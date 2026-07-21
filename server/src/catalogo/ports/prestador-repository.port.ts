/**
 * Provider Repository Port
 * Interface for querying prestadores (providers) in the catalog.
 * Implemented by TypeORM adapter.
 */

import { PrestadorResumen } from '../dto/prestador-resumen.dto.js';
import { PrestadorPerfil } from '../dto/prestador-perfil.dto.js';
import { Coordenadas } from '../domain/cobertura-zona.value.js';
import { QueryRunner } from 'typeorm';

export interface BusquedaCriteria {
  oficio: string;
  ubicacion: Coordenadas;
  categoria?: string;
  calificacionMinima?: number;
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

export interface CreatePrestadorData {
  id: string;
  nombreCompleto: string;
  oficios: string[];
  categoria: string;
  localidad: string;
  zonaCobertura: ReturnType<
    import('../domain/cobertura-zona.value.js').CoberturaZona['toJSON']
  >;
  cuentaActiva: boolean;
  visible: boolean;
  disponibilidadResumen?: {
    estado:
      | 'disponible_esta_semana'
      | 'proxima_disponible'
      | 'sin_disponibilidad';
    proximaFecha?: string;
    franjasDisponiblesProximos7Dias?: number;
  } | null;
  calificacionPromedio?: number;
  cantidadResenas?: number;
  /**
   * App-owned publish flag. A freshly registered prestador has NO visible
   * servicios yet, so registration sets this `false` — the prestador becomes
   * searchable only after publishing a service. Defaults to `false` when
   * omitted.
   */
  tieneServiciosPublicados?: boolean;
}

/**
 * Partial patch for a prestador self-service profile update.
 * Only the fields a prestador may edit on their own profile, plus the
 * app-owned `tieneServiciosPublicados` publish flag recomputed by the
 * application service.
 */
export interface UpdatePrestadorData {
  oficios?: string[];
  categoria?: string;
  localidad?: string;
  zonaCobertura?: ReturnType<
    import('../domain/cobertura-zona.value.js').CoberturaZona['toJSON']
  >;
  disponibilidadResumen?: import('../domain/prestador.entity.js').Prestador['disponibilidadResumen'];
  visible?: boolean;
  tieneServiciosPublicados?: boolean;
}

export interface IPrestadorRepository {
  /**
   * Finds providers by coverage zone and category.
   * Returns paginated results with basic summary info.
   */
  findByCobertura(
    criteria: BusquedaCriteria,
  ): Promise<PaginatedResult<PrestadorResumen>>;

  /**
   * Finds a provider by ID with full public profile data.
   * Returns null if not found.
   */
  findByIdWithProfile(id: string): Promise<PrestadorPerfil | null>;

  /**
   * Finds a prestador entity by ID (raw entity, for self-service reads/edits).
   * Returns null if not found.
   */
  findById(
    id: string,
  ): Promise<import('../domain/prestador.entity.js').Prestador | null>;

  /**
   * Creates a new prestador record.
   * Accepts optional QueryRunner for transaction support.
   */
  create(
    data: CreatePrestadorData,
    qr?: QueryRunner,
  ): Promise<import('../domain/prestador.entity.js').Prestador>;

  /**
   * Applies a partial update to an existing prestador and returns the saved
   * entity. Accepts an optional QueryRunner so the update can participate in a
   * transaction (e.g. atomic servicio mutation + publish-flag recompute).
   */
  update(
    id: string,
    patch: UpdatePrestadorData,
    qr?: QueryRunner,
  ): Promise<import('../domain/prestador.entity.js').Prestador>;
}
