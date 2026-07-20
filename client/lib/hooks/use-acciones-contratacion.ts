/**
 * UC09 contextual-action state + handlers (ADR-09-05/06, REQ-07/09/11/12/13/14),
 * extracted from `AccionesContratacion` so any surface can render the exact
 * transitions `accionesPara(rol, estado)` allows without duplicating the
 * wiring. No DOM beyond `useState`/`useRouter`/a focus `ref` — the JSX stays
 * in the colocated presentational component.
 *
 * On result:
 *   200 → success toast (role="status", catalog es-AR) + router.refresh()
 *   401 → router.push(`/login?next=${nextPath}`)        (ESC-UI-11)
 *   403 → "sin permiso" banner                            (REQ-07)
 *   404 → "ya no disponible" banner + refresh              (ESC-UI-08)
 *   409 → "estado cambió" banner + refresh                 (ESC-UI-07)
 *   red/5xx → non-technical banner                          (ESC-UI-10)
 * Anti-double-submit via `busy` (REQ-11).
 */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { toast } from "@/components/ui/toaster";
import { copy } from "@/lib/copy/es-AR";
import {
  accionesPara,
  type AccionContratacion,
  type RolSeguimiento,
} from "@/lib/api/acciones-contratacion";
import {
  cancelar,
  confirmar,
  finalizar,
  iniciar,
  type ContratacionEstado,
  type ResponderResult,
} from "@/lib/api/contrataciones";
import { mapSeguimientoError } from "@/lib/errors/field-errors";

const DEFAULT_NEXT_PATH = "/cuenta/contrataciones";

/** Irreversible actions require an explicit confirmation step (REQ-09). */
export const REQUIERE_CONFIRMACION: Record<AccionContratacion, boolean> = {
  confirmar: false,
  iniciar: false,
  finalizar: true,
  cancelar: true,
};

const API: Record<
  AccionContratacion,
  (id: string) => Promise<ResponderResult>
> = {
  confirmar,
  iniciar,
  finalizar,
  cancelar,
};

const SUCCESS_COPY: Record<AccionContratacion, string> = {
  confirmar: copy.seguimiento.exito.confirmar,
  iniciar: copy.seguimiento.exito.iniciar,
  finalizar: copy.seguimiento.exito.finalizar,
  cancelar: copy.seguimiento.exito.cancelar,
};

/** Confirmation message for irreversible actions (default: cancelar's). */
export const CONFIRM_MENSAJE: Partial<Record<AccionContratacion, string>> = {
  finalizar: copy.seguimiento.confirmar.finalizar,
  cancelar: copy.seguimiento.confirmar.cancelar,
};

export interface UseAccionesContratacionOptions {
  /** 401 redirect target, passed through `encodeURIComponent`. */
  nextPath?: string;
}

export function useAccionesContratacion(
  contratacionId: string,
  rol: RolSeguimiento,
  estado: ContratacionEstado,
  { nextPath = DEFAULT_NEXT_PATH }: UseAccionesContratacionOptions = {},
) {
  const router = useRouter();

  const [busy, setBusy] = useState<AccionContratacion | null>(null);
  const [pendingConfirm, setPendingConfirm] =
    useState<AccionContratacion | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (globalError) alertRef.current?.focus();
  }, [globalError]);

  const acciones = accionesPara(rol, estado);

  async function ejecutar(accion: AccionContratacion) {
    if (busy) return; // anti-double-submit guard (REQ-11)
    setBusy(accion);
    setGlobalError(null);

    const result = await API[accion](contratacionId);

    if (result.ok) {
      toast.success(SUCCESS_COPY[accion]);
      setPendingConfirm(null);
      // Clear `busy` on success too: router.refresh() is a SOFT refresh that
      // re-runs the server fetch WITHOUT remounting this client component, so a
      // lingering `busy` would keep every action button disabled after the new
      // estado renders (a user would have to hard-reload before acting again).
      // Found via the MI-11 system E2E (iniciar → finalizar in one session).
      setBusy(null);
      router.refresh();
      return;
    }

    setBusy(null);
    setPendingConfirm(null);

    const mapped = mapSeguimientoError(result);

    if (mapped.redirect) {
      router.push(`/login?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (mapped.banner) setGlobalError(mapped.banner);
    if (mapped.refresh) router.refresh();
  }

  function onAccionClick(accion: AccionContratacion) {
    if (REQUIERE_CONFIRMACION[accion]) {
      setPendingConfirm(accion);
      return;
    }
    void ejecutar(accion);
  }

  function cancelPending() {
    setPendingConfirm(null);
  }

  return {
    acciones,
    busy,
    pendingConfirm,
    globalError,
    alertRef,
    onAccionClick,
    ejecutar,
    cancelPending,
  };
}
