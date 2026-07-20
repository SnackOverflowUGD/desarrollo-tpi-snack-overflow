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
 * Payload to create a servicio on the authenticated prestador's own profile
 * (PSM-REQ-05). `prestadorId` is NEVER accepted from the client — the service
 * derives it from the JWT `sub`.
 */
export class CrearServicioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  categoria!: string;

  @IsString()
  @IsNotEmpty()
  descripcion!: string;

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
