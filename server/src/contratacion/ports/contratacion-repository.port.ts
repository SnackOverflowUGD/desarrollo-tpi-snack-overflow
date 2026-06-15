import { type TxContext } from '../../persistence/ports/transaction-runner.port.js';
import { Contratacion } from '../domain/contratacion.entity.js';
import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';

export const CONTRATACION_REPOSITORY = 'CONTRATACION_REPOSITORY';

/**
 * Query filter for GET /contrataciones (UC08, ADR-08-01).
 *
 * Exactly ONE identity dimension is set by the service (the one matching the
 * caller's role); both are optional at the type level because the same generic
 * query serves PRESTADOR (prestadorId) and CLIENTE (clienteId, reused by
 * MI-09.3). `estado` is an optional secondary filter.
 */
export interface ContratacionFiltro {
  prestadorId?: string;
  clienteId?: string;
  estado?: ContratacionEstado;
}

export interface IContratacionRepository {
  save(contratacion: Contratacion, tx?: TxContext): Promise<Contratacion>;
  findById(id: string): Promise<Contratacion | null>;
  findByParticipante(filtro: ContratacionFiltro): Promise<Contratacion[]>;
}
