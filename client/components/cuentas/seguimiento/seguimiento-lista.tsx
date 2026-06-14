"use client";

/**
 * Seguimiento list (REQ-05/14, ESC-UI-01/02/10). Receives the already-fetched
 * `items` + the viewer `rol`. Client-side filter by estado group (activas vs.
 * terminadas vs. todas; REQ-05). An empty result renders a NEUTRAL empty state
 * (NOT an error, ESC-UI-10); otherwise a keyboard-navigable list of
 * <ContratacionCard/>. No I/O here — listing happens in the page, actions in the
 * cards.
 */
import { useMemo, useState } from "react";

import { copy } from "@/lib/copy/es-AR";
import type {
  ContratacionEstado,
  ContratacionListItem,
} from "@/lib/api/contrataciones";
import type { RolSeguimiento } from "@/lib/api/acciones-contratacion";
import { ContratacionCard } from "@/components/cuentas/seguimiento/contratacion-card";

type Filtro = "activas" | "terminadas" | "todas";

const TERMINALES: ContratacionEstado[] = ["finalizada", "cancelada"];

function esTerminal(estado: ContratacionEstado): boolean {
  return TERMINALES.includes(estado);
}

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "activas", label: copy.seguimiento.filtroActivas },
  { value: "terminadas", label: copy.seguimiento.filtroTerminadas },
  { value: "todas", label: copy.seguimiento.filtroTodas },
];

export function SeguimientoLista({
  items,
  rol,
}: {
  items: ContratacionListItem[];
  rol: RolSeguimiento;
}) {
  const [filtro, setFiltro] = useState<Filtro>("activas");

  const visibles = useMemo(() => {
    if (filtro === "todas") return items;
    if (filtro === "terminadas") return items.filter((i) => esTerminal(i.estado));
    return items.filter((i) => !esTerminal(i.estado));
  }, [items, filtro]);

  return (
    <div className="flex flex-col gap-4">
      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">{copy.seguimiento.filtroLabel}</legend>
        {FILTROS.map((f) => {
          const active = filtro === f.value;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={active}
              onClick={() => setFiltro(f.value)}
              className={
                "min-h-11 rounded-full border px-4 text-sm font-medium transition-colors " +
                (active
                  ? "border-primary bg-primary text-on-primary"
                  : "border-border-strong bg-surface text-foreground hover:bg-surface-sunken")
              }
            >
              {f.label}
            </button>
          );
        })}
      </fieldset>

      {visibles.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-surface-sunken p-6 text-center text-sm text-muted-foreground">
          {copy.seguimiento.vacio}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {visibles.map((item) => (
            <ContratacionCard key={item.id} item={item} rol={rol} />
          ))}
        </ul>
      )}
    </div>
  );
}
