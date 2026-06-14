"use client";

/**
 * Filters panel (client, ADR-04-01, REQ-02/12, ESC-UI-04). Controls orden /
 * calificacionMin / fecha. Each change applies via `withFiltroAplicado`
 * (resets page=1) → router.push; "Limpiar filtros" → `limpiarFiltros`.
 * Order defaults to 'calificacion' (RN-CAT-03).
 *
 * Responsive (REQ-12): rendered inline as a sidebar on desktop; on mobile a
 * trigger opens a Radix Dialog drawer (focus-trap + Esc-to-close built in,
 * no new lib). Both reuse the same <FiltrosControles/>.
 */
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { copy } from "@/lib/copy/es-AR";
import {
  type CriteriosBusqueda,
  type Orden,
  DEFAULT_ORDEN,
} from "@/lib/catalogo/tipos";
import {
  criteriosToQueryString,
  limpiarFiltros,
  withFiltroAplicado,
} from "@/lib/catalogo/query-params";

interface FiltrosPanelProps {
  /** Current criteria (oficio + ubicacion guaranteed) hydrated from the URL. */
  criterios: CriteriosBusqueda;
}

function FiltrosControles({
  criterios,
  onClose,
}: {
  criterios: CriteriosBusqueda;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  function push(next: CriteriosBusqueda) {
    const qs = criteriosToQueryString(next);
    startTransition(() => router.push(`/prestadores?${qs}`));
    onClose?.();
  }

  const orden: Orden = criterios.orden ?? DEFAULT_ORDEN;
  const calificacionMin = criterios.calificacionMin
    ? String(criterios.calificacionMin)
    : "0";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="orden">{copy.catalogo.filtros.ordenLabel}</Label>
        <Select
          value={orden}
          onValueChange={(value) =>
            push(withFiltroAplicado(criterios, { orden: value as Orden }))
          }
        >
          <SelectTrigger id="orden">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="calificacion">
              {copy.catalogo.filtros.ordenCalificacion}
            </SelectItem>
            <SelectItem value="distancia">
              {copy.catalogo.filtros.ordenDistancia}
            </SelectItem>
            <SelectItem value="disponibilidad">
              {copy.catalogo.filtros.ordenDisponibilidad}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="calificacionMin">
          {copy.catalogo.filtros.calificacionMinLabel}
        </Label>
        <Select
          value={calificacionMin}
          onValueChange={(value) => {
            const n = Number.parseInt(value, 10);
            push(
              withFiltroAplicado(criterios, {
                calificacionMin: n >= 1 ? n : undefined,
              }),
            );
          }}
        >
          <SelectTrigger id="calificacionMin">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">
              {copy.catalogo.filtros.calificacionMinTodas}
            </SelectItem>
            {[5, 4, 3, 2, 1].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {copy.catalogo.filtros.calificacionMinValor.replace(
                  "{n}",
                  String(n),
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fecha">{copy.catalogo.filtros.fechaLabel}</Label>
        <Input
          id="fecha"
          type="date"
          defaultValue={criterios.fecha ?? ""}
          onChange={(e) =>
            push(
              withFiltroAplicado(criterios, {
                fecha: e.target.value || undefined,
              }),
            )
          }
        />
      </div>

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => push(limpiarFiltros(criterios))}
        >
          {copy.catalogo.filtros.limpiar}
        </Button>
      </div>
    </div>
  );
}

export function FiltrosPanel({ criterios }: FiltrosPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: inline sidebar. */}
      <aside
        className="hidden lg:block"
        aria-label={copy.catalogo.filtros.title}
      >
        <h2 className="mb-4 text-sm font-semibold text-foreground">
          {copy.catalogo.filtros.title}
        </h2>
        <FiltrosControles criterios={criterios} />
      </aside>

      {/* Mobile: trigger + Dialog drawer (focus-trap + Esc built in). */}
      <div className="lg:hidden">
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <Button type="button" variant="outline">
              <SlidersHorizontal aria-hidden="true" />
              {copy.catalogo.filtros.abrir}
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/40" />
            <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col gap-5 overflow-y-auto bg-surface p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-sm font-semibold text-foreground">
                  {copy.catalogo.filtros.title}
                </Dialog.Title>
                <Dialog.Close asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={copy.catalogo.filtros.cerrar}
                  >
                    <X aria-hidden="true" />
                  </Button>
                </Dialog.Close>
              </div>
              <FiltrosControles
                criterios={criterios}
                onClose={() => setOpen(false)}
              />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}
