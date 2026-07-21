/**
 * Pure normalization helper for the free-text `oficios` list.
 *
 * `prestadores.oficios` is a TypeORM `simple-array` of free-text strings with no
 * DB-level normalization, so the same trade can arrive with inconsistent casing
 * or padding (e.g. "gasista" from registration vs "Gasista" from profile edit),
 * producing duplicate-looking chips in the UI. This function collapses those
 * variants into a single canonical list.
 *
 * Pure: no DB, no I/O, no mutation of the input.
 */

/**
 * Trims each entry, drops empty/whitespace-only entries, and dedups
 * case-insensitively while preserving insertion order. For each distinct oficio
 * the FIRST-seen casing is kept.
 *
 * @param oficios raw list of oficio strings
 * @returns normalized list (trimmed, non-empty, case-insensitively deduped)
 */
export function normalizeOficios(oficios: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const oficio of oficios) {
    const trimmed = oficio.trim();
    if (trimmed === '') continue;

    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(trimmed);
  }

  return result;
}
