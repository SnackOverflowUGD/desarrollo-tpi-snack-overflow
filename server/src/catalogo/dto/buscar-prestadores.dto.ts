import { IsNotEmpty, IsOptional, IsIn, IsInt, Min, Max } from 'class-validator';

export class BuscarPrestadoresDto {
  @IsNotEmpty({ message: 'El oficio es obligatorio' })
  oficio!: string;

  @IsNotEmpty({ message: 'La ubicacion es obligatoria' })
  ubicacion!: string;

  @IsOptional()
  @IsIn(['calificacion', 'distancia', 'disponibilidad'])
  orden?: 'calificacion' | 'distancia' | 'disponibilidad';

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  calificacionMin?: number;

  @IsOptional()
  fecha?: string;
}
