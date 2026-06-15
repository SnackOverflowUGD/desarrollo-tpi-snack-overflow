/**
 * Unit tests for StateMachineService.
 *
 * The state machine now talks to `IStateChangeHistoryRepository` (a port), not
 * a TypeORM `Repository`. We inject a FakeHistoryRepository (pure in-memory),
 * so no DB is required and we can assert that:
 *   - the matrix is enforced (R1/R2),
 *   - the optional `tx` is threaded to `findLast` and `save`,
 *   - a history persistence error propagates (R3 — the runner above rolls back),
 *   - the notifier stays best-effort (R6/R4 legacy).
 */
import { ContratacionEstado } from '../../contratacion/domain/contratacion-estado.enum.js';
import type { TxContext } from '../../persistence/ports/transaction-runner.port.js';
import { InvalidTransitionError } from '../domain/invalid-transition.error.js';
import type { StateChangeHistory } from '../domain/state-change-history.entity.js';
import type { INotifier } from '../ports/notifier.port.js';
import type { IStateChangeHistoryRepository } from '../ports/state-change-history-repository.port.js';
import { StateMachineService } from './state-machine.service.js';

// ---------------------------------------------------------------------------
// Fake history repository (in-memory, tx-aware)
// ---------------------------------------------------------------------------

interface SavedRow {
  contratacionId: string;
  estadoAnterior: ContratacionEstado | null;
  estadoNuevo: ContratacionEstado;
  tx?: TxContext;
}

class FakeHistoryRepository implements IStateChangeHistoryRepository {
  rows: SavedRow[] = [];
  /** A row returned by findLast (the "current" last record), or null. */
  lastRecord: StateChangeHistory | null = null;
  /** Captures the tx passed to findLast / save for assertions. */
  lastFindTx: TxContext | undefined;
  saveTx: TxContext | undefined;
  /** When true, save() rejects to simulate a persistence error (R3). */
  failSave = false;

  findLast(
    _contratacionId: string,
    tx?: TxContext,
  ): Promise<StateChangeHistory | null> {
    this.lastFindTx = tx;
    return Promise.resolve(this.lastRecord);
  }

  findAll(): Promise<StateChangeHistory[]> {
    return Promise.resolve(this.rows as unknown as StateChangeHistory[]);
  }

  save(
    record: {
      contratacionId: string;
      estadoAnterior: ContratacionEstado | null;
      estadoNuevo: ContratacionEstado;
    },
    tx?: TxContext,
  ): Promise<void> {
    if (this.failSave) {
      return Promise.reject(new Error('Simulated history persistence error'));
    }
    this.saveTx = tx;
    this.rows.push({ ...record, tx });
    return Promise.resolve();
  }
}

function makeHistory(
  overrides: Partial<StateChangeHistory> = {},
): StateChangeHistory {
  return {
    id: 'history-uuid-1',
    contratacionId: 'contratacion-uuid-1',
    estadoAnterior: null,
    estadoNuevo: ContratacionEstado.SOLICITADA,
    timestamp: new Date(),
    ...overrides,
  };
}

interface Mocks {
  service: StateMachineService;
  historyRepo: FakeHistoryRepository;
  notifier: jest.Mocked<INotifier>;
}

function makeMocks(): Mocks {
  const historyRepo = new FakeHistoryRepository();
  const notifier: jest.Mocked<INotifier> = { notify: jest.fn() };
  const service = new StateMachineService(historyRepo, notifier);
  return { service, historyRepo, notifier };
}

const FAKE_TX = { __txBrand: Symbol('tx') } as unknown as TxContext;

// ---------------------------------------------------------------------------
// R1: Valid transitions
// ---------------------------------------------------------------------------
describe('StateMachineService.transitionTo()', () => {
  it('R1: SOLICITADA → PRESUPUESTADA appends history with correct estados', async () => {
    const { service, historyRepo, notifier } = makeMocks();
    historyRepo.lastRecord = makeHistory({
      estadoNuevo: ContratacionEstado.SOLICITADA,
    });

    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.PRESUPUESTADA,
    );

    expect(historyRepo.rows).toHaveLength(1);
    expect(historyRepo.rows[0]).toMatchObject({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.SOLICITADA,
      estadoNuevo: ContratacionEstado.PRESUPUESTADA,
    });
    expect(notifier.notify).toHaveBeenCalled();
  });

  it('R1: first registration SOLICITADA → skip validation', async () => {
    const { service, historyRepo, notifier } = makeMocks();
    historyRepo.lastRecord = null;

    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.SOLICITADA,
    );

    expect(historyRepo.rows[0]).toMatchObject({
      estadoAnterior: null,
      estadoNuevo: ContratacionEstado.SOLICITADA,
    });
    expect(notifier.notify).toHaveBeenCalled();
  });

  it('threads the optional tx to findLast and save (atomic enlistment)', async () => {
    const { service, historyRepo } = makeMocks();
    historyRepo.lastRecord = makeHistory({
      estadoNuevo: ContratacionEstado.SOLICITADA,
    });

    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.PRESUPUESTADA,
      FAKE_TX,
    );

    expect(historyRepo.lastFindTx).toBe(FAKE_TX);
    expect(historyRepo.saveTx).toBe(FAKE_TX);
  });

  // -------------------------------------------------------------------------
  // R2: Invalid transitions throw and persist nothing
  // -------------------------------------------------------------------------
  it('R2: FINALIZADA → EN_CURSO throws InvalidTransitionError, no save', async () => {
    const { service, historyRepo, notifier } = makeMocks();
    historyRepo.lastRecord = makeHistory({
      estadoAnterior: ContratacionEstado.EN_CURSO,
      estadoNuevo: ContratacionEstado.FINALIZADA,
    });

    await expect(
      service.transitionTo('contratacion-uuid-1', ContratacionEstado.EN_CURSO),
    ).rejects.toThrow(InvalidTransitionError);

    expect(historyRepo.rows).toHaveLength(0);
    expect(notifier.notify).not.toHaveBeenCalled();
  });

  it('R2: CANCELADA → SOLICITADA throws InvalidTransitionError', async () => {
    const { service, historyRepo } = makeMocks();
    historyRepo.lastRecord = makeHistory({
      estadoAnterior: ContratacionEstado.SOLICITADA,
      estadoNuevo: ContratacionEstado.CANCELADA,
    });

    await expect(
      service.transitionTo(
        'contratacion-uuid-1',
        ContratacionEstado.SOLICITADA,
      ),
    ).rejects.toThrow(InvalidTransitionError);
    expect(historyRepo.rows).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // R3: persistence error on save propagates (runner rolls back)
  // -------------------------------------------------------------------------
  it('R3: history save error propagates so the caller transaction rolls back', async () => {
    const { service, historyRepo, notifier } = makeMocks();
    historyRepo.lastRecord = makeHistory({
      estadoNuevo: ContratacionEstado.CONFIRMADA,
    });
    historyRepo.failSave = true;

    await expect(
      service.transitionTo(
        'contratacion-uuid-1',
        ContratacionEstado.EN_CURSO,
        FAKE_TX,
      ),
    ).rejects.toThrow('Simulated history persistence error');

    expect(historyRepo.rows).toHaveLength(0);
    // Notifier must not fire when the persistence step failed.
    expect(notifier.notify).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // R6/legacy R4: notifier failure is best-effort
  // -------------------------------------------------------------------------
  it('R6: notifier throws → transition still succeeds and history persisted', async () => {
    const { service, historyRepo, notifier } = makeMocks();
    historyRepo.lastRecord = makeHistory({
      estadoNuevo: ContratacionEstado.SOLICITADA,
    });
    notifier.notify.mockRejectedValue(new Error('Notifier unavailable'));

    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.PRESUPUESTADA,
    );

    expect(historyRepo.rows).toHaveLength(1);
    expect(notifier.notify).toHaveBeenCalled();
  });

  it('R6: notifier throws on first SOLICITADA → still succeeds', async () => {
    const { service, historyRepo, notifier } = makeMocks();
    historyRepo.lastRecord = null;
    notifier.notify.mockRejectedValue(new Error('Notifier unavailable'));

    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.SOLICITADA,
    );

    expect(historyRepo.rows).toHaveLength(1);
    expect(notifier.notify).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getHistory(): read-only timeline through the port's findAll (no tx)
// ---------------------------------------------------------------------------
describe('StateMachineService.getHistory()', () => {
  it('delegates to the history repo findAll', async () => {
    const { service, historyRepo } = makeMocks();
    const records = [
      makeHistory({ estadoNuevo: ContratacionEstado.SOLICITADA }),
      makeHistory({ estadoNuevo: ContratacionEstado.PRESUPUESTADA }),
    ];
    jest.spyOn(historyRepo, 'findAll').mockResolvedValue(records);

    const result = await service.getHistory('contratacion-uuid-1');

    expect(historyRepo.findAll).toHaveBeenCalledWith('contratacion-uuid-1');
    expect(result).toBe(records);
  });

  it('returns [] when there are no records', async () => {
    const { service } = makeMocks();
    const result = await service.getHistory('contratacion-uuid-1');
    expect(result).toEqual([]);
  });
});
