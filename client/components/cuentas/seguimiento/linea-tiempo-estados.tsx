"use client";

/**
 * State timeline drill-in (UC09). A disclosure toggle under each contratación
 * card that lazily fetches GET /api/contrataciones/:id (the BFF handler) the
 * first time it is opened, then renders the chronological estado changes with
 * es-AR labels + localized timestamps. Read-only — no mutations here.
 *
 * Outcomes (mirrors AccionesContratacion):
 *   200 → list of entries (empty array → neutral empty state)
 *   401 → router.push('/login?next=/cuenta/contrataciones')
 *   404 → "ya no disponible" banner
 *   network / 5xx → non-technical banner (role="alert")
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { copy } from "@/lib/copy/es-AR";
import {
  obtenerDetalle,
  type ContratacionHistorialItem,
} from "@/lib/api/contrataciones";
import {
  formatTimestamp,
  transicionLabel,
} from "@/lib/seguimiento/linea-tiempo";

const NEXT = "/cuenta/contrataciones";

type Estado =
  | { fase: "idle" }
  | { fase: "cargando" }
  | { fase: "listo"; historial: ContratacionHistorialItem[] }
  | { fase: "error"; mensaje: string };

export function LineaTiempoEstados({ contratacionId }: { contratacionId: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState<Estado>({ fase: "idle" });

  async function cargar() {
    setEstado({ fase: "cargando" });
    const result = await obtenerDetalle(contratacionId);

    if (result.ok) {
      setEstado({ fase: "listo", historial: result.data.historial });
      return;
    }

    if (result.kind === "unauthorized") {
      router.push(`/login?next=${encodeURIComponent(NEXT)}`);
      return;
    }

    setEstado({
      fase: "error",
      mensaje:
        result.kind === "no_disponible"
          ? copy.seguimiento.noDisponible
          : copy.seguimiento.linea.error,
    });
  }

  function onToggle() {
    const siguiente = !abierto;
    setAbierto(siguiente);
    // Lazy-load on first open; re-fetch if a prior attempt errored.
    if (siguiente && (estado.fase === "idle" || estado.fase === "error")) {
      void cargar();
    }
  }

  const panelId = `linea-tiempo-${contratacionId}`;

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      <button
        type="button"
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={onToggle}
        className="self-start text-sm font-medium text-primary underline-offset-2 hover:underline"
      >
        {abierto
          ? copy.seguimiento.linea.toggleOcultar
          : copy.seguimiento.linea.toggleVer}
      </button>

      {abierto && (
        <div id={panelId} className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-foreground">
            {copy.seguimiento.linea.titulo}
          </h3>

          {estado.fase === "cargando" && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {copy.seguimiento.linea.cargando}
            </p>
          )}

          {estado.fase === "error" && (
            <Alert variant="error" role="alert">
              {estado.mensaje}
            </Alert>
          )}

          {estado.fase === "listo" && estado.historial.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {copy.seguimiento.linea.vacio}
            </p>
          )}

          {estado.fase === "listo" && estado.historial.length > 0 && (
            <ol className="flex flex-col gap-3 border-l border-border pl-4">
              {estado.historial.map((item, i) => (
                <li key={`${item.estadoNuevo}-${item.timestamp}-${i}`} className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {transicionLabel(item)}
                  </span>
                  <time
                    dateTime={item.timestamp}
                    className="text-xs text-muted-foreground"
                  >
                    {formatTimestamp(item.timestamp)}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
