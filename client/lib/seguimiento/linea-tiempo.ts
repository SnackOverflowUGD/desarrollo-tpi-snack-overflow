/**
 * Pure helpers for the state-change timeline (UC09 drill-in). Kept framework-free
 * so they are trivially unit-testable (vitest) and reused by the component.
 */
import { copy } from "@/lib/copy/es-AR";
import type {
  ContratacionEstado,
  ContratacionHistorialItem,
} from "@/lib/api/contrataciones";

/** es-AR label for an estado (reuses the shared badge catalog). */
export function estadoLabel(estado: ContratacionEstado): string {
  return copy.bandeja.badges[estado];
}

/**
 * Human label for one timeline entry: the FIRST record (no previous estado) is
 * "Creada", every other is "Anterior → Nuevo". Color/iconography is the
 * component's concern — this stays text-only (WCAG 1.4.1).
 */
export function transicionLabel(item: ContratacionHistorialItem): string {
  if (item.estadoAnterior == null) {
    return `${copy.seguimiento.linea.inicial}: ${estadoLabel(item.estadoNuevo)}`;
  }
  return `${estadoLabel(item.estadoAnterior)} → ${estadoLabel(item.estadoNuevo)}`;
}

/**
 * Format an ISO timestamp as a localized es-AR date-time. Returns the raw input
 * unchanged when it is not a parseable date (defensive — never throws).
 */
export function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
