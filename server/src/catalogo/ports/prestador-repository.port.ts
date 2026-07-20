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
  zonaCobertura: ReturnType<import('../domain/cobertura-zona.value.js').CoberturaZona['toJSON']>;
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
   * Creates a new prestador record.
   * Accepts optional QueryRunner for transaction support.
   */
  create(
    data: CreatePrestadorData,
    qr?: QueryRunner,
  ): Promise<import('../domain/prestador.entity.js').Prestador>;
}
