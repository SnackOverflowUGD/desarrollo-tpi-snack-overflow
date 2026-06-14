import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { copy } from "@/lib/copy/es-AR";
import { backendFetch } from "@/lib/server/backend-fetch";
import { readSessionToken } from "@/lib/session/cookie";
import { decodeJwtClaims } from "@/lib/session/jwt";
import type { ContratacionListItem } from "@/lib/api/contrataciones";
import type { RolSeguimiento } from "@/lib/api/acciones-contratacion";
import { SeguimientoLista } from "@/components/cuentas/seguimiento/seguimiento-lista";
import { SeguimientoError } from "@/components/cuentas/seguimiento/seguimiento-error";

export const metadata: Metadata = {
  title: `${copy.seguimiento.title} · ${copy.app.title}`,
  description: copy.app.description,
};

// Reads the session cookie server-side — never prerender it.
export const dynamic = "force-dynamic";

const NEXT = "/cuenta/contrataciones";

/**
 * UC09 seguimiento page (Server Component, ADR-09-03/04, REQ-05/10/13,
 * ESC-UI-01/02/10/11).
 *
 * `proxy.ts` (matcher `/cuenta/:path*`) already guarantees a session BEFORE this
 * renders (anonymous deep-link → 307 /login?next=). We list ALL the user's
 * contrataciones server-side via `backendFetch('/contrataciones')` (no estado
 * filter — the group filter is client-side); the backend filters by the token
 * (RN-CON-07), so the list NEVER shows foreign contrataciones.
 *  - unauthorized sentinel / 401 → redirect('/login?next=/cuenta/contrataciones')
 *  - 200 → <SeguimientoLista/> (empty array → neutral empty state, ESC-UI-10)
 *  - 5xx / transport failure → <SeguimientoError/> (role="alert" + retry)
 *
 * `/cuenta/solicitudes` (UC08 inbox) is NOT touched; this is a separate route.
 */
export default async function ContratacionesPage() {
  // Derive the viewer role from the session token (decorative; backend is the
  // authority). proxy.ts already ensured a non-expired session.
  const token = await readSessionToken();
  const backendRole = token ? decodeJwtClaims(token)?.role : undefined;
  const rol: RolSeguimiento =
    backendRole === "prestador" ? "prestador" : "cliente";

  let result;
  try {
    result = await backendFetch("/contrataciones");
  } catch {
    return (
      <PageShell>
        <SeguimientoError />
      </PageShell>
    );
  }

  if (result.unauthorized) {
    redirect(`/login?next=${NEXT}`);
  }

  const { response } = result;
  if (response.status === 401) {
    redirect(`/login?next=${NEXT}`);
  }

  if (!response.ok) {
    return (
      <PageShell>
        <SeguimientoError />
      </PageShell>
    );
  }

  let items: ContratacionListItem[];
  try {
    items = (await response.json()) as ContratacionListItem[];
  } catch {
    return (
      <PageShell>
        <SeguimientoError />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <SeguimientoLista items={items} rol={rol} />
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">
          {copy.seguimiento.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {copy.seguimiento.subtitle}
        </p>
      </header>
      {children}
    </div>
  );
}
