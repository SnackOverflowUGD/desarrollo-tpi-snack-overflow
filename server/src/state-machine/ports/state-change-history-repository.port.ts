import { ContratacionEstado } from '../../contratacion/domain/contratacion-estado.enum.js';
import { type TxContext } from '../../persistence/ports/transaction-runner.port.js';
import { type StateChangeHistory } from '../domain/state-change-history.entity.js';

export const STATE_CHANGE_HISTORY_REPOSITORY =
  'STATE_CHANGE_HISTORY_REPOSITORY';

/**
 * Persistence port for `state_change_history`. Extracting it behind a port
 * removes the `@InjectRepository(StateChangeHistory)` leak from
 * `StateMachineService` (ADR-007). The optional `tx` enlists the read/write in
 * the caller's atomic unit; when absent, the adapter falls back to its default
 * `Repository` (auto-commit) for read paths.
 */
export interface IStateChangeHistoryRepository {
  /** Last row by timestamp DESC for a contratación, or null. Honors `tx`. */
  findLast(
    contratacionId: string,
    tx?: TxContext,
  ): Promise<StateChangeHistory | null>;

  /** Read path: all rows ordered by timestamp ASC (oldest first). */
  findAll(contratacionId: string): Promise<StateChangeHistory[]>;

  /** Append-only insert of a new history row. Honors `tx`. */
  save(
    record: {
      contratacionId: string;
      estadoAnterior: ContratacionEstado | null;
      estadoNuevo: ContratacionEstado;
    },
    tx?: TxContext,
  ): Promise<void>;
}
