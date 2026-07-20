"use client";

/**
 * UC09 contextual actions — presentational leaf over `useAccionesContratacion`
 * (colocated `lib/hooks/`, ADR-09-05/06, REQ-07/09/11/12/13/14). For a given
 * (rol, estado) it renders ONLY the actions `accionesPara` allows (defense in
 * depth; the backend is the authority). Non-destructive actions
 * (confirmar/iniciar) fire directly; irreversible ones (finalizar/cancelar)
 * go through <ConfirmAccion> (REQ-09). See the hook module for the
 * result→UI mapping (401/403/404/409/5xx) and the double-submit guard.
 *
 * `nextPath` is the 401 redirect target — callers on a different route
 * (e.g. the bandeja) must pass their own so a stale session doesn't bounce
 * the user to the wrong page.
 */
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/es-AR";
import type {
  AccionContratacion,
  RolSeguimiento,
} from "@/lib/api/acciones-contratacion";
import type { ContratacionEstado } from "@/lib/api/contrataciones";
import {
  CONFIRM_MENSAJE,
  REQUIERE_CONFIRMACION,
  useAccionesContratacion,
} from "@/lib/hooks/use-acciones-contratacion";
import { ConfirmAccion } from "@/components/cuentas/acciones/confirm-accion";

export function AccionesContratacion({
  contratacionId,
  rol,
  estado,
  nextPath,
}: {
  contratacionId: string;
  rol: RolSeguimiento;
  estado: ContratacionEstado;
  /** 401 redirect target (defaults to `/cuenta/contrataciones`). */
  nextPath?: string;
}) {
  const {
    acciones,
    busy,
    pendingConfirm,
    globalError,
    alertRef,
    onAccionClick,
    ejecutar,
    cancelPending,
  } = useAccionesContratacion(contratacionId, rol, estado, { nextPath });

  if (acciones.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4">
      {globalError && (
        <Alert ref={alertRef} variant="error" role="alert" tabIndex={-1}>
          {globalError}
        </Alert>
      )}

      <div className="flex flex-wrap gap-3">
        {acciones.map((accion: AccionContratacion) => (
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
          onCancel={cancelPending}
        />
      )}
    </div>
  );
}
