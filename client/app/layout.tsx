import type { Metadata } from "next";
import { Fraunces, Figtree, IBM_Plex_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/lib/session/session-context";
import { getInitialSession } from "@/lib/session/cookie";
import { copy } from "@/lib/copy/es-AR";
import "./globals.css";

// Brand fonts (DESIGN-SYSTEM §3.1). Each exposes a CSS variable consumed by the
// @theme font tokens in globals.css (--font-display-src / -sans-src / -mono-src).
// Fraunces is a variable font; we include the optical-size axis for display use.
const display = Fraunces({
  subsets: ["latin"],
  axes: ["opsz"],
  // NOTE(verify): weight must be "variable" when axes are defined for a variable
  // font. Using specific weights with axes causes Next.js turbopack compilation
  // failure (BUG-001). Reportado en verify.md.
  weight: "variable",
  variable: "--font-display-src",
  display: "swap",
});

const sans = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-src",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono-src",
  display: "swap",
});

export const metadata: Metadata = {
  title: copy.app.title,
  description: copy.app.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hydrate the client session from the cookie server-side (no flash).
  const initialSession = await getInitialSession();

  return (
    <html
      lang="es-AR"
      // suppressHydrationWarning is required by next-themes, which toggles the
      // `.dark` class on <html> on the client.
      suppressHydrationWarning
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a href="#main" className="skip-link">
          {copy.a11y.skipToContent}
        </a>
        <ThemeProvider>
          <SessionProvider initial={initialSession}>
            <main id="main" className="flex flex-1 flex-col">
              {children}
            </main>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
