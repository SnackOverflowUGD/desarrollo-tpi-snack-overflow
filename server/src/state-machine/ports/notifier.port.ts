import { ContratacionEstado } from '../../contratacion/domain/contratacion-estado.enum.js';

export const NOTIFIER = 'NOTIFIER';

export interface INotifier {
  notify(params: {
    contratacionId: string;
    estadoAnterior: ContratacionEstado;
    estadoNuevo: ContratacionEstado;
    timestamp: Date;
  }): Promise<void>;
}
