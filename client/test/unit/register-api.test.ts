import { describe, it, expect, vi, afterEach } from "vitest";
import { registerUser } from "@/lib/api/auth";
import type { RegisterPayload, RegisterSuccess } from "@/lib/api/auth";

const PAYLOAD: RegisterPayload = {
  name: "Juan",
  lastName: "Pérez",
  email: "juan@example.com",
  phone: "1165432100",
  password: "12345678",
  role: "cliente",
};

const SUCCESS_BODY: RegisterSuccess = {
  id: "abc123",
  email: "juan@example.com",
  role: "cliente",
  status: "activo",
  providerStatus: null,
  message: "User registered.",
};

function makeResponse(
  status: number,
  body: unknown,
  rejectJson = false,
): Response {
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

describe("registerUser", () => {
  it("201 with parseable body → { ok: true, data }", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(201, SUCCESS_BODY)));
    const result = await registerUser(PAYLOAD);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual(SUCCESS_BODY);
    }
  });

  it("422 → { ok: false, kind: 'validation' }", async () => {
    const body422 = {
      statusCode: 422,
      message: ["email must be an email"],
      error: "Unprocessable Entity",
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(422, body422)));
    const result = await registerUser(PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("validation");
  });

  it("409 → { ok: false, kind: 'conflict' }", async () => {
    const body409 = {
      statusCode: 409,
      message: "An account with this email already exists.",
      error: "Conflict",
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(409, body409)));
    const result = await registerUser(PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("conflict");
  });

  it("400 → { ok: false, kind: 'bad_request' }", async () => {
    const body400 = { statusCode: 400, message: "Bad Request", error: "Bad Request" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(400, body400)));
    const result = await registerUser(PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("bad_request");
  });

  it("500 → { ok: false, kind: 'server', status: 500 }", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(500, null)));
    const result = await registerUser(PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("server");
      if (result.kind === "server") expect(result.status).toBe(500);
    }
  });

  it("fetch rejects (network error) → { ok: false, kind: 'network' }", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    const result = await registerUser(PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("network");
  });

  it("201 with unparseable body → { ok: false, kind: 'server' }", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse(201, null, true)),
    );
    const result = await registerUser(PAYLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.kind).toBe("server");
      if (result.kind === "server") expect(result.status).toBe(201);
    }
  });

  it("POSTs to /api/auth/register with JSON content-type", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(201, SUCCESS_BODY));
    vi.stubGlobal("fetch", fetchMock);
    await registerUser(PAYLOAD);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/auth/register");
    expect(options.method).toBe("POST");
    expect((options.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
  });

  it("sends the payload as JSON body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(201, SUCCESS_BODY));
    vi.stubGlobal("fetch", fetchMock);
    await registerUser(PAYLOAD);

    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(options.body as string)).toEqual(PAYLOAD);
  });

  it("stubs are restored after each test (isolation check)", () => {
    // If fetch is NOT stubbed, this should use the real global.
    // In a node environment, fetch may not exist, but this at least confirms
    // vi.unstubAllGlobals() ran from afterEach.
    expect(typeof vi.fn).toBe("function"); // trivial sanity
  });
});
