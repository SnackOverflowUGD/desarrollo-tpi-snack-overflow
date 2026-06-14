"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Label primitive (DESIGN-SYSTEM §5.2). When `required`, renders a visible
 * asterisk; callers should also set aria-required on the associated control.
 */
function Label({
  className,
  required = false,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & {
  required?: boolean;
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-1 text-sm font-medium text-foreground select-none",
        className,
      )}
      {...props}
    >
      {children}
      {required && (
        <span className="text-error" aria-hidden="true">
          *
        </span>
      )}
    </LabelPrimitive.Root>
  );
}

export { Label };
