import { describe, it, expect } from "vitest";
import { esPrecioValido, proposalSchema } from "@/lib/validation/proposal";
import { copy } from "@/lib/copy/es-AR";

describe("esPrecioValido (pure)", () => {
  it("0 → false", () => expect(esPrecioValido(0)).toBe(false));
  it("negative → false", () => expect(esPrecioValido(-50)).toBe(false));
  it("NaN → false", () => expect(esPrecioValido(NaN)).toBe(false));
  it("positive → true", () => expect(esPrecioValido(15000)).toBe(true));
  it("small positive → true", () => expect(esPrecioValido(0.01)).toBe(true));
});

describe("proposalSchema — validation rules (REQ-07, ESC-UI-05)", () => {
  // A fixed future date well past any "today" the test runs on.
  const FUTURE = "2099-12-31";

  it("accepts a valid proposal (price > 0, future date, non-empty franja)", () => {
    const result = proposalSchema.safeParse({
      precioEstimado: 15000,
      fecha: FUTURE,
      franja: "Mañana (08–12)",
    });
    expect(result.success).toBe(true);
  });

  it("rejects precio <= 0", () => {
    const result = proposalSchema.safeParse({
      precioEstimado: 0,
      fecha: FUTURE,
      franja: "Mañana (08–12)",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) =>
        i.path.includes("precioEstimado"),
      )?.message;
      expect(msg).toBe(copy.bandeja.errors.precioInvalido);
    }
  });

  it("rejects a past date", () => {
    const result = proposalSchema.safeParse({
      precioEstimado: 15000,
      fecha: "2000-01-01",
      franja: "Mañana (08–12)",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path.includes("fecha"))
        ?.message;
      expect(msg).toBe(copy.bandeja.errors.fechaPasada);
    }
  });

  it("rejects an empty franja", () => {
    const result = proposalSchema.safeParse({
      precioEstimado: 15000,
      fecha: FUTURE,
      franja: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues.find((i) => i.path.includes("franja"))
        ?.message;
      expect(msg).toBe(copy.bandeja.errors.franjaRequerida);
    }
  });
});
