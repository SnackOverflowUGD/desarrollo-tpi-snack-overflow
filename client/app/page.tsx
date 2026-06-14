import Link from "next/link";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/es-AR";

/**
 * Minimal branded landing (Server Component). Hero + single primary CTA to the
 * registration flow, so the app reads coherently. DESIGN-SYSTEM §5.1: one
 * primary CTA per screen.
 */
export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <section className="flex max-w-xl flex-col items-center gap-6 text-center">
        <p className="text-sm font-medium tracking-wide text-primary uppercase">
          {copy.landing.eyebrow}
        </p>
        <h1 className="text-4xl font-semibold text-balance text-foreground sm:text-5xl">
          {copy.landing.title}
        </h1>
        <p className="text-lg text-pretty text-muted-foreground">
          {copy.landing.subtitle}
        </p>
        <Button asChild size="lg">
          <Link href="/registro">{copy.landing.cta}</Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          {copy.landing.loginPrompt}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {copy.landing.loginLink}
          </Link>
        </p>
      </section>
    </div>
  );
}
