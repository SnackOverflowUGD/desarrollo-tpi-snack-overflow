"use client";

/**
 * Servicios manager (PSM-REQ-05..08). Renders the prestador's own servicios
 * (including hidden ones), and orchestrates create / edit / publish-hide /
 * soft-delete (archivar). All mutations go through the discriminated
 * `lib/api/prestador-me` client (BFF → cookie→Bearer); after any success the
 * component calls `router.refresh()` so the server-rendered list (and the
 * publish flag) reflect the real state — never optimistic local mutation.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/components/ui/toaster";

import { copy } from "@/lib/copy/es-AR";
import {
  actualizarServicio,
  eliminarServicio,
  type MiServicio,
} from "@/lib/api/prestador-me";
import { ServicioForm } from "@/components/cuentas/servicios/servicio-form";

const LOGIN_PATH = "/login";

type View =
  | { type: "list" }
  | { type: "create" }
  | { type: "edit"; servicio: MiServicio };

/** Formats a price range using the es-AR copy templates. */
function formatPrecio(s: MiServicio): string {
  const c = copy.cuenta.servicios;
  const { rangoPrecioMin: min, rangoPrecioMax: max } = s;
  if (min !== null && max !== null) {
    return c.precioRango.replace("{min}", String(min)).replace("{max}", String(max));
  }
  if (min !== null) return c.precioDesde.replace("{min}", String(min));
  if (max !== null) return c.precioHasta.replace("{max}", String(max));
  return c.precioConsultar;
}

export function ServiciosManager({ servicios }: { servicios: MiServicio[] }) {
  const router = useRouter();
  const c = copy.cuenta.servicios;

  const [view, setView] = useState<View>({ type: "list" });
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  function backToList() {
    setView({ type: "list" });
    router.refresh();
  }

  /** Shared post-mutation handler for the toggle/delete row actions. */
  function handleActionResult(
    result: { ok: true } | { ok: false; kind: string },
    successMsg: string,
  ) {
    if (result.ok) {
      toast.success(successMsg);
      router.refresh();
      return;
    }
    if (result.kind === "unauthorized") {
      router.push(`${LOGIN_PATH}?next=${encodeURIComponent("/cuenta/servicios")}`);
      return;
    }
    if (result.kind === "no_disponible") {
      setGlobalError(c.noDisponible);
      router.refresh();
      return;
    }
    setGlobalError(c.errorAccion);
  }

  async function togglePublicado(s: MiServicio) {
    setGlobalError(null);
    setBusyId(s.id);
    const result = await actualizarServicio(s.id, { visible: !s.visible });
    setBusyId(null);
    handleActionResult(result, s.visible ? c.exitoEditar : c.exitoCrear);
  }

  async function confirmArchivar(id: string) {
    setGlobalError(null);
    setBusyId(id);
    const result = await eliminarServicio(id);
    setBusyId(null);
    setConfirmId(null);
    handleActionResult(result, c.exitoEliminar);
  }

  if (view.type === "create") {
    return <ServicioForm onCancel={() => setView({ type: "list" })} onSaved={backToList} />;
  }
  if (view.type === "edit") {
    return (
      <ServicioForm
        servicio={view.servicio}
        onCancel={() => setView({ type: "list" })}
        onSaved={backToList}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {globalError && (
        <Alert variant="error" role="alert">
          {globalError}
        </Alert>
      )}

      <div>
        <Button type="button" onClick={() => setView({ type: "create" })}>
          {c.nuevo}
        </Button>
      </div>

      {servicios.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
          {c.vacio}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {servicios.map((s) => {
            const busy = busyId === s.id;
            return (
              <li
                key={s.id}
                className="flex flex-col gap-3 rounded-md border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {s.categoria}
                      </span>
                      <span
                        className={
                          s.visible
                            ? "rounded-full bg-success-subtle px-2 py-0.5 text-xs font-medium text-success"
                            : "rounded-full bg-surface-sunken px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {s.visible ? c.visibleBadge : c.ocultoBadge}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{s.descripcion}</p>
                    <p className="text-sm text-foreground">{formatPrecio(s)}</p>
                  </div>
                </div>

                {confirmId === s.id ? (
                  <div className="flex flex-col gap-2 rounded-md bg-surface-sunken p-3">
                    <p className="text-sm text-foreground">{c.confirmarEliminar}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        loading={busy}
                        disabled={busy}
                        onClick={() => confirmArchivar(s.id)}
                      >
                        {c.confirmarEliminarSi}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => setConfirmId(null)}
                      >
                        {c.cancelar}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => setView({ type: "edit", servicio: s })}
                    >
                      {c.editar}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      loading={busy}
                      disabled={busy}
                      onClick={() => togglePublicado(s)}
                    >
                      {s.visible ? c.ocultar : c.publicar}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => setConfirmId(s.id)}
                    >
                      {c.eliminar}
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
