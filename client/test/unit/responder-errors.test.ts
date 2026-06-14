import { describe, it, expect } from "vitest";
import { mapResponderError } from "@/lib/errors/field-errors";
import { copy } from "@/lib/copy/es-AR";

describe("mapResponderError — es-AR catalog, no traces (REQ-09..12)", () => {
  it("401 → redirect, no message", () => {
    const m = mapResponderError({ ok: false, kind: "unauthorized" });
    expect(m.redirect).toBe(true);
    expect(m.banner).toBeUndefined();
  });

  it("403 → forbidden banner", () => {
    const m = mapResponderError({ ok: false, kind: "forbidden" });
    expect(m.banner).toBe(copy.bandeja.forbidden);
  });

  it("404 → no disponible banner + refresh", () => {
    const m = mapResponderError({ ok: false, kind: "no_disponible" });
    expect(m.banner).toBe(copy.bandeja.noDisponible);
    expect(m.refresh).toBe(true);
  });

  it("409 → estado cambiado banner + refresh (actionable, not a failure)", () => {
    const m = mapResponderError({ ok: false, kind: "estado_cambiado" });
    expect(m.banner).toBe(copy.bandeja.estadoCambiado);
    expect(m.refresh).toBe(true);
  });

  it("422/400 → inline field error on precio", () => {
    const m = mapResponderError({ ok: false, kind: "validacion" });
    expect(m.field?.key).toBe("precioEstimado");
    expect(m.field?.message).toBe(copy.bandeja.errors.precioInvalido);
  });

  it("network → retry banner", () => {
    const m = mapResponderError({ ok: false, kind: "network" });
    expect(m.banner).toBe(copy.bandeja.errorResponder);
  });

  it("server → retry banner", () => {
    const m = mapResponderError({ ok: false, kind: "server", status: 500 });
    expect(m.banner).toBe(copy.bandeja.errorResponder);
  });
});
