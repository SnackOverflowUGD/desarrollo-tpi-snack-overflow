import { describe, it, expect, vi, afterEach } from "vitest";
import {
  confirmar,
  iniciar,
  finalizar,
  cancelar,
  type ContratacionListItem,
} from "@/lib/api/contrataciones";

/**
 * UC09 — transition api-client status → kind mapping (OCL §Testing). Asserts the
 * 4 functions NEVER throw for business 4xx, map every status to the right kind,
 * use the right URL verb, and send NO body (id/identity travels in the URL).
 */

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
  fecha: "2026-12-31",
  franja: "Mañana (08–12)",
  descripcion: "Arreglo de tablero",
  estado: "confirmada",
  createdAt: "2026-06-13T10:00:00.000Z",
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const CASES = [
  { name: "confirmar", fn: confirmar, verbo: "confirm" },
  { name: "iniciar", fn: iniciar, verbo: "start" },
  { name: "finalizar", fn: finalizar, verbo: "finish" },
  { name: "cancelar", fn: cancelar, verbo: "cancel" },
] as const;

describe.each(CASES)("$name(id) — transition api", ({ fn, verbo }) => {
  it(`POSTs to /api/contrataciones/{id}/${verbo} with NO body`, async () => {
    const fetchMock = vi.fn().mockResolvedValue(makeResponse(200, ITEM));
    vi.stubGlobal("fetch", fetchMock);

    await fn("c1");

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/contrataciones/c1/${verbo}`,
      expect.objectContaining({ method: "POST" }),
    );
    // No body / no identity ever leaves the client (id is in the URL).
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.body).toBeUndefined();
  });

  it("200 with a usable item → { ok:true, data }", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, ITEM)));
    const result = await fn("c1");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.estado).toBe("confirmada");
  });

  it("200 with an unusable body → 'server' (not a fake success)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, null)));
    const result = await fn("c1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("401 → 'unauthorized' (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(401, {})));
    const result = await fn("c1");
    expect(result).toEqual({ ok: false, kind: "unauthorized" });
  });

  it("403 → 'forbidden' (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(403, {})));
    const result = await fn("c1");
    expect(result).toEqual({ ok: false, kind: "forbidden" });
  });

  it("404 → 'no_disponible' (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(404, {})));
    const result = await fn("c1");
    expect(result).toEqual({ ok: false, kind: "no_disponible" });
  });

  it("409 → 'estado_cambiado' (expected concurrency, never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(409, {})));
    const result = await fn("c1");
    expect(result).toEqual({ ok: false, kind: "estado_cambiado" });
  });

  it("500 → 'server' (never throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(500, {})));
    const result = await fn("c1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("502 (handler transport) → 'server'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(502, {})));
    const result = await fn("c1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("transport throw → 'network' (never propagates the throw)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );
    const result = await fn("c1");
    expect(result).toEqual({ ok: false, kind: "network" });
  });
});
