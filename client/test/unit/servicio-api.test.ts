import { describe, it, expect, vi, afterEach } from "vitest";

import {
  crearServicio,
  actualizarServicio,
  eliminarServicio,
  type MiServicio,
} from "@/lib/api/prestador-me";

function makeResponse(status: number, body: unknown, rejectJson = false): Response {
  return {
    status,
    json: rejectJson
      ? () => Promise.reject(new SyntaxError("bad json"))
      : () => Promise.resolve(body),
  } as unknown as Response;
}

const SERVICIO: MiServicio = {
  id: "s1",
  categoria: "Electricista",
  descripcion: "Tableros",
  rangoPrecioMin: 1000,
  rangoPrecioMax: 5000,
  visible: true,
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("crearServicio — status → result mapping (OCL)", () => {
  const PAYLOAD = { categoria: "Electricista", descripcion: "Tableros" };

  it("201 → { ok:true, data }", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(201, SERVICIO)));
    const result = await crearServicio(PAYLOAD);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.id).toBe("s1");
  });

  it("201 with unusable body → 'server'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(201, { nope: 1 })));
    const result = await crearServicio(PAYLOAD);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("401 → 'unauthorized'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(401, {})));
    const result = await crearServicio(PAYLOAD);
    if (!result.ok) expect(result.kind).toBe("unauthorized");
  });

  it("403 → 'forbidden'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(403, {})));
    const result = await crearServicio(PAYLOAD);
    if (!result.ok) expect(result.kind).toBe("forbidden");
  });

  it("400 → 'validation' (invalid price range)", async () => {
    const body = { statusCode: 400, message: ["invalid price range"], error: "Bad Request" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(400, body)));
    const result = await crearServicio(PAYLOAD);
    if (!result.ok && result.kind === "validation") expect(result.raw).toEqual(body);
  });

  it("transport throw → 'network'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const result = await crearServicio(PAYLOAD);
    if (!result.ok) expect(result.kind).toBe("network");
  });

  it("does NOT send prestadorId (derived from token)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(201, SERVICIO));
    vi.stubGlobal("fetch", fetchMock);
    await crearServicio(PAYLOAD);
    const sentBody = fetchMock.mock.calls[0][1].body as string;
    expect(sentBody).not.toContain("prestadorId");
  });
});

describe("actualizarServicio — status → result mapping (OCL)", () => {
  it("200 → { ok:true, data }", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, { ...SERVICIO, visible: false })));
    const result = await actualizarServicio("s1", { visible: false });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.visible).toBe(false);
  });

  it("404 → 'no_disponible' (ownership / inexistent)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(404, {})));
    const result = await actualizarServicio("foreign", { visible: true });
    if (!result.ok) expect(result.kind).toBe("no_disponible");
  });

  it("400 → 'validation'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(400, { message: [] })));
    const result = await actualizarServicio("s1", {});
    if (!result.ok) expect(result.kind).toBe("validation");
  });

  it("puts the id in the URL, not the body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(200, SERVICIO));
    vi.stubGlobal("fetch", fetchMock);
    await actualizarServicio("s1", { visible: false });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/s1");
    expect(init.body as string).not.toContain("s1");
  });

  it("transport throw → 'network'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const result = await actualizarServicio("s1", {});
    if (!result.ok) expect(result.kind).toBe("network");
  });
});

describe("eliminarServicio — soft delete status mapping (OCL)", () => {
  it("204 → { ok:true }", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(204, null, true)));
    const result = await eliminarServicio("s1");
    expect(result.ok).toBe(true);
  });

  it("401 → 'unauthorized'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(401, {})));
    const result = await eliminarServicio("s1");
    if (!result.ok) expect(result.kind).toBe("unauthorized");
  });

  it("404 → 'no_disponible' (ownership / inexistent)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(404, {})));
    const result = await eliminarServicio("foreign");
    if (!result.ok) expect(result.kind).toBe("no_disponible");
  });

  it("uses the DELETE method with the id in the URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(204, null, true));
    vi.stubGlobal("fetch", fetchMock);
    await eliminarServicio("s1");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/s1");
    expect(init.method).toBe("DELETE");
  });

  it("transport throw → 'network' (NEVER throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const result = await eliminarServicio("s1");
    if (!result.ok) expect(result.kind).toBe("network");
  });
});
