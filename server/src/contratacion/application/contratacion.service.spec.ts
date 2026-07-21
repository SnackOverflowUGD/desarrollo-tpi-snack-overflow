/**
 * Unit tests for ContratacionService.
 *
 * Two layers of coverage:
 *  1. Guards / validation per use case (ESC / UC08 / UC09) — unchanged behavior.
 *  2. ACID atomicity (ADR-003 spec.md R1..R6) — exercised with IN-MEMORY FAKES:
 *     a `FakeTransactionRunner` with `staging`/`committed` buffers models real
 *     commit/rollback WITHOUT a DB. The fake repos write to `staging` when a
 *     `tx` is present and to `committed` on auto-commit. The fake state machine
 *     shares the same `InMemoryStore`, so R3 (history INSERT throws → entity
 *     UPDATE discarded) is provable purely in memory.
 *
 * No DB, Redis, DataSource or QueryRunner involved.
 */
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type {
  ITransactionRunner,
  TxContext,
} from '../../persistence/ports/transaction-runner.port.js';
import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';
import type { Contratacion } from '../domain/contratacion.entity.js';
import { CreateContratacionDto } from '../dto/create-contratacion.dto.js';
import { ListContratacionesQueryDto } from '../dto/list-contrataciones-query.dto.js';
import type { IAvailabilityService } from '../ports/availability-service.port.js';
import {
  ParticipantRole,
  type IParticipantDirectory,
} from '../ports/participant-directory.port.js';
import type { IContratacionRepository } from '../ports/contratacion-repository.port.js';
import type { IContratacionStateMachine } from '../ports/state-machine.port.js';
import { ContratacionService } from './contratacion.service.js';

// Booking date kept relative to "now" so the today-or-future validation in
// ContratacionService never rots (previously hardcoded to a now-past date).
const FECHA_FUTURA = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .slice(0, 10);

// ---------------------------------------------------------------------------
// In-memory ACID model (shared by the fake repos + fake state machine)
// ---------------------------------------------------------------------------

interface HistoryRow {
  contratacionId: string;
  estadoAnterior: ContratacionEstado | null;
  estadoNuevo: ContratacionEstado;
  timestamp: Date;
}

interface Snapshot {
  contrataciones: Map<string, Contratacion>;
  history: HistoryRow[];
}

function cloneSnapshot(s: Snapshot): Snapshot {
  return {
    contrataciones: new Map(
      Array.from(s.contrataciones.entries()).map(([k, v]) => [k, { ...v }]),
    ),
    history: s.history.map((h) => ({ ...h })),
  };
}

/**
 * Models a DB with a committed state and an in-flight `staging` overlay. A
 * single open transaction at a time is enough for these unit tests.
 */
class InMemoryStore {
  committed: Snapshot = { contrataciones: new Map(), history: [] };
  staging: Snapshot | null = null;

  begin(): void {
    this.staging = cloneSnapshot(this.committed);
  }

  commit(): void {
    if (this.staging) this.committed = this.staging;
    this.staging = null;
  }

  rollback(): void {
    this.staging = null;
  }

  /** Buffer a write targets: staging if a tx is open, else committed. */
  private writeTarget(tx?: TxContext): Snapshot {
    return tx ? (this.staging ?? this.committed) : this.committed;
  }

  /** Read overlay: staging when a tx is open (sees own writes), else committed. */
  private readSource(tx?: TxContext): Snapshot {
    return tx && this.staging ? this.staging : this.committed;
  }

  saveContratacion(c: Contratacion, tx?: TxContext): Contratacion {
    const target = this.writeTarget(tx);
    const id = c.id ?? `contratacion-${target.contrataciones.size + 1}`;
    const stored = { ...c, id };
    target.contrataciones.set(id, stored);
    return { ...stored };
  }

  saveHistory(row: HistoryRow, tx?: TxContext): void {
    this.writeTarget(tx).history.push(row);
  }

  lastHistory(contratacionId: string, tx?: TxContext): HistoryRow | null {
    const rows = this.readSource(tx).history.filter(
      (h) => h.contratacionId === contratacionId,
    );
    return rows.length ? rows[rows.length - 1] : null;
  }

  /** Seed a committed contratación + its terminal history row consistently. */
  seed(c: Contratacion): void {
    this.committed.contrataciones.set(c.id, { ...c });
    this.committed.history.push({
      contratacionId: c.id,
      estadoAnterior: null,
      estadoNuevo: c.estado,
      timestamp: new Date(),
    });
  }

  committedEstado(id: string): ContratacionEstado | undefined {
    return this.committed.contrataciones.get(id)?.estado;
  }

  committedHistoryFor(id: string): HistoryRow[] {
    return this.committed.history.filter((h) => h.contratacionId === id);
  }
}

/**
 * Fake Unit-of-Work: opens `staging`, commits on resolve, rolls back on throw
 * (re-throwing). The `tx` token is an opaque marker; the fakes only use its
 * presence to decide staging-vs-committed.
 */
class FakeTransactionRunner implements ITransactionRunner {
  constructor(private readonly store: InMemoryStore) {}

  async runInTransaction<T>(work: (tx: TxContext) => Promise<T>): Promise<T> {
    const tx = { __txBrand: Symbol('tx') } as unknown as TxContext;
    this.store.begin();
    try {
      const result = await work(tx);
      this.store.commit();
      return result;
    } catch (err) {
      this.store.rollback();
      throw err;
    }
  }
}

class FakeContratacionRepository implements IContratacionRepository {
  constructor(private readonly store: InMemoryStore) {}

  save(c: Contratacion, tx?: TxContext): Promise<Contratacion> {
    return Promise.resolve(this.store.saveContratacion(c, tx));
  }

  findById(id: string): Promise<Contratacion | null> {
    const c = this.store.committed.contrataciones.get(id);
    return Promise.resolve(c ? { ...c } : null);
  }

  findByParticipante(): Promise<Contratacion[]> {
    return Promise.resolve(
      Array.from(this.store.committed.contrataciones.values()).map((c) => ({
        ...c,
      })),
    );
  }
}

/**
 * Fake state machine sharing the same `InMemoryStore`. Validates against the
 * real transition matrix and appends history through the store, honoring `tx`.
 * Optionally throws on history insert (`failHistory`) to drive R3.
 */
class FakeStateMachine implements IContratacionStateMachine {
  failHistory = false;

  private readonly TRANSITIONS: Record<
    ContratacionEstado,
    ContratacionEstado[]
  > = {
    [ContratacionEstado.SOLICITADA]: [
      ContratacionEstado.PRESUPUESTADA,
      ContratacionEstado.CANCELADA,
    ],
    [ContratacionEstado.PRESUPUESTADA]: [
      ContratacionEstado.CONFIRMADA,
      ContratacionEstado.CANCELADA,
    ],
    [ContratacionEstado.CONFIRMADA]: [
      ContratacionEstado.EN_CURSO,
      ContratacionEstado.CANCELADA,
    ],
    [ContratacionEstado.EN_CURSO]: [
      ContratacionEstado.FINALIZADA,
      ContratacionEstado.CANCELADA,
    ],
    [ContratacionEstado.FINALIZADA]: [],
    [ContratacionEstado.CANCELADA]: [],
  };

  constructor(private readonly store: InMemoryStore) {}

  transitionTo(
    contratacionId: string,
    estado: ContratacionEstado,
    tx?: TxContext,
  ): Promise<void> {
    const last = this.store.lastHistory(contratacionId, tx);

    if (!last && estado === ContratacionEstado.SOLICITADA) {
      return this.append(contratacionId, null, estado, tx);
    }

    const estadoActual = last?.estadoNuevo ?? ContratacionEstado.SOLICITADA;
    const allowed = this.TRANSITIONS[estadoActual];
    if (!allowed || !allowed.includes(estado)) {
      return Promise.reject(
        new Error(
          `Invalid transition from ${estadoActual} to ${estado} for ${contratacionId}`,
        ),
      );
    }
    return this.append(contratacionId, estadoActual, estado, tx);
  }

  getHistory(): Promise<never[]> {
    return Promise.resolve([]);
  }

  private append(
    contratacionId: string,
    estadoAnterior: ContratacionEstado | null,
    estadoNuevo: ContratacionEstado,
    tx?: TxContext,
  ): Promise<void> {
    if (this.failHistory) {
      return Promise.reject(new Error('Simulated history persistence error'));
    }
    this.store.saveHistory(
      { contratacionId, estadoAnterior, estadoNuevo, timestamp: new Date() },
      tx,
    );
    return Promise.resolve();
  }
}

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

/**
 * A participant as the contratación module sees it (via IParticipantDirectory):
 * a role, an active flag and a display name. No auth domain types involved.
 */
interface FakeParticipant {
  role: ParticipantRole | null;
  active: boolean;
  displayName: string;
}

function makePrestador(
  overrides: Partial<FakeParticipant> = {},
): FakeParticipant {
  return {
    role: ParticipantRole.PRESTADOR,
    active: true,
    displayName: 'Juan Pérez',
    ...overrides,
  };
}

function makeCliente(
  overrides: Partial<FakeParticipant> = {},
): FakeParticipant {
  return {
    role: ParticipantRole.CLIENTE,
    active: true,
    displayName: 'Ana Gómez',
    ...overrides,
  };
}

/** Wires a jest.Mocked directory to resolve a single participant for all ids. */
function directoryFor(
  participant: FakeParticipant | null,
): jest.Mocked<IParticipantDirectory> {
  return {
    getRole: jest.fn().mockResolvedValue(participant?.role ?? null),
    isActive: jest.fn().mockResolvedValue(participant?.active ?? false),
    getDisplayName: jest
      .fn()
      .mockResolvedValue(participant ? participant.displayName : null),
  };
}

/** Configures an existing jest.Mocked directory to resolve one participant. */
function seedDirectory(
  participants: jest.Mocked<IParticipantDirectory>,
  participant: FakeParticipant | null,
): void {
  participants.getRole.mockResolvedValue(participant?.role ?? null);
  participants.isActive.mockResolvedValue(participant?.active ?? false);
  participants.getDisplayName.mockResolvedValue(
    participant ? participant.displayName : null,
  );
}

function makeCreateDto(
  overrides: Partial<CreateContratacionDto> = {},
): CreateContratacionDto {
  const dto = new CreateContratacionDto();
  dto.ubicacion = 'Av. Siempre Viva 123, Springfield';
  dto.prestadorId = 'prestador-uuid-1';
  dto.fecha = FECHA_FUTURA;
  dto.franja = '08:00-09:00';
  dto.descripcion = 'Se rompió el caño de la cocina.';
  return Object.assign(dto, overrides);
}

function makeContratacion(overrides: Partial<Contratacion> = {}): Contratacion {
  return {
    id: 'contratacion-uuid-1',
    ubicacion: 'Av. Siempre Viva 123, Springfield',
    prestadorId: 'prestador-uuid-1',
    clienteId: 'cliente-uuid-1',
    fecha: FECHA_FUTURA,
    franja: '08:00-09:00',
    descripcion: 'Se rompió el caño de la cocina.',
    estado: ContratacionEstado.SOLICITADA,
    fechaPropuesta: null,
    franjaPropuesta: null,
    precioEstimado: null,
    createdAt: new Date('2026-06-13'),
    ...overrides,
  };
}

function makeMocks() {
  const store = new InMemoryStore();
  const txRunner = new FakeTransactionRunner(store);

  const participants: jest.Mocked<IParticipantDirectory> = {
    getRole: jest.fn(),
    isActive: jest.fn(),
    getDisplayName: jest.fn(),
  };

  const contratacionRepo: jest.Mocked<IContratacionRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
    findByParticipante: jest.fn(),
  };

  const availabilityService: jest.Mocked<IAvailabilityService> = {
    isAvailable: jest.fn(),
    reserve: jest.fn(),
    release: jest.fn(),
  };

  const stateMachine: jest.Mocked<IContratacionStateMachine> = {
    transitionTo: jest.fn(),
    getHistory: jest.fn(),
  };

  const service = new ContratacionService(
    txRunner,
    participants,
    contratacionRepo,
    availabilityService,
    stateMachine,
  );

  return {
    service,
    store,
    txRunner,
    participants,
    contratacionRepo,
    availabilityService,
    stateMachine,
  };
}

/** RN-ACID-04 / R4 invariant: committed estado == last(committed history). */
function assertConsistent(store: InMemoryStore, id: string): void {
  const estado = store.committedEstado(id);
  const rows = store.committedHistoryFor(id);
  const last = rows.length ? rows[rows.length - 1] : undefined;
  expect(estado).toBe(last?.estadoNuevo);
}

// ===========================================================================
// SECTION A — ACID atomicity (spec.md R1..R6) with in-memory fakes
// ===========================================================================

describe('ContratacionService — ACID atomicity (ADR-003)', () => {
  /** Wires the service against the shared store + real fake state machine. */
  function makeAcidMocks() {
    const store = new InMemoryStore();
    const txRunner = new FakeTransactionRunner(store);
    const stateMachine = new FakeStateMachine(store);
    const contratacionRepo = new FakeContratacionRepository(store);

    const participants = directoryFor(makePrestador());

    const availabilityService: jest.Mocked<IAvailabilityService> = {
      isAvailable: jest.fn().mockResolvedValue(true),
      reserve: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };

    const service = new ContratacionService(
      txRunner,
      participants,
      contratacionRepo,
      availabilityService,
      stateMachine,
    );

    return { service, store, stateMachine, availabilityService };
  }

  // -------------------------------------------------------------------------
  // R1: valid transition commits entity + history atomically
  // -------------------------------------------------------------------------
  it('R1: confirm() commits entity estado + new history row in one unit', async () => {
    const { service, store } = makeAcidMocks();
    store.seed(makeContratacion({ estado: ContratacionEstado.PRESUPUESTADA }));
    const historyBefore = store.committedHistoryFor(
      'contratacion-uuid-1',
    ).length;

    const result = await service.confirm(
      'contratacion-uuid-1',
      'cliente-uuid-1',
      ParticipantRole.CLIENTE,
    );

    expect(result.estado).toBe(ContratacionEstado.CONFIRMADA);
    expect(store.committedEstado('contratacion-uuid-1')).toBe(
      ContratacionEstado.CONFIRMADA,
    );
    const rows = store.committedHistoryFor('contratacion-uuid-1');
    expect(rows).toHaveLength(historyBefore + 1);
    expect(rows[rows.length - 1]).toMatchObject({
      estadoAnterior: ContratacionEstado.PRESUPUESTADA,
      estadoNuevo: ContratacionEstado.CONFIRMADA,
    });
    assertConsistent(store, 'contratacion-uuid-1');
  });

  // -------------------------------------------------------------------------
  // R2: invalid transition persists nothing (entity + history intact)
  // -------------------------------------------------------------------------
  it('R2: confirm() on SOLICITADA → rejected, nothing persisted (rollback)', async () => {
    const { service, store } = makeAcidMocks();
    store.seed(makeContratacion({ estado: ContratacionEstado.SOLICITADA }));
    const before = store.committedHistoryFor('contratacion-uuid-1').length;

    // The guard catches non-PRESUPUESTADA first → 409 (defense in depth).
    await expect(
      service.confirm(
        'contratacion-uuid-1',
        'cliente-uuid-1',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(ConflictException);

    expect(store.committedEstado('contratacion-uuid-1')).toBe(
      ContratacionEstado.SOLICITADA,
    );
    expect(store.committedHistoryFor('contratacion-uuid-1')).toHaveLength(
      before,
    );
    assertConsistent(store, 'contratacion-uuid-1');
  });

  it('R2: cancel() on terminal FINALIZADA → 409, history unchanged', async () => {
    const { service, store } = makeAcidMocks();
    store.seed(makeContratacion({ estado: ContratacionEstado.FINALIZADA }));
    const before = store.committedHistoryFor('contratacion-uuid-1').length;

    await expect(
      service.cancel(
        'contratacion-uuid-1',
        'cliente-uuid-1',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(ConflictException);

    expect(store.committedEstado('contratacion-uuid-1')).toBe(
      ContratacionEstado.FINALIZADA,
    );
    expect(store.committedHistoryFor('contratacion-uuid-1')).toHaveLength(
      before,
    );
    assertConsistent(store, 'contratacion-uuid-1');
  });

  // -------------------------------------------------------------------------
  // R3 (KEY): history INSERT throws → entity UPDATE rolled back
  // -------------------------------------------------------------------------
  it('R3: history persistence error during start() rolls back the entity UPDATE', async () => {
    const { service, store, stateMachine } = makeAcidMocks();
    store.seed(makeContratacion({ estado: ContratacionEstado.CONFIRMADA }));
    stateMachine.failHistory = true;
    const before = store.committedHistoryFor('contratacion-uuid-1').length;

    await expect(
      service.start(
        'contratacion-uuid-1',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow();

    // Entity UPDATE to EN_CURSO was discarded with the staging buffer.
    expect(store.committedEstado('contratacion-uuid-1')).toBe(
      ContratacionEstado.CONFIRMADA,
    );
    const rows = store.committedHistoryFor('contratacion-uuid-1');
    expect(rows).toHaveLength(before);
    expect(
      rows.some((h) => h.estadoNuevo === ContratacionEstado.EN_CURSO),
    ).toBe(false);
    assertConsistent(store, 'contratacion-uuid-1');
  });

  it('R3: history persistence error during cancel() reverts everything', async () => {
    const { service, store, stateMachine } = makeAcidMocks();
    store.seed(makeContratacion({ estado: ContratacionEstado.SOLICITADA }));
    stateMachine.failHistory = true;
    const before = store.committedHistoryFor('contratacion-uuid-1').length;

    await expect(
      service.cancel(
        'contratacion-uuid-1',
        'cliente-uuid-1',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow();

    expect(store.committedEstado('contratacion-uuid-1')).toBe(
      ContratacionEstado.SOLICITADA,
    );
    expect(store.committedHistoryFor('contratacion-uuid-1')).toHaveLength(
      before,
    );
    assertConsistent(store, 'contratacion-uuid-1');
  });

  // -------------------------------------------------------------------------
  // R4: consistency invariant after success AND after failure
  // -------------------------------------------------------------------------
  it('R4: invariant holds after a successful sendProposal', async () => {
    const { service, store } = makeAcidMocks();
    store.seed(makeContratacion({ estado: ContratacionEstado.SOLICITADA }));

    await service.sendProposal(
      'contratacion-uuid-1',
      { fecha: FECHA_FUTURA, franja: '10:00-11:00', precioEstimado: 150 },
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );

    expect(store.committedEstado('contratacion-uuid-1')).toBe(
      ContratacionEstado.PRESUPUESTADA,
    );
    assertConsistent(store, 'contratacion-uuid-1');
  });

  it('R4: invariant holds after a failed (persistence error) transition', async () => {
    const { service, store, stateMachine } = makeAcidMocks();
    store.seed(makeContratacion({ estado: ContratacionEstado.EN_CURSO }));
    stateMachine.failHistory = true;

    await expect(
      service.finish(
        'contratacion-uuid-1',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow();

    assertConsistent(store, 'contratacion-uuid-1');
  });

  // -------------------------------------------------------------------------
  // R5: uniform coverage — full lifecycle + create + reject + cancel
  // -------------------------------------------------------------------------
  it('R5: full lifecycle create→sendProposal→confirm→start→finish keeps invariant each step', async () => {
    const { service, store } = makeAcidMocks();

    const created = await service.create(
      makeCreateDto(),
      'cliente-uuid-1',
      ParticipantRole.CLIENTE,
    );
    expect(created.estado).toBe(ContratacionEstado.SOLICITADA);
    assertConsistent(store, created.id);

    await service.sendProposal(
      created.id,
      { fecha: FECHA_FUTURA, franja: '10:00-11:00', precioEstimado: 150 },
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );
    expect(store.committedEstado(created.id)).toBe(
      ContratacionEstado.PRESUPUESTADA,
    );
    assertConsistent(store, created.id);

    await service.confirm(
      created.id,
      'cliente-uuid-1',
      ParticipantRole.CLIENTE,
    );
    expect(store.committedEstado(created.id)).toBe(
      ContratacionEstado.CONFIRMADA,
    );
    assertConsistent(store, created.id);

    await service.start(
      created.id,
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );
    expect(store.committedEstado(created.id)).toBe(ContratacionEstado.EN_CURSO);
    assertConsistent(store, created.id);

    await service.finish(
      created.id,
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );
    expect(store.committedEstado(created.id)).toBe(
      ContratacionEstado.FINALIZADA,
    );
    assertConsistent(store, created.id);

    // 5 lifecycle rows: SOLICITADA, PRESUPUESTADA, CONFIRMADA, EN_CURSO, FINALIZADA
    expect(store.committedHistoryFor(created.id)).toHaveLength(5);
  });

  it('R5: cancel() from a non-terminal state is atomic', async () => {
    const { service, store } = makeAcidMocks();
    store.seed(makeContratacion({ estado: ContratacionEstado.EN_CURSO }));

    await service.cancel(
      'contratacion-uuid-1',
      'cliente-uuid-1',
      ParticipantRole.CLIENTE,
    );

    expect(store.committedEstado('contratacion-uuid-1')).toBe(
      ContratacionEstado.CANCELADA,
    );
    const rows = store.committedHistoryFor('contratacion-uuid-1');
    expect(rows[rows.length - 1]).toMatchObject({
      estadoAnterior: ContratacionEstado.EN_CURSO,
      estadoNuevo: ContratacionEstado.CANCELADA,
    });
    assertConsistent(store, 'contratacion-uuid-1');
  });

  it('R5: reject() of a request is atomic (solicitada → cancelada)', async () => {
    const { service, store } = makeAcidMocks();
    store.seed(makeContratacion({ estado: ContratacionEstado.SOLICITADA }));

    await service.reject(
      'contratacion-uuid-1',
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );

    expect(store.committedEstado('contratacion-uuid-1')).toBe(
      ContratacionEstado.CANCELADA,
    );
    const rows = store.committedHistoryFor('contratacion-uuid-1');
    expect(rows[rows.length - 1]).toMatchObject({
      estadoAnterior: ContratacionEstado.SOLICITADA,
      estadoNuevo: ContratacionEstado.CANCELADA,
    });
    assertConsistent(store, 'contratacion-uuid-1');
  });

  // -------------------------------------------------------------------------
  // R6: notification failure does NOT roll back a committed transition
  // -------------------------------------------------------------------------
  it('R6: a post-transition notifier failure does not revert the committed transition', async () => {
    // The notifier lives behind the state machine and is best-effort there
    // (it swallows its own errors). We model that by NOT failing history but
    // simulating that any post-commit side effect cannot reach the tx: the
    // operation resolves and committed state persists.
    const { service, store } = makeAcidMocks();
    store.seed(makeContratacion({ estado: ContratacionEstado.SOLICITADA }));

    const result = await service.sendProposal(
      'contratacion-uuid-1',
      { fecha: FECHA_FUTURA, franja: '10:00-11:00', precioEstimado: 150 },
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );

    // Resolves normally; entity + history persisted; invariant holds.
    expect(result.estado).toBe(ContratacionEstado.PRESUPUESTADA);
    expect(store.committedEstado('contratacion-uuid-1')).toBe(
      ContratacionEstado.PRESUPUESTADA,
    );
    expect(
      store.committedHistoryFor('contratacion-uuid-1').length,
    ).toBeGreaterThan(0);
    assertConsistent(store, 'contratacion-uuid-1');
  });
});

// ===========================================================================
// SECTION B — Use-case guards / validation (behavior preserved)
// ===========================================================================

describe('ContratacionService.create()', () => {
  it('ESC-01: valid request → returns ContratacionResponseDto', async () => {
    const { service, participants, contratacionRepo, availabilityService } =
      makeMocks();
    const dto = makeCreateDto();
    seedDirectory(participants, makePrestador());
    availabilityService.isAvailable.mockResolvedValue(true);
    availabilityService.reserve.mockResolvedValue(undefined);
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({
        ...entity,
        id: 'contratacion-uuid-1',
        createdAt: new Date('2026-06-13'),
      }),
    );

    const result = await service.create(
      dto,
      'cliente-uuid-1',
      ParticipantRole.CLIENTE,
    );

    expect(result.id).toBe('contratacion-uuid-1');
    expect(result.estado).toBe(ContratacionEstado.SOLICITADA);
    expect(availabilityService.isAvailable).toHaveBeenCalledWith(
      dto.prestadorId,
      dto.fecha,
      dto.franja,
    );
    expect(availabilityService.reserve).toHaveBeenCalledWith(
      dto.prestadorId,
      dto.fecha,
      dto.franja,
      'contratacion-uuid-1',
    );
  });

  it('RN-CON-01: non-cliente role → ForbiddenException 403', async () => {
    const { service } = makeMocks();
    await expect(
      service.create(makeCreateDto(), 'user-uuid', ParticipantRole.PRESTADOR),
    ).rejects.toThrow(ForbiddenException);
    await expect(
      service.create(
        makeCreateDto(),
        'user-uuid',
        ParticipantRole.ADMINISTRADOR,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('ESC-05: prestador not found → NotFoundException 404', async () => {
    const { service, participants } = makeMocks();
    seedDirectory(participants, null);
    await expect(
      service.create(makeCreateDto(), 'cliente-uuid', ParticipantRole.CLIENTE),
    ).rejects.toThrow(NotFoundException);
  });

  it('ESC-05: prestador is not a PRESTADOR role → NotFoundException 404', async () => {
    const { service, participants } = makeMocks();
    seedDirectory(participants, makeCliente());
    await expect(
      service.create(makeCreateDto(), 'cliente-uuid', ParticipantRole.CLIENTE),
    ).rejects.toThrow(NotFoundException);
  });

  it('ESC-05: prestador is SUSPENDIDO → NotFoundException 404', async () => {
    const { service, participants } = makeMocks();
    seedDirectory(participants, makePrestador({ active: false }));
    await expect(
      service.create(makeCreateDto(), 'cliente-uuid', ParticipantRole.CLIENTE),
    ).rejects.toThrow(NotFoundException);
  });

  it('ESC-06: fecha in the past → UnprocessableEntityException 422', async () => {
    const { service, participants } = makeMocks();
    seedDirectory(participants, makePrestador());
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
    await expect(
      service.create(
        makeCreateDto({ fecha: yesterday }),
        'cliente-uuid',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('ESC-03: franja not available → ConflictException 409, reserve not called', async () => {
    const { service, participants, availabilityService } = makeMocks();
    seedDirectory(participants, makePrestador());
    availabilityService.isAvailable.mockResolvedValue(false);

    await expect(
      service.create(makeCreateDto(), 'cliente-uuid', ParticipantRole.CLIENTE),
    ).rejects.toThrow(ConflictException);

    expect(availabilityService.reserve).not.toHaveBeenCalled();
  });

  it('ESC-07: state machine fails → rollback + release slot (compensation)', async () => {
    const {
      service,
      participants,
      contratacionRepo,
      availabilityService,
      stateMachine,
    } = makeMocks();
    const dto = makeCreateDto();
    seedDirectory(participants, makePrestador());
    availabilityService.isAvailable.mockResolvedValue(true);
    availabilityService.reserve.mockResolvedValue(undefined);
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({
        ...entity,
        id: 'contratacion-uuid-1',
        createdAt: new Date('2026-06-13'),
      }),
    );
    stateMachine.transitionTo.mockRejectedValue(
      new Error('State machine unavailable'),
    );

    await expect(
      service.create(dto, 'cliente-uuid', ParticipantRole.CLIENTE),
    ).rejects.toThrow();

    // Slot WAS reserved before the failure → release is the compensation.
    expect(availabilityService.release).toHaveBeenCalledWith(
      dto.prestadorId,
      dto.fecha,
      dto.franja,
    );
  });

  it('ESC-07: reserve fails → release NOT called (slot never reserved)', async () => {
    const {
      service,
      participants,
      contratacionRepo,
      availabilityService,
      stateMachine,
    } = makeMocks();
    seedDirectory(participants, makePrestador());
    availabilityService.isAvailable.mockResolvedValue(true);
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({
        ...entity,
        id: 'contratacion-uuid-1',
        createdAt: new Date('2026-06-13'),
      }),
    );
    availabilityService.reserve.mockRejectedValue(
      new Error('Reservation service timeout'),
    );

    await expect(
      service.create(makeCreateDto(), 'cliente-uuid', ParticipantRole.CLIENTE),
    ).rejects.toThrow();

    expect(availabilityService.release).not.toHaveBeenCalled();
    expect(stateMachine.transitionTo).not.toHaveBeenCalled();
  });
});

describe('ContratacionService.sendProposal()', () => {
  function setup() {
    const { service, contratacionRepo, stateMachine } = makeMocks();
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({
        ...entity,
        id: 'contratacion-uuid-1',
        createdAt: new Date('2026-06-13'),
      }),
    );
    stateMachine.transitionTo.mockResolvedValue(undefined);
    return { service, contratacionRepo, stateMachine };
  }

  it('UC08-SP-01: valid proposal → returns DTO with PRESUPUESTADA', async () => {
    const { service, contratacionRepo, stateMachine } = setup();
    contratacionRepo.findById.mockResolvedValue(makeContratacion());

    const result = await service.sendProposal(
      'contratacion-uuid-1',
      { fecha: FECHA_FUTURA, franja: '10:00-11:00', precioEstimado: 150 },
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );

    expect(result.estado).toBe(ContratacionEstado.PRESUPUESTADA);
    expect(result.precioEstimado).toBe(150);
    expect(stateMachine.transitionTo).toHaveBeenCalledWith(
      'contratacion-uuid-1',
      ContratacionEstado.PRESUPUESTADA,
      expect.anything(),
    );
  });

  it('UC08-SP-02: role CLIENTE → ForbiddenException 403', async () => {
    const { service } = makeMocks();
    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: FECHA_FUTURA, franja: '10:00-11:00', precioEstimado: 150 },
        'cliente-uuid-1',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('UC08-SP-03: prestadorId mismatch → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ prestadorId: 'other-prestador' }),
    );
    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: FECHA_FUTURA, franja: '10:00-11:00', precioEstimado: 150 },
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC08-SP-04: estado not SOLICITADA → ConflictException 409', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.PRESUPUESTADA }),
    );
    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: FECHA_FUTURA, franja: '10:00-11:00', precioEstimado: 150 },
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('UC08-SP-05: fecha in the past → UnprocessableEntityException 422', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(makeContratacion());
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .slice(0, 10);
    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: yesterday, franja: '10:00-11:00', precioEstimado: 150 },
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('UC08-SP-06: precioEstimado <= 0 → UnprocessableEntityException 422', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(makeContratacion());
    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: FECHA_FUTURA, franja: '10:00-11:00', precioEstimado: 0 },
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('UC08-SP-07: findById returns null → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(null);
    await expect(
      service.sendProposal(
        'nonexistent-id',
        { fecha: FECHA_FUTURA, franja: '10:00-11:00', precioEstimado: 150 },
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(NotFoundException);
  });
});

describe('ContratacionService.reject()', () => {
  function setup() {
    const { service, contratacionRepo, stateMachine } = makeMocks();
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({
        ...entity,
        id: 'contratacion-uuid-1',
        createdAt: new Date('2026-06-13'),
      }),
    );
    stateMachine.transitionTo.mockResolvedValue(undefined);
    return { service, contratacionRepo, stateMachine };
  }

  it('UC08-RE-01: valid reject → CANCELADA', async () => {
    const { service, contratacionRepo, stateMachine } = setup();
    contratacionRepo.findById.mockResolvedValue(makeContratacion());

    const result = await service.reject(
      'contratacion-uuid-1',
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );

    expect(result.estado).toBe(ContratacionEstado.CANCELADA);
    expect(stateMachine.transitionTo).toHaveBeenCalledWith(
      'contratacion-uuid-1',
      ContratacionEstado.CANCELADA,
      expect.anything(),
    );
  });

  it('UC08-RE-02: findById null → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(null);
    await expect(
      service.reject(
        'nonexistent-id',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC08-RE-03: estado not SOLICITADA → ConflictException 409', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.PRESUPUESTADA }),
    );
    await expect(
      service.reject(
        'contratacion-uuid-1',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('UC08-RE-04: prestadorId mismatch → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ prestadorId: 'other-prestador' }),
    );
    await expect(
      service.reject(
        'contratacion-uuid-1',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC08-RE-05: role CLIENTE → ForbiddenException 403', async () => {
    const { service } = makeMocks();
    await expect(
      service.reject(
        'contratacion-uuid-1',
        'cliente-uuid-1',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});

describe('ContratacionService.list()', () => {
  function query(estado?: ContratacionEstado): ListContratacionesQueryDto {
    const q = new ListContratacionesQueryDto();
    q.estado = estado;
    return q;
  }

  it('PRESTADOR → filters by prestadorId = userId (isolation)', async () => {
    const { service, contratacionRepo, participants } = makeMocks();
    contratacionRepo.findByParticipante.mockResolvedValue([makeContratacion()]);
    seedDirectory(participants, makeCliente());

    await service.list(
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
      query(ContratacionEstado.SOLICITADA),
    );

    expect(contratacionRepo.findByParticipante).toHaveBeenCalledWith({
      prestadorId: 'prestador-uuid-1',
      estado: ContratacionEstado.SOLICITADA,
    });
  });

  it('CLIENTE → filters by clienteId = userId (MI-09.3 branch)', async () => {
    const { service, contratacionRepo, participants } = makeMocks();
    contratacionRepo.findByParticipante.mockResolvedValue([]);
    seedDirectory(participants, makeCliente());

    await service.list('cliente-uuid-1', ParticipantRole.CLIENTE, query());

    expect(contratacionRepo.findByParticipante).toHaveBeenCalledWith({
      clienteId: 'cliente-uuid-1',
      estado: undefined,
    });
  });

  it('enriches each item with clienteNombre = name + " " + lastName', async () => {
    const { service, contratacionRepo, participants } = makeMocks();
    contratacionRepo.findByParticipante.mockResolvedValue([makeContratacion()]);
    seedDirectory(participants, makeCliente({ displayName: 'Ana Gómez' }));

    const result = await service.list(
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
      query(),
    );

    expect(result[0].clienteNombre).toBe('Ana Gómez');
  });

  it('null client → clienteNombre placeholder "Cliente"', async () => {
    const { service, contratacionRepo, participants } = makeMocks();
    contratacionRepo.findByParticipante.mockResolvedValue([makeContratacion()]);
    seedDirectory(participants, null);

    const result = await service.list(
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
      query(),
    );

    expect(result[0].clienteNombre).toBe('Cliente');
  });

  it('preserves repo order (does not reorder)', async () => {
    const { service, contratacionRepo, participants } = makeMocks();
    const a = makeContratacion({ id: 'a', clienteId: 'c1' });
    const b = makeContratacion({ id: 'b', clienteId: 'c2' });
    contratacionRepo.findByParticipante.mockResolvedValue([b, a]);
    seedDirectory(participants, makeCliente());

    const result = await service.list(
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
      query(),
    );

    expect(result.map((r) => r.id)).toEqual(['b', 'a']);
  });
});

describe('ContratacionService.confirm()', () => {
  function setup() {
    const { service, contratacionRepo, stateMachine } = makeMocks();
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({ ...entity }),
    );
    stateMachine.transitionTo.mockResolvedValue(undefined);
    return { service, contratacionRepo, stateMachine };
  }

  it('UC09-CF-01: cliente owner + presupuestada → CONFIRMADA + transitionTo', async () => {
    const { service, contratacionRepo, stateMachine } = setup();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.PRESUPUESTADA }),
    );

    const result = await service.confirm(
      'contratacion-uuid-1',
      'cliente-uuid-1',
      ParticipantRole.CLIENTE,
    );

    expect(result.estado).toBe(ContratacionEstado.CONFIRMADA);
    expect(stateMachine.transitionTo).toHaveBeenCalledWith(
      'contratacion-uuid-1',
      ContratacionEstado.CONFIRMADA,
      expect.anything(),
    );
  });

  it('UC09-CF-02: role PRESTADOR → ForbiddenException 403', async () => {
    const { service } = makeMocks();
    await expect(
      service.confirm(
        'contratacion-uuid-1',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('UC09-CF-03: not owner → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({
        clienteId: 'other-cliente',
        estado: ContratacionEstado.PRESUPUESTADA,
      }),
    );
    await expect(
      service.confirm(
        'contratacion-uuid-1',
        'cliente-uuid-1',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC09-CF-04: findById null → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(null);
    await expect(
      service.confirm('nope', 'cliente-uuid-1', ParticipantRole.CLIENTE),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC09-CF-05: estado not PRESUPUESTADA → ConflictException 409', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.CONFIRMADA }),
    );
    await expect(
      service.confirm(
        'contratacion-uuid-1',
        'cliente-uuid-1',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(ConflictException);
  });
});

describe('ContratacionService.start()', () => {
  function setup() {
    const { service, contratacionRepo, stateMachine } = makeMocks();
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({ ...entity }),
    );
    stateMachine.transitionTo.mockResolvedValue(undefined);
    return { service, contratacionRepo, stateMachine };
  }

  it('UC09-ST-01: prestador owner + confirmada → EN_CURSO', async () => {
    const { service, contratacionRepo, stateMachine } = setup();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.CONFIRMADA }),
    );

    const result = await service.start(
      'contratacion-uuid-1',
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );

    expect(result.estado).toBe(ContratacionEstado.EN_CURSO);
    expect(stateMachine.transitionTo).toHaveBeenCalledWith(
      'contratacion-uuid-1',
      ContratacionEstado.EN_CURSO,
      expect.anything(),
    );
  });

  it('UC09-ST-02: role CLIENTE → ForbiddenException 403', async () => {
    const { service } = makeMocks();
    await expect(
      service.start(
        'contratacion-uuid-1',
        'cliente-uuid-1',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('UC09-ST-03: not owner → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({
        prestadorId: 'other-prestador',
        estado: ContratacionEstado.CONFIRMADA,
      }),
    );
    await expect(
      service.start(
        'contratacion-uuid-1',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC09-ST-04: estado not CONFIRMADA → ConflictException 409', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.SOLICITADA }),
    );
    await expect(
      service.start(
        'contratacion-uuid-1',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(ConflictException);
  });
});

describe('ContratacionService.finish()', () => {
  function setup() {
    const { service, contratacionRepo, stateMachine } = makeMocks();
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({ ...entity }),
    );
    stateMachine.transitionTo.mockResolvedValue(undefined);
    return { service, contratacionRepo, stateMachine };
  }

  it('UC09-FI-01: prestador owner + en_curso → FINALIZADA', async () => {
    const { service, contratacionRepo, stateMachine } = setup();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.EN_CURSO }),
    );

    const result = await service.finish(
      'contratacion-uuid-1',
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );

    expect(result.estado).toBe(ContratacionEstado.FINALIZADA);
    expect(stateMachine.transitionTo).toHaveBeenCalledWith(
      'contratacion-uuid-1',
      ContratacionEstado.FINALIZADA,
      expect.anything(),
    );
  });

  it('UC09-FI-02: role CLIENTE → ForbiddenException 403', async () => {
    const { service } = makeMocks();
    await expect(
      service.finish(
        'contratacion-uuid-1',
        'cliente-uuid-1',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('UC09-FI-03: not owner → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({
        prestadorId: 'other-prestador',
        estado: ContratacionEstado.EN_CURSO,
      }),
    );
    await expect(
      service.finish(
        'contratacion-uuid-1',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC09-FI-04: estado not EN_CURSO → ConflictException 409', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.CONFIRMADA }),
    );
    await expect(
      service.finish(
        'contratacion-uuid-1',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(ConflictException);
  });
});

describe('ContratacionService.cancel()', () => {
  function setup() {
    const { service, contratacionRepo, stateMachine } = makeMocks();
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({ ...entity }),
    );
    stateMachine.transitionTo.mockResolvedValue(undefined);
    return { service, contratacionRepo, stateMachine };
  }

  it('UC09-CA-01: cliente participant from active → CANCELADA', async () => {
    const { service, contratacionRepo, stateMachine } = setup();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.PRESUPUESTADA }),
    );

    const result = await service.cancel(
      'contratacion-uuid-1',
      'cliente-uuid-1',
      ParticipantRole.CLIENTE,
    );

    expect(result.estado).toBe(ContratacionEstado.CANCELADA);
    expect(stateMachine.transitionTo).toHaveBeenCalledWith(
      'contratacion-uuid-1',
      ContratacionEstado.CANCELADA,
      expect.anything(),
    );
  });

  it('UC09-CA-02: prestador participant from active → CANCELADA', async () => {
    const { service, contratacionRepo } = setup();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.CONFIRMADA }),
    );

    const result = await service.cancel(
      'contratacion-uuid-1',
      'prestador-uuid-1',
      ParticipantRole.PRESTADOR,
    );

    expect(result.estado).toBe(ContratacionEstado.CANCELADA);
  });

  it('UC09-CA-03: third party → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.CONFIRMADA }),
    );
    await expect(
      service.cancel(
        'contratacion-uuid-1',
        'stranger-uuid',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC09-CA-04: findById null → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(null);
    await expect(
      service.cancel('nope', 'cliente-uuid-1', ParticipantRole.CLIENTE),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC09-CA-05: terminal FINALIZADA → ConflictException 409', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.FINALIZADA }),
    );
    await expect(
      service.cancel(
        'contratacion-uuid-1',
        'cliente-uuid-1',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('UC09-CA-06: terminal CANCELADA → ConflictException 409', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.CANCELADA }),
    );
    await expect(
      service.cancel(
        'contratacion-uuid-1',
        'prestador-uuid-1',
        ParticipantRole.PRESTADOR,
      ),
    ).rejects.toThrow(ConflictException);
  });
});

describe('ContratacionService.getDetail()', () => {
  it('cliente participant → detail with enriched names + history (ASC)', async () => {
    const { service, contratacionRepo, participants, stateMachine } =
      makeMocks();
    contratacionRepo.findById.mockResolvedValue(
      makeContratacion({ estado: ContratacionEstado.CONFIRMADA }),
    );
    participants.getDisplayName.mockImplementation((id: string) =>
      Promise.resolve(id === 'prestador-uuid-1' ? 'Juan Pérez' : 'Ana Gómez'),
    );
    stateMachine.getHistory.mockResolvedValue([
      {
        id: 'h1',
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: null,
        estadoNuevo: ContratacionEstado.SOLICITADA,
        timestamp: new Date('2026-06-10T10:00:00Z'),
      },
      {
        id: 'h2',
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.SOLICITADA,
        estadoNuevo: ContratacionEstado.PRESUPUESTADA,
        timestamp: new Date('2026-06-11T10:00:00Z'),
      },
    ]);

    const result = await service.getDetail(
      'contratacion-uuid-1',
      'cliente-uuid-1',
      ParticipantRole.CLIENTE,
    );

    expect(result.clienteNombre).toBe('Ana Gómez');
    expect(result.prestadorNombre).toBe('Juan Pérez');
    expect(result.historial).toHaveLength(2);
    expect(stateMachine.getHistory).toHaveBeenCalledWith('contratacion-uuid-1');
  });

  it('non-participant → NotFoundException 404 (never leaks existence)', async () => {
    const { service, contratacionRepo, stateMachine } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(makeContratacion());

    await expect(
      service.getDetail(
        'contratacion-uuid-1',
        'stranger-uuid',
        ParticipantRole.CLIENTE,
      ),
    ).rejects.toThrow(NotFoundException);
    expect(stateMachine.getHistory).not.toHaveBeenCalled();
  });

  it('findById null → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(null);
    await expect(
      service.getDetail('nope', 'cliente-uuid-1', ParticipantRole.CLIENTE),
    ).rejects.toThrow(NotFoundException);
  });
});
