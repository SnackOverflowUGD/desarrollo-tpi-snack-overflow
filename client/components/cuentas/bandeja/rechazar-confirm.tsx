"use client";

/**
 * Reject confirmation (ADR-08-04, REQ-06, ESC-UI-03). An explicit confirmation
 * step prevents accidental rejects: the first click reveals the confirm/cancel
 * controls; only the confirm click calls `rechazarSolicitud(id)`. On 200 it
 * announces success (role="status" via the toast) and refreshes the inbox;
 * errors map to a banner + refresh. Anti-double-submit via `loading`/`disabled`.
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toaster";
import { copy } from "@/lib/copy/es-AR";
import { rechazarSolicitud } from "@/lib/api/contrataciones";
import { mapResponderError } from "@/lib/errors/field-errors";

export function RechazarConfirm({
  contratacionId,
  onDone,
}: {
  contratacionId: string;
  onDone?: () => void;
}) {
  const router = useRouter();

  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (globalError) alertRef.current?.focus();
  }, [globalError]);

  async function onConfirm() {
    if (busy) return; // anti-double-submit guard
    setBusy(true);
    setGlobalError(null);

    const result = await rechazarSolicitud(contratacionId);

    if (result.ok) {
      toast.success(copy.bandeja.exitoRechazar);
      router.refresh();
      return;
    }

    setBusy(false);

    const mapped = mapResponderError(result);

    if (mapped.redirect) {
      const next = "/cuenta/solicitudes";
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    if (mapped.banner) setGlobalError(mapped.banner);
    if (mapped.refresh) router.refresh();
  }

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={() => setConfirming(true)}
      >
        {copy.bandeja.rechazar}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {globalError && (
        <Alert ref={alertRef} variant="error" role="alert" tabIndex={-1}>
          {globalError}
        </Alert>
      )}
      <p className="text-sm text-foreground">{copy.bandeja.confirmarRechazar}</p>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="destructive"
          loading={busy}
          disabled={busy}
          onClick={onConfirm}
        >
          {busy ? copy.bandeja.rechazando : copy.bandeja.confirmarRechazarSi}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => {
            setConfirming(false);
            onDone?.();
          }}
        >
          {copy.bandeja.cancelarAccion}
        </Button>
      </div>
    </div>
  );
}
