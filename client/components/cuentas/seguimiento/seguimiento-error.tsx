"use client";

/**
 * Seguimiento error state (REQ-14, ESC-UI-10). A network/5xx failure when
 * listing renders a `role="alert"` banner with a retry button that re-runs the
 * Server Component via `router.refresh()`. The empty state is NOT routed here —
 * it is a neutral state in <SeguimientoLista/>.
 */
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/es-AR";

export function SeguimientoError() {
  const router = useRouter();

  return (
    <Alert variant="error" role="alert" className="flex-col">
      <div className="flex flex-col gap-3">
        <span>{copy.seguimiento.errorListar}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => router.refresh()}
        >
          {copy.seguimiento.reintentar}
        </Button>
      </div>
    </Alert>
  );
}
