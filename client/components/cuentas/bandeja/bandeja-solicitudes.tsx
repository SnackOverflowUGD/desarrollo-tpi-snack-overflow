"use client";

/**
 * Inbox list with tabs (Pendientes / Activas / Terminadas).
 * Receives all items and filters client-side by active tab.
 * Empty states are neutral (NOT errors) per tab.
 */
import { copy } from "@/lib/copy/es-AR";
import type { ContratacionListItem } from "@/lib/api/contrataciones";
import { SolicitudCard } from "@/components/cuentas/bandeja/solicitud-card";
import { BandejaTabs } from "@/components/cuentas/bandeja/tabs";

type Tab = "pendientes" | "activas" | "terminadas";

const ESTADOS_POR_TAB: Record<Tab, ContratacionListItem["estado"][]> = {
  pendientes: ["solicitada"],
  activas: ["presupuestada", "confirmada", "en_curso"],
  terminadas: ["finalizada", "cancelada"],
};

const EMPTY_COPY: Record<Tab, string> = {
  pendientes: copy.bandeja.vacio,
  activas: copy.bandeja.vacioActivas,
  terminadas: copy.bandeja.vacioTerminadas,
};

interface BandejaSolicitudesProps {
  items: ContratacionListItem[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export function BandejaSolicitudes({
  items,
  activeTab,
  onTabChange,
}: BandejaSolicitudesProps) {
  const estados = ESTADOS_POR_TAB[activeTab];
  const filteredItems = items.filter((item) => estados.includes(item.estado));

  return (
    <div>
      <BandejaTabs activeTab={activeTab} onChange={onTabChange} />

      {filteredItems.length === 0 ? (
        <p
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="rounded-lg border border-dashed border-border bg-surface-sunken p-6 text-center text-sm text-muted-foreground"
        >
          {EMPTY_COPY[activeTab]}
        </p>
      ) : (
        <ul
          id={`panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="flex flex-col gap-4"
        >
          {filteredItems.map((item) => (
            <SolicitudCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}