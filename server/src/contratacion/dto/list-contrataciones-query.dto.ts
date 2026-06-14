import { IsEnum, IsOptional } from 'class-validator';
import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';

/**
 * Query params for GET /contrataciones (UC08, REQ-01).
 *
 * Only `?estado=` is accepted. The identity dimension (prestadorId/clienteId)
 * is ALWAYS derived from the JWT (req.user), NEVER from the query string
 * (RN-CON-07: isolation by token). An out-of-enum value → 400 via @IsEnum.
 */
export class ListContratacionesQueryDto {
  @IsOptional()
  @IsEnum(ContratacionEstado)
  estado?: ContratacionEstado;
}
