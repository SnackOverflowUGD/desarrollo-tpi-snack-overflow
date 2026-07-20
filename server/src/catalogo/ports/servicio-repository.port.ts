/**
 * Service Repository Port
 * Interface for querying and mutating a prestador's published services.
 * Implemented by TypeORM adapter.
 */

import { QueryRunner } from 'typeorm';
import { Servicio } from '../domain/servicio.entity.js';

export const SERVICIO_REPOSITORY = 'SERVICIO_REPOSITORY';

/**
 * Data required to create a servicio. The `id` is assigned by the adapter.
 */
export interface CreateServicioData {
  prestadorId: string;
  categoria: string;
  descripcion: string;
  rangoPrecioMin: number | null;
  rangoPrecioMax: number | null;
  visible: boolean;
}

/**
 * Partial patch for updating a servicio.
 */
export interface UpdateServicioData {
  categoria?: string;
  descripcion?: string;
  rangoPrecioMin?: number | null;
  rangoPrecioMax?: number | null;
  visible?: boolean;
}

export interface IServicioRepository {
  /**
   * Finds all visible services for a given provider.
   */
  findByPrestadorId(prestadorId: string): Promise<Servicio[]>;

  /**
   * Finds all services for a given provider, including hidden (visible=false)
   * ones. Used by the owner's self-management view.
   */
  findByPrestadorIdIncludingHidden(prestadorId: string): Promise<Servicio[]>;

  /**
   * Finds a servicio by ID (raw entity, used for ownership checks).
   * Returns null if not found.
   */
  findById(id: string): Promise<Servicio | null>;

  /**
   * Counts the visible services of a provider. Accepts an optional QueryRunner
   * so the count can be read inside the same transaction that mutated a
   * servicio (publish-flag recompute).
   */
  countVisibleByPrestadorId(
    prestadorId: string,
    qr?: QueryRunner,
  ): Promise<number>;

  /**
   * Creates a new servicio. Accepts an optional QueryRunner for transactions.
   */
  create(data: CreateServicioData, qr?: QueryRunner): Promise<Servicio>;

  /**
   * Applies a partial update to a servicio and returns the saved entity.
   * Accepts an optional QueryRunner for transactions.
   */
  update(
    id: string,
    patch: UpdateServicioData,
    qr?: QueryRunner,
  ): Promise<Servicio>;

  /**
   * Soft-deletes a servicio by setting `visible = false`. The row is preserved
   * (reversible). Accepts an optional QueryRunner for transactions.
   */
  softDelete(id: string, qr?: QueryRunner): Promise<void>;
}
