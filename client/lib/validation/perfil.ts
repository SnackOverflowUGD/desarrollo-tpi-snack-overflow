/**
 * Client-side validation for the prestador profile-edit form (PSM-REQ-02/03/04).
 * Mirrors the backend `ActualizarPerfilDto` rules but is the single source of
 * truth for the form; the server revalidates. Pure + reusable by unit tests.
 *
 * `localidad` is validated against the curated `UBICACIONES` labels (the same
 * values the registro form submits) so the UI never sends an unknown localidad
 * the backend would reject with 400.
 */
import { z } from "zod";

import { copy } from "@/lib/copy/es-AR";
import { UBICACIONES } from "@/lib/catalogo/ubicaciones";
import type {
  ActualizarPerfilPayload,
  DisponibilidadEstado,
  MiPerfil,
} from "@/lib/api/prestador-me";

/** The 3 availability estados the backend enum accepts (PSM-REQ-04). */
export const DISPONIBILIDAD_ESTADOS = [
  "disponible_esta_semana",
  "proxima_disponible",
  "sin_disponibilidad",
] as const;

/** Set of valid localidad labels (mirrors registro-form's LOCALIDADES values). */
const LOCALIDAD_LABELS = new Set(UBICACIONES.map((u) => u.label));

/** True when `label` is a localidad present in the curated `UBICACIONES` list. */
export function isLocalidadValida(label: string): boolean {
  return LOCALIDAD_LABELS.has(label);
}

export const perfilSchema = z.object({
  // At least one oficio — a prestador with no oficio is not discoverable.
  oficios: z
    .array(z.string().trim().min(1))
    .min(1, copy.cuenta.perfil.errors.oficiosRequerido),
  localidad: z
    .string()
    .trim()
    .min(1, copy.cuenta.perfil.errors.localidadRequerida)
    .refine(isLocalidadValida, copy.cuenta.perfil.errors.localidadInvalida),
  disponibilidad: z.enum(DISPONIBILIDAD_ESTADOS, {
    message: copy.cuenta.perfil.errors.disponibilidadInvalida,
  }),
  visible: z.boolean(),
});

export type PerfilFormValues = z.infer<typeof perfilSchema>;

/**
 * Derives initial form values from the loaded profile. Missing/unknown values
 * fall back to safe defaults (`sin_disponibilidad`, `visible=true`) so the form
 * is always renderable even for a freshly registered prestador.
 */
export function perfilDefaultsFrom(perfil: MiPerfil): PerfilFormValues {
  const estado = perfil.disponibilidadResumen?.estado;
  const disponibilidad: DisponibilidadEstado =
    estado && (DISPONIBILIDAD_ESTADOS as readonly string[]).includes(estado)
      ? estado
      : "sin_disponibilidad";

  return {
    oficios: Array.isArray(perfil.oficios) ? perfil.oficios : [],
    localidad: perfil.localidad ?? "",
    disponibilidad,
    visible: perfil.visible ?? true,
  };
}

/**
 * Maps validated form values to the backend PATCH payload. `disponibilidad`
 * (a flat enum in the form) is wrapped into the structured `disponibilidadResumen`
 * the backend stores; `localidad` is always sent (the service is idempotent when
 * unchanged and regenerates the zona when it differs).
 */
export function buildActualizarPerfilPayload(
  values: PerfilFormValues,
): ActualizarPerfilPayload {
  return {
    oficios: values.oficios,
    localidad: values.localidad,
    disponibilidadResumen: { estado: values.disponibilidad },
    visible: values.visible,
  };
}
