import { describe, it, expect } from "vitest";
import { decodeJwtClaims, isExpired } from "@/lib/session/jwt";
import { isSafeInternalPath, safeRedirectTarget } from "@/lib/session/next-redirect";

// Build a JWT-shaped string with a given payload (signature is irrelevant —
// decodeJwtClaims never verifies it).
function makeJwt(payload: Record<string, unknown>): string {
  const b64url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(payload)}.sig`;
}

describe("decodeJwtClaims", () => {
  it("reads exp/email/role from a well-formed token", () => {
    const token = makeJwt({ exp: 1234567890, email: "u@x.com", role: "cliente" });
    const claims = decodeJwtClaims(token);
    expect(claims).toEqual({ exp: 1234567890, email: "u@x.com", role: "cliente" });
  });

  it("returns null for a malformed (non-3-segment) token", () => {
    expect(decodeJwtClaims("not.a.jwt.extra")).toBeNull();
    expect(decodeJwtClaims("nope")).toBeNull();
  });

  it("returns null for an unparseable payload", () => {
    expect(decodeJwtClaims("aaa.@@@.ccc")).toBeNull();
  });

  it("omits non-string/non-number claims", () => {
    const token = makeJwt({ exp: "soon", email: 42 });
    expect(decodeJwtClaims(token)).toEqual({ exp: undefined, email: undefined, role: undefined });
  });
});

describe("isExpired (RN-AUTH-06)", () => {
  const NOW = 1_000_000;

  it("false for a token whose exp is in the future", () => {
    expect(isExpired(makeJwt({ exp: NOW + 100 }), NOW)).toBe(false);
  });

  it("true for a token whose exp is in the past", () => {
    expect(isExpired(makeJwt({ exp: NOW - 100 }), NOW)).toBe(true);
  });

  it("true when exp equals now (<=)", () => {
    expect(isExpired(makeJwt({ exp: NOW }), NOW)).toBe(true);
  });

  it("true (fail-closed) for a malformed token or one with no exp", () => {
    expect(isExpired("garbage", NOW)).toBe(true);
    expect(isExpired(makeJwt({ email: "x" }), NOW)).toBe(true);
  });
});

describe("isSafeInternalPath / safeRedirectTarget (open-redirect, ESC-UI-07)", () => {
  it("accepts internal absolute paths", () => {
    expect(isSafeInternalPath("/cuenta")).toBe(true);
    expect(isSafeInternalPath("/cuenta/pedidos?x=1")).toBe(true);
  });

  it("rejects protocol-relative //evil", () => {
    expect(isSafeInternalPath("//evil.com")).toBe(false);
  });

  it("rejects absolute URLs with a scheme", () => {
    expect(isSafeInternalPath("http://evil.com")).toBe(false);
    expect(isSafeInternalPath("https://evil.com")).toBe(false);
    expect(isSafeInternalPath("javascript:alert(1)")).toBe(false);
  });

  it("rejects backslash tricks and non-absolute paths", () => {
    expect(isSafeInternalPath("/\\evil.com")).toBe(false);
    expect(isSafeInternalPath("cuenta")).toBe(false);
    expect(isSafeInternalPath("")).toBe(false);
    expect(isSafeInternalPath(null)).toBe(false);
  });

  it("safeRedirectTarget falls back to '/' for unsafe input", () => {
    expect(safeRedirectTarget("//evil")).toBe("/");
    expect(safeRedirectTarget("/cuenta")).toBe("/cuenta");
  });
});
