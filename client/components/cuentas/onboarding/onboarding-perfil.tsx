/**
 * Non-mandatory post-registration onboarding panel (ONBOARDING-REQ-01). Shown
 * on the perfil / servicios pages when `?onboarding=1` is present (the target of
 * `postRegistroRedirect`). It guides a freshly registered prestador to complete
 * their profile and publish their first servicio (which makes them searchable),
 * but is fully skippable — nothing is blocked if they dismiss it.
 *
 * Server Component (static copy + links only); no client state required.
 */
import Link from "next/link";

import { copy } from "@/lib/copy/es-AR";
import { Alert } from "@/components/ui/alert";

export function OnboardingPerfil({
  variant = "perfil",
}: {
  /** `perfil` links onward to servicios; `servicios` links back to perfil. */
  variant?: "perfil" | "servicios";
}) {
  const c = copy.cuenta.onboarding;
  const nextHref =
    variant === "perfil" ? "/cuenta/servicios?onboarding=1" : "/cuenta/perfil";
  const nextLabel =
    variant === "perfil" ? c.irAServicios : copy.cuenta.perfil.title;

  return (
    <Alert variant="info" role="status">
      <p className="font-medium">{c.title}</p>
      <p className="mt-1">{c.subtitle}</p>
      <ol className="mt-2 list-decimal pl-5 text-sm">
        <li>{c.pasoPerfil}</li>
        <li>{c.pasoServicio}</li>
      </ol>
      <div className="mt-3 flex flex-wrap gap-4">
        <Link
          href={nextHref}
          className="font-medium underline underline-offset-4"
        >
          {nextLabel}
        </Link>
        <Link
          href={variant === "perfil" ? "/cuenta/perfil" : "/cuenta/servicios"}
          className="text-muted-foreground underline underline-offset-4"
        >
          {c.omitir}
        </Link>
      </div>
    </Alert>
  );
}
