/**
 * Pure coverage-filter + pagination helper (RN-CAT-06).
 *
 * The coverage (point-in-polygon) check cannot run in SQL because zones are
 * stored as GeoJSON, not PostGIS. The previous implementation paginated in SQL
 * and THEN filtered by coverage, which (a) reported a wrong `total` (the post-
 * filter length of the current page) and (b) under-filled pages whenever some
 * rows on the page fell outside the zone.
 *
 * This function takes the FULL candidate set (already filtered by the SQL-able
 * predicates: cuenta activa + servicios publicados + visible + categoría exacta
 * + calificación mínima), applies the coverage predicate to the whole set, sets
 * `total` to the real count of matches, and only THEN slices the requested page.
 *
 * Pure: no DB, no I/O. The caller injects `cubre` so this stays unit-testable
 * with plain fixtures.
 */

export interface PaginacionCobertura<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * @param candidatos  full candidate set matching every non-geographic criterion
 * @param cubre       predicate: does this candidate cover the requested location?
 * @param page        1-based page number (values < 1 are clamped to 1)
 * @param pageSize    items per page (values < 1 are clamped to 1)
 */
export function filtrarYPaginarPorCobertura<T>(
  candidatos: readonly T[],
  cubre: (candidato: T) => boolean,
  page: number,
  pageSize: number,
): PaginacionCobertura<T> {
  const safePage = page >= 1 ? Math.floor(page) : 1;
  const safePageSize = pageSize >= 1 ? Math.floor(pageSize) : 1;

  const matching = candidatos.filter((c) => cubre(c));
  const total = matching.length;

  const skip = (safePage - 1) * safePageSize;
  const data = matching.slice(skip, skip + safePageSize);

  return { data, total, page: safePage, pageSize: safePageSize };
}
