/**
 * Public profile DTO — full provider profile shown when client selects a provider (ESC-06).
 * Excludes contact info per RN-CAT-05.
 */

export class ResenaDto {
  calificacion!: number;
  contenido!: string;
  fecha!: string;
  clienteNombre?: string;
}

export class ServicioDto {
  id!: string;
  categoria!: string;
  descripcion!: string;
  rangoPrecio!: { min: number | null; max: number | null };
}

export class PrestadorPerfil {
  id!: string;
  nombreCompleto!: string;
  oficios!: string[];
  calificacionPromedio!: number;
  cantidadResenas!: number;
  zonaCobertura!: string[];
  servicios!: ServicioDto[];
  resenas!: ResenaDto[];
}
