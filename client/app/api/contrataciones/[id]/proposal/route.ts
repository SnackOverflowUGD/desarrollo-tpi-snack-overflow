/**
 * Proposal Route Handler (BFF) — POST /api/contrataciones/[id]/proposal
 * (ADR-08-03, REQ-04/05). The browser POSTs to this SAME-ORIGIN path; the
 * handler runs server-side and uses `backendFetch` to attach the session Bearer
 * (read from the httpOnly cookie) and forward to the backend
 * `POST /contrataciones/:id/proposal`. The token NEVER reaches the client.
 *
 * The `id` is taken from the URL params (Next 16: `params` is a Promise) and
 * NEVER from the body — the backend validates ownership (404 if foreign,
 * RN-CON-07). This handler owns NO UX: it forwards the backend status + body
 * verbatim so lib/api/contrataciones.ts maps each outcome to its `kind`.
 *   sentinel unauthorized  → 401   (client redirects to /login?next=)
 *   backend 200/4xx         → status + body forwarded verbatim
 *   transport failure       → 502   (client maps to a generic banner)
 */
import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend-fetch";

// Reads the session cookie at request time — never prerender it.
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;

  // Forward the raw client body as-is. The backend revalidates every field; the
  // client api-layer never sends `id`/`prestadorId` in the body (REQ-04).
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let result;
  try {
    result = await backendFetch(`/contrataciones/${id}/proposal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: rawBody,
    });
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
