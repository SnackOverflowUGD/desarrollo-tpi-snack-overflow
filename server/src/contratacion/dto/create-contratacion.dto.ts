import { IsDateString, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateContratacionDto {
  @IsString()
  @IsNotEmpty()
  ubicacion: string;

  @IsUUID()
  @IsNotEmpty()
  prestadorId: string;

  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  franja: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;
}
