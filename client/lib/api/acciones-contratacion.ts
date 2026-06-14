/**
 * UC09 — pure contextual-action helper (ADR-09-05, REQ-07). Given the user's
 * role and a contratación estado, returns the list of transition actions the UI
 * MUST offer, mirroring the backend state machine + actor matrix. This is a
 * client-side DEFENSE-IN-DEPTH layer: the backend (403/404/409) is the real
 * authority. No DOM, no I/O → directly unit-testable.
 *
 * Matrix (spec REQ-07 / design ADR-09-05):
 *   cliente   + presupuestada                  → ["confirmar", "cancelar"]
 *   cliente   + solicitada|confirmada|en_curso → ["cancelar"]
 *   prestador + confirmada                     → ["iniciar", "cancelar"]
 *   prestador + en_curso                       → ["finalizar", "cancelar"]
 *   *         + finalizada|cancelada           → []   (terminal, RN-SM-02)
 *   prestador + solicitada|presupuestada       → []   (handled by UC08 inbox)
 */
import type { ContratacionEstado } from "@/lib/api/contrataciones";

export type AccionContratacion =
  | "confirmar"
  | "iniciar"
  | "finalizar"
  | "cancelar";

export type RolSeguimiento = "cliente" | "prestador";

export function accionesPara(
  rol: RolSeguimiento,
  estado: ContratacionEstado,
): AccionContratacion[] {
  // Terminal states never offer transition actions (RN-SM-02).
  if (estado === "finalizada" || estado === "cancelada") return [];

  if (rol === "cliente") {
    switch (estado) {
      case "presupuestada":
        // Confirmar (REQ-01) or cancelar/rechazar (REQ-04 / UC21).
        return ["confirmar", "cancelar"];
      case "solicitada":
      case "confirmada":
      case "en_curso":
        return ["cancelar"];
      default:
        return [];
    }
  }

  // rol === "prestador"
  switch (estado) {
    case "confirmada":
      return ["iniciar", "cancelar"];
    case "en_curso":
      return ["finalizar", "cancelar"];
    // solicitada / presupuestada → no UC09 action (UC08 inbox owns those).
    default:
      return [];
  }
}
