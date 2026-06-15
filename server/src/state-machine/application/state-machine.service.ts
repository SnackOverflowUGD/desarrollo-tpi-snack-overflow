import { Inject, Injectable, Logger } from '@nestjs/common';
import { ContratacionEstado } from '../../contratacion/domain/contratacion-estado.enum.js';
import type { IContratacionStateMachine } from '../../contratacion/ports/state-machine.port.js';
import { type TxContext } from '../../persistence/ports/transaction-runner.port.js';
import { InvalidTransitionError } from '../domain/invalid-transition.error.js';
import { StateChangeHistory } from '../domain/state-change-history.entity.js';
import { NOTIFIER, type INotifier } from '../ports/notifier.port.js';
import {
  STATE_CHANGE_HISTORY_REPOSITORY,
  type IStateChangeHistoryRepository,
} from '../ports/state-change-history-repository.port.js';

@Injectable()
export class StateMachineService implements IContratacionStateMachine {
  private readonly logger = new Logger(StateMachineService.name);

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

  constructor(
    @Inject(STATE_CHANGE_HISTORY_REPOSITORY)
    private readonly historyRepo: IStateChangeHistoryRepository,
    @Inject(NOTIFIER)
    private readonly notifier: INotifier,
  ) {}

  /**
   * Validates the requested transition against the matrix and appends the
   * history row. When `tx` is provided, the history read+insert enlist in the
   * caller's atomic unit so the entity UPDATE and this INSERT commit/rollback
   * together (RN-ACID-01/03). The `InvalidTransitionError` thrown here is the
   * final barrier inside the callback → it triggers rollback (R2).
   *
   * The notification (RN-ACID-06) is best-effort and swallows its own errors,
   * so it can never propagate out of `transitionTo` to abort the transaction.
   */
  async transitionTo(
    contratacionId: string,
    estado: ContratacionEstado,
    tx?: TxContext,
  ): Promise<void> {
    const lastRecord = await this.historyRepo.findLast(contratacionId, tx);

    // No history + target is SOLICITADA → first registration, skip validation
    if (!lastRecord && estado === ContratacionEstado.SOLICITADA) {
      await this.historyRepo.save(
        { contratacionId, estadoAnterior: null, estadoNuevo: estado },
        tx,
      );
      await this.notifyBestEffort(contratacionId, null, estado);
      return;
    }

    const estadoActual =
      lastRecord?.estadoNuevo ?? ContratacionEstado.SOLICITADA;

    // Validate transition against matrix
    const allowed = this.TRANSITIONS[estadoActual];
    if (!allowed || !allowed.includes(estado)) {
      throw new InvalidTransitionError(contratacionId, estadoActual, estado);
    }

    await this.historyRepo.save(
      { contratacionId, estadoAnterior: estadoActual, estadoNuevo: estado },
      tx,
    );
    await this.notifyBestEffort(contratacionId, estadoActual, estado);
  }

  async getHistory(contratacionId: string): Promise<StateChangeHistory[]> {
    return this.historyRepo.findAll(contratacionId);
  }

  private async notifyBestEffort(
    contratacionId: string,
    estadoAnterior: ContratacionEstado | null,
    estadoNuevo: ContratacionEstado,
  ): Promise<void> {
    try {
      await this.notifier.notify({
        contratacionId,
        estadoAnterior: estadoAnterior ?? ContratacionEstado.SOLICITADA,
        estadoNuevo,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.warn(
        `Notifier failed for contratacion ${contratacionId} transition ${estadoAnterior} → ${estadoNuevo}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
