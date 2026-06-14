"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Button primitive re-themed with our tokens (DESIGN-SYSTEM §5.1).
 * Variants and sizes match the baseline. Mobile bumps the default `md` size to
 * a 44px touch target (§8). Loading shows a spinner, keeps width stable and
 * sets aria-busy (REQ-09).
 */
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-primary-hover",
        secondary: "bg-secondary text-on-secondary hover:opacity-90",
        outline:
          "border border-border-strong bg-surface text-foreground hover:bg-surface-sunken",
        ghost: "text-foreground hover:bg-surface-sunken",
        destructive: "bg-error text-on-error hover:opacity-90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3",
        // md: 40px desktop, bumped to 44px touch target on mobile (§8).
        md: "h-11 px-4 md:h-10",
        lg: "h-12 px-6 text-base",
        icon: "size-11 md:size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={asChild ? undefined : (disabled ?? loading)}
      aria-busy={loading || undefined}
      {...props}
    >
      {/* Slot.Root requires a single child element — never inject the spinner
          when asChild (the consumer's element, e.g. a Link, is the sole child). */}
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Loader2 className="animate-spin" aria-hidden="true" />}
          {children}
        </>
      )}
    </Comp>
  );
}

export { Button, buttonVariants };
