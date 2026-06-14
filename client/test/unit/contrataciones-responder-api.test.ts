import { describe, it, expect, vi, afterEach } from "vitest";
import {
  listarSolicitudes,
  enviarPropuesta,
  rechazarSolicitud,
  type ContratacionListItem,
  type SendProposalPayload,
} from "@/lib/api/contrataciones";

function makeResponse(status: number, body: unknown, rejectJson = false): Response {
  return {
    status,
    json: rejectJson
      ? () => Promise.reject(new SyntaxError("bad json"))
      : () => Promise.resolve(body),
  } as unknown as Response;
}

const ITEM: ContratacionListItem = {
  id: "c1",
  ubicacion: "Posadas",
  prestadorId: "p1",
  clienteId: "cli-1",
  clienteNombre: "Ana Gómez",
  prestadorNombre: "Juan Pérez",
  fecha: "2026-12-31",
  franja: "Mañana (08–12)",
  descripcion: "Arreglo de tablero",
  estado: "presupuestada",
  createdAt: "2026-06-13T10:00:00.000Z",
};

const PROPOSAL: SendProposalPayload = {
  fecha: "2026-12-31",
  franja: "Mañana (08–12)",
  precioEstimado: 15000,
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("listarSolicitudes — status → kind mapping (OCL, never throws)", () => {
  it("200 with an array → { ok:true, items }", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, [ITEM])));
    const result = await listarSolicitudes();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.items).toHaveLength(1);
      expect(result.items[0].clienteNombre).toBe("Ana Gómez");
    }
  });

  it("forwards ?estado= in the query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(200, []));
    vi.stubGlobal("fetch", fetchMock);
    await listarSolicitudes({ estado: "solicitada" });
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contrataciones?estado=solicitada",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("200 with a non-array body → 'server' (not a fake success)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, { ok: true })));
    const result = await listarSolicitudes();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("401 → 'unauthorized'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(401, { ok: false })));
    const result = await listarSolicitudes();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("unauthorized");
  });

  it("500 → 'server'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(500, { ok: false })));
    const result = await listarSolicitudes();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("transport failure → 'network' (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const result = await listarSolicitudes();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("network");
  });
});

describe("enviarPropuesta — status → kind mapping (OCL, never throws 4xx)", () => {
  it("200 ⇒ { ok:true, data.estado:'presupuestada' }", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, ITEM)));
    const result = await enviarPropuesta("c1", PROPOSAL);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.estado).toBe("presupuestada");
  });

  it("payload NEVER includes id/prestadorId", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(200, ITEM));
    vi.stubGlobal("fetch", fetchMock);
    await enviarPropuesta("c1", PROPOSAL);
    const [, init] = fetchMock.mock.calls[0];
    const sent = JSON.parse((init as RequestInit).body as string);
    expect(sent).not.toHaveProperty("id");
    expect(sent).not.toHaveProperty("prestadorId");
    expect(sent).toEqual({
      fecha: "2026-12-31",
      franja: "Mañana (08–12)",
      precioEstimado: 15000,
    });
  });

  it("posts to the id-scoped URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(200, ITEM));
    vi.stubGlobal("fetch", fetchMock);
    await enviarPropuesta("c1", PROPOSAL);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contrataciones/c1/proposal",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "no_disponible"],
    [409, "estado_cambiado"],
    [422, "validacion"],
    [400, "validacion"],
    [500, "server"],
  ])("%i → '%s'", async (status, kind) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(status, { ok: false })));
    const result = await enviarPropuesta("c1", PROPOSAL);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe(kind);
  });

  it("transport failure → 'network' (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const result = await enviarPropuesta("c1", PROPOSAL);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("network");
  });
});

describe("rechazarSolicitud — status → kind mapping (OCL, never throws 4xx)", () => {
  it("200 ⇒ { ok:true, data.estado:'cancelada' }", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse(200, { ...ITEM, estado: "cancelada" })),
    );
    const result = await rechazarSolicitud("c1");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.estado).toBe("cancelada");
  });

  it("posts to the id-scoped URL without a body", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(makeResponse(200, { ...ITEM, estado: "cancelada" }));
    vi.stubGlobal("fetch", fetchMock);
    await rechazarSolicitud("c1");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contrataciones/c1/reject");
    expect((init as RequestInit).body).toBeUndefined();
  });

  it.each([
    [401, "unauthorized"],
    [403, "forbidden"],
    [404, "no_disponible"],
    [409, "estado_cambiado"],
    [500, "server"],
  ])("%i → '%s'", async (status, kind) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(status, { ok: false })));
    const result = await rechazarSolicitud("c1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe(kind);
  });

  it("transport failure → 'network' (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const result = await rechazarSolicitud("c1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("network");
  });
});
