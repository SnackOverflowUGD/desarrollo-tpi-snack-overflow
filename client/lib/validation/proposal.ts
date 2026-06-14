/**
 * Client-side validation for the proposal (presupuestar) form (ADR-08-05,
 * REQ-07, ESC-UI-05). Mirrors lib/validation/solicitud.ts: a zod schema as the
 * single source of truth, reusable in tests.
 *
 * REUSE: `esFechaValida`/`hoyISO` come from solicitud.ts (pure, already tested)
 * — they are NOT reduplicated here. The only new pure helper is
 * `esPrecioValido(n) => n > 0`.
 *
 * The contratación `id` is NOT a field of this schema — it travels via the
 * selected item's context, never as user input (REQ-04).
 */
import { z } from "zod";
import { copy } from "@/lib/copy/es-AR";
import { esFechaValida, hoyISO } from "@/lib/validation/solicitud";

/** Pure price guard: a proposal price is valid only when strictly positive. */
export function esPrecioValido(n: number): boolean {
  return Number.isFinite(n) && n > 0;
}

export const proposalSchema = z.object({
  // RHF's `register("precioEstimado", { valueAsNumber: true })` converts the
  // <input type="number"> string to a number (NaN if empty). We enforce > 0
  // here; NaN/0/negative all fail via `esPrecioValido`.
  precioEstimado: z
    .number({ message: copy.bandeja.errors.precioRequerido })
    .refine((value) => esPrecioValido(value), {
      message: copy.bandeja.errors.precioInvalido,
    }),
  // ISO date from <input type="date">. Required first, then "today or future".
  fecha: z
    .string()
    .trim()
    .min(1, copy.bandeja.errors.fechaRequerida)
    .refine((value) => esFechaValida(value, hoyISO()), {
      message: copy.bandeja.errors.fechaPasada,
    }),
  // Free text, non-empty only — the curated set lives in copy, NOT here.
  franja: z.string().trim().min(1, copy.bandeja.errors.franjaRequerida),
});

export type ProposalFormValues = z.infer<typeof proposalSchema>;

export const proposalDefaults: ProposalFormValues = {
  precioEstimado: 0,
  fecha: "",
  franja: "",
};
