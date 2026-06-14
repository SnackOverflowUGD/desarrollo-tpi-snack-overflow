/**
 * Unit tests for filtrarYPaginarPorCobertura (RN-CAT-06).
 *
 * Pure function — no DB. Proves the corrected behavior: coverage filter applies
 * to the FULL candidate set, `total` is the real match count, and the requested
 * page is sliced AFTER filtering (so pages fill correctly and totals are right).
 */
import { filtrarYPaginarPorCobertura } from './cobertura-paginacion.util.js';

interface Candidato {
  id: number;
  dentro: boolean; // is this candidate inside the requested zone?
}

// 10 candidates, 6 inside the polygon (ids 1,3,5,6,8,10), 4 outside.
const CANDIDATOS: Candidato[] = [
  { id: 1, dentro: true },
  { id: 2, dentro: false },
  { id: 3, dentro: true },
  { id: 4, dentro: false },
  { id: 5, dentro: true },
  { id: 6, dentro: true },
  { id: 7, dentro: false },
  { id: 8, dentro: true },
  { id: 9, dentro: false },
  { id: 10, dentro: true },
];

const cubre = (c: Candidato) => c.dentro;

describe('filtrarYPaginarPorCobertura', () => {
  it('total is the REAL count of matching candidates, not the page length (RN-CAT-06)', () => {
    const result = filtrarYPaginarPorCobertura(CANDIDATOS, cubre, 1, 4);
    // 6 of 10 are inside the zone.
    expect(result.total).toBe(6);
    // First page holds 4 of those 6.
    expect(result.data.map((c) => c.id)).toEqual([1, 3, 5, 6]);
  });

  it('the requested page is sliced AFTER the coverage filter (pages fill correctly)', () => {
    // pageSize 2: page 1 → [1,3], page 2 → [5,6], page 3 → [8,10].
    expect(
      filtrarYPaginarPorCobertura(CANDIDATOS, cubre, 1, 2).data.map((c) => c.id),
    ).toEqual([1, 3]);
    expect(
      filtrarYPaginarPorCobertura(CANDIDATOS, cubre, 2, 2).data.map((c) => c.id),
    ).toEqual([5, 6]);
    expect(
      filtrarYPaginarPorCobertura(CANDIDATOS, cubre, 3, 2).data.map((c) => c.id),
    ).toEqual([8, 10]);
  });

  it('last page under-fills with the remainder, total still reflects all matches', () => {
    // 6 matches, pageSize 4 → page 2 has the remaining 2.
    const page2 = filtrarYPaginarPorCobertura(CANDIDATOS, cubre, 2, 4);
    expect(page2.total).toBe(6);
    expect(page2.data.map((c) => c.id)).toEqual([8, 10]);
    expect(page2.page).toBe(2);
    expect(page2.pageSize).toBe(4);
  });

  it('a page beyond the matches is empty but total is unchanged', () => {
    const page3 = filtrarYPaginarPorCobertura(CANDIDATOS, cubre, 3, 4);
    expect(page3.data).toEqual([]);
    expect(page3.total).toBe(6);
  });

  it('zero matches → empty page and total 0', () => {
    const result = filtrarYPaginarPorCobertura(
      CANDIDATOS,
      () => false,
      1,
      20,
    );
    expect(result.data).toEqual([]);
    expect(result.total).toBe(0);
  });

  it('clamps page and pageSize below 1 to 1', () => {
    const result = filtrarYPaginarPorCobertura(CANDIDATOS, cubre, 0, 0);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(1);
    expect(result.data.map((c) => c.id)).toEqual([1]);
    expect(result.total).toBe(6);
  });
});
