import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';

export const STATE_MACHINE = 'STATE_MACHINE';

export interface IContratacionStateMachine {
  transitionTo(contratacionId: string, estado: ContratacionEstado): Promise<void>;
}
