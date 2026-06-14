import * as React from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

/**
 * Field anatomy (DESIGN-SYSTEM §5.2): Label -> control -> HelpText | ErrorText.
 * Wires aria-invalid + aria-describedby on the control via a render prop so the
 * error/help ids are always consistent (§8, REQ-07/REQ-10).
 *
 * The child render function receives the ids and invalid flag; the caller
 * spreads them onto the actual control (Input/SelectTrigger/...).
 */
export interface FieldRenderProps {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
}

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  className?: string;
  children: (props: FieldRenderProps) => React.ReactNode;
}

function Field({
  id,
  label,
  required = false,
  help,
  error,
  className,
  children,
}: FieldProps) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const invalid = Boolean(error);

  // Point aria-describedby at the visible message (error wins over help).
  const describedBy = error ? errorId : help ? helpId : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>

      {children({ id, describedBy, invalid })}

      {error ? (
        <p
          id={errorId}
          className="flex items-center gap-1.5 text-xs font-medium text-error"
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : help ? (
        <p id={helpId} className="text-xs text-muted-foreground">
          {help}
        </p>
      ) : null}
    </div>
  );
}

export { Field };
