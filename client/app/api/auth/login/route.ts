/**
 * Login Route Handler (design ADR-UC02-02, §6, Supuesto S1/S4).
 *
 * The browser POSTs to this SAME-ORIGIN path. This handler — running on the
 * server — calls the backend `POST /auth/login`, and on success translates the
 * `{ accessToken }` body into an httpOnly session cookie. The token is NEVER
 * forwarded to the client (the success body is just `{ ok: true }`).
 *
 * Route resolution (S1, verified against Next 16 docs `proxy.md` §"Execution
 * order"): filesystem routes (app/) run at step 5, BEFORE the `afterFiles`
 * rewrites (step 6) where the `/api/:path*` rewrite in next.config.ts lives.
 * So this handler wins over the blind proxy for `/api/auth/login` exactly —
 * no change to next.config.ts is needed. forgot/reset keep using the rewrite.
 *
 * Error contract (mapped by lib/api/auth.ts → loginUser):
 *   200 backend → set cookie, respond 200 { ok: true } (no token in body)
 *   401/403/423/422 → forward the SAME status + body so the client maps to UX
 *   network/5xx → 502 (the client maps to a generic banner)
 */
import { NextResponse } from "next/server";

import { setSessionCookie } from "@/lib/session/cookie";

// This handler reads cookies/headers at request time — never prerender it.
export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

interface LoginRequestBody {
  email?: unknown;
  password?: unknown;
}

interface BackendLoginSuccess {
  accessToken: string;
}

export async function POST(request: Request): Promise<Response> {
  // Parse the incoming client body defensively.
  let body: LoginRequestBody;
  try {
    body = (await request.json()) as LoginRequestBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  // Call the backend server-to-server (no CORS, no prefix — see next.config.ts).
  let backendResponse: Response;
  try {
    backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      // Never cache an auth call.
      cache: "no-store",
    });
  } catch {
    // Transport failure reaching the backend → 502 (client maps to 'server').
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  if (backendResponse.status === 200) {
    let data: BackendLoginSuccess | null = null;
    try {
      data = (await backendResponse.json()) as BackendLoginSuccess;
    } catch {
      data = null;
    }

    if (!data || typeof data.accessToken !== "string" || data.accessToken === "") {
      // 200 without a usable token is an unexpected server condition.
      return NextResponse.json({ ok: false }, { status: 502 });
    }

    // Determine Secure flag from the request protocol (works behind
    // Cloudflare tunnel where x-forwarded-proto is set, and over plain
    // HTTP localhost where it isn't).
    const forwardedProto = request.headers.get("x-forwarded-proto");
    const isSecure = forwardedProto === "https";
    // Translate body → httpOnly cookie. The token never reaches the client.
    await setSessionCookie(data.accessToken, { secure: isSecure });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Business 4xx (401/403/423/422): forward status + body verbatim so the
  // client can map each to its UX (banner / inline). Do NOT set a cookie.
  if (
    backendResponse.status === 401 ||
    backendResponse.status === 403 ||
    backendResponse.status === 423 ||
    backendResponse.status === 422
  ) {
    let raw: unknown = null;
    try {
      raw = await backendResponse.json();
    } catch {
      raw = null;
    }
    return NextResponse.json(raw ?? { ok: false }, {
      status: backendResponse.status,
    });
  }

  // 5xx or any other unexpected status → 502 (client maps to a generic banner).
  return NextResponse.json({ ok: false }, { status: 502 });
}
