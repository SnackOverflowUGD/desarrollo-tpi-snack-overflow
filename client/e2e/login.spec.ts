/**
 * E2E tests for the Login form + session handling — UC02 UI.
 *
 * Spec:   openspec/changes/uc02-ui-login/spec.md  (REQ-01..12, ESC-UI-01..07/10)
 * Design: openspec/changes/uc02-ui-login/design.md  (ADR-UC02-01..04, OCL §9)
 *
 * Strategy (mirrors e2e/registro.spec.ts):
 *  - All form tests run against /login with the backend mocked via page.route().
 *  - The mock intercepts **\/api\/auth\/login. That path resolves to the Next
 *    Route Handler (app/api/auth/login/route.ts) in production; here Playwright
 *    short-circuits the browser->handler request, so we assert the OBSERVABLE
 *    behaviour (redirect, banner, disabled submit), not the real httpOnly cookie
 *    (which only the real handler could set — covered by the proxy smoke test).
 *  - Copy strings are asserted via expected values from lib/copy/es-AR.ts.
 */

import { expect, test, type Page } from "@playwright/test";

// ─── shared helpers ────────────────────────────────────────────────────────────

/** Navigates to /login and waits for the client form to hydrate. */
async function gotoLogin(page: Page, query = "") {
  await page.goto(`/login${query}`);
  await page.waitForSelector("form[novalidate]", { state: "visible" });
}

/** Fills email + password with valid-looking values (overridable). */
async function fillCredentials(
  page: Page,
  overrides: Partial<{ email: string; password: string }> = {},
) {
  const values = {
    email: "ana@ejemplo.com",
    password: "SecurePass1!",
    ...overrides,
  };
  await page.fill("#email", values.email);
  await page.fill("#password", values.password);
}

/** Mocks POST /api/auth/login (the Route Handler) with a given status/body. */
function mockLoginEndpoint(page: Page, status: number, body: object = {}) {
  return page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

const submit = (page: Page) =>
  page.getByRole("button", { name: /Ingresar|Ingresando/i });

// ─── ESC-UI-01: login exitoso (200 → loading → redirect, form bloqueado) ───────

test.describe("ESC-UI-01 — Login exitoso", () => {
  test("200 → POST enviado, redirige al destino y bloquea el form", async ({
    page,
  }) => {
    // REQ-01, REQ-02, REQ-05, REQ-08
    await mockLoginEndpoint(page, 200, { ok: true });
    // Mock the post-login destination so the redirect target responds.
    await page.route("**/", (route, request) => {
      // Only stub top-level document navigations to "/", let assets pass.
      if (request.resourceType() === "document") {
        return route.fulfill({
          status: 200,
          contentType: "text/html",
          body: "<html><body>Home</body></html>",
        });
      }
      return route.continue();
    });

    await gotoLogin(page);
    await fillCredentials(page);

    const [request] = await Promise.all([
      page.waitForRequest("**/api/auth/login"),
      submit(page).click(),
    ]);
    expect(request.method()).toBe("POST");
    // The token must NOT travel in the request from the form (it only sends creds).
    expect(request.postData() ?? "").not.toContain("accessToken");

    // Redirect to the default post-login destination "/" (Supuesto S2).
    await page.waitForURL(/\/$/, { timeout: 10000 });
  });

  test("el botón entra en aria-busy durante el envío (REQ-08)", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", async (route) => {
      await new Promise((r) => setTimeout(r, 400));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
    });

    await gotoLogin(page);
    await fillCredentials(page);

    const btn = submit(page);
    await btn.click();

    await expect(btn).toHaveAttribute("aria-busy", "true", { timeout: 3000 });
    await expect(btn).toHaveText("Ingresando…");
  });
});

// ─── ESC-UI-02: credenciales inválidas (401) → banner GENÉRICO, anti-enum ──────

test.describe("ESC-UI-02 — Credenciales inválidas (401)", () => {
  test("banner genérico role=alert; conserva email, limpia password, reintento", async ({
    page,
  }) => {
    // REQ-03, RNF-S.4 (anti-enumeración)
    await mockLoginEndpoint(page, 401, { message: "Invalid credentials." });

    await gotoLogin(page);
    await fillCredentials(page, { email: "ana@ejemplo.com", password: "wrong" });

    await submit(page).click();

    const banner = page.locator('[data-slot="alert"][role="alert"]');
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toHaveText("E-mail o contraseña incorrectos.");

    // Anti-enumeración: el mensaje NO revela qué campo falló.
    await expect(banner).not.toHaveText(/e-?mail incorrecto/i);
    await expect(banner).not.toHaveText(/contraseña incorrecta\b/i);
    await expect(banner).not.toHaveText(/usuario no existe|no encontrado/i);
    // Tampoco filtra el inglés crudo del backend.
    await expect(page.locator("body")).not.toContainText("Invalid credentials");

    // El e-mail se conserva; la contraseña se limpia (REQ-03 / ESC-UI-02).
    await expect(page.locator("#email")).toHaveValue("ana@ejemplo.com");
    await expect(page.locator("#password")).toHaveValue("");

    // El botón vuelve a default (no aria-busy, no disabled) → reintento permitido.
    await expect(submit(page)).not.toHaveAttribute("aria-busy", "true");
    await expect(submit(page)).toBeEnabled();
  });
});

// ─── ESC-UI-03: cuenta bloqueada (423) → banner + submit deshabilitado ─────────

test.describe("ESC-UI-03 — Cuenta bloqueada temporalmente (423)", () => {
  test("banner 30 min + submit deshabilitado (sin reintento inmediato)", async ({
    page,
  }) => {
    // REQ-03, RN-AUTH-04
    await mockLoginEndpoint(page, 423, {
      message: "Account temporarily locked. Try again in 30 minutes.",
    });

    await gotoLogin(page);
    await fillCredentials(page);
    await submit(page).click();

    const banner = page.locator('[data-slot="alert"][role="alert"]');
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toHaveText(/bloqueada temporalmente/i);
    await expect(banner).toHaveText(/30 minutos/i);
    await expect(page.locator("body")).not.toContainText("Account temporarily");

    // El submit queda deshabilitado permanentemente (lockedOut).
    await expect(submit(page)).toBeDisabled();
  });
});

// ─── ESC-UI-04: cuenta suspendida (403) → banner con canal de soporte ──────────

test.describe("ESC-UI-04 — Cuenta suspendida (403)", () => {
  test("banner con canal de soporte; sin revelar validez de credenciales", async ({
    page,
  }) => {
    // REQ-03, RN-AUTH-01
    await mockLoginEndpoint(page, 403, {
      message: "Account suspended. Contact support.",
    });

    await gotoLogin(page);
    await fillCredentials(page);
    await submit(page).click();

    const banner = page.locator('[data-slot="alert"][role="alert"]');
    await expect(banner).toBeVisible({ timeout: 5000 });
    await expect(banner).toHaveText(/suspendida/i);
    await expect(banner).toHaveText(/soporte@snackoverflow\.com/i);
    await expect(page.locator("body")).not.toContainText("Account suspended");

    // Suspendida no bloquea el submit (reintento permitido aunque inútil).
    await expect(submit(page)).toBeEnabled();
  });
});

// ─── ESC-UI-05: validación cliente + 422 inline ───────────────────────────────

test.describe("ESC-UI-05 — Validación cliente y 422 inline", () => {
  test("email sin '@' en blur → error inline con aria-invalid/aria-describedby", async ({
    page,
  }) => {
    // REQ-01, REQ-04
    await gotoLogin(page);

    const email = page.locator("#email");
    await email.fill("usuariodominio.com");
    await email.blur();

    const err = page.locator("#email-error");
    await expect(err).toBeVisible();
    await expect(err).toHaveText(/e-mail válido/i);
    await expect(email).toHaveAttribute("aria-invalid", "true");
    await expect(email).toHaveAttribute("aria-describedby", "email-error");
  });

  test("submit con error de cliente NO dispara solicitud HTTP", async ({
    page,
  }) => {
    // ESC-UI-05: client-side block, no network call
    let requestMade = false;
    await page.route("**/api/auth/login", async (route) => {
      requestMade = true;
      await route.continue();
    });

    await gotoLogin(page);
    await page.fill("#email", "noarroba");
    await page.fill("#password", ""); // empty too
    await submit(page).click();

    await page.waitForTimeout(500);
    expect(requestMade).toBe(false);
    await expect(page.locator("#email-error")).toBeVisible();
  });

  test("password vacío bloquea; password corto NO bloquea (login no valida longitud)", async ({
    page,
  }) => {
    // REQ-01: login does NOT enforce min-length on password.
    await mockLoginEndpoint(page, 200, { ok: true });
    await page.route("**/", (route, request) =>
      request.resourceType() === "document"
        ? route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>Home</body></html>" })
        : route.continue(),
    );

    await gotoLogin(page);
    // A 3-char password would be rejected by registro, but login accepts it.
    await fillCredentials(page, { password: "abc" });

    const [request] = await Promise.all([
      page.waitForRequest("**/api/auth/login"),
      submit(page).click(),
    ]);
    expect(request.method()).toBe("POST"); // short password reached the server
  });

  test("422 del servidor → error inline por campo, valores conservados", async ({
    page,
  }) => {
    // REQ-04: parse 422 message[], map to fields in es-AR, keep values.
    await mockLoginEndpoint(page, 422, {
      statusCode: 422,
      message: ["email must be an email"],
      error: "Unprocessable Entity",
    });

    await gotoLogin(page);
    // Valid client-side email so zod passes and the mock is hit.
    await fillCredentials(page, { email: "valid@example.com" });
    await submit(page).click();

    const emailErr = page.locator("#email-error");
    await expect(emailErr).toBeVisible({ timeout: 5000 });
    await expect(emailErr).toHaveText(/e-mail válido/i);
    await expect(emailErr).not.toHaveText(/must be an email/i);
    await expect(page.locator("#email")).toHaveAttribute("aria-invalid", "true");

    // El botón vuelve a default tras 422.
    await expect(submit(page)).not.toHaveAttribute("aria-busy", "true");
  });
});

// ─── ESC-UI-07: ruta protegida sin sesión → 307 /login?next= (proxy REAL) ──────

test.describe("ESC-UI-07 — Ruta protegida sin sesión redirige a /login", () => {
  test("GET /cuenta sin cookie → redirige a /login?next=/cuenta (proxy.ts)", async ({
    page,
  }) => {
    // REQ-07. This exercises the REAL proxy (no mock): the edge/server proxy
    // sees no session cookie on the protected /cuenta path and 307s to /login.
    await page.context().clearCookies();
    await page.goto("/cuenta");

    await expect(page).toHaveURL(/\/login\?next=%2Fcuenta|\/login\?next=\/cuenta/);
    await page.waitForSelector("form[novalidate]", { state: "visible" });
  });

  test("login OK con ?next=/cuenta honra el destino original", async ({
    page,
  }) => {
    // REQ-02/REQ-07: tras 200, el form hace router.push(next). El Route Handler
    // está mockeado, así que NO se setea la cookie httpOnly real; sin ella el
    // proxy REAL rebotaría /cuenta de vuelta a /login. Para aislar "el form
    // honra next" sembramos una cookie de sesión vigente (JWT con exp futuro)
    // que satisface al proxy, y stubeamos el documento /cuenta.
    const exp = Math.floor(Date.now() / 1000) + 3600;
    const b64 = (o: object) =>
      Buffer.from(JSON.stringify(o)).toString("base64url");
    const fakeJwt = `${b64({ alg: "HS256", typ: "JWT" })}.${b64({
      exp,
      email: "ana@ejemplo.com",
      role: "cliente",
    })}.sig`;
    await page.context().addCookies([
      { name: "so_session", value: fakeJwt, url: "http://localhost:3001" },
    ]);

    await mockLoginEndpoint(page, 200, { ok: true });
    await page.route("**/cuenta", (route, request) =>
      request.resourceType() === "document"
        ? route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>Cuenta</body></html>" })
        : route.continue(),
    );

    await gotoLogin(page, "?next=%2Fcuenta");
    await fillCredentials(page);
    await submit(page).click();

    await page.waitForURL(/\/cuenta/, { timeout: 10000 });
  });

  test("next inseguro (//evil) es ignorado → cae al destino por defecto '/'", async ({
    page,
  }) => {
    // REQ-07 open-redirect guard (safeRedirectTarget).
    await mockLoginEndpoint(page, 200, { ok: true });
    await page.route("**/", (route, request) =>
      request.resourceType() === "document"
        ? route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>Home</body></html>" })
        : route.continue(),
    );

    await gotoLogin(page, "?next=%2F%2Fevil.com");
    await fillCredentials(page);
    await submit(page).click();

    // Must NOT navigate off-origin; falls back to "/".
    await page.waitForURL(/localhost:3001\/$/, { timeout: 10000 });
  });
});

// ─── ESC-UI-10: error de red / 5xx → banner role=alert, datos conservados ──────

test.describe("ESC-UI-10 — Error de red / servidor", () => {
  test("fallo de red → banner role=alert, conserva datos, reintento", async ({
    page,
  }) => {
    // REQ-10
    await page.route("**/api/auth/login", (route) => route.abort("failed"));

    await gotoLogin(page);
    await fillCredentials(page, { email: "ana@ejemplo.com", password: "Secret123" });
    await submit(page).click();

    const banner = page.locator('[data-slot="alert"][role="alert"]');
    await expect(banner).toBeVisible({ timeout: 8000 });
    await expect(banner).toHaveText(/conex/i);

    // Datos conservados (ambos campos), reintento permitido.
    await expect(page.locator("#email")).toHaveValue("ana@ejemplo.com");
    await expect(page.locator("#password")).toHaveValue("Secret123");
    await expect(submit(page)).toBeEnabled();
  });

  test("502/5xx → banner genérico de servidor sin trazas técnicas", async ({
    page,
  }) => {
    // REQ-10: handler maps backend 5xx → 502; loginUser → 'server'.
    await mockLoginEndpoint(page, 502, { ok: false });

    await gotoLogin(page);
    await fillCredentials(page);
    await submit(page).click();

    const banner = page.locator('[data-slot="alert"][role="alert"]');
    await expect(banner).toBeVisible({ timeout: 8000 });
    await expect(banner).toHaveText(/Algo salió mal/i);
    // No stack traces / internal details.
    await expect(page.locator("body")).not.toContainText(/stack|trace|Error:/i);
  });
});

// ─── Accesibilidad (REQ-11) ────────────────────────────────────────────────────

test.describe("Accesibilidad — REQ-11", () => {
  test("campos con label visible (htmlFor) y aria-required", async ({ page }) => {
    await gotoLogin(page);
    for (const id of ["email", "password"]) {
      await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-required", "true");
    }
  });

  test("toggle mostrar/ocultar contraseña es operable y accesible (aria-pressed)", async ({
    page,
  }) => {
    await gotoLogin(page);
    const toggle = page.getByRole("button", { name: /Mostrar contraseña/i });
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("#password")).toHaveAttribute("type", "password");

    await toggle.click();
    await expect(
      page.getByRole("button", { name: /Ocultar contraseña/i }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#password")).toHaveAttribute("type", "text");
  });

  test("el html tiene lang=es-AR y existe el skip-link", async ({ page }) => {
    await gotoLogin(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
    await expect(page.locator("a.skip-link")).toHaveCount(1);
  });

  test("el foco se mueve al banner role=alert cuando aparece (REQ-11)", async ({
    page,
  }) => {
    await page.route("**/api/auth/login", (route) => route.abort("failed"));
    await gotoLogin(page);
    await fillCredentials(page);
    await submit(page).click();

    const banner = page.locator('[data-slot="alert"][role="alert"]');
    await expect(banner).toBeVisible({ timeout: 8000 });
    await expect(banner).toBeFocused();
  });

  test("links a /registro y a recuperación presentes (REQ-12)", async ({
    page,
  }) => {
    await gotoLogin(page);
    await expect(page.locator('a[href="/registro"]')).toBeVisible();
    await expect(page.locator('a[href="/recuperar-contrasena"]')).toBeVisible();
  });
});
