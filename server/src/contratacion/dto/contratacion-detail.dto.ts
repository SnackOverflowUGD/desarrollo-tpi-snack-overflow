import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';

/**
 * State-change timeline entry for GET /contrataciones/:id. Mirrors the
 * persisted StateChangeHistory shape, exposed read-only (no `id`, no
 * `contratacionId` — those are internal). `timestamp` is a Date, serialized to
 * an ISO string over the wire.
 */
export interface ContratacionHistorialItem {
  estadoAnterior: ContratacionEstado | null;
  estadoNuevo: ContratacionEstado;
  timestamp: Date;
}

/**
 * Read model for GET /contrataciones/:id (detail + state timeline).
 *
 * Same shape as ContratacionResponseDto PLUS the enriched `clienteNombre` /
 * `prestadorNombre` (resolved via USER_REPOSITORY) and the chronological
 * `historial` (estadoAnterior → estadoNuevo, ASC by timestamp) read from the
 * state machine through the IContratacionStateMachine port. The endpoint is
 * guarded so only the cliente or prestador participant can fetch it (404
 * otherwise — never leak existence).
 */
export class ContratacionDetailDto {
  id: string;
  ubicacion: string;
  prestadorId: string;
  prestadorNombre: string;
  clienteId: string;
  clienteNombre: string;
  fecha: string;
  franja: string;
  descripcion: string;
  fechaPropuesta?: string | null;
  franjaPropuesta?: string | null;
  precioEstimado?: number | null;
  justificacionPrecio?: string | null;
  estado: ContratacionEstado;
  createdAt: Date;
  historial: ContratacionHistorialItem[];

  constructor(partial: Partial<ContratacionDetailDto>) {
    Object.assign(this, partial);
  }
}
