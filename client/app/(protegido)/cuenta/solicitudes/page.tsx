import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { copy } from "@/lib/copy/es-AR";
import { backendFetch } from "@/lib/server/backend-fetch";
import type { ContratacionListItem } from "@/lib/api/contrataciones";
import { BandejaClient } from "@/components/cuentas/bandeja/bandeja-client";
import { BandejaError } from "@/components/cuentas/bandeja/bandeja-error";

export const metadata: Metadata = {
  title: `${copy.bandeja.title} · ${copy.app.title}`,
  description: copy.app.description,
};

// Reads the session cookie server-side — never prerender it.
export const dynamic = "force-dynamic";

/**
 * Prestador inbox page (Server Component).
 * Lists ALL contrataciones for the prestador (no estado filter).
 * Client-side tabs filter into: Pendientes (solicitada) / Activas (presupuestada, confirmada, en_curso) / Terminadas (finalizada, cancelada).
 */
export default async function SolicitudesPage() {
  let result;
  try {
    // Fetch ALL states for the prestador; client-side tabs filter them
    result = await backendFetch("/contrataciones");
  } catch {
    return (
      <PageShell>
        <BandejaError />
      </PageShell>
    );
  }

  if (result.unauthorized) {
    redirect("/login?next=/cuenta/solicitudes");
  }

  const { response } = result;
  if (response.status === 401) {
    redirect("/login?next=/cuenta/solicitudes");
  }

  if (!response.ok) {
    return (
      <PageShell>
        <BandejaError />
      </PageShell>
    );
  }

  let items: ContratacionListItem[];
  try {
    items = (await response.json()) as ContratacionListItem[];
  } catch {
    return (
      <PageShell>
        <BandejaError />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <BandejaClient items={items} />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">
          {copy.bandeja.title}
        </h1>
        <p className="text-sm text-muted-foreground">{copy.bandeja.subtitle}</p>
      </header>
      {children}
    </div>
  );
}