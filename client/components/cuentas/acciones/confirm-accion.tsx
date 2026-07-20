"use client";

/**
 * Generic accessible confirmation dialog (ADR-09-06, REQ-09/14). Generalized
 * from `bandeja/rechazar-confirm.tsx` for the irreversible UC09 actions
 * (finalizar, cancelar) and reusable by any "this can't be undone" flow. The
 * UC08 `RechazarConfirm` stays untouched (no regression).
 *
 * Behavior is parametrized by `mensaje` + `onConfirm`. It is a real modal:
 *  - role="dialog", aria-modal="true", labelled by its message (REQ-14)
 *  - focus moves into the dialog on open and is RESTORED to the trigger on close
 *  - focus is TRAPPED (Tab cycles within the dialog)
 *  - Escape closes it (cancel)
 * Anti-double-submit via `busy` (the confirm button shows aria-busy).
 */
import { useEffect, useId, useRef } from "react";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/es-AR";

const CONFIRM_ATTR = "data-confirm-accion";

export function ConfirmAccion({
  mensaje,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: {
  mensaje: string;
  /** Label for the confirm button while idle (defaults to the catalog). */
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Remember the element that had focus before the dialog opened, restore on
  // unmount (close). Move focus to the primary action on open.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current
      ?.querySelector<HTMLButtonElement>(`[${CONFIRM_ATTR}]`)
      ?.focus();
    return () => {
      previouslyFocused?.focus?.();
    };
  }, []);

  // Escape closes (cancel); Tab is trapped within the dialog.
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      if (!busy) onCancel();
      return;
    }
    if (event.key !== "Tab") return;

    const root = dialogRef.current;
    if (!root) return;
    const focusable = root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-surface p-6 shadow-lg"
      >
        <p id={titleId} className="text-sm text-foreground">
          {mensaje}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onCancel}
          >
            {copy.seguimiento.confirmar.no}
          </Button>
          <Button
            {...{ [CONFIRM_ATTR]: "" }}
            type="button"
            variant="destructive"
            loading={busy}
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel ?? copy.seguimiento.confirmar.si}
          </Button>
        </div>
      </div>
    </div>
  );
}
