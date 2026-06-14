import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { copy } from "@/lib/copy/es-AR";
import { backendFetch } from "@/lib/server/backend-fetch";
import type { ContratacionListItem } from "@/lib/api/contrataciones";
import { BandejaSolicitudes } from "@/components/cuentas/bandeja/bandeja-solicitudes";
import { BandejaError } from "@/components/cuentas/bandeja/bandeja-error";

export const metadata: Metadata = {
  title: `${copy.bandeja.title} · ${copy.app.title}`,
  description: copy.app.description,
};

// Reads the session cookie server-side — never prerender it.
export const dynamic = "force-dynamic";

/**
 * Prestador inbox page (Server Component, ADR-08-01/03/04, REQ-01/02/03/08,
 * ESC-UI-01/07/08).
 *
 * `proxy.ts` (matcher `/cuenta/:path*`) already guarantees a session BEFORE this
 * renders (anonymous deep-link → 307 /login?next=). We list server-side via
 * `backendFetch('/contrataciones?estado=solicitada')` (no hop to our own BFF):
 *  - unauthorized sentinel / 401 → redirect('/login?next=/cuenta/solicitudes')
 *  - 200 → <BandejaSolicitudes/> (empty array → neutral empty state, REQ-03)
 *  - 5xx / transport failure → <BandejaError/> (role="alert" + retry, REQ-03)
 *
 * The backend filters by `prestadorId = sub` (token), so a non-prestador logged
 * user sees an empty inbox — isolation reinforced by the backend, not just UI.
 */
export default async function SolicitudesPage() {
  let result;
  try {
    result = await backendFetch("/contrataciones?estado=solicitada");
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
      <BandejaSolicitudes items={items} />
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
