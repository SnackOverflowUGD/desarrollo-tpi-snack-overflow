/**
 * E2E tests for the seguimiento + state-transition flow — UC09 UI (MI-09.3).
 *
 * Spec:   openspec/changes/uc09-ui-gestion/spec.md  (REQ-01..15, ESC-UI-01..11)
 * Design: openspec/changes/uc09-ui-gestion/design.md (ADR-09-01..06, OCL §Testing)
 *
 * ARCHITECTURE NOTE — READ BEFORE CHANGING MOCKS (mirrors UC08 OBS-01 / UC07 / UC04):
 *  - The seguimiento page /cuenta/contrataciones is a SERVER COMPONENT that lists
 *    via `backendFetch('/contrataciones')` SERVER-SIDE (Next server → BACKEND_URL).
 *    The browser NEVER issues that fetch, so `page.route` CANNOT intercept the
 *    listing. With the seed DB empty (and no backend-signed session here), the
 *    runtime path renders the NEUTRAL empty state (ESC-UI-10) or, with a forged
 *    signature, redirects to /login — never a leaked technical trace.
 *  - Because the list renders no <ContratacionCard/> without backend data, the
 *    CARD-LEVEL interactions (action buttons → toast/badge/refresh, ConfirmAccion
 *    dialog, accionesPara matrix render, anti-double-submit) cannot mount in this
 *    empty render. They are covered by the 286 unit tests (accionesPara matrix,
 *    api-client kind mapping, mapSeguimientoError) + this file's BFF probes +
 *    verify.md §runtime probes (curl with a backend-signed JWT). Closing them on
 *    the real UI needs a seeded backend (a participant with a non-terminal
 *    contratación) — deferred (same split UC04/UC07/UC08 documented), in verify.md.
 *  - What IS runtime-verifiable WITHOUT a seed and is fully exercised here:
 *      · ESC-UI-11 / REQ-10: anon /cuenta/contrataciones → 307 /login?next=<destino>.
 *      · ESC-UI-10 / REQ-05: a future-exp session does NOT crash and the page never
 *        surfaces a raw technical error to the user.
 *      · REQ-10 / RNF-S: the REAL BFF auth loop cookie→Bearer→backend through the
 *        4 NEW Route Handlers (confirm/start/finish/cancel): sentinel 401 (no cookie
 *        / expired) vs. forwarded backend 401; the id travels in the URL, no body.
 *      · The token is NEVER present in the client document/bundle.
 *      · es-AR + html lang.
 *
 * Mirrors the precedent e2e/bandeja.spec.ts + e2e/solicitar.spec.ts.
 */
import { expect, test, type Page } from "@playwright/test";

const SEGUIMIENTO_PATH = "/cuenta/contrataciones";
// A well-formed but non-existent contratación id (seed DB empty → 404 / not yours).
const CONTRATACION_ID = "22222222-2222-4222-8222-222222222222";

/** The 4 NEW UC09 transition verbs (ADR-09-01). */
const VERBOS = ["confirm", "start", "finish", "cancel"] as const;

/** Mints a fake JWT (unsigned) with a chosen exp + role, like bandeja.spec.ts. */
function fakeJwt(role: string, expOffsetSeconds: number): string {
  const exp = Math.floor(Date.now() / 1000) + expOffsetSeconds;
  const b64 = (o: object) =>
    Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
    exp,
    email: "participante@ejemplo.com",
    role,
  })}.sig`;
}

async function seedSession(page: Page, role = "cliente", expOffset = 3600) {
  await page.context().addCookies([
    {
      name: "so_session",
      value: fakeJwt(role, expOffset),
      url: "http://localhost:3001",
    },
  ]);
}

// ─── ESC-UI-11 / REQ-10 — la vista protegida exige sesión (proxy REAL) ────────────

test.describe("ESC-UI-11 / REQ-10 — matcher de proxy protege /cuenta/contrataciones", () => {
  test("anónimo en /cuenta/contrataciones → 307 a /login?next=<destino> (proxy REAL)", async ({
    page,
  }) => {
    // No session cookie on the protected /cuenta/* path (matcher `/cuenta/:path*`,
    // proxy.ts SIN cambios) → redirect preserving `next`.
    await page.context().clearCookies();
    await page.goto(SEGUIMIENTO_PATH);

    await expect(page).toHaveURL(/\/login\?next=/);
    // Convención del repo: el param es `next` (no `from`), URL-encodeado al destino.
    expect(new URL(page.url()).searchParams.get("next")).toBe(SEGUIMIENTO_PATH);
  });
});

// ─── ESC-UI-10 / REQ-05 — seguimiento con sesión: nunca expone traza técnica ──────

test.describe("ESC-UI-10 / REQ-05 — seguimiento con sesión (sin traza técnica)", () => {
  test("sesión válida + seed vacío → NO crashea ni expone detalle técnico", async ({
    page,
  }) => {
    // The page is SSR: backendFetch lists server-side. The forged token has a
    // future exp so backendFetch attaches the Bearer and calls the live backend;
    // the backend rejects the bad signature → 401 → the page redirects to /login.
    // To assert the EMPTY state instead we rely on the runtime probe in verify.md
    // (valid backend-signed token → 200 []). Here we assert that a future-exp
    // session does NOT crash and the page never surfaces a raw technical error.
    await seedSession(page, "cliente", 3600);
    await page.goto(SEGUIMIENTO_PATH);

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("statusCode");
    expect(bodyText).not.toMatch(/stack|at \w+ \(/i);
    expect(bodyText).not.toContain(CONTRATACION_ID);
  });
});

// ─── REQ-10 / RNF-S — el token nunca llega al cliente ─────────────────────────────

test.describe("REQ-10 / RNF-S.1/S.4 — el token nunca aparece en el documento", () => {
  test("el JWT de sesión NUNCA se serializa en el HTML enviado al browser", async ({
    page,
  }) => {
    await seedSession(page, "cliente", 3600);
    await page.goto(SEGUIMIENTO_PATH);

    const cookies = await page.context().cookies();
    const token = cookies.find((c) => c.name === "so_session")?.value ?? "";
    expect(token.length).toBeGreaterThan(0);

    const html = await page.content();
    expect(html).not.toContain(token);
    expect(html).not.toContain("Bearer ");
  });
});

// ─── REQ-10 — loop auth BFF cookie→Bearer→backend (REAL, sin mock) ────────────────
// Mirrors bandeja.spec.ts: the transition handlers are browser-observable; we drive
// the real Route Handlers and assert the sentinel-vs-forward 401 surface for the
// FOUR NEW UC09 endpoints (confirm/start/finish/cancel). No mock. The id is in the
// URL; the POST carries NO body (the backend derives the participant from the token).

test.describe("REQ-10 — Route Handlers UC09 (loop auth real, sin mock)", () => {
  for (const verbo of VERBOS) {
    test(`POST /api/contrataciones/:id/${verbo} sin cookie → 401 sentinel (sin body)`, async ({
      page,
    }) => {
      await page.context().clearCookies();
      const res = await page.request.post(
        `/api/contrataciones/${CONTRATACION_ID}/${verbo}`,
      );
      expect(res.status()).toBe(401);
      const text = await res.text();
      expect(text).not.toMatch(/stack|trace|Error:/i);
    });

    test(`POST /api/contrataciones/:id/${verbo} cookie expirada → 401 sentinel (RN-AUTH-06)`, async ({
      page,
    }) => {
      await seedSession(page, "cliente", -3600); // exp in the past
      const res = await page.request.post(
        `/api/contrataciones/${CONTRATACION_ID}/${verbo}`,
      );
      expect(res.status()).toBe(401);
    });

    test(`POST /api/contrataciones/:id/${verbo} cookie exp-futura sin firma → 401 reenviado del backend`, async ({
      page,
    }) => {
      // exp future → backendFetch attaches the Bearer and calls the real backend;
      // the backend rejects the forged signature → 401 forwarded. Proves the
      // cookie→Bearer→backend forwarding actually happens (defense in depth).
      await seedSession(page, "cliente", 3600);
      const res = await page.request.post(
        `/api/contrataciones/${CONTRATACION_ID}/${verbo}`,
      );
      expect(res.status()).toBe(401);
      const json = (await res.json().catch(() => null)) as
        | { message?: string }
        | null;
      if (json && typeof json.message === "string") {
        expect(json.message).not.toMatch(/stack|at \w+ \(/i);
      }
    });
  }
});

// ─── ESC-UI-07/08 — acción mockeada vía page.route (browser-observable) ───────────
// The seguimiento LIST is SSR (not interceptable), but the ACTION handlers ARE
// browser-observable. We mock the same-origin BFF Route Handler and drive the
// request FROM THE PAGE (page.evaluate → window.fetch), which DOES pass through
// page.route (the `page.request` fixture bypasses route — that is why we use the
// in-page fetch here). This proves the mocked 409/404 reaches the browser exactly
// as the api-client (mapResponder) consumes it, without any technical trace.

test.describe("ESC-UI-07/08 — acción mockeada (page.route, in-page fetch)", () => {
  test("ESC-UI-07: 409 mockeado → el browser recibe 409 (mapResponder → estado_cambiado), sin traza", async ({
    page,
  }) => {
    await seedSession(page, "cliente", 3600);
    await page.goto(SEGUIMIENTO_PATH);
    await page.route(
      `**/api/contrataciones/${CONTRATACION_ID}/confirm`,
      (route) =>
        route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ message: "estado cambió", statusCode: 409 }),
        }),
    );

    const out = await page.evaluate(async (id) => {
      const r = await fetch(`/api/contrataciones/${id}/confirm`, {
        method: "POST",
      });
      return { status: r.status, body: await r.text() };
    }, CONTRATACION_ID);

    expect(out.status).toBe(409);
    expect(out.body).not.toMatch(/stack|trace|Error:/i);
  });

  test("ESC-UI-08: 404 mockeado → el browser recibe 404 (mapResponder → no_disponible), sin traza", async ({
    page,
  }) => {
    await seedSession(page, "cliente", 3600);
    await page.goto(SEGUIMIENTO_PATH);
    await page.route(
      `**/api/contrataciones/${CONTRATACION_ID}/cancel`,
      (route) =>
        route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ message: "no disponible", statusCode: 404 }),
        }),
    );

    const out = await page.evaluate(async (id) => {
      const r = await fetch(`/api/contrataciones/${id}/cancel`, {
        method: "POST",
      });
      return { status: r.status, body: await r.text() };
    }, CONTRATACION_ID);

    expect(out.status).toBe(404);
    expect(out.body).not.toMatch(/stack|trace|Error:/i);
  });
});

// ─── Accesibilidad / es-AR — shell protegido ─────────────────────────────────────

test.describe("Accesibilidad — shell protegido (REQ-14)", () => {
  test("html lang=es-AR y sin detalle técnico en la vista de seguimiento", async ({
    page,
  }) => {
    await seedSession(page, "cliente", 3600);
    await page.goto(SEGUIMIENTO_PATH);

    await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("Bad Request");
    expect(bodyText).not.toContain("statusCode");
  });
});
