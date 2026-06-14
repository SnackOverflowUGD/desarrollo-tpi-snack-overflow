"use client";

/**
 * Inbox error state (REQ-03, ESC-UI-07). A network/5xx failure when listing
 * renders an `role="alert"` banner with a retry button that re-runs the Server
 * Component via `router.refresh()`. The empty state is NOT routed here — it is
 * a neutral state in <BandejaSolicitudes/>.
 */
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/es-AR";

export function BandejaError() {
  const router = useRouter();

  return (
    <Alert variant="error" role="alert" className="flex-col">
      <div className="flex flex-col gap-3">
        <span>{copy.bandeja.errorListar}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => router.refresh()}
        >
          {copy.bandeja.reintentar}
        </Button>
      </div>
    </Alert>
  );
}
