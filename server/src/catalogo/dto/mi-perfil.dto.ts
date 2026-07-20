import { CoberturaZona } from '../domain/cobertura-zona.value.js';

/**
 * A servicio as seen by its owner (self-management view) — includes the
 * `visible` flag and hidden servicios, unlike the public `ServicioDto`.
 */
export interface MiPerfilServicioDto {
  id: string;
  categoria: string;
  descripcion: string;
  rangoPrecioMin: number | null;
  rangoPrecioMax: number | null;
  visible: boolean;
}

/**
 * The authenticated prestador's own profile (PSM-REQ-01). Carries the
 * editable fields plus the app-owned publish flag and ALL servicios
 * (including hidden ones).
 */
export interface MiPerfilDto {
  id: string;
  nombreCompleto: string;
  categoria: string;
  oficios: string[];
  localidad: string | null;
  zonaCobertura: ReturnType<CoberturaZona['toJSON']> | null;
  disponibilidadResumen:
    | import('../domain/prestador.entity.js').Prestador['disponibilidadResumen']
    | null;
  visible: boolean;
  tieneServiciosPublicados: boolean;
  servicios: MiPerfilServicioDto[];
}
