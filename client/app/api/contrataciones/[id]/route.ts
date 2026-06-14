/**
 * Detail Route Handler (BFF) — GET /api/contrataciones/[id] (UC09 drill-in).
 * Clone of the transition handlers: the browser GETs this SAME-ORIGIN path; the
 * handler runs server-side and uses `backendFetch` to attach the session Bearer
 * and forward to `GET /contrataciones/:id`. The token NEVER reaches the client.
 *
 * Route resolution (next.config.ts): the catch-all `/api/:path*` rewrite
 * EXCLUDES the `/api/contrataciones` prefix via negative lookahead, so this
 * DYNAMIC handler resolves to the filesystem (attaching the Bearer) instead of
 * proxying without it.
 *
 * The `id` is taken from the URL params (Next 16: `params` is a Promise) and
 * NEVER from a body — the backend validates participation (404 if foreign).
 *   sentinel unauthorized  → 401   (client redirects to /login?next=)
 *   backend 200/4xx         → status + body forwarded verbatim
 *   transport failure       → 502   (client maps to a generic banner)
 */
import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend-fetch";

// Reads the session cookie at request time — never prerender it.
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;

  let result;
  try {
    result = await backendFetch(`/contrataciones/${id}`);
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
