import { IsNotEmpty, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class BuscarPrestadoresDto {
  @IsNotEmpty({ message: 'El oficio es obligatorio' })
  oficio!: string;

  @IsNotEmpty({ message: 'La ubicacion es obligatoria' })
  ubicacion!: string;

  @IsOptional()
  @IsIn(['calificacion', 'distancia', 'disponibilidad'])
  orden?: 'calificacion' | 'distancia' | 'disponibilidad';

  // Query-string values arrive as strings; @Type coerces them to Number so
  // @IsInt passes (transform alone does NOT enable implicit conversion).
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  calificacionMin?: number;

  @IsOptional()
  fecha?: string;
}
