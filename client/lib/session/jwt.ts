/**
 * Minimal JWT claim reader (design §6.2, ADR-UC02-03, RN-AUTH-06).
 *
 * Decodes the base64url payload of a JWT WITHOUT verifying its signature. This
 * is ONLY used to (a) know the `exp` so the edge proxy / SSR can treat an
 * expired token as no session, and (b) surface non-sensitive UI claims
 * (email, role). The real verification is always done by the backend on every
 * protected request — these claims MUST NOT be trusted for authorization.
 *
 * Edge/Node safe: uses `atob` (available in both the edge runtime and modern
 * Node) and falls back to Buffer when `atob` is missing.
 */

export interface JwtClaims {
  exp?: number; // seconds since epoch (RFC 7519)
  email?: string;
  role?: string;
  name?: string;
  lastName?: string;
}

function base64UrlDecode(segment: string): string | null {
  // Restore standard base64 alphabet and padding.
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  try {
    // Node path: Buffer handles UTF-8 correctly.
    if (typeof Buffer !== "undefined") {
      return Buffer.from(padded, "base64").toString("utf8");
    }
    // Edge runtime: decode via Uint8Array + TextDecoder to preserve UTF-8.
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/**
 * Decode the public claims of a JWT. Returns null for any malformed input
 * (not three segments, invalid base64, non-object payload).
 */
export function decodeJwtClaims(token: string): JwtClaims | null {
  if (typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const json = base64UrlDecode(parts[1]);
  if (json === null) return null;

  try {
    const payload = JSON.parse(json) as unknown;
    if (typeof payload !== "object" || payload === null) return null;

    const { exp, email, role, name, lastName } = payload as Record<string, unknown>;
    return {
      exp: typeof exp === "number" ? exp : undefined,
      email: typeof email === "string" ? email : undefined,
      role: typeof role === "string" ? role : undefined,
      name: typeof name === "string" ? name : undefined,
      lastName: typeof lastName === "string" ? lastName : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * True when the token is absent, malformed, has no `exp`, or `exp <= now`.
 * A token we cannot read is treated as expired (fail-closed, RN-AUTH-06).
 * @param nowSeconds defaults to the current time in seconds.
 */
export function isExpired(token: string, nowSeconds?: number): boolean {
  const claims = decodeJwtClaims(token);
  if (!claims || typeof claims.exp !== "number") return true;
  const now = nowSeconds ?? Math.floor(Date.now() / 1000);
  return claims.exp <= now;
}
