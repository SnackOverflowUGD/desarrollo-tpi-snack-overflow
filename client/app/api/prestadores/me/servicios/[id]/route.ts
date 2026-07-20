/**
 * Servicio update/soft-delete Route Handler (BFF) —
 * PATCH|DELETE /api/prestadores/me/servicios/[id] (PSM-REQ-07/08). The browser
 * calls this SAME-ORIGIN path; the handler runs server-side and uses
 * `backendFetch` to attach the session Bearer (cookie→Bearer) and forward to
 * `PATCH|DELETE /prestadores/me/servicios/:id`. The token NEVER reaches the
 * client; the `id` travels in the URL (Next 16: `params` is a Promise), never
 * the body. Ownership is enforced server-side (404 on a foreign servicio).
 *
 * Route resolution: this is a DYNAMIC handler, so the blanket `/api/:path*`
 * rewrite would otherwise WIN and proxy it WITHOUT the Bearer. next.config.ts
 * excludes the `/api/prestadores/me` prefix via negative lookahead so it
 * resolves to this filesystem handler instead.
 *   sentinel unauthorized → 401 · backend 200/204/4xx → verbatim · transport → 502
 */
import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend-fetch";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let result;
  try {
    result = await backendFetch(`/prestadores/me/servicios/${id}`, {
      method: "PATCH",
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

export async function DELETE(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;

  let result;
  try {
    result = await backendFetch(`/prestadores/me/servicios/${id}`, {
      method: "DELETE",
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  if (result.unauthorized) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const { response } = result;

  // Soft delete succeeds with 204 No Content — a 204 MUST NOT carry a body.
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  let raw: unknown = null;
  try {
    raw = await response.json();
  } catch {
    raw = null;
  }

  return NextResponse.json(raw ?? { ok: false }, { status: response.status });
}
