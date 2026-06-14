import { cn } from "@/lib/utils";
import { copy } from "@/lib/copy/es-AR";
import type { ContratacionEstado } from "@/lib/api/contrataciones";

/**
 * Estado badge (Server-friendly, REQ-15, WCAG 1.4.1). Always carries TEXT; the
 * color is reinforcement only. Tokens follow DESIGN-SYSTEM §estado:
 * solicitada=info, presupuestada=warning, cancelada=error (plus the remaining
 * states reused by MI-09.x). Contrast pairs are the verified subtle/foreground
 * tokens (≥4.5:1 in light and dark).
 */
const ESTADO_CLASSES: Record<ContratacionEstado, string> = {
  solicitada: "bg-info-subtle text-info",
  presupuestada: "bg-warning-subtle text-warning-deep dark:text-warning",
  confirmada: "bg-success-subtle text-success",
  cancelada: "bg-error-subtle text-error",
  en_curso: "bg-primary-subtle text-primary",
  finalizada: "bg-surface-sunken text-muted-foreground",
};

export function EstadoBadge({
  estado,
  className,
}: {
  estado: ContratacionEstado;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        ESTADO_CLASSES[estado],
        className,
      )}
    >
      {copy.bandeja.badges[estado]}
    </span>
  );
}
