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
    findOne: jest.fn(async ({ where }: { where: { id: string } }) =>
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
