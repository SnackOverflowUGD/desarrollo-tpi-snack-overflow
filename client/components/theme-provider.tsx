"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * App-wide theme provider. Wraps next-themes with the class strategy so the
 * `.dark` token overrides in globals.css take effect. Dark mode is a
 * first-class theme (DESIGN-SYSTEM §2.6) even though UC01 ships no visible
 * toggle yet — this wires it correctly from the first Work Item.
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
