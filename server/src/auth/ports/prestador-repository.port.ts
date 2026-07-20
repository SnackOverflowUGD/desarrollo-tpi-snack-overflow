/**
 * Auth Module - Prestador Repository Port Re-export
 * Re-exports the catalog's prestador repository port for auth module consumption.
 * Follows the same pattern as USER_REPOSITORY in user.repository.port.ts
 */

export type {
  IPrestadorRepository,
  CreatePrestadorData,
} from '../../catalogo/ports/prestador-repository.port.js';
export { PRESTADOR_REPOSITORY } from '../../catalogo/ports/prestador-repository.port.js';