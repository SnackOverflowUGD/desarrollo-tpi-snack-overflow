/**
 * Inbox list (Server-friendly, REQ-02/03/14, ESC-UI-07). Receives the already
 * fetched `items`. An empty array renders a NEUTRAL empty state (NOT an error,
 * REQ-03); otherwise it renders a keyboard-navigable list of <SolicitudCard/>.
 * The list itself carries no I/O — listing/refresh happen in the page + cards.
 */
import { copy } from "@/lib/copy/es-AR";
import type { ContratacionListItem } from "@/lib/api/contrataciones";
import { SolicitudCard } from "@/components/cuentas/bandeja/solicitud-card";

export function BandejaSolicitudes({
  items,
}: {
  items: ContratacionListItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-surface-sunken p-6 text-center text-sm text-muted-foreground">
        {copy.bandeja.vacio}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <SolicitudCard key={item.id} item={item} />
      ))}
    </ul>
  );
}
