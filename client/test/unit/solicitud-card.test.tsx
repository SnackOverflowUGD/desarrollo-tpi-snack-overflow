import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

import type { ContratacionListItem } from "@/lib/api/contrataciones";
import { SolicitudCard } from "@/components/cuentas/bandeja/solicitud-card";

/**
 * `SolicitudCard` (bandeja Activas tab) — asserts the shared
 * `<AccionesContratacion>` engine is gated by `accionesPara(prestador, ...)`
 * exactly like the seguimiento surface, and that the pre-existing
 * `solicitada` presupuestar/rechazar block is untouched (spec ESC-15..20).
 */

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

// SolicitudCard/AccionesContratacion never call these on render (only on
// click), but the module is imported transitively — mock to keep the suite
// hermetic (no real fetch).
vi.mock("@/lib/api/contrataciones", async () => {
  const actual = await vi.importActual<
    typeof import("@/lib/api/contrataciones")
  >("@/lib/api/contrataciones");
  return {
    ...actual,
    confirmar: vi.fn(),
    iniciar: vi.fn(),
    finalizar: vi.fn(),
    cancelar: vi.fn(),
    rechazarSolicitud: vi.fn(),
  };
});

function makeItem(
  estado: ContratacionListItem["estado"],
): ContratacionListItem {
  return {
    id: "contratacion-1",
    ubicacion: "Posadas, Misiones",
    prestadorId: "prestador-1",
    clienteId: "cliente-1",
    clienteNombre: "Carla Cliente",
    prestadorNombre: "Pedro Prestador",
    fecha: "2030-03-15",
    franja: "Mañana (08–12)",
    descripcion: "Instalar un tablero eléctrico.",
    precioEstimado: estado === "solicitada" ? null : 18000,
    estado,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SolicitudCard — Activas tab actions (prestador)", () => {
  it("confirmada → renders Iniciar + Cancelar", () => {
    render(<SolicitudCard item={makeItem("confirmada")} />);

    expect(screen.getByRole("button", { name: "Iniciar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Presupuestar" })).toBeNull();
  });

  it("en_curso → renders Finalizar + Cancelar", () => {
    render(<SolicitudCard item={makeItem("en_curso")} />);

    expect(
      screen.getByRole("button", { name: "Finalizar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("presupuestada → no lifecycle action renders (waiting on cliente)", () => {
    render(<SolicitudCard item={makeItem("presupuestada")} />);

    expect(screen.queryByRole("button", { name: "Iniciar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Finalizar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancelar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Presupuestar" })).toBeNull();
  });
});

describe("SolicitudCard — solicitada keeps the UC08 inbox actions", () => {
  it("renders Presupuestar + Rechazar, not the UC09 lifecycle actions", () => {
    render(<SolicitudCard item={makeItem("solicitada")} />);

    expect(
      screen.getByRole("button", { name: "Presupuestar" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rechazar" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Iniciar" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Cancelar" })).toBeNull();
  });
});
