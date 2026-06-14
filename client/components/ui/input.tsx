import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Text input primitive (DESIGN-SYSTEM §5.2). Font-size >=16px is enforced
 * globally to avoid iOS zoom (§3.2). Error state is driven by aria-invalid so
 * callers only set ARIA; styling follows.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-foreground transition-colors md:h-10",
        "placeholder:text-muted-foreground",
        "focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted-foreground",
        "aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:outline-error",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
