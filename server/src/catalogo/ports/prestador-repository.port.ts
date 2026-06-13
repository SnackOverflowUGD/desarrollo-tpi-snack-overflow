/**
 * Provider Repository Port
 * Interface for querying prestadores (providers) in the catalog.
 * Implemented by TypeORM adapter.
 */

import { PrestadorResumen } from '../dto/prestador-resumen.dto.js';
import { PrestadorPerfil } from '../dto/prestador-perfil.dto.js';
import { Coordenadas } from '../domain/cobertura-zona.value.js';

export interface BusquedaCriteria {
  oficio: string;
  ubicacion: Coordenadas;
  categoria?: string;
  calificacionMinima?: number;
  fechaDisponibilidad?: Date;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const PRESTADOR_REPOSITORY = 'PRESTADOR_REPOSITORY';

export interface IPrestadorRepository {
  /**
   * Finds providers by coverage zone and category.
   * Returns paginated results with basic summary info.
   */
  findByCobertura(criteria: BusquedaCriteria): Promise<PaginatedResult<PrestadorResumen>>;

  /**
   * Finds a provider by ID with full public profile data.
   * Returns null if not found.
   */
  findByIdWithProfile(id: string): Promise<PrestadorPerfil | null>;
}