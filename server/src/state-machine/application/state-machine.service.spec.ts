/**
 * Unit tests for StateMachineService — derived from spec.md (R1–R4)
 * and design.md transition matrix.
 *
 * Repository and notifier are fully mocked; no DB required.
 */
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, type TestingModule } from '@nestjs/testing';
import { ContratacionEstado } from '../../contratacion/domain/contratacion-estado.enum.js';
import { InvalidTransitionError } from '../domain/invalid-transition.error.js';
import { StateChangeHistory } from '../domain/state-change-history.entity.js';
import { NOTIFIER, type INotifier } from '../ports/notifier.port.js';
import { StateMachineService } from './state-machine.service.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  historyRepo: jest.Mocked<Repository<StateChangeHistory>>;
  notifier: jest.Mocked<INotifier>;
}

async function makeMocks(): Promise<Mocks> {
  const historyRepo: jest.Mocked<Repository<StateChangeHistory>> = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  } as unknown as jest.Mocked<Repository<StateChangeHistory>>;

  const notifier: jest.Mocked<INotifier> = {
    notify: jest.fn(),
  };

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      StateMachineService,
      {
        provide: getRepositoryToken(StateChangeHistory),
        useValue: historyRepo,
      },
      {
        provide: NOTIFIER,
        useValue: notifier,
      },
    ],
  }).compile();

  const service = module.get<StateMachineService>(StateMachineService);

  return { service, historyRepo, notifier };
}

// ---------------------------------------------------------------------------
// R1: Valid transitions
// ---------------------------------------------------------------------------
describe('StateMachineService.transitionTo()', () => {
  it('R1: SOLICITADA → PRESUPUESTADA saves history with correct estados', async () => {
    const { service, historyRepo, notifier } = await makeMocks();

    // One previous history record: estadoNuevo = SOLICITADA
    const previous = makeHistory({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: null,
      estadoNuevo: ContratacionEstado.SOLICITADA,
    });
    historyRepo.findOne.mockResolvedValue(previous);
    historyRepo.create.mockReturnValue(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.SOLICITADA,
        estadoNuevo: ContratacionEstado.PRESUPUESTADA,
      }),
    );

    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.PRESUPUESTADA,
    );

    expect(historyRepo.findOne).toHaveBeenCalledWith({
      where: { contratacionId: 'contratacion-uuid-1' },
      order: { timestamp: 'DESC' },
    });
    expect(historyRepo.create).toHaveBeenCalledWith({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.SOLICITADA,
      estadoNuevo: ContratacionEstado.PRESUPUESTADA,
    });
    expect(historyRepo.save).toHaveBeenCalled();
    expect(notifier.notify).toHaveBeenCalled();
  });

  it('R1: first registration SOLICITADA → skip validation', async () => {
    const { service, historyRepo, notifier } = await makeMocks();

    // No history exists
    historyRepo.findOne.mockResolvedValue(null);
    historyRepo.create.mockReturnValue(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: null,
        estadoNuevo: ContratacionEstado.SOLICITADA,
      }),
    );

    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.SOLICITADA,
    );

    expect(historyRepo.findOne).toHaveBeenCalled();
    expect(historyRepo.create).toHaveBeenCalledWith({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: null,
      estadoNuevo: ContratacionEstado.SOLICITADA,
    });
    expect(historyRepo.save).toHaveBeenCalled();
    expect(notifier.notify).toHaveBeenCalled();
  });

  it('R1: PRESUPUESTADA → CONFIRMADA transition works', async () => {
    const { service, historyRepo, notifier } = await makeMocks();

    const previous = makeHistory({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.SOLICITADA,
      estadoNuevo: ContratacionEstado.PRESUPUESTADA,
    });
    historyRepo.findOne.mockResolvedValue(previous);
    historyRepo.create.mockReturnValue(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.PRESUPUESTADA,
        estadoNuevo: ContratacionEstado.CONFIRMADA,
      }),
    );

    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.CONFIRMADA,
    );

    expect(historyRepo.create).toHaveBeenCalledWith({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.PRESUPUESTADA,
      estadoNuevo: ContratacionEstado.CONFIRMADA,
    });
    expect(historyRepo.save).toHaveBeenCalled();
    expect(notifier.notify).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // R2: Invalid transitions
  // -----------------------------------------------------------------------
  it('R2: FINALIZADA → EN_CURSO throws InvalidTransitionError', async () => {
    const { service, historyRepo, notifier } = await makeMocks();

    const previous = makeHistory({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.EN_CURSO,
      estadoNuevo: ContratacionEstado.FINALIZADA,
    });
    historyRepo.findOne.mockResolvedValue(previous);

    await expect(
      service.transitionTo('contratacion-uuid-1', ContratacionEstado.EN_CURSO),
    ).rejects.toThrow(InvalidTransitionError);

    // No history created, no notification
    expect(historyRepo.create).not.toHaveBeenCalled();
    expect(historyRepo.save).not.toHaveBeenCalled();
    expect(notifier.notify).not.toHaveBeenCalled();
  });

  it('R2: CANCELADA → SOLICITADA throws InvalidTransitionError', async () => {
    const { service, historyRepo, notifier } = await makeMocks();

    const previous = makeHistory({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.SOLICITADA,
      estadoNuevo: ContratacionEstado.CANCELADA,
    });
    historyRepo.findOne.mockResolvedValue(previous);

    await expect(
      service.transitionTo(
        'contratacion-uuid-1',
        ContratacionEstado.SOLICITADA,
      ),
    ).rejects.toThrow(InvalidTransitionError);

    expect(historyRepo.create).not.toHaveBeenCalled();
    expect(historyRepo.save).not.toHaveBeenCalled();
    expect(notifier.notify).not.toHaveBeenCalled();
  });

  it('R2: FINALIZADA → CANCELADA throws InvalidTransitionError (terminal)', async () => {
    const { service, historyRepo } = await makeMocks();

    const previous = makeHistory({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.EN_CURSO,
      estadoNuevo: ContratacionEstado.FINALIZADA,
    });
    historyRepo.findOne.mockResolvedValue(previous);

    await expect(
      service.transitionTo('contratacion-uuid-1', ContratacionEstado.CANCELADA),
    ).rejects.toThrow(InvalidTransitionError);
  });

  // -----------------------------------------------------------------------
  // R4: Notifier fails → transition still succeeds
  // -----------------------------------------------------------------------
  it('R4: notifier throws → transition still succeeds and history saved', async () => {
    const { service, historyRepo, notifier } = await makeMocks();

    const previous = makeHistory({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: null,
      estadoNuevo: ContratacionEstado.SOLICITADA,
    });
    historyRepo.findOne.mockResolvedValue(previous);
    historyRepo.create.mockReturnValue(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.SOLICITADA,
        estadoNuevo: ContratacionEstado.PRESUPUESTADA,
      }),
    );
    notifier.notify.mockRejectedValue(new Error('Notifier unavailable'));

    // Should not throw
    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.PRESUPUESTADA,
    );

    // History should still be saved
    expect(historyRepo.create).toHaveBeenCalled();
    expect(historyRepo.save).toHaveBeenCalled();
    // Notifier was called (best-effort)
    expect(notifier.notify).toHaveBeenCalled();
  });

  it('R4: notifier throws on first SOLICITADA → transition still succeeds', async () => {
    const { service, historyRepo, notifier } = await makeMocks();

    historyRepo.findOne.mockResolvedValue(null);
    notifier.notify.mockRejectedValue(new Error('Notifier unavailable'));

    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.SOLICITADA,
    );

    expect(historyRepo.create).toHaveBeenCalled();
    expect(historyRepo.save).toHaveBeenCalled();
    expect(notifier.notify).toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // History ordering (R3)
  // -----------------------------------------------------------------------
  it('R3: multiple transitions maintain correct history chain', async () => {
    const { service, historyRepo } = await makeMocks();

    // Simulate 4 transitions: SOLICITADA → PRESUPUESTADA → CONFIRMADA → EN_CURSO → FINALIZADA
    // Each call reads the latest and creates the next

    // Transition 1: first registration
    historyRepo.findOne.mockResolvedValueOnce(null);
    historyRepo.create.mockReturnValueOnce(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: null,
        estadoNuevo: ContratacionEstado.SOLICITADA,
      }),
    );
    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.SOLICITADA,
    );

    // Transition 2: SOLICITADA → PRESUPUESTADA
    historyRepo.findOne.mockResolvedValueOnce(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: null,
        estadoNuevo: ContratacionEstado.SOLICITADA,
      }),
    );
    historyRepo.create.mockReturnValueOnce(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.SOLICITADA,
        estadoNuevo: ContratacionEstado.PRESUPUESTADA,
      }),
    );
    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.PRESUPUESTADA,
    );

    // Transition 3: PRESUPUESTADA → CONFIRMADA
    historyRepo.findOne.mockResolvedValueOnce(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.SOLICITADA,
        estadoNuevo: ContratacionEstado.PRESUPUESTADA,
      }),
    );
    historyRepo.create.mockReturnValueOnce(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.PRESUPUESTADA,
        estadoNuevo: ContratacionEstado.CONFIRMADA,
      }),
    );
    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.CONFIRMADA,
    );

    // Transition 4: CONFIRMADA → EN_CURSO
    historyRepo.findOne.mockResolvedValueOnce(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.PRESUPUESTADA,
        estadoNuevo: ContratacionEstado.CONFIRMADA,
      }),
    );
    historyRepo.create.mockReturnValueOnce(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.CONFIRMADA,
        estadoNuevo: ContratacionEstado.EN_CURSO,
      }),
    );
    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.EN_CURSO,
    );

    // Transition 5: EN_CURSO → FINALIZADA
    historyRepo.findOne.mockResolvedValueOnce(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.CONFIRMADA,
        estadoNuevo: ContratacionEstado.EN_CURSO,
      }),
    );
    historyRepo.create.mockReturnValueOnce(
      makeHistory({
        contratacionId: 'contratacion-uuid-1',
        estadoAnterior: ContratacionEstado.EN_CURSO,
        estadoNuevo: ContratacionEstado.FINALIZADA,
      }),
    );
    await service.transitionTo(
      'contratacion-uuid-1',
      ContratacionEstado.FINALIZADA,
    );

    // Verify that each transition called findOne with correct contratacionId
    const findOneCalls = historyRepo.findOne.mock.calls;
    expect(findOneCalls.length).toBe(5);
    for (const call of findOneCalls) {
      expect(call[0]).toEqual({
        where: { contratacionId: 'contratacion-uuid-1' },
        order: { timestamp: 'DESC' },
      });
    }

    // Verify the create calls chain
    const createCalls = historyRepo.create.mock.calls;
    expect(createCalls.length).toBe(5);

    // First: null → SOLICITADA
    expect(createCalls[0][0]).toEqual({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: null,
      estadoNuevo: ContratacionEstado.SOLICITADA,
    });

    // Second: SOLICITADA → PRESUPUESTADA
    expect(createCalls[1][0]).toEqual({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.SOLICITADA,
      estadoNuevo: ContratacionEstado.PRESUPUESTADA,
    });

    // Third: PRESUPUESTADA → CONFIRMADA
    expect(createCalls[2][0]).toEqual({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.PRESUPUESTADA,
      estadoNuevo: ContratacionEstado.CONFIRMADA,
    });

    // Fourth: CONFIRMADA → EN_CURSO
    expect(createCalls[3][0]).toEqual({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.CONFIRMADA,
      estadoNuevo: ContratacionEstado.EN_CURSO,
    });

    // Fifth: EN_CURSO → FINALIZADA
    expect(createCalls[4][0]).toEqual({
      contratacionId: 'contratacion-uuid-1',
      estadoAnterior: ContratacionEstado.EN_CURSO,
      estadoNuevo: ContratacionEstado.FINALIZADA,
    });
  });
});

// ---------------------------------------------------------------------------
// getHistory(): read-only timeline, ordered by timestamp ASC
// ---------------------------------------------------------------------------
describe('StateMachineService.getHistory()', () => {
  it('reads the history ordered by timestamp ASC', async () => {
    const { service, historyRepo } = await makeMocks();
    const records = [
      makeHistory({
        estadoAnterior: null,
        estadoNuevo: ContratacionEstado.SOLICITADA,
      }),
      makeHistory({
        estadoAnterior: ContratacionEstado.SOLICITADA,
        estadoNuevo: ContratacionEstado.PRESUPUESTADA,
      }),
    ];
    historyRepo.find.mockResolvedValue(records);

    const result = await service.getHistory('contratacion-uuid-1');

    expect(historyRepo.find).toHaveBeenCalledWith({
      where: { contratacionId: 'contratacion-uuid-1' },
      order: { timestamp: 'ASC' },
    });
    expect(result).toBe(records);
  });

  it('returns [] when there are no records', async () => {
    const { service, historyRepo } = await makeMocks();
    historyRepo.find.mockResolvedValue([]);

    const result = await service.getHistory('contratacion-uuid-1');

    expect(result).toEqual([]);
  });
});
