/**
 * Service Repository Port
 * Interface for querying published services.
 * Implemented by TypeORM adapter.
 */

import { Servicio } from '../domain/servicio.entity.js';

export const SERVICIO_REPOSITORY = 'SERVICIO_REPOSITORY';

export interface IServicioRepository {
  /**
   * Finds all visible services for a given provider.
   */
  findByPrestadorId(prestadorId: string): Promise<Servicio[]>;
}