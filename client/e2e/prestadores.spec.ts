/**
 * E2E tests for the public provider SEARCH / LISTING screen — UC04 UI.
 *
 * Spec:   openspec/changes/uc04-ui-busqueda-perfil/spec.md  (REQ-01..12, ESC-UI-01..07)
 * Design: openspec/changes/uc04-ui-busqueda-perfil/design.md (ADR-04-01..06, OCL §8)
 *
 * ARCHITECTURE NOTE (read before changing mocks):
 *  - /prestadores is a SERVER COMPONENT. `await searchParams` → buscarPrestadores()
 *    runs SERVER-SIDE (Next server → BACKEND_URL). The browser NEVER fetches the
 *    backend directly, so `page.route('**\/catalogo/prestadores**')` CANNOT
 *    intercept the listing fetch (it lives behind the RSC). For data-dependent
 *    states (results cards) we therefore drive the REAL stack against the running
 *    backend; with the seed DB empty the runtime path is the NEUTRAL empty state
 *    (ESC-UI-03), which we assert here. Results-with-data (ESC-UI-01 cards) is
 *    verified by runtime probe + documented in verify.md (same mock-vs-runtime
 *    split UC02 documented for the cookie loop).
 *  - The CLIENT behaviours (validation block, no-HTTP-on-invalid, URL changes on
 *    submit/filter, a11y attributes) ARE fully exercised here — they need no mock.
 *
 * Mirrors the precedent e2e/login.spec.ts + e2e/registro.spec.ts.
 */
import { expect, test, type Page } from "@playwright/test";

// ─── shared helpers ────────────────────────────────────────────────────────────

/** Navigates to /prestadores (optionally with a query) and waits for hydration. */
async function gotoPrestadores(page: Page, query = "") {
  await page.goto(`/prestadores${query}`);
  await page.waitForSelector("form[novalidate]", { state: "visible" });
}

const submit = (page: Page) =>
  page.getByRole("button", { name: /Buscar|Buscando/i });

// ─── ESC-UI-02: validación cliente — oficio/ubicación faltante bloquea el submit ─

test.describe("ESC-UI-02 — Validación cliente bloquea el submit", () => {
  test("oficio + ubicación vacíos → NO navega, ErrorText + aria-invalid en ambos", async ({
    page,
  }) => {
    // REQ-01. No HTTP / no navigation when invalid (the search lives in the URL,
    // so "no navigation" == "no request would be issued").
    await gotoPrestadores(page);

    // Intercept ANY navigation to a search URL to prove none happens.
    let navigatedToSearch = false;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame() && /\/prestadores\?.*oficio=/.test(frame.url())) {
        navigatedToSearch = true;
      }
    });

    await submit(page).click();
    await page.waitForTimeout(500);

    expect(navigatedToSearch).toBe(false);
    // URL must NOT have gained search params.
    await expect(page).not.toHaveURL(/oficio=/);

    const oficioErr = page.locator("#oficio-error");
    await expect(oficioErr).toBeVisible();
    await expect(oficioErr).toHaveText("Elegí un oficio.");
    await expect(page.locator("#oficio")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#oficio")).toHaveAttribute(
      "aria-describedby",
      "oficio-error",
    );

    const ubicErr = page.locator("#ubicacion-error");
    await expect(ubicErr).toBeVisible();
    await expect(ubicErr).toHaveText("Ingresá una ubicación.");
    await expect(page.locator("#ubicacion")).toHaveAttribute("aria-invalid", "true");
  });

  test("solo ubicación faltante → bloquea con error en ubicación", async ({ page }) => {
    await gotoPrestadores(page);
    await page.fill("#oficio", "Electricista");
    // ubicación queda vacía
    await submit(page).click();
    await page.waitForTimeout(400);

    await expect(page).not.toHaveURL(/oficio=/);
    await expect(page.locator("#ubicacion-error")).toBeVisible();
    await expect(page.locator("#ubicacion-error")).toHaveText("Ingresá una ubicación.");
  });

  test("oficio es TEXTO LIBRE: cualquier valor no-vacío pasa la validación cliente", async ({
    page,
  }) => {
    // Grounding: oficio is free text (no enum gate). A non-suggested value must
    // still pass client validation and navigate to a search URL.
    await gotoPrestadores(page);
    await page.fill("#oficio", "Domador de caballos"); // not in the suggestion list
    await page.fill("#ubicacion", "Rosario");
    await submit(page).click();

    await page.waitForURL(/\/prestadores\?.*oficio=Domador/, { timeout: 10000 });
    // No client error surfaced.
    await expect(page.locator("#oficio-error")).toHaveCount(0);
  });
});

// ─── ESC-UI-01 (client path) — submit válido navega a la URL de búsqueda ────────

test.describe("ESC-UI-01 — Submit válido construye la URL de búsqueda", () => {
  test("oficio + ubicación válidos → router.push('/prestadores?oficio=..&ubicacion=..&page=1')", async ({
    page,
  }) => {
    // REQ-01/05. The search is URL-state (ADR-04-01): a valid submit changes the
    // URL with whitelisted params and page=1. Data rendering is SSR (runtime).
    await gotoPrestadores(page);
    await page.fill("#oficio", "Electricista");
    await page.fill("#ubicacion", "Córdoba");
    await submit(page).click();

    await page.waitForURL(/\/prestadores\?/, { timeout: 10000 });
    const url = new URL(page.url());
    expect(url.searchParams.get("oficio")).toBe("Electricista");
    expect(url.searchParams.get("ubicacion")).toBe("Córdoba");
    expect(url.searchParams.get("page")).toBe("1");
    // REQ-02: never emits an unknown param (whitelist).
    for (const key of url.searchParams.keys()) {
      expect([
        "oficio",
        "ubicacion",
        "orden",
        "calificacionMin",
        "fecha",
        "page",
        "pageSize",
      ]).toContain(key);
    }
  });

  test("orden por defecto es Calificación (RN-CAT-03) y la barra hidrata desde la URL", async ({
    page,
  }) => {
    // REQ-02 default order. With criteria present, the filters panel renders and
    // the order Select shows "Calificación".
    await gotoPrestadores(page, "?oficio=Electricista&ubicacion=Cordoba");
    // Bar hydrates its inputs from the URL.
    await expect(page.locator("#oficio")).toHaveValue("Electricista");
    await expect(page.locator("#ubicacion")).toHaveValue("Cordoba");
    // Desktop sidebar order selector defaults to "Calificación".
    const ordenTrigger = page.locator("#orden");
    await expect(ordenTrigger).toBeVisible();
    await expect(ordenTrigger).toHaveText(/Calificación/);
  });
});

// ─── ESC-UI-03 — Sin resultados (200 data:[]) = estado NEUTRO, no error ─────────

test.describe("ESC-UI-03 — Sin resultados (estado neutro, NO error)", () => {
  test("búsqueda con DB vacía → role=status, mensaje con {oficio}/{ubicacion}, NO role=alert", async ({
    page,
  }) => {
    // REQ-05 / ESC-UI-03 — verified against the REAL backend (seed DB empty →
    // 200 {data:[],total:0}); the RSC maps total===0 → <EstadoVacio/>.
    await gotoPrestadores(page, "?oficio=Electricista&ubicacion=Cordoba");

    const status = page.locator('[role="status"]');
    await expect(status.first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator("body")).toContainText(
      "No encontramos prestadores para Electricista en Cordoba.",
    );
    // The location guidance is ALWAYS present (covers geocoding-fail, S4).
    await expect(page.locator("body")).toContainText(
      /revisá o precisá la ubicación/i,
    );
    // It is NOT an error: no error Alert banner (the global Sonner toaster region
    // also carries role="alert" but is empty — we scope to the Alert primitive).
    await expect(page.locator('[data-slot="alert"][role="alert"]')).toHaveCount(0);
    await expect(page.locator("body")).not.toContainText("Algo salió mal");

    // The search form stays visible and editable (the CDU resumes at criteria input).
    await expect(page.locator("#oficio")).toBeEditable();
    await expect(page.locator("#ubicacion")).toBeEditable();
  });
});

// ─── ESC-UI-04 — Cambio de orden/filtro re-ejecuta la búsqueda (URL) sin recarga ─

test.describe("ESC-UI-04 — Filtros/orden editan la URL (page=1, whitelist)", () => {
  test("cambiar orden a Distancia → URL gana orden=distancia y page=1, sin full reload", async ({
    page,
  }) => {
    // REQ-02 / RN-CAT-03/04. Start on page 3 to prove the reset to page=1.
    await gotoPrestadores(page, "?oficio=Plomero&ubicacion=Cordoba&page=3");

    // Detect a full reload (would set this flag false→reload clears it).
    await page.evaluate(() => ((window as unknown as { __noReload: boolean }).__noReload = true));

    const ordenTrigger = page.locator("#orden");
    await ordenTrigger.click();
    await page.getByRole("option", { name: "Distancia" }).click();

    await page.waitForURL(/orden=distancia/, { timeout: 10000 });
    const url = new URL(page.url());
    expect(url.searchParams.get("orden")).toBe("distancia");
    expect(url.searchParams.get("page")).toBe("1"); // reset to first page (REQ-02)
    expect(url.searchParams.get("oficio")).toBe("Plomero"); // preserved
    expect(url.searchParams.get("ubicacion")).toBe("Cordoba");

    // Client navigation (App Router), NOT a full document reload.
    const noReload = await page.evaluate(
      () => (window as unknown as { __noReload?: boolean }).__noReload,
    );
    expect(noReload).toBe(true);
  });


  test('"Limpiar filtros" conserva oficio+ubicación y borra los filtros adicionales', async ({
    page,
  }) => {
    await gotoPrestadores(
      page,
      "?oficio=Plomero&ubicacion=Cordoba&calificacionMin=5&orden=distancia",
    );
    await page
      .getByRole("complementary", { name: "Filtros" })
      .getByRole("button", { name: "Limpiar filtros" })
      .click();
    await page.waitForURL(
      (u) =>
        u.searchParams.get("calificacionMin") === null &&
        u.searchParams.get("orden") === null,
      { timeout: 10000 },
    );
    const url = new URL(page.url());
    expect(url.searchParams.get("calificacionMin")).toBeNull();
    expect(url.searchParams.get("orden")).toBeNull();
    expect(url.searchParams.get("oficio")).toBe("Plomero");
    expect(url.searchParams.get("ubicacion")).toBe("Cordoba");
  });
});

// ─── REQ-10 — Acceso público sin sesión ─────────────────────────────────────────

test.describe("REQ-10 — Acceso público sin sesión", () => {
  test("/prestadores es accesible sin cookie y NO redirige a /login", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/prestadores");
    await expect(page).toHaveURL(/\/prestadores$/);
    await expect(page).not.toHaveURL(/\/login/);
    await page.waitForSelector("form[novalidate]", { state: "visible" });
  });

  test("deep-link a /prestadores (sin params) muestra el estado inicial neutro, NO fetch", async ({
    page,
  }) => {
    // Guard ADR-04-03: without oficio||ubicacion the RSC does NOT fetch.
    await gotoPrestadores(page);
    await expect(page.locator("body")).toContainText("Buscá un oficio en tu zona");
    await expect(page.locator('[data-slot="alert"][role="alert"]')).toHaveCount(0);
  });
});

// ─── Accesibilidad (REQ-11) ─────────────────────────────────────────────────────

test.describe("Accesibilidad — REQ-11 (listado)", () => {
  test("campos oficio/ubicación con label visible (htmlFor) y aria-required", async ({
    page,
  }) => {
    await gotoPrestadores(page);
    for (const id of ["oficio", "ubicacion"]) {
      await expect(page.locator(`label[for="${id}"]`)).toBeVisible();
      await expect(page.locator(`#${id}`)).toHaveAttribute("aria-required", "true");
    }
  });

  test("oficio usa <input list=datalist> (texto libre), NO un <select> de enum", async ({
    page,
  }) => {
    // Grounding: oficio is free text with non-restrictive suggestions.
    await gotoPrestadores(page);
    const oficio = page.locator("#oficio");
    await expect(oficio).toHaveAttribute("list", "oficios-sugeridos");
    await expect(page.locator("datalist#oficios-sugeridos")).toHaveCount(1);
    // It is a real text input, not a combobox/select trigger.
    await expect(oficio).toHaveJSProperty("tagName", "INPUT");
  });

  test("el html tiene lang=es-AR", async ({ page }) => {
    await gotoPrestadores(page);
    await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");
  });

  test("inputs con font-size ≥16px (sin zoom en iOS, REQ-11)", async ({ page }) => {
    await gotoPrestadores(page);
    const fs = await page
      .locator("#oficio")
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(fs).toBeGreaterThanOrEqual(16);
  });
});
