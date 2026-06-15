/**
 * Session cookie name + options and server-only helpers (design §6.1,
 * ADR-UC02-01). The accessToken returned by the backend in the login body is
 * stored here as an httpOnly cookie so it never touches browser JavaScript
 * (XSS-safe). CSRF is mitigated with sameSite:'lax' + secure (prod) + httpOnly.
 *
 * `server-only` makes importing this module from a Client Component a build
 * error — these helpers use `cookies()` from `next/headers` (async in Next 16)
 * and may only run in Route Handlers / Server Components.
 */
import "server-only";
import { cookies } from "next/headers";

import { decodeJwtClaims, isExpired } from "@/lib/session/jwt";
import type { SessionState } from "@/lib/session/session-context";

export const SESSION_COOKIE = "so_session";

// Conservative fallback lifetime when the JWT carries no usable `exp` (seconds).
const FALLBACK_MAX_AGE = 60 * 60; // 1 hour

interface BaseCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
}

/** Static cookie attributes shared by set/clear (maxAge added per-call). */
export const cookieOptions: BaseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
};

/** Derive a maxAge (seconds) from the token's `exp`, clamped to a sane minimum. */
function maxAgeFromToken(token: string): number {
  const claims = decodeJwtClaims(token);
  if (claims && typeof claims.exp === "number") {
    const seconds = claims.exp - Math.floor(Date.now() / 1000);
    if (seconds > 0) return seconds;
  }
  return FALLBACK_MAX_AGE;
}

/**
 * Persist the accessToken as the session cookie. maxAge tracks the JWT `exp`
 * so the cookie disappears when the token can no longer be valid (RN-AUTH-06).
 *
 * The `secure` flag is determined from the request context when available:
 *  - `x-forwarded-proto: https` (Cloudflare/proxy) → true
 *  - local HTTP → false
 * This avoids rejection when the app is accessed over plain HTTP but NODE_ENV
 * is production (common behind a local proxy or tunnel).
 */
export async function setSessionCookie(
  token: string,
  options?: { secure?: boolean },
): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    ...cookieOptions,
    secure: options?.secure ?? (process.env.NODE_ENV === "production"),
    maxAge: maxAgeFromToken(token),
  });
}

/** Remove the session cookie (logout, REQ-06). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  // maxAge:0 expires it immediately; same attributes so the browser matches it.
  store.set(SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
}

/** Read the raw session token from the request cookies (server-side). */
export async function readSessionToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value;
}

/**
 * Derive the non-sensitive session snapshot from the request cookie. Used by
 * the root layout to hydrate <SessionProvider> server-side (no flash). An
 * expired or malformed token is treated as anonymous (RN-AUTH-06). The token
 * itself is never returned — only decoded public claims (email/role).
 */
export async function getInitialSession(): Promise<SessionState> {
  const token = await readSessionToken();
  if (!token || isExpired(token)) {
    return { status: "anonymous" };
  }
  const claims = decodeJwtClaims(token);
  return {
    status: "authenticated",
    user: {
      email: claims?.email,
      role: claims?.role,
      name: claims?.name,
      lastName: claims?.lastName,
    },
  };
}
