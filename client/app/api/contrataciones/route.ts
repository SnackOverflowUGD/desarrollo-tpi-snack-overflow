/**
 * Hiring request Route Handler (BFF) — POST /api/contrataciones
 * (ADR-07-01/03, REQ-04/06). The browser POSTs to this SAME-ORIGIN path; the
 * handler runs server-side and uses `backendFetch` to attach the session Bearer
 * (read from the httpOnly cookie) and forward to the backend
 * `POST /contrataciones`. The token NEVER reaches the client.
 *
 * Route resolution (verified UC02): filesystem routes (app/) win over the blind
 * `/api/:path*` rewrite in next.config.ts, so this handler — not the proxy —
 * serves `/api/contrataciones` exactly.
 *
 * This handler owns NO UX: it just translates outcomes to status codes that
 * lib/api/contrataciones.ts maps to the discriminated result.
 *   sentinel unauthorized  → 401   (client redirects to /login?next=)
 *   backend 201/4xx         → status + body forwarded verbatim
 *   transport failure       → 502   (client maps to a generic banner)
 */
import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend-fetch";

// Reads the session cookie at request time — never prerender it.
export const dynamic = "force-dynamic";

/**
 * UC08 (ADR-08-03, REQ-01/08): list the authenticated user's contrataciones.
 *
 * Forwards the `?estado=` query string VERBATIM to the backend
 * `GET /contrataciones` (the backend derives the prestadorId/clienteId from the
 * token — this handler never sends an identity). Status + body are forwarded
 * verbatim; the sentinel maps to 401, transport failure to 502. The page
 * Server Component calls `backendFetch` directly; this handler exists for
 * client-side refreshes and tests.
 */
export async function GET(request: Request): Promise<Response> {
  const { search } = new URL(request.url);

  let result;
  try {
    result = await backendFetch(`/contrataciones${search}`);
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  if (result.unauthorized) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { response } = result;
  let raw: unknown = null;
  try {
    raw = await response.json();
  } catch {
    raw = null;
  }

  return NextResponse.json(raw ?? { ok: false }, { status: response.status });
}

export async function POST(request: Request): Promise<Response> {
  // Re-read the raw client body and forward it as-is. The backend revalidates
  // every field; the client api-layer never sends `clienteId` (REQ-04).
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let result;
  try {
    result = await backendFetch("/contrataciones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: rawBody,
    });
  } catch {
    // Transport failure reaching the backend → 502 (client maps to 'server').
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  // No session / expired token: never hit the backend → 401 so the client
  // treats the user as logged-out and redirects to /login (REQ-06).
  if (result.unauthorized) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  // Forward the backend status + body verbatim (201/400/403/404/409/422/…)
  // so the client api-layer maps each to its `kind`.
  const { response } = result;
  let raw: unknown = null;
  try {
    raw = await response.json();
  } catch {
    raw = null;
  }

  return NextResponse.json(raw ?? { ok: false }, { status: response.status });
}
