import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/**
 * Availability state — reuses the exact enum stored in
 * `prestador.disponibilidadResumen.estado` and consumed by the search
 * projection (PSM-REQ-04).
 */
export enum DisponibilidadEstado {
  DISPONIBLE_ESTA_SEMANA = 'disponible_esta_semana',
  PROXIMA_DISPONIBLE = 'proxima_disponible',
  SIN_DISPONIBILIDAD = 'sin_disponibilidad',
}

export class DisponibilidadResumenDto {
  @IsEnum(DisponibilidadEstado)
  estado!: DisponibilidadEstado;

  @IsOptional()
  @IsString()
  proximaFecha?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  franjasDisponiblesProximos7Dias?: number;
}

/**
 * Self-service profile patch. Every field is optional (PATCH semantics); the
 * service applies only the keys present. `localidad` changes trigger an
 * in-service zona regeneration (PSM-REQ-03).
 */
export class ActualizarPerfilDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  oficios?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  categoria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  localidad?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DisponibilidadResumenDto)
  disponibilidadResumen?: DisponibilidadResumenDto;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
