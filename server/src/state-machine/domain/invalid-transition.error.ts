import { ContratacionEstado } from '../../contratacion/domain/contratacion-estado.enum.js';

export class InvalidTransitionError extends Error {
  constructor(
    contratacionId: string,
    estadoActual: ContratacionEstado,
    destino: ContratacionEstado,
  ) {
    super(
      `Invalid transition from ${estadoActual} to ${destino} for contratacion ${contratacionId}`,
    );
    this.name = 'InvalidTransitionError';
  }
}
