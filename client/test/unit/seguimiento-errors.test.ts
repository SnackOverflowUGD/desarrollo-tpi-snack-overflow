import { describe, it, expect } from "vitest";
import { mapSeguimientoError } from "@/lib/errors/field-errors";
import { copy } from "@/lib/copy/es-AR";

/**
 * UC09 — seguimiento error mapping (REQ-07/12/13). Each `ResponderResult` kind
 * maps to the es-AR catalog under `copy.seguimiento`; no backend traces leak.
 */

describe("mapSeguimientoError — kind → es-AR catalog", () => {
  it("unauthorized (401) → redirect, no visible message", () => {
    expect(mapSeguimientoError({ ok: false, kind: "unauthorized" })).toEqual({
      redirect: true,
    });
  });

  it("estado_cambiado (409) → actionable banner + refresh", () => {
    expect(mapSeguimientoError({ ok: false, kind: "estado_cambiado" })).toEqual({
      banner: copy.seguimiento.estadoCambiado,
      refresh: true,
    });
  });

  it("no_disponible (404) → 'ya no disponible' banner + refresh", () => {
    expect(mapSeguimientoError({ ok: false, kind: "no_disponible" })).toEqual({
      banner: copy.seguimiento.noDisponible,
      refresh: true,
    });
  });

  it("forbidden (403) → 'sin permiso' banner", () => {
    expect(mapSeguimientoError({ ok: false, kind: "forbidden" })).toEqual({
      banner: copy.seguimiento.forbidden,
    });
  });

  it("network → non-technical banner", () => {
    expect(mapSeguimientoError({ ok: false, kind: "network" })).toEqual({
      banner: copy.seguimiento.errorAccionar,
    });
  });

  it("server (5xx) → non-technical banner", () => {
    expect(
      mapSeguimientoError({ ok: false, kind: "server", status: 500 }),
    ).toEqual({ banner: copy.seguimiento.errorAccionar });
  });

  it("never exposes raw backend traces (every banner is a catalog string)", () => {
    const catalog = new Set<string>([
      copy.seguimiento.estadoCambiado,
      copy.seguimiento.noDisponible,
      copy.seguimiento.forbidden,
      copy.seguimiento.errorAccionar,
    ]);
    const kinds = [
      { ok: false, kind: "estado_cambiado" },
      { ok: false, kind: "no_disponible" },
      { ok: false, kind: "forbidden" },
      { ok: false, kind: "network" },
      { ok: false, kind: "server", status: 503 },
    ] as const;
    for (const k of kinds) {
      const mapped = mapSeguimientoError(k);
      if (mapped.banner) expect(catalog.has(mapped.banner)).toBe(true);
    }
  });
});
