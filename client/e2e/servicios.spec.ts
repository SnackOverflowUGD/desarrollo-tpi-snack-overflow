/**
 * E2E tests for prestador self-management — perfil + servicios UI (PSM-REQ-*,
 * ONBOARDING-REQ-01, ESC-LOCALIDAD-08).
 *
 * ARCHITECTURE NOTE (mirrors seguimiento.spec.ts / bandeja.spec.ts):
 *  - /cuenta/perfil and /cuenta/servicios are SERVER COMPONENTS that load via
 *    `backendFetch('/prestadores/me')` SERVER-SIDE. The browser never issues
 *    that fetch, so `page.route` CANNOT intercept the listing, and a forged
 *    (unsigned) JWT is rejected by the real backend signature check → the page
 *    redirects to /login. What IS runtime-verifiable WITHOUT a seeded backend:
 *      · the proxy.ts matcher protects both routes (anon → /login?next=<dest>),
 *      · the NEW BFF route handlers run the cookie→Bearer loop (sentinel 401
 *        with no cookie), and the token never leaks into the client document.
 *  - The FULL happy path (register → login → complete profile → publish servicio
 *    → appears in the catalog, ESC-LOCALIDAD-08) needs a LIVE backend on :3000
 *    (real signed session + geocoding). It is written below but SKIPS when the
 *    backend is unreachable, so the suite reports honestly without hard-failing
 *    on a browser/env limitation.
 */
import { expect, test, type Page } from "@playwright/test";

const PERFIL_PATH = "/cuenta/perfil";
const SERVICIOS_PATH = "/cuenta/servicios";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

/** Mints a fake (unsigned) JWT with a chosen exp + role, like seguimiento.spec.ts. */
function fakeJwt(role: string, expOffsetSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expOffsetSeconds;
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
    exp,
    email: "prestador@ejemplo.com",
    role,
  })}.sig`;
}

async function seedSession(page: Page, role = "prestador", expOffset = 3600) {
  await page.context().addCookies([
    { name: "so_session", value: fakeJwt(role, expOffset), url: "http://localhost:3001" },
  ]);
}

// ─── proxy.ts REAL — protected self-management routes require a session ───────

test.describe("REQ-09 — la autogestión exige sesión (proxy REAL)", () => {
  test("anónimo en /cuenta/servicios → /login?next=<destino>", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(SERVICIOS_PATH);
    await expect(page).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toBe(SERVICIOS_PATH);
  });

  test("anónimo en /cuenta/perfil → /login?next=<destino>", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto(PERFIL_PATH);
    await expect(page).toHaveURL(/\/login\?next=/);
    expect(new URL(page.url()).searchParams.get("next")).toBe(PERFIL_PATH);
  });
});

// ─── BFF cookie→Bearer loop through the NEW servicio route handlers ───────────

test.describe("PSM-REQ-09 / RNF-S — el BFF de servicios protege por token", () => {
  test("POST /api/prestadores/me/servicios sin cookie → 401 (sentinel, backend NO llamado)", async ({
    page,
  }) => {
    await page.context().clearCookies();
    const res = await page.request.post("http://localhost:3001/api/prestadores/me/servicios", {
      data: { categoria: "Electricista", descripcion: "x" },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(401);
  });

  test("DELETE /api/prestadores/me/servicios/:id sin cookie → 401 (sentinel)", async ({
    page,
  }) => {
    await page.context().clearCookies();
    const res = await page.request.delete(
      "http://localhost:3001/api/prestadores/me/servicios/00000000-0000-4000-8000-000000000000",
      { failOnStatusCode: false },
    );
    expect(res.status()).toBe(401);
  });
});

// ─── El token NUNCA aparece en el documento (RNF-S.1/S.4) ─────────────────────

test.describe("RNF-S.1/S.4 — el JWT nunca se serializa en el HTML", () => {
  test("el token de sesión no aparece en /cuenta/servicios", async ({ page }) => {
    await seedSession(page, "prestador", 3600);
    await page.goto(SERVICIOS_PATH);

    const cookies = await page.context().cookies();
    const token = cookies.find((c) => c.name === "so_session")?.value ?? "";
    expect(token.length).toBeGreaterThan(0);

    const html = await page.content();
    expect(html).not.toContain(token);
    expect(html).not.toContain("Bearer ");
  });
});

// ─── ESC-LOCALIDAD-08 — full real-stack happy path (skips without a backend) ──

test.describe("ESC-LOCALIDAD-08 — publicar servicio → buscable en el catálogo", () => {
  test("registro → login → completar perfil → publicar servicio → aparece en la búsqueda", async ({
    page,
    request,
  }) => {
    // Only meaningful against a LIVE backend (real signed session + geocoding).
    let backendUp = false;
    try {
      const probe = await request.get(
        `${BACKEND_URL}/catalogo/prestadores?oficio=Electricista&ubicacion=Posadas`,
        { failOnStatusCode: false, timeout: 4000 },
      );
      backendUp = probe.status() < 500;
    } catch {
      backendUp = false;
    }
    test.skip(
      !backendUp,
      "Backend on :3000 not reachable — full publish→searchable flow deferred to a seeded run (documented in verify).",
    );

    const stamp = Date.now();
    const email = `prestador.${stamp}@ejemplo.com`;
    const password = "SecurePass1!";

    // 1) Register as a NON-regulated prestador (Carpintero → activo, no matrícula).
    await page.goto("/registro");
    await page.waitForSelector("form[novalidate]", { state: "visible" });
    await page
      .getByRole("radiogroup", { name: "¿Cómo te registrás?" })
      .getByRole("radio", { name: "Prestador" })
      .click();
    await page.fill("#name", "Nuevo");
    await page.fill("#lastName", "Prestador");
    await page.fill("#email", email);
    await page.fill("#phone", "+543764000000");
    await page.fill("#password", password);
    await page.locator("#trade").click();
    await page.getByRole("option", { name: "Carpintero" }).click();
    await page.locator("#localidad").click();
    await page.getByRole("option", { name: "Posadas", exact: true }).click();
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    // Registration lands on /login (onboarding pre-set in ?next=).
    await page.waitForURL(/\/login/, { timeout: 15000 });

    // 2) Log in → should land on the onboarding profile step.
    await page.fill("#email", email);
    await page.fill("#password", password);
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.waitForURL(/\/cuenta\/perfil/, { timeout: 15000 });

    // 3) Publish the first servicio.
    await page.goto(SERVICIOS_PATH);
    await page
      .getByRole("button", { name: /Publicar un servicio/i })
      .click();
    await page.fill("#servicio-categoria", "Muebles a medida");
    await page.fill("#servicio-descripcion", "Fabricación y reparación de muebles");
    await page.fill("#servicio-precio-min", "5000");
    await page.fill("#servicio-precio-max", "20000");
    await page.getByRole("button", { name: /Guardar servicio/i }).click();

    // 4) The prestador now matches the public catalog filter (visible ∧ published).
    // The public projection exposes `nombreCompleto` ("Nuevo Prestador"). A brand
    // new prestador has rating 0 and sorts last, so page through a large pageSize
    // to avoid a pagination false-negative against the seed data.
    await expect
      .poll(
        async () => {
          const res = await request.get(
            `${BACKEND_URL}/catalogo/prestadores?oficio=Carpintero&ubicacion=Posadas&pageSize=100`,
            { failOnStatusCode: false },
          );
          if (res.status() !== 200) return "";
          return await res.text();
        },
        { timeout: 20000 },
      )
      .toContain("Nuevo Prestador");
  });
});
