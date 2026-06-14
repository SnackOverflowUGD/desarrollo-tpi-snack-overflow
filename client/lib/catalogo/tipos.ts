/**
 * Catalog domain types — EXACT mirror of the backend contract for
 * GET /catalogo/prestadores and GET /catalogo/prestadores/:id (design §3).
 *
 * RN-CAT-05: the public profile NEVER includes contact data (phone/email);
 * the types below deliberately do NOT declare those fields, so a leaked
 * contact value would not even type-check into the UI.
 */

export type Disponibilidad =
  | "disponible_esta_semana"
  | "proxima_disponible"
  | "sin_disponibilidad";

export interface PrestadorResumen {
  id: string;
  nombreCompleto: string;
  oficios: string[];
  calificacionPromedio: number;
  cantidadResenas: number;
  disponibilidad: Disponibilidad | null;
  proximaFechaDisponible?: string;
  franjasDisponiblesProximos7Dias?: number;
  distanciaKm?: number;
  centroCobertura?: { lat: number; lng: number };
}

/**
 * Price range. Either bound may be null (the backend omits an unknown bound).
 * The UI renders a partial/open range when one side is null (REQ-07).
 */
export interface RangoPrecio {
  min: number | null;
  max: number | null;
}

export interface Servicio {
  id: string;
  categoria: string;
  descripcion: string;
  rangoPrecio: RangoPrecio;
}

export interface Resena {
  calificacion: number;
  contenido: string;
  fecha: string;
  clienteNombre?: string;
}

export interface PrestadorPerfil {
  id: string;
  nombreCompleto: string;
  oficios: string[];
  calificacionPromedio: number;
  cantidadResenas: number;
  zonaCobertura: string[];
  servicios: Servicio[];
  resenas: Resena[];
  // RN-CAT-05: SIN datos de contacto. The type does NOT declare phone/email.
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type Orden = "calificacion" | "distancia" | "disponibilidad";

/** The set of valid `orden` values — single source for runtime validation. */
export const ORDENES: readonly Orden[] = [
  "calificacion",
  "distancia",
  "disponibilidad",
] as const;

/**
 * Search criteria already validated/normalized: `oficio` and `ubicacion` are
 * guaranteed non-empty before a request is issued (ADR-04-03). The optional
 * fields carry their backend defaults documented inline.
 */
export interface CriteriosBusqueda {
  oficio: string;
  ubicacion: string;
  orden?: Orden; // default 'calificacion' (RN-CAT-03)
  calificacionMin?: number; // 1..5
  page?: number; // default 1
  pageSize?: number; // default 20
}

/** Default page size when not overridden via the URL (Supuesto S6). */
export const DEFAULT_PAGE_SIZE = 20;

/** Default ordering materialized in the selector (RN-CAT-03). */
export const DEFAULT_ORDEN: Orden = "calificacion";
