"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toast mount (DESIGN-SYSTEM §5.9). Sonner is a11y-friendly: success/info use
 * role="status" (polite), errors role="alert" (assertive). Themed via our
 * tokens; follows the active next-themes theme. Use the `toast` export from
 * `sonner` directly to fire toasts.
 */
export function Toaster(props: ToasterProps) {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-center"
      richColors
      closeButton
      style={
        {
          "--normal-bg": "var(--color-surface)",
          "--normal-text": "var(--color-foreground)",
          "--normal-border": "var(--color-border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { toast } from "sonner";
