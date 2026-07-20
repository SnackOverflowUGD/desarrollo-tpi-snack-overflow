import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { IsPriceRangeValid } from './price-range.validator.js';

/**
 * Partial update for a prestador's own servicio (PSM-REQ-07). All fields
 * optional (PATCH); the service applies only the keys present and enforces
 * ownership before mutating.
 */
export class ActualizarServicioDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  categoria?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descripcion?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rangoPrecioMin?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @IsPriceRangeValid()
  rangoPrecioMax?: number | null;

  @IsOptional()
  @IsBoolean()
  visible?: boolean;
}
