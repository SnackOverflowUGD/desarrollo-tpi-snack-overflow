/**
 * Unit tests for normalizeOficios.
 *
 * Pure function — no DB. Proves the canonicalization contract: trim, drop
 * empties, case-insensitive dedup (first-seen casing wins), order preserved.
 */
import { normalizeOficios } from './oficios.util.js';

describe('normalizeOficios', () => {
  it('dedups case-insensitively, keeping the first-seen casing', () => {
    expect(normalizeOficios(['gasista', 'Gasista'])).toEqual(['gasista']);
  });

  it('trims surrounding whitespace', () => {
    expect(normalizeOficios([' Gasista '])).toEqual(['Gasista']);
  });

  it('drops empty and whitespace-only entries', () => {
    expect(normalizeOficios(['Gasista', '', '  '])).toEqual(['Gasista']);
  });

  it('preserves order and keeps distinct oficios', () => {
    expect(normalizeOficios(['Albañil', 'Techista'])).toEqual([
      'Albañil',
      'Techista',
    ]);
  });

  it('returns an empty array for empty input', () => {
    expect(normalizeOficios([])).toEqual([]);
  });
});
