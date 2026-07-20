import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { copy } from "@/lib/copy/es-AR";
import { backendFetch } from "@/lib/server/backend-fetch";
import type { MiPerfil } from "@/lib/api/prestador-me";
import { ServiciosManager } from "@/components/cuentas/servicios/servicios-manager";
import { OnboardingPerfil } from "@/components/cuentas/onboarding/onboarding-perfil";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: `${copy.cuenta.servicios.title} · ${copy.app.title}`,
  description: copy.app.description,
};

// Reads the session cookie server-side — never prerender it.
export const dynamic = "force-dynamic";

const SERVICIOS_PATH = "/cuenta/servicios";

/**
 * Prestador servicios manager page (Server Component, PSM-REQ-05..08). Loads the
 * profile server-side via `backendFetch('/prestadores/me')` (which carries ALL
 * servicios, including hidden ones), then hands the list to the interactive
 * <ServiciosManager/>. A cliente/administrador has no prestador profile →
 * backend 403 → bounce to their own area.
 *
 * `?onboarding=1` (post-registration step) shows the non-mandatory onboarding
 * panel guiding the new prestador to publish their first servicio.
 */
export default async function ServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const { onboarding } = await searchParams;
  const isOnboarding = onboarding === "1";

  let result;
  try {
    result = await backendFetch("/prestadores/me");
  } catch {
    return (
      <PageShell>
        <Alert variant="error" role="alert">
          {copy.cuenta.servicios.errorAccion}
        </Alert>
      </PageShell>
    );
  }

  if (result.unauthorized) {
    redirect(`/login?next=${SERVICIOS_PATH}`);
  }

  const { response } = result;
  if (response.status === 401) {
    redirect(`/login?next=${SERVICIOS_PATH}`);
  }
  if (response.status === 403) {
    redirect("/cuenta/contrataciones");
  }

  if (!response.ok) {
    return (
      <PageShell>
        <Alert variant="error" role="alert">
          {copy.cuenta.servicios.errorAccion}
        </Alert>
      </PageShell>
    );
  }

  let perfil: MiPerfil;
  try {
    perfil = (await response.json()) as MiPerfil;
  } catch {
    return (
      <PageShell>
        <Alert variant="error" role="alert">
          {copy.cuenta.servicios.errorAccion}
        </Alert>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {isOnboarding && <OnboardingPerfil variant="servicios" />}
      <ServiciosManager servicios={perfil.servicios} />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">
          {copy.cuenta.servicios.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {copy.cuenta.servicios.subtitle}
        </p>
      </header>
      {children}
    </div>
  );
}
