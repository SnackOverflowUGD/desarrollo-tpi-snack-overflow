import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class SendProposalDto {
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  franja: string;

  @IsNumber()
  @Min(0.01)
  precioEstimado: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  justificacionPrecio?: string;
}
