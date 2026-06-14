import { describe, it, expect } from "vitest";
import {
  estadoLabel,
  transicionLabel,
  formatTimestamp,
} from "@/lib/seguimiento/linea-tiempo";
import type { ContratacionHistorialItem } from "@/lib/api/contrataciones";

describe("estadoLabel — es-AR badge catalog", () => {
  it("maps each estado to its es-AR label", () => {
    expect(estadoLabel("solicitada")).toBe("Solicitada");
    expect(estadoLabel("presupuestada")).toBe("Presupuestada");
    expect(estadoLabel("en_curso")).toBe("En curso");
    expect(estadoLabel("finalizada")).toBe("Finalizada");
  });
});

describe("transicionLabel — timeline entry text", () => {
  it("first entry (no previous estado) → 'Creada: <nuevo>'", () => {
    const item: ContratacionHistorialItem = {
      estadoAnterior: null,
      estadoNuevo: "solicitada",
      timestamp: "2026-06-10T10:00:00.000Z",
    };
    expect(transicionLabel(item)).toBe("Creada: Solicitada");
  });

  it("subsequent entry → 'Anterior → Nuevo'", () => {
    const item: ContratacionHistorialItem = {
      estadoAnterior: "solicitada",
      estadoNuevo: "presupuestada",
      timestamp: "2026-06-11T10:00:00.000Z",
    };
    expect(transicionLabel(item)).toBe("Solicitada → Presupuestada");
  });
});

describe("formatTimestamp — es-AR date-time", () => {
  it("formats a valid ISO timestamp (dd/mm/yyyy + time)", () => {
    const out = formatTimestamp("2026-06-10T13:05:00.000Z");
    // Locale formatting varies by tz; assert it contains the date parts.
    expect(out).toMatch(/2026/);
    expect(out).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("returns the raw input unchanged for an unparseable value (never throws)", () => {
    expect(formatTimestamp("not-a-date")).toBe("not-a-date");
  });
});
