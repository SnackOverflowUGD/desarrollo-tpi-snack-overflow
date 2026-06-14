/**
 * E2E tests for password recovery — UC02 UI (secundario).
 *
 * Spec:   openspec/changes/uc02-ui-login/spec.md  (REQ-09/10, ESC-UI-08/09/10)
 * Design: openspec/changes/uc02-ui-login/design.md  (§5.2/5.3, OCL §9)
 *
 * Strategy (mirrors e2e/registro.spec.ts): mock the backend via page.route().
 *  - forgot/reset hit the blind same-origin rewrite (no Route Handler, no cookie),
 *    so **\/api\/auth\/forgot-password and **\/api\/auth\/reset-password are
 *    intercepted directly.
 *  - Copy strings are asserted via expected values from lib/copy/es-AR.ts.
 */

import { expect, test, type Page } from "@playwright/test";

// ─── helpers ────────────────────────────────────────────────────────────────

async function gotoForgot(page: Page) {
  await page.goto("/recuperar-contrasena");
  await page.waitForSelector("form[novalidate]", { state: "visible" });
}

async function gotoReset(page: Page, query = "") {
  await page.goto(`/restablecer-contrasena${query}`);
  // The page may render a form OR the "Enlace expirado" screen (no form).
  await page.waitForLoadState("domcontentloaded");
}

function mock(page: Page, urlGlob: string, status: number, body: object = {}) {
  return page.route(urlGlob, async (route) => {
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });
}

// ─── ESC-UI-08: forgot-password → mensaje neutro SIEMPRE (anti-enum) ───────────

test.describe("ESC-UI-08 — Recuperación: mensaje neutro", () => {
  test("email registrado o no → SIEMPRE el mismo mensaje neutro (role=status)", async ({
    page,
  }) => {
    // REQ-09, RN-AUTH-05, RNF-S.4. El backend responde 200 siempre.
    await mock(page, "**/api/auth/forgot-password", 200, { ok: true });

    await gotoForgot(page);
    await page.fill("#email", "cualquiera@ejemplo.com");
    await page.getByRole("button", { name: /Enviar enlace|Enviando/i }).click();

    const status = page.locator('[data-slot="alert"][role="status"]');
    await expect(status).toBeVisible({ timeout: 5000 });
    await expect(status).toHaveText(
      "Si ese e-mail está registrado, te enviamos un enlace para restablecer tu contraseña.",
    );
    // Anti-enumeración: no confirma ni niega la existencia de la cuenta.
    await expect(page.locator("body")).not.toContainText(/no existe|no encontrad|registrado correctamente/i);
  });

  test("email inválido (sin @) en blur → error inline, no se envía", async ({
    page,
  }) => {
    let requestMade = false;
    await page.route("**/api/auth/forgot-password", async (route) => {
      requestMade = true;
      await route.continue();
    });

    await gotoForgot(page);
    const email = page.locator("#email");
    await email.fill("noarroba");
    await email.blur();
    await expect(page.locator("#email-error")).toBeVisible();

    await page.getByRole("button", { name: /Enviar enlace/i }).click();
    await page.waitForTimeout(400);
    expect(requestMade).toBe(false);
  });

  test("error de red en forgot → banner role=alert reintentable (REQ-10)", async ({
    page,
  }) => {
    await page.route("**/api/auth/forgot-password", (route) => route.abort("failed"));

    await gotoForgot(page);
    await page.fill("#email", "ana@ejemplo.com");
    await page.getByRole("button", { name: /Enviar enlace/i }).click();

    const banner = page.locator('[data-slot="alert"][role="alert"]');
    await expect(banner).toBeVisible({ timeout: 8000 });
    await expect(banner).toHaveText(/conex/i);
    // El form sigue disponible (no se muestra el mensaje neutro).
    await expect(page.locator("#email")).toHaveValue("ana@ejemplo.com");
  });
});

// ─── ESC-UI-09: reset-password con token ───────────────────────────────────────

test.describe("ESC-UI-09 — Restablecer contraseña", () => {
  test("sin token en la URL → pantalla 'Enlace expirado' con CTA (sin form)", async ({
    page,
  }) => {
    // REQ-09: token ausente/vacío → no se muestra el form.
    await gotoReset(page); // no ?token

    await expect(page.getByText("Enlace expirado")).toBeVisible();
    const cta = page.locator('a[href="/recuperar-contrasena"]');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveText(/Pedir un nuevo enlace/i);
    // No hay campos de contraseña.
    await expect(page.locator("#newPassword")).toHaveCount(0);
  });

  test("confirmación que no coincide → error inline (validación cliente)", async ({
    page,
  }) => {
    await gotoReset(page, "?token=valid-token-123");
    await page.fill("#newPassword", "NuevaPass1!");
    await page.fill("#confirmPassword", "OtraDistinta1!");
    await page.locator("#confirmPassword").blur();

    const err = page.locator("#confirmPassword-error");
    await expect(err).toBeVisible();
    await expect(err).toHaveText(/no coinciden/i);
  });

  test("password <8 → error inline, no se envía", async ({ page }) => {
    let requestMade = false;
    await page.route("**/api/auth/reset-password", async (route) => {
      requestMade = true;
      await route.continue();
    });

    await gotoReset(page, "?token=valid-token-123");
    await page.fill("#newPassword", "corta");
    await page.locator("#newPassword").blur();
    await expect(page.locator("#newPassword-error")).toBeVisible();
    await expect(page.locator("#newPassword-error")).toHaveText(/al menos 8/i);

    await page.getByRole("button", { name: /Guardar contraseña/i }).click();
    await page.waitForTimeout(400);
    expect(requestMade).toBe(false);
  });

  test("200 → éxito (role=status) y redirige a /login", async ({ page }) => {
    // ESC-UI-09 happy path.
    await mock(page, "**/api/auth/reset-password", 200, { ok: true });
    await page.route("**/login**", (route, request) =>
      request.resourceType() === "document"
        ? route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>Login</body></html>" })
        : route.continue(),
    );

    await gotoReset(page, "?token=valid-token-123");
    await page.fill("#newPassword", "NuevaPass1!");
    await page.fill("#confirmPassword", "NuevaPass1!");
    await page.getByRole("button", { name: /Guardar contraseña/i }).click();

    await page.waitForURL(/\/login/, { timeout: 10000 });
  });

  test("token vencido/usado (410) → pantalla 'Enlace expirado' + CTA, sin cambio", async ({
    page,
  }) => {
    // ESC-UI-09 / UC02 ESC-07.
    await mock(page, "**/api/auth/reset-password", 410, { message: "Token expired" });

    await gotoReset(page, "?token=stale-token");
    await page.fill("#newPassword", "NuevaPass1!");
    await page.fill("#confirmPassword", "NuevaPass1!");
    await page.getByRole("button", { name: /Guardar contraseña/i }).click();

    await expect(page.getByText("Enlace expirado")).toBeVisible({ timeout: 5000 });
    const cta = page.locator('a[href="/recuperar-contrasena"]');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveText(/Pedir un nuevo enlace/i);
    await expect(page.locator("body")).not.toContainText("Token expired");
  });

  test("422 del servidor (pass corta) → error inline en newPassword", async ({
    page,
  }) => {
    await mock(page, "**/api/auth/reset-password", 422, {
      statusCode: 422,
      message: ["newPassword must be longer than or equal to 8 characters"],
      error: "Unprocessable Entity",
    });

    await gotoReset(page, "?token=valid-token-123");
    // Pasa la validación cliente (>=8) para llegar al mock 422.
    await page.fill("#newPassword", "OchoChars");
    await page.fill("#confirmPassword", "OchoChars");
    await page.getByRole("button", { name: /Guardar contraseña/i }).click();

    const err = page.locator("#newPassword-error");
    await expect(err).toBeVisible({ timeout: 5000 });
    await expect(err).toHaveText(/al menos 8/i);
    await expect(err).not.toHaveText(/must be longer/i);
  });

  test("error de red en reset → banner role=alert reintentable (REQ-10)", async ({
    page,
  }) => {
    await page.route("**/api/auth/reset-password", (route) => route.abort("failed"));

    await gotoReset(page, "?token=valid-token-123");
    await page.fill("#newPassword", "NuevaPass1!");
    await page.fill("#confirmPassword", "NuevaPass1!");
    await page.getByRole("button", { name: /Guardar contraseña/i }).click();

    const banner = page.locator('[data-slot="alert"][role="alert"]');
    await expect(banner).toBeVisible({ timeout: 8000 });
    await expect(banner).toHaveText(/conex/i);
  });
});

// ─── Accesibilidad recuperación (REQ-11) ───────────────────────────────────────

test.describe("Accesibilidad recuperación — REQ-11", () => {
  test("forgot: label visible y aria-required en email", async ({ page }) => {
    await gotoForgot(page);
    await expect(page.locator('label[for="email"]')).toBeVisible();
    await expect(page.locator("#email")).toHaveAttribute("aria-required", "true");
  });

  test("reset: toggle mostrar/ocultar contraseña con aria-pressed", async ({
    page,
  }) => {
    await gotoReset(page, "?token=valid-token-123");
    const toggle = page.getByRole("button", { name: /Mostrar contraseña/i });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("#newPassword")).toHaveAttribute("type", "password");
    await toggle.click();
    await expect(page.locator("#newPassword")).toHaveAttribute("type", "text");
  });
});
