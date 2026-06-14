/**
 * Static catalog of trades (oficios) for the registration form.
 *
 * Supuesto S2: this mirrors the backend `RegulatedTrade` seeds (spec PA-02).
 * `regulated: true` marks trades that require a matrícula and therefore put a
 * provider account into `pendiente_habilitacion` on registration (RN-REG-05).
 *
 * TODO(UC18): replace this static list with the real trades catalog endpoint
 * once it exists. Keep `value` in sync with backend seed values.
 */
export interface Trade {
  value: string;
  label: string;
  regulated: boolean;
}

export const TRADES: readonly Trade[] = [
  // Regulated — require matrícula / habilitación
  { value: "electricista", label: "Electricista", regulated: true },
  { value: "gasista", label: "Gasista", regulated: true },
  { value: "plomero", label: "Plomero", regulated: true },
  { value: "tecnico-refrigeracion", label: "Técnico en refrigeración", regulated: true },

  // Non-regulated
  { value: "albanil", label: "Albañil", regulated: false },
  { value: "carpintero", label: "Carpintero", regulated: false },
  { value: "pintor", label: "Pintor", regulated: false },
  { value: "herrero", label: "Herrero", regulated: false },
  { value: "jardinero", label: "Jardinero", regulated: false },
  { value: "techista", label: "Techista", regulated: false },
  { value: "cerrajero", label: "Cerrajero", regulated: false },
  { value: "fletero", label: "Fletero", regulated: false },
] as const;

/** Returns true when the given trade value is regulated (requires matrícula). */
export function isRegulatedTrade(value: string): boolean {
  return TRADES.some((t) => t.value === value && t.regulated);
}
