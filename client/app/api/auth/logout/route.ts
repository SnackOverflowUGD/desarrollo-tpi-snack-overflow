/**
 * Logout Route Handler (design §6, REQ-06). Clears the session cookie. There is
 * NO backend call: invalidation is by `exp` only — no server-side blocklist
 * (RN-AUTH-06). Returns `{ ok: true }`.
 */
import { NextResponse } from "next/server";

import { clearSessionCookie } from "@/lib/session/cookie";

export const dynamic = "force-dynamic";

export async function POST(): Promise<Response> {
  await clearSessionCookie();
  return NextResponse.json({ ok: true }, { status: 200 });
}
