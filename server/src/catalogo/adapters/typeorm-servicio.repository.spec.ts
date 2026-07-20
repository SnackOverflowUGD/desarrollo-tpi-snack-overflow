/**
 * Unit tests for TypeOrmServicioRepository — the servicio mutation surface used
 * by prestador self-management (Slice 1: REPO-SERVICIO-CRUD-01).
 *
 * No real Postgres: the TypeORM Repository and its EntityManager are replaced
 * by an in-memory fake. A `manager` buffer models the persisted rows; passing a
 * fake QueryRunner routes writes through `qr.manager` (the transactional path)
 * instead of `repo.manager`, which is exactly what the application service
 * relies on for atomic publish-flag recompute.
 *
 * Pins: create links to prestador (ESC-10), update mutates only patched fields
 * (ESC-10), softDelete preserves the row with visible=false (ESC-11), and
 * countVisibleByPrestadorId counts only visible rows.
 */
import { TypeOrmServicioRepository } from './typeorm-servicio.repository.js';
import { Servicio } from '../domain/servicio.entity.js';

// ---------------------------------------------------------------------------
// In-memory fake EntityManager + Repository
// ---------------------------------------------------------------------------

function makeServicio(overrides: Partial<Servicio> = {}): Servicio {
  const s = new Servicio();
  s.id = overrides.id ?? 's1';
  s.prestadorId = overrides.prestadorId ?? 'p1';
  s.categoria = overrides.categoria ?? 'Plomero';
  s.descripcion = overrides.descripcion ?? 'Destapaciones';
  s.rangoPrecioMin = overrides.rangoPrecioMin ?? 1000;
  s.rangoPrecioMax = overrides.rangoPrecioMax ?? 5000;
  s.visible = overrides.visible ?? true;
  return s;
}

/**
 * Models a persisted table plus the TypeORM EntityManager surface the adapter
 * touches. `save`/`update` mutate the shared `rows` array so assertions can
 * inspect post-state.
 */
function makeManager(rows: Servicio[]) {
  return {
    rows,
    findOne: jest.fn(
      async (_entity: unknown, { where }: { where: { id: string } }) =>
        rows.find((r) => r.id === where.id) ?? null,
    ),
    save: jest.fn(async (_entity: unknown, obj: Servicio) => {
      const idx = rows.findIndex((r) => r.id === obj.id);
      if (idx === -1) rows.push(obj);
      else rows[idx] = obj;
      return obj;
    }),
    merge: jest.fn(
      (_entity: unknown, target: Servicio, patch: Partial<Servicio>) =>
        Object.assign(target, patch),
    ),
    count: jest.fn(
      async (
        _entity: unknown,
        { where }: { where: { prestadorId: string; visible: boolean } },
      ) =>
        rows.filter(
          (r) =>
            r.prestadorId === where.prestadorId && r.visible === where.visible,
        ).length,
    ),
    update: jest.fn(
      async (
        _entity: unknown,
        criteria: { id: string },
        patch: Partial<Servicio>,
      ) => {
        const row = rows.find((r) => r.id === criteria.id);
        if (row) Object.assign(row, patch);
        return { affected: row ? 1 : 0 };
      },
    ),
  };
}

function makeRepo(rows: Servicio[] = []) {
  const manager = makeManager(rows);
  const repo = {
    manager,
    create: jest.fn((obj: Partial<Servicio>) => Object.assign(new Servicio(), obj)),
    find: jest.fn(
      async ({ where }: { where: { prestadorId: string; visible?: boolean } }) =>
        rows.filter(
          (r) =>
            r.prestadorId === where.prestadorId &&
            (where.visible === undefined || r.visible === where.visible),
        ),
    ),
    findOne: jest.fn(
      async ({ where }: { where: { id: string } }) =>
        rows.find((r) => r.id === where.id) ?? null,
    ),
  };
  const adapter = new TypeOrmServicioRepository(repo as never);
  return { adapter, repo, manager, rows };
}

/** A fake QueryRunner exposing only the `manager` the adapter uses. */
function makeQueryRunner(rows: Servicio[]) {
  return { manager: makeManager(rows) } as never;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TypeOrmServicioRepository.create()', () => {
  it('ESC-10: persists a servicio linked to the prestador with a generated id', async () => {
    const rows: Servicio[] = [];
    const { adapter } = makeRepo(rows);

    const created = await adapter.create({
      prestadorId: 'p1',
      categoria: 'Plomero',
      descripcion: 'Destapaciones',
      rangoPrecioMin: 1000,
      rangoPrecioMax: 5000,
      visible: true,
    });

    expect(created.id).toBeDefined();
    expect(created.prestadorId).toBe('p1');
    expect(rows).toHaveLength(1);
    expect(rows[0].descripcion).toBe('Destapaciones');
  });

  it('routes the write through the QueryRunner manager when a tx is provided', async () => {
    const committed: Servicio[] = [];
    const { adapter, manager: baseManager } = makeRepo(committed);
    const txRows: Servicio[] = [];
    const qr = makeQueryRunner(txRows);

    await adapter.create(
      {
        prestadorId: 'p1',
        categoria: 'Plomero',
        descripcion: 'Tx',
        rangoPrecioMin: 1,
        rangoPrecioMax: 2,
        visible: true,
      },
      qr,
    );

    // The transactional path wrote to qr.manager, NOT the base repo manager.
    expect(txRows).toHaveLength(1);
    expect(baseManager.save).not.toHaveBeenCalled();
  });
});

describe('TypeOrmServicioRepository.update()', () => {
  it('ESC-10: mutates only the patched fields', async () => {
    const existing = makeServicio({
      id: 's1',
      descripcion: 'old',
      rangoPrecioMin: 1000,
      rangoPrecioMax: 5000,
      visible: true,
    });
    const { adapter } = makeRepo([existing]);

    const updated = await adapter.update('s1', { descripcion: 'new' });

    expect(updated.descripcion).toBe('new');
    // Untouched fields survive the merge.
    expect(updated.rangoPrecioMin).toBe(1000);
    expect(updated.rangoPrecioMax).toBe(5000);
    expect(updated.visible).toBe(true);
  });

  it('throws when the servicio does not exist', async () => {
    const { adapter } = makeRepo([]);
    await expect(adapter.update('missing', { visible: false })).rejects.toThrow(
      /not found/i,
    );
  });
});

describe('TypeOrmServicioRepository.softDelete()', () => {
  it('ESC-11: preserves the row and flips visible to false', async () => {
    const rows = [makeServicio({ id: 's1', visible: true })];
    const { adapter } = makeRepo(rows);

    await adapter.softDelete('s1');

    // Row still present (not physically removed), just hidden.
    expect(rows).toHaveLength(1);
    expect(rows[0].visible).toBe(false);
  });
});

describe('TypeOrmServicioRepository.countVisibleByPrestadorId()', () => {
  it('counts only visible servicios of the prestador', async () => {
    const rows = [
      makeServicio({ id: 's1', prestadorId: 'p1', visible: true }),
      makeServicio({ id: 's2', prestadorId: 'p1', visible: false }),
      makeServicio({ id: 's3', prestadorId: 'p1', visible: true }),
      makeServicio({ id: 's4', prestadorId: 'other', visible: true }),
    ];
    const { adapter } = makeRepo(rows);

    expect(await adapter.countVisibleByPrestadorId('p1')).toBe(2);
  });

  it('reads through the QueryRunner manager when a tx is provided', async () => {
    const { adapter } = makeRepo([]);
    const txRows = [makeServicio({ id: 's1', prestadorId: 'p1', visible: true })];
    const qr = makeQueryRunner(txRows);

    expect(await adapter.countVisibleByPrestadorId('p1', qr)).toBe(1);
  });
});

describe('TypeOrmServicioRepository.findByPrestadorIdIncludingHidden()', () => {
  it('returns hidden servicios too (owner self-management view)', async () => {
    const rows = [
      makeServicio({ id: 's1', prestadorId: 'p1', visible: true }),
      makeServicio({ id: 's2', prestadorId: 'p1', visible: false }),
    ];
    const { adapter } = makeRepo(rows);

    const result = await adapter.findByPrestadorIdIncludingHidden('p1');
    expect(result.map((s) => s.id).sort()).toEqual(['s1', 's2']);
  });
});
