import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';
import type { StateChangeHistory } from '../../state-machine/domain/state-change-history.entity.js';

export const STATE_MACHINE = 'STATE_MACHINE';

export interface IContratacionStateMachine {
  transitionTo(
    contratacionId: string,
    estado: ContratacionEstado,
  ): Promise<void>;

  /**
   * Read-only state-change history for a contratación, ordered by timestamp
   * ASC (oldest first). The history is persisted on every `transitionTo`; this
   * exposes it without the contratacion module touching the history repository
   * directly (hexagonal boundary). Returns `[]` when there are no records.
   */
  getHistory(contratacionId: string): Promise<StateChangeHistory[]>;
}
