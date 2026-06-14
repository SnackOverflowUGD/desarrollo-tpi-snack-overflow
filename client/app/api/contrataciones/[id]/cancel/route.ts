/**
 * Cancel Route Handler (BFF) — POST /api/contrataciones/[id]/cancel
 * (ADR-09-01, REQ-04). Clone of reject/route.ts: forwards to the backend
 * `POST /contrataciones/:id/cancel` with the session Bearer attached
 * server-side (NO body — identity from the token, REQ-10). Either participant
 * (cliente or prestador) may cancel; the backend enforces it. The token NEVER
 * reaches the client; the `id` comes from the URL, never the body.
 *   sentinel unauthorized → 401 · backend 200/4xx → verbatim · transport → 502
 */
import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend-fetch";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;

  let result;
  try {
    result = await backendFetch(`/contrataciones/${id}/cancel`, {
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
