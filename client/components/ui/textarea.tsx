import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Textarea primitive (DESIGN-SYSTEM §5.2). Mirrors Input styling — border,
 * background, focus ring, error state — with a taller / resizable area for
 * multi-line text.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-foreground transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted-foreground",
        "aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:outline-error",
        "resize-y",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
