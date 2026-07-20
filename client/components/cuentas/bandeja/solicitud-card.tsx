"use client";

/**
 * Inbox item card (REQ-02/04/13/14/15). Shows the readable client name,
 * ubicación, requested fecha/franja and descripción plus an <EstadoBadge/>. For
 * a `solicitada` item it exposes the presupuestar/rechazar actions; the
 * `contratacionId` is taken from the item (REQ-04) and never typed by the user.
 *
 * The presupuestar form is toggled open to keep each card compact; rejecting
 * has its own inline confirmation step.
 *
 * For non-`solicitada` items (the Activas tab: presupuestada/confirmada/
 * en_curso), it renders the shared `<AccionesContratacion>` engine so the
 * prestador can iniciar/finalizar/cancelar from the ONE workflow they
 * actually navigate to — the bandeja never linked to /cuenta/contrataciones.
 * `accionesPara` gates the actual buttons (null for presupuestada — the
 * prestador is just waiting on the cliente there).
 */
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/es-AR";
import type { ContratacionListItem } from "@/lib/api/contrataciones";
import { EstadoBadge } from "@/components/cuentas/bandeja/estado-badge";
import { PresupuestarForm } from "@/components/cuentas/bandeja/presupuestar-form";
import { RechazarConfirm } from "@/components/cuentas/bandeja/rechazar-confirm";
import { AccionesContratacion } from "@/components/cuentas/acciones/acciones-contratacion";

function DatoLinea({ label, valor }: { label: string; valor: string }) {
  return (
    <p className="text-sm text-foreground">
      <span className="font-medium text-muted-foreground">{label}: </span>
      {valor}
    </p>
  );
}

export function SolicitudCard({ item }: { item: ContratacionListItem }) {
  const [showForm, setShowForm] = useState(false);

  const accionable = item.estado === "solicitada";

  return (
    <li className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-sm">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-foreground">
            {item.clienteNombre}
          </h2>
          <DatoLinea label={copy.bandeja.ubicacionLabel} valor={item.ubicacion} />
        </div>
        <EstadoBadge estado={item.estado} />
      </header>

      <div className="flex flex-col gap-1">
        <DatoLinea label={copy.bandeja.fechaLabel} valor={item.fecha} />
        <DatoLinea label={copy.bandeja.franjaLabel} valor={item.franja} />
        <DatoLinea
          label={copy.bandeja.descripcionLabel}
          valor={item.descripcion}
        />
      </div>

      {accionable && (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          {showForm ? (
            <PresupuestarForm
              contratacionId={item.id}
              fechaPedida={item.fecha}
              franjaPedida={item.franja}
              onDone={() => setShowForm(false)}
            />
          ) : (
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={() => setShowForm(true)}>
                {copy.bandeja.presupuestar}
              </Button>
              <RechazarConfirm contratacionId={item.id} />
            </div>
          )}
        </div>
      )}

      {!accionable && (
        <AccionesContratacion
          contratacionId={item.id}
          rol="prestador"
          estado={item.estado}
          nextPath="/cuenta/solicitudes"
        />
      )}
    </li>
  );
}
