/**
 * Reject Route Handler (BFF) — POST /api/contrataciones/[id]/reject
 * (ADR-08-03, REQ-06). The browser POSTs to this SAME-ORIGIN path; the handler
 * runs server-side and uses `backendFetch` to attach the session Bearer and
 * forward to the backend `POST /contrataciones/:id/reject` (NO body — reject
 * requires no fields, RN-CON-10). The token NEVER reaches the client.
 *
 * The `id` is taken from the URL params (Next 16: `params` is a Promise) and
 * NEVER from the body — the backend validates ownership (404 if foreign).
 *   sentinel unauthorized  → 401   (client redirects to /login?next=)
 *   backend 200/4xx         → status + body forwarded verbatim
 *   transport failure       → 502   (client maps to a generic banner)
 */
import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend-fetch";

// Reads the session cookie at request time — never prerender it.
export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;

  let result;
  try {
    result = await backendFetch(`/contrataciones/${id}/reject`, {
      method: "POST",
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
