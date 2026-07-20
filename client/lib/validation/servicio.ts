/**
 * Client-side validation for the servicio create/edit form (PSM-REQ-05/07).
 * Mirrors the backend `CrearServicioDto`/`ActualizarServicioDto` rules
 * (`rangoPrecioMin <= rangoPrecioMax`, non-negative prices) and is the single
 * source of truth for the form. Pure + reusable by unit tests.
 *
 * Price fields are modeled as STRINGS in the form (empty = "no bound") to match
 * the registro/proposal pattern of keeping RHF values as plain strings; the
 * payload builders parse them to `number | null` for the backend.
 */
import { z } from "zod";

import { copy } from "@/lib/copy/es-AR";
import type {
  ActualizarServicioPayload,
  CrearServicioPayload,
  MiServicio,
} from "@/lib/api/prestador-me";

const e = copy.cuenta.servicios.errors;

/** Parses a raw price string. Empty → null (no bound); otherwise a number. */
function parsePrecio(raw: string): { ok: boolean; value: number | null } {
  const t = raw.trim();
  if (t === "") return { ok: true, value: null };
  const n = Number(t);
  if (!Number.isFinite(n) || n < 0) return { ok: false, value: null };
  return { ok: true, value: n };
}

/** Public helper: raw string → `number | null` (assumes a validated value). */
export function toPrecio(raw: string): number | null {
  return parsePrecio(raw).value;
}

export const servicioSchema = z
  .object({
    categoria: z.string().trim().min(1, e.categoriaRequerida).max(100),
    descripcion: z.string().trim().min(1, e.descripcionRequerida),
    // Raw strings; parsed + range-checked in superRefine.
    rangoPrecioMin: z.string(),
    rangoPrecioMax: z.string(),
    visible: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const min = parsePrecio(data.rangoPrecioMin);
    const max = parsePrecio(data.rangoPrecioMax);

    if (!min.ok) {
      ctx.addIssue({ code: "custom", path: ["rangoPrecioMin"], message: e.precioInvalido });
    }
    if (!max.ok) {
      ctx.addIssue({ code: "custom", path: ["rangoPrecioMax"], message: e.precioInvalido });
    }
    // Range check only when both bounds are present and individually valid.
    if (
      min.ok &&
      max.ok &&
      min.value !== null &&
      max.value !== null &&
      min.value > max.value
    ) {
      ctx.addIssue({ code: "custom", path: ["rangoPrecioMax"], message: e.rangoInvalido });
    }
  });

export type ServicioFormValues = z.infer<typeof servicioSchema>;

/** Empty form values for the "publish a new servicio" case. */
export const servicioDefaults: ServicioFormValues = {
  categoria: "",
  descripcion: "",
  rangoPrecioMin: "",
  rangoPrecioMax: "",
  visible: true,
};

/** Prefills the form from an existing servicio (edit case). */
export function servicioDefaultsFrom(servicio: MiServicio): ServicioFormValues {
  return {
    categoria: servicio.categoria,
    descripcion: servicio.descripcion,
    rangoPrecioMin:
      servicio.rangoPrecioMin === null ? "" : String(servicio.rangoPrecioMin),
    rangoPrecioMax:
      servicio.rangoPrecioMax === null ? "" : String(servicio.rangoPrecioMax),
    visible: servicio.visible,
  };
}

/** Maps validated form values to the create payload. */
export function buildCrearServicioPayload(
  values: ServicioFormValues,
): CrearServicioPayload {
  return {
    categoria: values.categoria.trim(),
    descripcion: values.descripcion.trim(),
    rangoPrecioMin: toPrecio(values.rangoPrecioMin),
    rangoPrecioMax: toPrecio(values.rangoPrecioMax),
    visible: values.visible,
  };
}

/** Maps validated form values to the update payload (same shape). */
export function buildActualizarServicioPayload(
  values: ServicioFormValues,
): ActualizarServicioPayload {
  return buildCrearServicioPayload(values);
}
