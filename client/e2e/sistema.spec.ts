/**
 * SYSTEM end-to-end — the integrated happy path across WIs UC01/02/04/05/07/08/09
 * against the LIVE stack (NestJS :3000 + Next :3001 + Postgres) with REAL seeded
 * data. This is WI MI-11 "Verificación de la integración": it closes the recurring
 * OBS-01 deferral of every per-WI verify.md — those suites mock `page.route` and,
 * because the listing pages are Server Components fetching server-side, never render
 * cards from real data. Here we DO NOT mock anything: real login (cookie
 * so_session → Bearer), real search (real geocoding + coverage filter), real
 * contratación lifecycle driven through two browser sessions.
 *
 * PRECONDITION — run the seed first (idempotent, resets its own rows):
 *   server/scripts/seed-e2e.sh
 * It registers cliente + prestador via the API (valid argon2 hash) and inserts the
 * catalog `prestadores` row (Argentina-wide coverage polygon + a service +
 * tiene_servicios_publicados=true) so the provider is searchable. Credentials below
 * MUST match the seed.
 *
 * GOTCHAS honored:
 *  - Serial, single worker — the flow is stateful (one contratación walked through
 *    its states by two actors). Do NOT run in parallel against the reused :3001.
 *  - NO page.route — we want real backend traffic (this is system verification).
 *  - Cross-browser matrix GREEN (35/35) on Chromium, Firefox, WebKit, Mobile
 *    Chrome and Mobile Safari. Run each project with a fresh seed (re-seed
 *    isolates the shared cliente) and `--workers=1`. WebKit hydrates slower
 *    under the dev server: `loginUI` refills until the value sticks and
 *    `reloadSettled` retries gotos that race the actions' router.refresh().
 *    See playwright.config.ts for the Linux WebKit system-lib setup.
 *  - Sonner injects an empty role="alert"; error banners are scoped to
 *    [data-slot="alert"][role="alert"]. Success is announced via toast role="status".
 *  - State is asserted via the <EstadoBadge/> text (es-AR catalog) which renders on
 *    both the prestador inbox and the cliente seguimiento page.
 */
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

// ── Seed-matched constants (keep in sync with server/scripts/seed-e2e.sh) ────────
const CLIENTE = {
  email: "cliente.e2e-mi11@snackoverflow.test",
  password: "cliente1234",
};
const PRESTADOR = {
  email: "prestador.e2e-mi11@snackoverflow.test",
  password: "prestador1234",
};
const OFICIO = "Electricista";
const UBICACION = "Posadas, Misiones, Argentina";
// A franja from the curated es-AR set (note the en-dash U+2013, not a hyphen).
const FRANJA = "Mañana (08–12)";
// A safely-future date (availability is a stub today, but the DTO requires today+).
const FECHA = "2030-03-15";
const PRECIO = "18000";

// Run as one ordered story; a failed step aborts the rest (they depend on it).
test.describe.configure({ mode: "serial" });

// ── Helpers ──────────────────────────────────────────────────────────────────
const errorBanner = (page: Page) =>
  page.locator('[data-slot="alert"][role="alert"]');

/**
 * Reload tolerant of an in-flight client navigation. The estado actions call
 * router.refresh() (soft RSC nav) on success; on WebKit/Mobile Safari that
 * refresh can still be in flight when the test reloads, and Playwright aborts
 * the goto with "interrupted by another navigation". Retrying lets it land
 * once the soft refresh settles — fast no-op on engines already idle.
 */
async function reloadSettled(page: Page, url: string): Promise<void> {
  await expect(async () => {
    await page.goto(url);
  }).toPass({ timeout: 15_000 });
}

/** Real UI login: fills the form, submits, asserts the so_session cookie is set. */
async function loginUI(
  context: BrowserContext,
  creds: { email: string; password: string },
): Promise<Page> {
  const page = await context.newPage();
  await page.goto("/login");

  // WebKit/Mobile Safari hydrate slower than Chromium/Firefox under the dev
  // server: a `fill` that lands BEFORE react-hook-form attaches its refs gets
  // clobbered when hydration applies the form's empty defaults (the field then
  // blurs to a "e-mail inválido" validation error and the typed value is lost).
  // Refill until the value sticks post-hydration — a no-op on engines that
  // hydrate before the first fill.
  const fillStable = async (selector: string, value: string) => {
    const field = page.locator(selector);
    await expect(async () => {
      await field.fill(value);
      expect(await field.inputValue()).toBe(value);
    }).toPass({ timeout: 10_000 });
  };
  await fillStable("#email", creds.email);
  await fillStable("#password", creds.password);
  await page.getByRole("button", { name: "Ingresar" }).click();

  // Successful login redirects away from /login (to "/" by default).
  await page.waitForURL((url) => !url.pathname.startsWith("/login"), {
    timeout: 15_000,
  });
  await expect(errorBanner(page)).toHaveCount(0);

  const cookies = await context.cookies();
  const session = cookies.find((c) => c.name === "so_session");
  expect(session, "so_session cookie must be set after login").toBeTruthy();
  expect(session!.httpOnly).toBe(true);

  return page;
}

// ── The integrated flow ────────────────────────────────────────────────────────
test.describe("MI-11 — flujo integrado de sistema (stack vivo + seed real)", () => {
  let clienteCtx: BrowserContext;
  let prestadorCtx: BrowserContext;
  let clientePage: Page;
  let prestadorPage: Page;
  // The contratación id, discovered from the URL or a probe, shared across steps.
  let contratacionId = "";

  test.beforeAll(async ({ browser }) => {
    clienteCtx = await browser.newContext();
    prestadorCtx = await browser.newContext();
  });

  test.afterAll(async () => {
    await clienteCtx?.close();
    await prestadorCtx?.close();
  });

  test("1 — el cliente hace login real (cookie so_session httpOnly)", async () => {
    clientePage = await loginUI(clienteCtx, CLIENTE);
  });

  test("2 — busca por oficio+ubicación y ve al prestador sembrado", async () => {
    await clientePage.goto(
      `/prestadores?oficio=${encodeURIComponent(OFICIO)}&ubicacion=${encodeURIComponent(UBICACION)}`,
    );

    // The seeded provider's result card. The whole card is a link to its profile.
    const card = clientePage.getByRole("link", { name: /Pedro Prestador/i });
    await expect(card).toBeVisible({ timeout: 15_000 });
    // Oficio chip is present on the card (search matched categoria = oficio).
    await expect(
      clientePage.getByRole("heading", { name: "Pedro Prestador" }),
    ).toBeVisible();
  });

  test("3 — abre el perfil: datos visibles, sin datos de contacto (RN-CAT-05)", async () => {
    await clientePage.getByRole("link", { name: /Pedro Prestador/i }).click();
    await clientePage.waitForURL(/\/prestadores\/[0-9a-f-]{36}$/);

    await expect(
      clientePage.getByRole("heading", { name: "Pedro Prestador", level: 1 }),
    ).toBeVisible();
    // Coverage zone is shown (Posadas).
    await expect(clientePage.getByText("Posadas")).toBeVisible();
    // RN-CAT-05: the public profile must NOT leak contact info before hiring.
    const body = await clientePage.locator("body").innerText();
    expect(body).not.toContain(CLIENTE.email);
    expect(body).not.toContain("+549");
    expect(body).not.toMatch(/\b\d{6,}\b/); // no bare phone-like number runs
    // The "Solicitar" CTA is present and enabled for an authenticated cliente.
    const cta = clientePage.getByRole("button", { name: "Solicitar" });
    await expect(cta).toBeEnabled();
  });

  test("4 — solicita la contratación → estado solicitada (201)", async () => {
    // Drive the real CTA → protected request form (session is authenticated).
    await clientePage.getByRole("button", { name: "Solicitar" }).click();
    await clientePage.waitForURL(/\/prestadores\/[0-9a-f-]{36}\/solicitar$/);

    await clientePage.locator("#ubicacion").fill(UBICACION);
    await clientePage.locator("#fecha").fill(FECHA);
    // Franja is a Select primitive: open the trigger, pick the option.
    await clientePage.locator("#franja").click();
    await clientePage.getByRole("option", { name: FRANJA }).click();
    await clientePage
      .locator("#descripcion")
      .fill("Necesito instalar un tablero eléctrico nuevo en mi casa.");

    await clientePage
      .getByRole("button", { name: "Enviar solicitud" })
      .click();

    // 201 replaces the form with the success panel (no error banner).
    await expect(
      clientePage.getByRole("heading", { name: "¡Solicitud enviada!" }),
    ).toBeVisible({ timeout: 15_000 });
    await expect(errorBanner(clientePage)).toHaveCount(0);
  });

  test("5 — el prestador hace login, ve la solicitud y la presupuesta → presupuestada", async () => {
    prestadorPage = await loginUI(prestadorCtx, PRESTADOR);

    await prestadorPage.goto("/cuenta/solicitudes");

    // The seeded provider's inbox shows the client's request (estado: Solicitada).
    const clienteHeading = prestadorPage.getByRole("heading", {
      name: "Carla Cliente",
    });
    await expect(clienteHeading).toBeVisible({ timeout: 15_000 });
    await expect(
      prestadorPage.getByText("Solicitada", { exact: true }).first(),
    ).toBeVisible();

    // Capture the contratación id via a real probe of the BFF (token in cookie).
    const listJson = await prestadorPage.evaluate(async () => {
      const r = await fetch("/api/contrataciones?estado=solicitada");
      return (await r.json()) as Array<{ id: string; estado: string }>;
    });
    expect(Array.isArray(listJson)).toBe(true);
    expect(listJson.length).toBeGreaterThanOrEqual(1);
    contratacionId = listJson[0].id;
    expect(contratacionId).toMatch(/^[0-9a-f-]{36}$/);

    // Open the inline presupuestar form and submit a price.
    await prestadorPage.getByRole("button", { name: "Presupuestar" }).click();
    await prestadorPage.locator(`#precio-${contratacionId}`).fill(PRECIO);
    // Date/franja are prefilled from the request; just submit.
    await prestadorPage
      .getByRole("button", { name: "Enviar propuesta" })
      .click();

    // 200 → success toast (role="status"), inbox refreshes, no error banner.
    await expect(
      prestadorPage.getByText(
        "¡Propuesta enviada! El cliente la revisará y te confirmará.",
      ),
    ).toBeVisible({ timeout: 15_000 });
    await expect(errorBanner(prestadorPage)).toHaveCount(0);

    // Probe: the backend now reports presupuestada with the price.
    const after = await prestadorPage.evaluate(async (id) => {
      const r = await fetch("/api/contrataciones");
      const items = (await r.json()) as Array<{
        id: string;
        estado: string;
        precioEstimado: number | null;
      }>;
      return items.find((i) => i.id === id) ?? null;
    }, contratacionId);
    expect(after?.estado).toBe("presupuestada");
    // The backend serializes the Postgres `numeric` as a STRING ("18000.00"),
    // not a JS number — compare numerically (integration observation, see verify.md).
    expect(Number(after?.precioEstimado)).toBe(Number(PRECIO));
  });

  test("6 — el cliente ve la propuesta en seguimiento y confirma → confirmada", async () => {
    await reloadSettled(clientePage, "/cuenta/contrataciones");

    // The card renders with the real estado badge (Presupuestada).
    await expect(
      clientePage.getByText("Presupuestada", { exact: true }).first(),
    ).toBeVisible({ timeout: 15_000 });
    // Precio is now visible (presupuestada+). The card renders the raw backend
    // value (`$${item.precioEstimado}`), which is the numeric-as-string "18000.00".
    await expect(
      clientePage.getByText(new RegExp(`\\$${PRECIO}(\\.00)?`)),
    ).toBeVisible();

    // cliente + presupuestada → accionesPara = ["confirmar", "cancelar"].
    await clientePage.getByRole("button", { name: "Confirmar" }).click();

    await expect(
      clientePage.getByText(
        "¡Listo! Confirmaste la propuesta. El prestador va a iniciar el trabajo.",
      ),
    ).toBeVisible({ timeout: 15_000 });
    await expect(errorBanner(clientePage)).toHaveCount(0);

    const after = await clientePage.evaluate(async (id) => {
      const r = await fetch("/api/contrataciones");
      const items = (await r.json()) as Array<{ id: string; estado: string }>;
      return items.find((i) => i.id === id) ?? null;
    }, contratacionId);
    expect(after?.estado).toBe("confirmada");
  });

  test("7 — el prestador inicia (en_curso) y finaliza (finalizada)", async () => {
    await reloadSettled(prestadorPage, "/cuenta/contrataciones");

    await expect(
      prestadorPage.getByText("Confirmada", { exact: true }).first(),
    ).toBeVisible({ timeout: 15_000 });

    // prestador + confirmada → ["iniciar", "cancelar"]. Iniciar fires directly.
    await prestadorPage.getByRole("button", { name: "Iniciar" }).click();
    await expect(
      prestadorPage.getByText(
        "Registraste el inicio del trabajo. La contratación está en curso.",
      ),
    ).toBeVisible({ timeout: 15_000 });

    // The action uses router.refresh() (soft) after success; reload to get a clean
    // SSR render of the en_curso card (busy reset, Finalizar enabled) — avoids the
    // soft-refresh in-between state where the previous action's `busy` lingers.
    await reloadSettled(prestadorPage, "/cuenta/contrataciones");

    // After reload: prestador + en_curso → ["finalizar", "cancelar"].
    await expect(
      prestadorPage.getByText("En curso", { exact: true }).first(),
    ).toBeVisible({ timeout: 15_000 });

    // Finalizar is irreversible → goes through the <ConfirmAccion/> dialog.
    const finalizarBtn = prestadorPage.getByRole("button", {
      name: "Finalizar",
    });
    await expect(finalizarBtn).toBeEnabled({ timeout: 15_000 });
    await finalizarBtn.click();
    // The <ConfirmAccion/> dialog labels its confirm button with the ACTION name
    // (confirmLabel = "Finalizar"), not the catalog "Sí, confirmar". Scope the
    // click to the dialog so it doesn't collide with the trigger button.
    const dialog = prestadorPage.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Finalizar" }).click();

    await expect(
      prestadorPage.getByText(
        "Confirmaste la finalización del servicio. ¡Gracias!",
      ),
    ).toBeVisible({ timeout: 15_000 });
    await expect(errorBanner(prestadorPage)).toHaveCount(0);

    // Final state probe: finalizada (terminal).
    const after = await prestadorPage.evaluate(async (id) => {
      const r = await fetch("/api/contrataciones");
      const items = (await r.json()) as Array<{ id: string; estado: string }>;
      return items.find((i) => i.id === id) ?? null;
    }, contratacionId);
    expect(after?.estado).toBe("finalizada");

    // And it shows as Finalizada on the prestador's tracking view. The default
    // filter is "Activas" (hides finalizada/cancelada), so switch to "Terminadas".
    await reloadSettled(prestadorPage, "/cuenta/contrataciones");
    await prestadorPage.getByRole("button", { name: "Terminadas" }).click();
    await expect(
      prestadorPage.getByText("Finalizada", { exact: true }).first(),
    ).toBeVisible({ timeout: 15_000 });
  });
});
