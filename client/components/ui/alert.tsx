import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, Clock, Info, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Inline alert banner (DESIGN-SYSTEM §5.6). Each variant carries an icon AND
 * text so state is never communicated by color alone (WCAG 1.4.1). The ARIA
 * role is chosen by the caller (e.g. role="alert" for the error summary so it
 * is announced and can receive focus, REQ-07.3 / §8).
 */
const alertVariants = cva(
  "flex items-start gap-2 rounded-md border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        warning:
          "border-warning/40 bg-warning-subtle text-warning-deep dark:text-warning",
        error: "border-error/40 bg-error-subtle text-error",
        info: "border-info/40 bg-info-subtle text-info",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

const ICONS: Record<NonNullable<VariantProps<typeof alertVariants>["variant"]>, LucideIcon> =
  {
    warning: Clock,
    error: AlertCircle,
    info: Info,
  };

function Alert({
  className,
  variant = "info",
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const Icon = ICONS[variant ?? "info"];
  return (
    <div
      data-slot="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="flex-1">{children}</div>
    </div>
  );
}

export { Alert, alertVariants };
