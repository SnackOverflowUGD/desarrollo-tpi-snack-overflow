import { describe, it, expect, vi, afterEach } from "vitest";

import {
  getProfile,
  updateProfile,
  type MiPerfil,
} from "@/lib/api/prestador-me";

function makeResponse(status: number, body: unknown, rejectJson = false): Response {
  return {
    status,
    json: rejectJson
      ? () => Promise.reject(new SyntaxError("bad json"))
      : () => Promise.resolve(body),
  } as unknown as Response;
}

const PERFIL: MiPerfil = {
  id: "11111111-1111-4111-8111-111111111111",
  nombreCompleto: "Juan Pérez",
  categoria: "Electricista",
  oficios: ["Electricista"],
  localidad: "Posadas",
  zonaCobertura: { type: "Polygon", coordinates: [] },
  disponibilidadResumen: { estado: "disponible_esta_semana" },
  visible: true,
  tieneServiciosPublicados: false,
  servicios: [],
};

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("getProfile — status → result mapping (OCL)", () => {
  it("200 with valid shape → { ok:true, data }", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, PERFIL)));
    const result = await getProfile();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.id).toBe(PERFIL.id);
  });

  it("200 with an unusable body → 'server' (never a fake success)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, { nope: 1 })));
    const result = await getProfile();
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("401 → 'unauthorized'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(401, {})));
    const result = await getProfile();
    if (!result.ok) expect(result.kind).toBe("unauthorized");
  });

  it("403 → 'forbidden'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(403, {})));
    const result = await getProfile();
    if (!result.ok) expect(result.kind).toBe("forbidden");
  });

  it("500 → 'server' with status", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(500, {})));
    const result = await getProfile();
    if (!result.ok && result.kind === "server") expect(result.status).toBe(500);
  });

  it("transport throw → 'network' (NEVER throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const result = await getProfile();
    if (!result.ok) expect(result.kind).toBe("network");
  });
});

describe("updateProfile — status → result mapping (OCL)", () => {
  const PATCH = { oficios: ["Electricista"], localidad: "Posadas" };

  it("200 → { ok:true, data } and reflects the new publish flag", async () => {
    const updated = { ...PERFIL, tieneServiciosPublicados: true };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(200, updated)));
    const result = await updateProfile(PATCH);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.tieneServiciosPublicados).toBe(true);
  });

  it("401 → 'unauthorized'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(401, {})));
    const result = await updateProfile(PATCH);
    if (!result.ok) expect(result.kind).toBe("unauthorized");
  });

  it("403 → 'forbidden'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(403, {})));
    const result = await updateProfile(PATCH);
    if (!result.ok) expect(result.kind).toBe("forbidden");
  });

  it("400 (unknown localidad / bad enum) → 'validation' carrying raw", async () => {
    const body = { statusCode: 400, message: "Localidad desconocida", error: "Bad Request" };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(400, body)));
    const result = await updateProfile({ localidad: "Springfield" });
    expect(result.ok).toBe(false);
    if (!result.ok && result.kind === "validation") {
      expect(result.raw).toEqual(body);
    }
  });

  it("500 → 'server'", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(500, {})));
    const result = await updateProfile(PATCH);
    if (!result.ok) expect(result.kind).toBe("server");
  });

  it("transport throw → 'network' (NEVER throws)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    const result = await updateProfile(PATCH);
    if (!result.ok) expect(result.kind).toBe("network");
  });

  it("NEVER throws for any 4xx", async () => {
    for (const status of [400, 401, 403, 404]) {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(makeResponse(status, {})));
      await expect(updateProfile(PATCH)).resolves.toBeDefined();
    }
  });
});
