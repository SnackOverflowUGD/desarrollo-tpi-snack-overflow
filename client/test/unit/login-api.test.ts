import { describe, it, expect, vi, afterEach } from "vitest";
import {
  loginUser,
  requestPasswordReset,
  resetPassword,
} from "@/lib/api/auth";

function makeResponse(status: number, body: unknown, rejectJson = false): Response {
  return {
    status,
    json: rejectJson
      ? () => Promise.reject(new SyntaxError("bad json"))
      : () => Promise.resolve(body),
  } as unknown as Response;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("loginUser", () => {
  const PAYLOAD = { email: "user@example.com", password: "secret" };

  it("200 → { ok: true } and NEVER exposes a token (OCL Q1)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, { accessToken: "jwt" })));
    const result = await loginUser(PAYLOAD);
    expect(result.ok).toBe(true);
    // No token field on the success result.
    expect(JSON.stringify(result)).not.toContain("jwt");
    expect("accessToken" in result).toBe(false);
  });

  it("401 → 'invalid_credentials' (anti-enum, no field revealed; OCL Q7)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(401, { message: "Invalid credentials." })));
    const result = await loginUser(PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("invalid_credentials");
      // The result discriminant carries no per-field signal.
      expect(JSON.stringify(result).toLowerCase()).not.toMatch(/email|password|contraseñ/);
    }
  });

  it("403 → 'suspended'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(403, {})));
    const result = await loginUser(PAYLOAD);
    if (!result.ok) expect(result.kind).toBe("suspended");
  });

  it("423 → 'locked'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(423, {})));
    const result = await loginUser(PAYLOAD);
    if (!result.ok) expect(result.kind).toBe("locked");
  });

  it("422 → 'validation' with raw.message array", async () => {
    const body = { statusCode: 422, message: ["email must be an email"], error: "Unprocessable Entity" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(422, body)));
    const result = await loginUser(PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok && result.kind === "validation") {
      expect(Array.isArray(result.raw.message)).toBe(true);
    }
  });

  it("500 → 'server' with status (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(500, null)));
    const result = await loginUser(PAYLOAD);
    if (!result.ok && result.kind === "server") expect(result.status).toBe(500);
  });

  it("transport failure → 'network' (never throws; OCL Q6)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const result = await loginUser(PAYLOAD);
    if (!result.ok) expect(result.kind).toBe("network");
  });

  it("POSTs to the Route Handler /api/auth/login (not the rewrite)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(200, { accessToken: "x" }));
    vi.stubGlobal("fetch", fetchMock);
    await loginUser(PAYLOAD);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe("/api/auth/login");
  });
});

describe("requestPasswordReset", () => {
  it("any 2xx → { ok: true } (anti-enum, OCL Q1/Q2)", async () => {
    for (const status of [200, 201, 204]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(status, { message: "ok" })));
      const result = await requestPasswordReset({ email: "a@b.com" });
      expect(result.ok).toBe(true);
      vi.unstubAllGlobals();
    }
  });

  it("transport failure → 'network'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("down")));
    const result = await requestPasswordReset({ email: "a@b.com" });
    if (!result.ok) expect(result.kind).toBe("network");
  });

  it("5xx → 'server'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(503, null)));
    const result = await requestPasswordReset({ email: "a@b.com" });
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("uses the rewrite endpoint /api/auth/forgot-password", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);
    await requestPasswordReset({ email: "a@b.com" });
    expect((fetchMock.mock.calls[0] as [string])[0]).toBe("/api/auth/forgot-password");
  });
});

describe("resetPassword", () => {
  const PAYLOAD = { token: "t", newPassword: "newpass12" };

  it("200 → { ok: true }", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, { message: "ok" })));
    const result = await resetPassword(PAYLOAD);
    expect(result.ok).toBe(true);
  });

  it.each([400, 404, 410])("%i → 'invalid_token'", async (status) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(status, {})));
    const result = await resetPassword(PAYLOAD);
    if (!result.ok) expect(result.kind).toBe("invalid_token");
  });

  it("422 → 'validation'", async () => {
    const body = { statusCode: 422, message: ["newPassword too short"], error: "Unprocessable Entity" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(422, body)));
    const result = await resetPassword(PAYLOAD);
    if (!result.ok) expect(result.kind).toBe("validation");
  });

  it("transport failure → 'network'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("down")));
    const result = await resetPassword(PAYLOAD);
    if (!result.ok) expect(result.kind).toBe("network");
  });
});
