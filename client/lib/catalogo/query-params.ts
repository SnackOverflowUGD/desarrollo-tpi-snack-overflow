/**
 * Pure URL-state helpers — the testable heart of ADR-04-01/03 (REQ-02, OCL §8).
 *
 * No DOM, no fetch. `criteriosFromSearchParams` parses the awaited searchParams
 * into normalized criteria (dropping unknown keys / invalid values, NEVER
 * throwing). `criteriosToQueryString` serializes ONLY whitelisted, defined
 * keys, so the backend's `forbidNonWhitelisted` whitelist can never 400 us.
 */
import {
  type CriteriosBusqueda,
  type Orden,
  ORDENES,
} from "@/lib/catalogo/tipos";

/** The only keys ever serialized to / read from the query string (REQ-02). */
export const WHITELIST = [
  "oficio",
  "ubicacion",
  "orden",
  "calificacionMin",
  "fecha",
  "page",
  "pageSize",
] as const;

/** Narrows a raw searchParams value to a single string (first wins for arrays). */
function single(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

function isOrden(v: string | undefined): v is Orden {
  return typeof v === "string" && (ORDENES as readonly string[]).includes(v);
}

/** Parses a positive integer string; returns undefined for anything invalid. */
function parseIntStrict(v: string | undefined): number | undefined {
  if (v === undefined || v.trim() === "") return undefined;
  if (!/^-?\d+$/.test(v.trim())) return undefined;
  return Number.parseInt(v, 10);
}

/**
 * searchParams (already awaited) → normalized Partial<CriteriosBusqueda>.
 * Unknown keys are ignored; out-of-range / out-of-enum values are dropped.
 * `oficio`/`ubicacion` may be absent → the RSC guard decides (ADR-04-03).
 * NEVER throws.
 */
export function criteriosFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): Partial<CriteriosBusqueda> {
  const out: Partial<CriteriosBusqueda> = {};

  const oficio = single(sp.oficio)?.trim();
  if (oficio) out.oficio = oficio;

  const ubicacion = single(sp.ubicacion)?.trim();
  if (ubicacion) out.ubicacion = ubicacion;

  const orden = single(sp.orden);
  if (isOrden(orden)) out.orden = orden;

  const calificacionMin = parseIntStrict(single(sp.calificacionMin));
  if (
    calificacionMin !== undefined &&
    calificacionMin >= 1 &&
    calificacionMin <= 5
  ) {
    out.calificacionMin = calificacionMin;
  }

  const fecha = single(sp.fecha)?.trim();
  if (fecha) out.fecha = fecha;

  const page = parseIntStrict(single(sp.page));
  if (page !== undefined && page >= 1) out.page = page;

  const pageSize = parseIntStrict(single(sp.pageSize));
  if (pageSize !== undefined && pageSize >= 1) out.pageSize = pageSize;

  return out;
}

/**
 * CriteriosBusqueda → query string with ONLY whitelisted, defined keys.
 * Guarantees REQ-02: never emits an unknown param. No leading "?".
 */
export function criteriosToQueryString(c: CriteriosBusqueda): string {
  const params = new URLSearchParams();

  for (const key of WHITELIST) {
    const value = c[key];
    if (value === undefined || value === null) continue;
    const str = String(value).trim();
    if (str === "") continue;
    params.set(key, str);
  }

  return params.toString();
}

/**
 * Applies a filter/order patch and resets to page 1 (REQ-02). Returns a new
 * object; never mutates the input.
 */
export function withFiltroAplicado(
  c: CriteriosBusqueda,
  patch: Partial<CriteriosBusqueda>,
): CriteriosBusqueda {
  return { ...c, ...patch, page: 1 };
}

/**
 * "Limpiar filtros": keeps oficio + ubicacion, drops orden/calificacionMin/
 * fecha, resets page to 1 (REQ-02). pageSize is preserved.
 */
export function limpiarFiltros(c: CriteriosBusqueda): CriteriosBusqueda {
  return {
    oficio: c.oficio,
    ubicacion: c.ubicacion,
    pageSize: c.pageSize,
    page: 1,
  };
}
