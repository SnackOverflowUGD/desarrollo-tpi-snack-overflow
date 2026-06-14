/**
 * Route protection (design §6.3, REQ-07, ESC-UI-07, Supuesto S3).
 *
 * NOTE (Next 16 breaking change): the `middleware` file convention is
 * deprecated and RENAMED to `proxy` (see node_modules/next/dist/docs/.../
 * proxy.md §"Migration to Proxy"). The design predates this rename and refers
 * to `middleware.ts`; functionally identical, just the new file/function name.
 * Proxy now defaults to the Node.js runtime, so the JWT `exp` check runs fine.
 *
 * Logic: read the session cookie; if a PROTECTED path has no cookie or an
 * expired token, redirect 307 to /login?next=<original pathname>. Public paths
 * always pass through. The matcher is conservative (Supuesto S3): only the
 * placeholder protected area `/cuenta/*` is guarded today; everything public
 * (home, login, registro, recuperación, assets, /api/*) is untouched.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/session/cookie";
import { isExpired } from "@/lib/session/jwt";

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const hasValidSession = typeof token === "string" && !isExpired(token);

  if (hasValidSession) {
    return NextResponse.next();
  }

  // No valid session on a protected path (only `/cuenta/*` matches today):
  // redirect to /login preserving the original path as a safe `next` target.
  const loginUrl = new URL("/login", request.url);
  // `pathname` from nextUrl is always an internal absolute path → safe to pass.
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl, 307);
}

export const config = {
  // Only protect the placeholder account area for now (Supuesto S3). Excludes
  // every public route, API handlers, and Next internals/assets implicitly by
  // simply not matching them.
  matcher: ["/cuenta/:path*"],
};
