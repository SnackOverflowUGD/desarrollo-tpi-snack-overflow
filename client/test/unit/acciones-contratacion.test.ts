import { describe, it, expect } from "vitest";
import {
  accionesPara,
  type AccionContratacion,
} from "@/lib/api/acciones-contratacion";
import type { ContratacionEstado } from "@/lib/api/contrataciones";

/**
 * UC09 — `accionesPara` exhaustive matrix (ADR-09-05, design §Testing). Asserts
 * the helper mirrors the backend state machine + actor matrix and NEVER offers
 * an action outside it.
 */

const ESTADOS: ContratacionEstado[] = [
  "solicitada",
  "presupuestada",
  "confirmada",
  "en_curso",
  "finalizada",
  "cancelada",
];

const ALL_ACCIONES: AccionContratacion[] = [
  "confirmar",
  "iniciar",
  "finalizar",
  "cancelar",
];

describe("accionesPara — cliente", () => {
  it("presupuestada → confirmar + cancelar", () => {
    expect(accionesPara("cliente", "presupuestada")).toEqual([
      "confirmar",
      "cancelar",
    ]);
  });

  it.each(["solicitada", "confirmada", "en_curso"] as ContratacionEstado[])(
    "%s → solo cancelar",
    (estado) => {
      expect(accionesPara("cliente", estado)).toEqual(["cancelar"]);
    },
  );

  it.each(["finalizada", "cancelada"] as ContratacionEstado[])(
    "%s (terminal) → []",
    (estado) => {
      expect(accionesPara("cliente", estado)).toEqual([]);
    },
  );
});

describe("accionesPara — prestador", () => {
  it("confirmada → iniciar + cancelar", () => {
    expect(accionesPara("prestador", "confirmada")).toEqual([
      "iniciar",
      "cancelar",
    ]);
  });

  it("en_curso → finalizar + cancelar", () => {
    expect(accionesPara("prestador", "en_curso")).toEqual([
      "finalizar",
      "cancelar",
    ]);
  });

  it.each(["solicitada", "presupuestada"] as ContratacionEstado[])(
    "%s → [] (UC08 inbox owns these for the prestador)",
    (estado) => {
      expect(accionesPara("prestador", estado)).toEqual([]);
    },
  );

  it.each(["finalizada", "cancelada"] as ContratacionEstado[])(
    "%s (terminal) → []",
    (estado) => {
      expect(accionesPara("prestador", estado)).toEqual([]);
    },
  );
});

describe("accionesPara — invariants (defense in depth)", () => {
  it("never offers an action outside the canonical set, for any (rol, estado)", () => {
    for (const rol of ["cliente", "prestador"] as const) {
      for (const estado of ESTADOS) {
        for (const accion of accionesPara(rol, estado)) {
          expect(ALL_ACCIONES).toContain(accion);
        }
      }
    }
  });

  it("never offers any transition action on a terminal state", () => {
    for (const rol of ["cliente", "prestador"] as const) {
      expect(accionesPara(rol, "finalizada")).toEqual([]);
      expect(accionesPara(rol, "cancelada")).toEqual([]);
    }
  });

  it("only the prestador can iniciar/finalizar; only the cliente can confirmar", () => {
    // confirmar is exclusively a cliente action
    for (const estado of ESTADOS) {
      expect(accionesPara("prestador", estado)).not.toContain("confirmar");
    }
    // iniciar / finalizar are exclusively prestador actions
    for (const estado of ESTADOS) {
      expect(accionesPara("cliente", estado)).not.toContain("iniciar");
      expect(accionesPara("cliente", estado)).not.toContain("finalizar");
    }
  });
});
