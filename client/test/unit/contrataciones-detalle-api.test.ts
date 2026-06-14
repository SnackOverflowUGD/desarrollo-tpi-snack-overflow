import { describe, it, expect, vi, afterEach } from "vitest";
import {
  obtenerDetalle,
  type ContratacionDetail,
} from "@/lib/api/contrataciones";

/**
 * UC09 — detail api-client status → kind mapping (OCL §Testing). Asserts
 * `obtenerDetalle` NEVER throws for business 4xx, maps every status to the right
 * kind, GETs the right URL with no body, and rejects unusable 200 bodies.
 */

function makeResponse(status: number, body: unknown, rejectJson = false): Response {
  return {
    status,
    json: rejectJson
      ? () => Promise.reject(new SyntaxError("bad json"))
      : () => Promise.resolve(body),
  } as unknown as Response;
}

const DETAIL: ContratacionDetail = {
  id: "c1",
  ubicacion: "Posadas",
  prestadorId: "p1",
  prestadorNombre: "Juan Pérez",
  clienteId: "cli-1",
  clienteNombre: "Ana Gómez",
  fecha: "2026-12-31",
  franja: "Mañana (08–12)",
  descripcion: "Arreglo de tablero",
  estado: "confirmada",
  createdAt: "2026-06-13T10:00:00.000Z",
  historial: [
    {
      estadoAnterior: null,
      estadoNuevo: "solicitada",
      timestamp: "2026-06-10T10:00:00.000Z",
    },
    {
      estadoAnterior: "solicitada",
      estadoNuevo: "presupuestada",
      timestamp: "2026-06-11T10:00:00.000Z",
    },
  ],
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("obtenerDetalle — status → kind mapping (OCL)", () => {
  it("GETs /api/contrataciones/{id} with NO body", async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(200, DETAIL));
    vi.stubGlobal("fetch", fetchMock);

    await obtenerDetalle("c1");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/contrataciones/c1",
      expect.objectContaining({ method: "GET" }),
    );
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.body).toBeUndefined();
  });

  it("200 with a usable body → { ok:true, data } with historial", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, DETAIL)));
    const result = await obtenerDetalle("c1");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.historial).toHaveLength(2);
      expect(result.data.prestadorNombre).toBe("Juan Pérez");
    }
  });

  it("200 missing historial array → 'server' (not a fake success)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeResponse(200, { ...DETAIL, historial: undefined })),
    );
    const result = await obtenerDetalle("c1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("200 with null body → 'server'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, null)));
    const result = await obtenerDetalle("c1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("401 → 'unauthorized' (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(401, {})));
    const result = await obtenerDetalle("c1");
    expect(result).toEqual({ ok: false, kind: "unauthorized" });
  });

  it("404 → 'no_disponible' (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(404, {})));
    const result = await obtenerDetalle("c1");
    expect(result).toEqual({ ok: false, kind: "no_disponible" });
  });

  it("500 → 'server' with status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(500, {})));
    const result = await obtenerDetalle("c1");
    expect(result.ok).toBe(false);
    if (!result.ok && result.kind === "server") expect(result.status).toBe(500);
  });

  it("502 (handler transport) → 'server'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(502, {})));
    const result = await obtenerDetalle("c1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("transport throw → 'network' (never propagates the throw)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    const result = await obtenerDetalle("c1");
    expect(result).toEqual({ ok: false, kind: "network" });
  });
});
