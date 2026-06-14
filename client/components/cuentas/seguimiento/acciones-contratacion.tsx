"use client";

/**
 * UC09 contextual actions — the heart of the seguimiento UI (ADR-09-05/06,
 * REQ-07/09/11/12/13/14, ESC-UI-03..08/11). For a given (rol, estado) it
 * renders ONLY the actions `accionesPara` allows (defense in depth; the backend
 * is the authority). Non-destructive actions (confirmar/iniciar) fire directly;
 * irreversible ones (finalizar/cancelar) go through <ConfirmAccion> (REQ-09).
 *
 * On result:
 *   200 → success toast (role="status", catalog es-AR) + router.refresh()
 *   401 → router.push('/login?next=/cuenta/contrataciones')   (ESC-UI-11)
 *   403 → "sin permiso" banner                                 (REQ-07)
 *   404 → "ya no disponible" banner + refresh                  (ESC-UI-08)
 *   409 → "estado cambió" banner + refresh                     (ESC-UI-07)
 *   red/5xx → non-technical banner                             (ESC-UI-10)
 * Anti-double-submit via `busy` (buttons show aria-busy, REQ-11).
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
import { ConfirmAccion } from "@/components/cuentas/seguimiento/confirm-accion";

const NEXT = "/cuenta/contrataciones";

/** Irreversible actions require an explicit confirmation step (REQ-09). */
const REQUIERE_CONFIRMACION: Record<AccionContratacion, boolean> = {
  confirmar: false,
  iniciar: false,
  finalizar: true,
  cancelar: true,
};

const API: Record<AccionContratacion, (id: string) => Promise<ResponderResult>> =
  {
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

const CONFIRM_MENSAJE: Partial<Record<AccionContratacion, string>> = {
  finalizar: copy.seguimiento.confirmar.finalizar,
  cancelar: copy.seguimiento.confirmar.cancelar,
};

export function AccionesContratacion({
  contratacionId,
  rol,
  estado,
}: {
  contratacionId: string;
  rol: RolSeguimiento;
  estado: ContratacionEstado;
}) {
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
  if (acciones.length === 0) return null;

  async function ejecutar(accion: AccionContratacion) {
    if (busy) return; // anti-double-submit guard (REQ-11)
    setBusy(accion);
    setGlobalError(null);

    const result = await API[accion](contratacionId);

    if (result.ok) {
      toast.success(SUCCESS_COPY[accion]);
      setPendingConfirm(null);
      router.refresh();
      return;
    }

    setBusy(null);
    setPendingConfirm(null);

    const mapped = mapSeguimientoError(result);

    if (mapped.redirect) {
      router.push(`/login?next=${encodeURIComponent(NEXT)}`);
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

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      {globalError && (
        <Alert ref={alertRef} variant="error" role="alert" tabIndex={-1}>
          {globalError}
        </Alert>
      )}

      <div className="flex flex-wrap gap-3">
        {acciones.map((accion) => (
          <Button
            key={accion}
            type="button"
            variant={
              REQUIERE_CONFIRMACION[accion] ? "outline" : "primary"
            }
            loading={busy === accion}
            disabled={busy !== null}
            onClick={() => onAccionClick(accion)}
          >
            {copy.seguimiento.acciones[accion]}
          </Button>
        ))}
      </div>

      {pendingConfirm && (
        <ConfirmAccion
          mensaje={
            CONFIRM_MENSAJE[pendingConfirm] ?? copy.seguimiento.confirmar.cancelar
          }
          confirmLabel={copy.seguimiento.acciones[pendingConfirm]}
          busy={busy === pendingConfirm}
          onConfirm={() => void ejecutar(pendingConfirm)}
          onCancel={() => setPendingConfirm(null)}
        />
      )}
    </div>
  );
}
