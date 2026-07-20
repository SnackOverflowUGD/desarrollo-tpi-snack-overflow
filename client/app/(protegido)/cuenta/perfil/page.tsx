import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { copy } from "@/lib/copy/es-AR";
import { backendFetch } from "@/lib/server/backend-fetch";
import type { MiPerfil } from "@/lib/api/prestador-me";
import { PerfilForm } from "@/components/cuentas/perfil/perfil-form";
import { Alert } from "@/components/ui/alert";

export const metadata: Metadata = {
  title: `${copy.cuenta.perfil.title} · ${copy.app.title}`,
  description: copy.app.description,
};

// Reads the session cookie server-side — never prerender it.
export const dynamic = "force-dynamic";

const PERFIL_PATH = "/cuenta/perfil";

/**
 * Prestador profile-edit page (Server Component, PSM-REQ-01/02). Loads the
 * profile server-side via `backendFetch('/prestadores/me')` (cookie→Bearer),
 * then hands it to the interactive <PerfilForm/>. A cliente/administrador has no
 * prestador profile → backend 403 → send them to their own area.
 *
 * `?onboarding=1` (set by the post-registration redirect) shows a non-mandatory
 * "completá tu perfil" banner guiding the new prestador to publish a service.
 */
export default async function PerfilPage({
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
          {copy.cuenta.perfil.errorGuardar}
        </Alert>
      </PageShell>
    );
  }

  if (result.unauthorized) {
    redirect(`/login?next=${PERFIL_PATH}`);
  }

  const { response } = result;
  if (response.status === 401) {
    redirect(`/login?next=${PERFIL_PATH}`);
  }
  if (response.status === 403) {
    // A cliente reached here — bounce to their own contrataciones area.
    redirect("/cuenta/contrataciones");
  }

  if (!response.ok) {
    return (
      <PageShell>
        <Alert variant="error" role="alert">
          {copy.cuenta.perfil.errorGuardar}
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
          {copy.cuenta.perfil.errorGuardar}
        </Alert>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {isOnboarding && (
        <Alert variant="info" role="status">
          <p className="font-medium">{copy.cuenta.onboarding.title}</p>
          <p className="mt-1">{copy.cuenta.onboarding.subtitle}</p>
        </Alert>
      )}
      <PerfilForm perfil={perfil} />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">
          {copy.cuenta.perfil.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {copy.cuenta.perfil.subtitle}
        </p>
      </header>
      {children}
    </div>
  );
}
