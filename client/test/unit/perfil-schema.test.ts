import { describe, it, expect } from "vitest";

import {
  perfilSchema,
  perfilDefaultsFrom,
  buildActualizarPerfilPayload,
  isLocalidadValida,
  type PerfilFormValues,
} from "@/lib/validation/perfil";
import type { MiPerfil } from "@/lib/api/prestador-me";

const VALID: PerfilFormValues = {
  oficios: ["Electricista"],
  localidad: "Posadas",
  disponibilidad: "disponible_esta_semana",
  visible: true,
};

describe("perfilSchema — validation rules", () => {
  it("accepts a valid profile", () => {
    expect(perfilSchema.safeParse(VALID).success).toBe(true);
  });

  it("rejects an empty oficios list", () => {
    const r = perfilSchema.safeParse({ ...VALID, oficios: [] });
    expect(r.success).toBe(false);
  });

  it("rejects a localidad not present in UBICACIONES", () => {
    const r = perfilSchema.safeParse({ ...VALID, localidad: "Springfield" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "localidad")).toBe(true);
    }
  });

  it("accepts a barrio-level localidad label", () => {
    const r = perfilSchema.safeParse({ ...VALID, localidad: "Posadas — Centro" });
    expect(r.success).toBe(true);
  });

  it("rejects an invalid disponibilidad enum value", () => {
    const r = perfilSchema.safeParse({
      ...VALID,
      disponibilidad: "quizas" as PerfilFormValues["disponibilidad"],
    });
    expect(r.success).toBe(false);
  });

  it("accepts each of the 3 valid disponibilidad estados", () => {
    for (const estado of [
      "disponible_esta_semana",
      "proxima_disponible",
      "sin_disponibilidad",
    ] as const) {
      expect(
        perfilSchema.safeParse({ ...VALID, disponibilidad: estado }).success,
      ).toBe(true);
    }
  });
});

describe("isLocalidadValida", () => {
  it("is true for a curated city label", () => {
    expect(isLocalidadValida("Posadas")).toBe(true);
  });
  it("is false for an unknown label", () => {
    expect(isLocalidadValida("Springfield")).toBe(false);
  });
});

describe("perfilDefaultsFrom", () => {
  const base: MiPerfil = {
    id: "1",
    nombreCompleto: "Ana",
    categoria: "Plomera",
    oficios: ["Plomero"],
    localidad: "Oberá",
    zonaCobertura: null,
    disponibilidadResumen: { estado: "proxima_disponible" },
    visible: false,
    tieneServiciosPublicados: false,
    servicios: [],
  };

  it("maps loaded profile fields to form values", () => {
    const d = perfilDefaultsFrom(base);
    expect(d).toEqual({
      oficios: ["Plomero"],
      localidad: "Oberá",
      disponibilidad: "proxima_disponible",
      visible: false,
    });
  });

  it("falls back to safe defaults for a fresh prestador (no disponibilidad, null localidad)", () => {
    const d = perfilDefaultsFrom({
      ...base,
      localidad: null,
      disponibilidadResumen: null,
      visible: true,
    });
    expect(d.localidad).toBe("");
    expect(d.disponibilidad).toBe("sin_disponibilidad");
    expect(d.visible).toBe(true);
  });

  it("ignores an unknown stored estado and falls back", () => {
    const d = perfilDefaultsFrom({
      ...base,
      // Simulate a corrupt/legacy stored value the enum no longer allows.
      disponibilidadResumen: {
        estado: "loquesea",
      } as unknown as MiPerfil["disponibilidadResumen"],
    });
    expect(d.disponibilidad).toBe("sin_disponibilidad");
  });
});

describe("buildActualizarPerfilPayload", () => {
  it("wraps disponibilidad into the structured resumen and sends localidad", () => {
    const payload = buildActualizarPerfilPayload(VALID);
    expect(payload).toEqual({
      oficios: ["Electricista"],
      localidad: "Posadas",
      disponibilidadResumen: { estado: "disponible_esta_semana" },
      visible: true,
    });
  });
});
