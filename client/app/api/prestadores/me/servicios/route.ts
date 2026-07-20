/**
 * Servicio create Route Handler (BFF) — POST /api/prestadores/me/servicios
 * (PSM-REQ-05). Clone of the /api/prestadores/me handler: the browser POSTs to
 * this SAME-ORIGIN path; the handler runs server-side and uses `backendFetch`
 * to attach the session Bearer (cookie→Bearer) and forward to the backend
 * `POST /prestadores/me/servicios`. The token NEVER reaches the client;
 * `prestadorId` is derived from the token, never from the body.
 *   sentinel unauthorized → 401 · backend 201/4xx → verbatim · transport → 502
 */
import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/server/backend-fetch";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let result;
  try {
    result = await backendFetch("/prestadores/me/servicios", {
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
