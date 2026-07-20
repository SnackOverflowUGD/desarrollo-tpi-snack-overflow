import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

import { copy } from "@/lib/copy/es-AR";
import type { ResponderResult } from "@/lib/api/contrataciones";

/**
 * `useAccionesContratacion` — extracted UC09 state + handlers (design
 * §Shared Extraction Plan). `accionesPara` itself is already covered by
 * `test/unit/acciones-contratacion.test.ts`; this suite exercises the
 * hook's own responsibilities: double-submit guard (ESC-23), the MI-11
 * `busy` clear-on-success fix, the 401 redirect via `nextPath`, the 409
 * stale-estado banner+refresh (ESC-24), and the confirm-required defer.
 */

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const confirmarMock = vi.fn();
const iniciarMock = vi.fn();
const finalizarMock = vi.fn();
const cancelarMock = vi.fn();

vi.mock("@/lib/api/contrataciones", () => ({
  confirmar: (id: string) => confirmarMock(id),
  iniciar: (id: string) => iniciarMock(id),
  finalizar: (id: string) => finalizarMock(id),
  cancelar: (id: string) => cancelarMock(id),
}));

// Import AFTER the mocks above so the hook picks up the mocked API module.
import { useAccionesContratacion } from "@/lib/hooks/use-acciones-contratacion";

const OK: ResponderResult = {
  ok: true,
  data: {
    id: "contratacion-1",
    ubicacion: "Posadas",
    prestadorId: "prestador-1",
    clienteId: "cliente-1",
    clienteNombre: "Carla Cliente",
    prestadorNombre: "Pedro Prestador",
    fecha: "2030-03-15",
    franja: "Mañana (08–12)",
    descripcion: "desc",
    estado: "en_curso",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
};

beforeEach(() => {
  pushMock.mockClear();
  refreshMock.mockClear();
  confirmarMock.mockReset();
  iniciarMock.mockReset();
  finalizarMock.mockReset();
  cancelarMock.mockReset();
});

describe("useAccionesContratacion — double-submit guard (ESC-23)", () => {
  it("a second click while a request is in flight sends no extra request", () => {
    // Never resolves for this assertion — only the call count matters.
    iniciarMock.mockReturnValue(new Promise<ResponderResult>(() => {}));

    const { result } = renderHook(() =>
      useAccionesContratacion("contratacion-1", "prestador", "confirmada"),
    );

    act(() => {
      result.current.onAccionClick("iniciar");
    });
    expect(result.current.busy).toBe("iniciar");

    // Second "click" — a real re-render already happened after the first
    // (React flushed `setBusy` synchronously inside the `act` above), so
    // this closure sees the updated `busy` and the guard short-circuits.
    act(() => {
      result.current.onAccionClick("iniciar");
    });

    expect(iniciarMock).toHaveBeenCalledTimes(1);
  });
});

describe("useAccionesContratacion — success (MI-11 fix)", () => {
  it("clears `busy` and calls router.refresh() on success", async () => {
    iniciarMock.mockResolvedValue(OK);

    const { result } = renderHook(() =>
      useAccionesContratacion("contratacion-1", "prestador", "confirmada"),
    );

    await act(async () => {
      result.current.onAccionClick("iniciar");
    });

    // Load-bearing: router.refresh() is a SOFT refresh that does not remount
    // this client leaf, so a lingering `busy` would keep every button
    // disabled after the re-render.
    expect(result.current.busy).toBeNull();
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});

describe("useAccionesContratacion — 401 (ESC-UI-11)", () => {
  it("redirects to /login?next=<nextPath> without touching globalError", async () => {
    iniciarMock.mockResolvedValue({ ok: false, kind: "unauthorized" });

    const { result } = renderHook(() =>
      useAccionesContratacion("contratacion-1", "prestador", "confirmada", {
        nextPath: "/cuenta/solicitudes",
      }),
    );

    await act(async () => {
      result.current.onAccionClick("iniciar");
    });

    expect(pushMock).toHaveBeenCalledWith(
      `/login?next=${encodeURIComponent("/cuenta/solicitudes")}`,
    );
    expect(result.current.globalError).toBeNull();
  });

  it("defaults nextPath to /cuenta/contrataciones when not provided", async () => {
    iniciarMock.mockResolvedValue({ ok: false, kind: "unauthorized" });

    const { result } = renderHook(() =>
      useAccionesContratacion("contratacion-1", "prestador", "confirmada"),
    );

    await act(async () => {
      result.current.onAccionClick("iniciar");
    });

    expect(pushMock).toHaveBeenCalledWith(
      `/login?next=${encodeURIComponent("/cuenta/contrataciones")}`,
    );
  });
});

describe("useAccionesContratacion — stale estado (ESC-24)", () => {
  it("409 estado_cambiado → banner + refetch", async () => {
    iniciarMock.mockResolvedValue({ ok: false, kind: "estado_cambiado" });

    const { result } = renderHook(() =>
      useAccionesContratacion("contratacion-1", "prestador", "confirmada"),
    );

    await act(async () => {
      result.current.onAccionClick("iniciar");
    });

    expect(result.current.globalError).toBe(copy.seguimiento.estadoCambiado);
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(result.current.busy).toBeNull();
  });
});

describe("useAccionesContratacion — irreversible actions defer (REQ-09)", () => {
  it("cancelar sets pendingConfirm instead of calling the API directly", () => {
    const { result } = renderHook(() =>
      useAccionesContratacion("contratacion-1", "prestador", "en_curso"),
    );

    act(() => {
      result.current.onAccionClick("cancelar");
    });

    expect(result.current.pendingConfirm).toBe("cancelar");
    expect(cancelarMock).not.toHaveBeenCalled();
  });

  it("ejecutar(pendingConfirm) on confirm calls the API and clears pendingConfirm", async () => {
    cancelarMock.mockResolvedValue(OK);

    const { result } = renderHook(() =>
      useAccionesContratacion("contratacion-1", "prestador", "en_curso"),
    );

    act(() => {
      result.current.onAccionClick("cancelar");
    });

    await act(async () => {
      await result.current.ejecutar("cancelar");
    });

    expect(cancelarMock).toHaveBeenCalledWith("contratacion-1");
    expect(result.current.pendingConfirm).toBeNull();
  });

  it("cancelPending clears pendingConfirm without calling the API", () => {
    const { result } = renderHook(() =>
      useAccionesContratacion("contratacion-1", "prestador", "en_curso"),
    );

    act(() => {
      result.current.onAccionClick("cancelar");
    });
    act(() => {
      result.current.cancelPending();
    });

    expect(result.current.pendingConfirm).toBeNull();
    expect(cancelarMock).not.toHaveBeenCalled();
  });
});

describe("useAccionesContratacion — acciones mirrors accionesPara", () => {
  it("prestador + confirmada → [iniciar, cancelar]", () => {
    const { result } = renderHook(() =>
      useAccionesContratacion("contratacion-1", "prestador", "confirmada"),
    );
    expect(result.current.acciones).toEqual(["iniciar", "cancelar"]);
  });

  it("prestador + finalizada (terminal) → []", () => {
    const { result } = renderHook(() =>
      useAccionesContratacion("contratacion-1", "prestador", "finalizada"),
    );
    expect(result.current.acciones).toEqual([]);
  });
});
