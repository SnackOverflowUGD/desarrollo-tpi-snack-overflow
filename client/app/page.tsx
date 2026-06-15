import { redirect } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy/es-AR";
import { getInitialSession } from "@/lib/session/cookie";

/**
 * Minimal branded landing (async Server Component). Hero + single primary CTA
 * to the registration flow. Authenticated users are redirected to their
 * role-specific landing so they never see the anonymous marketing page.
 * DESIGN-SYSTEM §5.1: one primary CTA per screen.
 */
export default async function Home() {
  const session = await getInitialSession();

  if (session.status === "authenticated") {
    const role = session.user?.role;
    if (role === "prestador") {
      redirect("/cuenta/solicitudes");
    }
    if (role === "cliente") {
      redirect("/prestadores");
    }
  }

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
