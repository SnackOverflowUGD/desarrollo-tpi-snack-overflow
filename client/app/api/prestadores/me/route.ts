/**
 * Prestador self-management Route Handler (BFF) — GET/PATCH /api/prestadores/me
 * (PSM-REQ-01/02). Clone of the contrataciones handlers: the browser calls this
 * SAME-ORIGIN path; the handler runs server-side and uses `backendFetch` to
 * attach the session Bearer (read from the httpOnly cookie) and forward to the
 * backend `GET|PATCH /prestadores/me`. The token NEVER reaches the client.
 *
 * The prestador is addressed by the JWT `sub` on the backend — no id ever
 * travels in the path (design decision (b)).
 *
 * Route resolution (next.config.ts): the catch-all `/api/:path*` rewrite
 * EXCLUDES the `/api/prestadores/me` prefix via negative lookahead so these
 * handlers — not the blind proxy — resolve to the filesystem and attach the
 * Bearer (the rewrite cannot read the httpOnly cookie).
 *   sentinel unauthorized → 401 · backend 200/4xx → verbatim · transport → 502
 */
import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend-fetch";

// Reads the session cookie at request time — never prerender it.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  let result;
  try {
    result = await backendFetch("/prestadores/me");
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

export async function PATCH(request: Request): Promise<Response> {
  // Re-read the raw client body and forward it as-is. The backend revalidates
  // every field; the client never sends an id (identity from the token).
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let result;
  try {
    result = await backendFetch("/prestadores/me", {
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
