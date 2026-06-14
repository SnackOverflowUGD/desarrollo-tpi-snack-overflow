import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';

/**
 * Read model for GET /contrataciones (UC08, ADR-08-02 / REQ-01/02).
 *
 * Same fields as ContratacionResponseDto PLUS `clienteNombre` (name + ' ' +
 * lastName of the client User), resolved in the application layer via
 * USER_REPOSITORY. Kept distinct from ContratacionResponseDto so the list
 * read model can diverge without breaking the proposal/reject contract.
 */
export class ContratacionListItemDto {
  id: string;
  ubicacion: string;
  prestadorId: string;
  clienteId: string;
  clienteNombre: string;
  fecha: string;
  franja: string;
  descripcion: string;
  fechaPropuesta?: string | null;
  franjaPropuesta?: string | null;
  precioEstimado?: number | null;
  estado: ContratacionEstado;
  createdAt: Date;

  constructor(partial: Partial<ContratacionListItemDto>) {
    Object.assign(this, partial);
  }
}
