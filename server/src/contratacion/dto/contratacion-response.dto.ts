import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';

export class ContratacionResponseDto {
  id: string;
  ubicacion: string;
  prestadorId: string;
  clienteId: string;
  fecha: string;
  franja: string;
  descripcion: string;
  fechaPropuesta?: string | null;
  franjaPropuesta?: string | null;
  precioEstimado?: number | null;
  estado: ContratacionEstado;
  createdAt: Date;

  constructor(partial: Partial<ContratacionResponseDto>) {
    Object.assign(this, partial);
  }
}
