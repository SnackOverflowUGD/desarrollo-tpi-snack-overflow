/**
 * Unit tests for TypeOrmPrestadorRepository — the data-access mapping logic
 * (coverage filtering + pagination total, profile servicios mapping).
 *
 * No real Postgres: the TypeORM Repository and its QueryBuilder are replaced by
 * in-memory fakes per team convention. These tests pin RN-CAT-06 (true total)
 * and RF-2.5 (profile carries the provider's published servicios).
 */
import { TypeOrmPrestadorRepository } from './typeorm-prestador.repository.js';
import { Prestador } from '../domain/prestador.entity.js';
import { Servicio } from '../domain/servicio.entity.js';
import { CoberturaZona } from '../domain/cobertura-zona.value.js';
import type { BusquedaCriteria } from '../ports/prestador-repository.port.js';
import type { IServicioRepository } from '../ports/servicio-repository.port.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A square zone around the origin: covers [-1,-1]..[1,1]. */
function zonaCuadrada(): ReturnType<CoberturaZona['toJSON']> {
  return new CoberturaZona(
    {
      type: 'Polygon',
      coordinates: [
        [
          [-1, -1],
          [1, -1],
          [1, 1],
          [-1, 1],
          [-1, -1],
        ],
      ],
    },
    'Centro',
  ).toJSON();
}

/** A far-away zone that does NOT cover the origin. */
function zonaLejana(): ReturnType<CoberturaZona['toJSON']> {
  return new CoberturaZona(
    {
      type: 'Polygon',
      coordinates: [
        [
          [10, 10],
          [12, 10],
          [12, 12],
          [10, 12],
          [10, 10],
        ],
      ],
    },
    'Lejos',
  ).toJSON();
}

function makePrestador(
  id: string,
  zona: ReturnType<CoberturaZona['toJSON']>,
): Prestador {
  const p = new Prestador();
  p.id = id;
  p.nombreCompleto = `Prestador ${id}`;
  p.oficios = ['plomero'];
  p.categoria = 'plomero';
  p.calificacionPromedio = 4.5;
  p.cantidadResenas = 3;
  p.zonaCobertura = zona;
  p.localidad = 'Posadas';
  p.cuentaActiva = true;
  p.tieneServiciosPublicados = true;
  p.visible = true;
  p.disponibilidadResumen = null;
  return p;
}

/**
 * Fake QueryBuilder: ignores the SQL predicates (those are exercised against a
 * real DB in e2e) and returns the seeded candidate rows. The point of this fake
 * is the APPLICATION-side logic: coverage filtering + pagination total.
 */
function fakeQueryBuilder(rows: Prestador[]) {
  const qb: Record<string, unknown> = {};
  for (const m of [
    'where',
    'andWhere',
    'orderBy',
    'addOrderBy',
    'skip',
    'take',
  ]) {
    qb[m] = jest.fn(() => qb);
  }
  qb.getMany = jest.fn(async () => rows);
  qb.getCount = jest.fn(async () => rows.length);
  return qb;
}

function makeRepo(rows: Prestador[], servicioRepo?: IServicioRepository) {
  const prestadorRepo = {
    createQueryBuilder: jest.fn(() => fakeQueryBuilder(rows)),
    findOne: jest.fn(
      async ({ where }: { where: { id: string } }) =>
        rows.find((r) => r.id === where.id) ?? null,
    ),
  };

  const fallbackServicioRepo: IServicioRepository = {
    findByPrestadorId: jest.fn(async () => []),
  };

  const repo = new TypeOrmPrestadorRepository(
    prestadorRepo as never,
    servicioRepo ?? fallbackServicioRepo,
  );
  return { repo, prestadorRepo };
}

const CRITERIA: BusquedaCriteria = {
  oficio: 'plomero',
  ubicacion: { lat: 0, lng: 0 }, // origin → inside the square zone
  page: 1,
  pageSize: 2,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TypeOrmPrestadorRepository.findByCobertura()', () => {
  it('RN-CAT-06: total is the count of providers covering the location, NOT the page length', async () => {
    // 5 candidates: 3 cover the origin, 2 are far away.
    const rows = [
      makePrestador('a', zonaCuadrada()),
      makePrestador('b', zonaLejana()),
      makePrestador('c', zonaCuadrada()),
      makePrestador('d', zonaLejana()),
      makePrestador('e', zonaCuadrada()),
    ];
    const { repo } = makeRepo(rows);

    const result = await repo.findByCobertura({ ...CRITERIA, pageSize: 2 });

    // 3 providers actually cover the origin → total MUST be 3 (not 2 = page len).
    expect(result.total).toBe(3);
    // Page 1 (size 2) holds the first 2 COVERING providers.
    expect(result.data.map((r) => r.id)).toEqual(['a', 'c']);
  });

  it('RN-CAT-06: page 2 returns the remaining covering provider (page fills after filter)', async () => {
    const rows = [
      makePrestador('a', zonaCuadrada()),
      makePrestador('b', zonaLejana()),
      makePrestador('c', zonaCuadrada()),
      makePrestador('d', zonaLejana()),
      makePrestador('e', zonaCuadrada()),
    ];
    const { repo } = makeRepo(rows);

    const result = await repo.findByCobertura({
      ...CRITERIA,
      page: 2,
      pageSize: 2,
    });

    expect(result.total).toBe(3);
    expect(result.data.map((r) => r.id)).toEqual(['e']);
  });
});

describe('TypeOrmPrestadorRepository.findByIdWithProfile()', () => {
  it('RF-2.5: profile carries the providers published servicios (not hardcoded empty)', async () => {
    const rows = [makePrestador('p1', zonaCuadrada())];

    const servicio = new Servicio();
    servicio.id = 's1';
    servicio.prestadorId = 'p1';
    servicio.categoria = 'plomero';
    servicio.descripcion = 'Destapaciones';
    servicio.rangoPrecioMin = 1000;
    servicio.rangoPrecioMax = 5000;
    servicio.visible = true;

    const servicioRepo: IServicioRepository = {
      findByPrestadorId: jest.fn(async () => [servicio]),
    };

    const { repo } = makeRepo(rows, servicioRepo);

    const perfil = await repo.findByIdWithProfile('p1');

    expect(servicioRepo.findByPrestadorId).toHaveBeenCalledWith('p1');
    expect(perfil).not.toBeNull();
    expect(perfil!.servicios).toHaveLength(1);
    expect(perfil!.servicios[0]).toEqual({
      id: 's1',
      categoria: 'plomero',
      descripcion: 'Destapaciones',
      rangoPrecio: { min: 1000, max: 5000 },
    });
  });

  it('returns null when the provider does not exist', async () => {
    const { repo } = makeRepo([]);
    expect(await repo.findByIdWithProfile('missing')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// UAT-02 — disponibilidad stale-snapshot guard
// ---------------------------------------------------------------------------

describe('TypeOrmPrestadorRepository.toResumen() — disponibilidad mapping', () => {
  it('UAT-02: downgrades disponible_esta_semana to sin_disponibilidad when franjasDisponiblesProximos7Dias is 0', async () => {
    const p = makePrestador('p-stale-0', zonaCuadrada());
    p.disponibilidadResumen = {
      estado: 'disponible_esta_semana',
      franjasDisponiblesProximos7Dias: 0,
    };
    const { repo } = makeRepo([p]);

    const result = await repo.findByCobertura({ ...CRITERIA, pageSize: 10 });

    expect(result.data[0].disponibilidad).toBe('sin_disponibilidad');
  });

  it('UAT-02: downgrades disponible_esta_semana to sin_disponibilidad when franjasDisponiblesProximos7Dias is undefined', async () => {
    const p = makePrestador('p-stale-undef', zonaCuadrada());
    p.disponibilidadResumen = {
      estado: 'disponible_esta_semana',
      franjasDisponiblesProximos7Dias: undefined,
    };
    const { repo } = makeRepo([p]);

    const result = await repo.findByCobertura({ ...CRITERIA, pageSize: 10 });

    expect(result.data[0].disponibilidad).toBe('sin_disponibilidad');
  });

  it('keeps disponible_esta_semana when franjasDisponiblesProximos7Dias is > 0', async () => {
    const p = makePrestador('p-available', zonaCuadrada());
    p.disponibilidadResumen = {
      estado: 'disponible_esta_semana',
      franjasDisponiblesProximos7Dias: 3,
    };
    const { repo } = makeRepo([p]);

    const result = await repo.findByCobertura({ ...CRITERIA, pageSize: 10 });

    expect(result.data[0].disponibilidad).toBe('disponible_esta_semana');
  });

  it('passes through proxima_disponible and sin_disponibilidad unchanged', async () => {
    const pProxima = makePrestador('p-proxima', zonaCuadrada());
    pProxima.disponibilidadResumen = {
      estado: 'proxima_disponible',
      proximaFecha: '2026-06-20',
    };
    const pSin = makePrestador('p-sin', zonaCuadrada());
    pSin.disponibilidadResumen = { estado: 'sin_disponibilidad' };

    const { repo: repoProxima } = makeRepo([pProxima]);
    const { repo: repoSin } = makeRepo([pSin]);

    const resultProxima = await repoProxima.findByCobertura({
      ...CRITERIA,
      pageSize: 10,
    });
    const resultSin = await repoSin.findByCobertura({
      ...CRITERIA,
      pageSize: 10,
    });

    expect(resultProxima.data[0].disponibilidad).toBe('proxima_disponible');
    expect(resultSin.data[0].disponibilidad).toBe('sin_disponibilidad');
  });
});

// ---------------------------------------------------------------------------
// UAT-01 — centroCobertura population from zonaCobertura
// ---------------------------------------------------------------------------

/**
 * Zone A: [-1,-1]..[1,1] — centroid at (0,0). Already covers origin.
 * Zone B: [-1,-1]..[10,1] — centroid at lng≈4.5, lat≈0. Also covers origin.
 */
function zonaAncha(): ReturnType<CoberturaZona['toJSON']> {
  return new CoberturaZona(
    {
      type: 'Polygon',
      coordinates: [
        [
          [-1, -1],
          [10, -1],
          [10, 1],
          [-1, 1],
          [-1, -1],
        ],
      ],
    },
    'Ancha',
  ).toJSON();
}

describe('TypeOrmPrestadorRepository.toResumen() — centroCobertura population', () => {
  it('UAT-01: centroCobertura is populated from zonaCobertura centroid for distance ranking', async () => {
    // Zone A covers origin (0,0) with centroid near (0,0)
    const pNear = makePrestador('near', zonaCuadrada());
    // Zone B also covers origin (0,0) but centroid is far to the right (~4.5,0)
    const pFar = makePrestador('far', zonaAncha());

    const { repo } = makeRepo([pNear, pFar]);
    const result = await repo.findByCobertura({ ...CRITERIA, pageSize: 2 });

    expect(result.data).toHaveLength(2);

    // centroCobertura must be populated — not null/undefined
    expect(result.data[0].centroCobertura).toBeDefined();
    expect(result.data[1].centroCobertura).toBeDefined();

    // The near provider's centroid should be close to (0,0)
    const near = result.data.find((r) => r.id === 'near')!;
    expect(near.centroCobertura!.lat).toBeCloseTo(0, 1);
    expect(near.centroCobertura!.lng).toBeCloseTo(0, 1);
  });
});

// ---------------------------------------------------------------------------
// Slice 1 — self-management mutation surface (REPO-PRESTADOR-UPDATE-01)
// findById (raw entity read) + update (partial patch, QueryRunner-aware).
// ---------------------------------------------------------------------------

/**
 * Fake EntityManager modeling the persisted prestadores table. `update()` loads
 * via findOne, merges only the patched keys, and saves — so assertions can
 * check post-state and that a QueryRunner routes writes transactionally.
 */
function makeManager(rows: Prestador[]) {
  return {
    rows,
    findOne: jest.fn(
      async (_entity: unknown, { where }: { where: { id: string } }) =>
        rows.find((r) => r.id === where.id) ?? null,
    ),
    merge: jest.fn(
      (_entity: unknown, target: Prestador, patch: Partial<Prestador>) =>
        Object.assign(target, patch),
    ),
    save: jest.fn(async (_entity: unknown, obj: Prestador) => {
      const idx = rows.findIndex((r) => r.id === obj.id);
      if (idx === -1) rows.push(obj);
      else rows[idx] = obj;
      return obj;
    }),
  };
}

function makeMutableRepo(rows: Prestador[]) {
  const manager = makeManager(rows);
  const prestadorRepo = {
    manager,
    findOne: jest.fn(
      async ({ where }: { where: { id: string } }) =>
        rows.find((r) => r.id === where.id) ?? null,
    ),
  };
  const servicioRepo: IServicioRepository = {
    findByPrestadorId: jest.fn(async () => []),
  } as never;
  const repo = new TypeOrmPrestadorRepository(
    prestadorRepo as never,
    servicioRepo,
  );
  return { repo, prestadorRepo, manager };
}

describe('TypeOrmPrestadorRepository.findById()', () => {
  it('returns the raw prestador entity', async () => {
    const p = makePrestador('p1', zonaCuadrada());
    const { repo } = makeMutableRepo([p]);
    expect(await repo.findById('p1')).toBe(p);
  });

  it('returns null when not found', async () => {
    const { repo } = makeMutableRepo([]);
    expect(await repo.findById('missing')).toBeNull();
  });
});

describe('TypeOrmPrestadorRepository.update()', () => {
  it('ESC-09: patches only the provided fields, leaving the rest intact', async () => {
    const p = makePrestador('p1', zonaCuadrada());
    p.categoria = 'Plomero';
    p.visible = true;
    const { repo } = makeMutableRepo([p]);

    const updated = await repo.update('p1', {
      categoria: 'Electricista',
      visible: false,
    });

    expect(updated.categoria).toBe('Electricista');
    expect(updated.visible).toBe(false);
    // Untouched fields survive.
    expect(updated.nombreCompleto).toBe('Prestador p1');
    expect(updated.localidad).toBe('Posadas');
  });

  it('ESC-09: writes through the QueryRunner manager so it is atomic with siblings', async () => {
    const { repo, manager: baseManager } = makeMutableRepo([]);
    const txRows = [makePrestador('p1', zonaCuadrada())];
    const qr = { manager: makeManager(txRows) } as never;

    await repo.update('p1', { tieneServiciosPublicados: true }, qr);

    expect(txRows[0].tieneServiciosPublicados).toBe(true);
    // The base (non-transactional) manager must NOT have been used.
    expect(baseManager.save).not.toHaveBeenCalled();
  });

  it('throws when the prestador does not exist', async () => {
    const { repo } = makeMutableRepo([]);
    await expect(repo.update('missing', { visible: false })).rejects.toThrow(
      /not found/i,
    );
  });
});
