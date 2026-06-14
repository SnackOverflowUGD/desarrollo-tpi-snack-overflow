import { describe, it, expect } from "vitest";
import {
  criteriosFromSearchParams,
  criteriosToQueryString,
  withFiltroAplicado,
  limpiarFiltros,
  WHITELIST,
} from "@/lib/catalogo/query-params";
import type { CriteriosBusqueda } from "@/lib/catalogo/tipos";

describe("criteriosToQueryString", () => {
  it("emits ONLY whitelisted keys, never unknown params (Q1)", () => {
    // Inject an unknown key at runtime to prove it is never serialized.
    const c = {
      oficio: "electricista",
      ubicacion: "Posadas",
      hack: "value",
    } as unknown as CriteriosBusqueda;
    const qs = criteriosToQueryString(c);
    const params = new URLSearchParams(qs);
    for (const key of params.keys()) {
      expect(WHITELIST).toContain(key);
    }
    expect(qs).not.toContain("hack");
  });

  it("omits undefined values (Q2)", () => {
    const c: CriteriosBusqueda = { oficio: "plomero", ubicacion: "Oberá" };
    const qs = criteriosToQueryString(c);
    expect(qs).toContain("oficio=plomero");
    expect(qs).toContain("ubicacion=Ober");
    expect(qs).not.toContain("orden=");
    expect(qs).not.toContain("page=");
  });

  it("round-trips through criteriosFromSearchParams for valid keys (Q3)", () => {
    const c: CriteriosBusqueda = {
      oficio: "gasista",
      ubicacion: "Posadas",
      orden: "distancia",
      calificacionMin: 4,
      page: 2,
      pageSize: 20,
    };
    const qs = criteriosToQueryString(c);
    const sp = Object.fromEntries(new URLSearchParams(qs));
    expect(criteriosFromSearchParams(sp)).toEqual(c);
  });
});

describe("criteriosFromSearchParams", () => {
  it("discards unknown keys (Q4)", () => {
    const result = criteriosFromSearchParams({
      oficio: "pintor",
      ubicacion: "Eldorado",
      unknown: "x",
    });
    expect(result).toEqual({ oficio: "pintor", ubicacion: "Eldorado" });
    expect("unknown" in result).toBe(false);
  });

  it("ignores orden outside the enum (Q5)", () => {
    const result = criteriosFromSearchParams({ orden: "precio" });
    expect(result.orden).toBeUndefined();
  });

  it("accepts valid orden values", () => {
    expect(criteriosFromSearchParams({ orden: "calificacion" }).orden).toBe("calificacion");
    expect(criteriosFromSearchParams({ orden: "disponibilidad" }).orden).toBe("disponibilidad");
  });

  it("ignores calificacionMin outside 1..5 and page<1 (Q6)", () => {
    expect(criteriosFromSearchParams({ calificacionMin: "0" }).calificacionMin).toBeUndefined();
    expect(criteriosFromSearchParams({ calificacionMin: "6" }).calificacionMin).toBeUndefined();
    expect(criteriosFromSearchParams({ calificacionMin: "abc" }).calificacionMin).toBeUndefined();
    expect(criteriosFromSearchParams({ page: "0" }).page).toBeUndefined();
    expect(criteriosFromSearchParams({ page: "-1" }).page).toBeUndefined();
  });

  it("keeps valid calificacionMin and page", () => {
    expect(criteriosFromSearchParams({ calificacionMin: "3" }).calificacionMin).toBe(3);
    expect(criteriosFromSearchParams({ page: "5" }).page).toBe(5);
  });

  it("takes the first value when a key repeats (array)", () => {
    expect(criteriosFromSearchParams({ oficio: ["a", "b"] }).oficio).toBe("a");
  });

  it("drops empty/whitespace oficio and ubicacion", () => {
    const result = criteriosFromSearchParams({ oficio: "  ", ubicacion: "" });
    expect(result.oficio).toBeUndefined();
    expect(result.ubicacion).toBeUndefined();
  });
});

describe("withFiltroAplicado", () => {
  it("applies the patch and resets page to 1", () => {
    const c: CriteriosBusqueda = { oficio: "a", ubicacion: "b", page: 4 };
    const next = withFiltroAplicado(c, { orden: "distancia" });
    expect(next.orden).toBe("distancia");
    expect(next.page).toBe(1);
    // Original is not mutated.
    expect(c.page).toBe(4);
  });
});

describe("limpiarFiltros", () => {
  it("keeps oficio+ubicacion+pageSize, drops filters, page=1", () => {
    const c: CriteriosBusqueda = {
      oficio: "a",
      ubicacion: "b",
      orden: "distancia",
      calificacionMin: 4,
      page: 3,
      pageSize: 20,
    };
    const next = limpiarFiltros(c);
    expect(next).toEqual({ oficio: "a", ubicacion: "b", pageSize: 20, page: 1 });
  });
});
