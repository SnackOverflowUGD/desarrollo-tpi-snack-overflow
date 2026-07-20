import { describe, it, expect } from "vitest";

import {
  servicioSchema,
  servicioDefaults,
  servicioDefaultsFrom,
  buildCrearServicioPayload,
  toPrecio,
  type ServicioFormValues,
} from "@/lib/validation/servicio";
import type { MiServicio } from "@/lib/api/prestador-me";

const VALID: ServicioFormValues = {
  categoria: "Instalaciones eléctricas",
  descripcion: "Cableado y tableros",
  rangoPrecioMin: "1000",
  rangoPrecioMax: "5000",
  visible: true,
};

describe("servicioSchema — validation rules", () => {
  it("accepts a valid servicio", () => {
    expect(servicioSchema.safeParse(VALID).success).toBe(true);
  });

  it("accepts empty price bounds (open range)", () => {
    const r = servicioSchema.safeParse({
      ...VALID,
      rangoPrecioMin: "",
      rangoPrecioMax: "",
    });
    expect(r.success).toBe(true);
  });

  it("rejects an empty categoria", () => {
    expect(servicioSchema.safeParse({ ...VALID, categoria: "  " }).success).toBe(false);
  });

  it("rejects an empty descripcion", () => {
    expect(servicioSchema.safeParse({ ...VALID, descripcion: "" }).success).toBe(false);
  });

  it("rejects a negative price", () => {
    const r = servicioSchema.safeParse({ ...VALID, rangoPrecioMin: "-1" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "rangoPrecioMin")).toBe(true);
    }
  });

  it("rejects min > max (ESC-PSM-10)", () => {
    const r = servicioSchema.safeParse({
      ...VALID,
      rangoPrecioMin: "5000",
      rangoPrecioMax: "1000",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "rangoPrecioMax")).toBe(true);
    }
  });

  it("allows min == max", () => {
    expect(
      servicioSchema.safeParse({
        ...VALID,
        rangoPrecioMin: "2000",
        rangoPrecioMax: "2000",
      }).success,
    ).toBe(true);
  });
});

describe("toPrecio", () => {
  it("empty string → null", () => {
    expect(toPrecio("")).toBe(null);
    expect(toPrecio("   ")).toBe(null);
  });
  it("numeric string → number", () => {
    expect(toPrecio("1500")).toBe(1500);
  });
});

describe("servicioDefaults / servicioDefaultsFrom", () => {
  it("defaults publish a new visible servicio with empty prices", () => {
    expect(servicioDefaults).toEqual({
      categoria: "",
      descripcion: "",
      rangoPrecioMin: "",
      rangoPrecioMax: "",
      visible: true,
    });
  });

  it("prefills from an existing servicio (null bound → empty string)", () => {
    const s: MiServicio = {
      id: "s1",
      categoria: "Plomería",
      descripcion: "Destapaciones",
      rangoPrecioMin: 3000,
      rangoPrecioMax: null,
      visible: false,
    };
    expect(servicioDefaultsFrom(s)).toEqual({
      categoria: "Plomería",
      descripcion: "Destapaciones",
      rangoPrecioMin: "3000",
      rangoPrecioMax: "",
      visible: false,
    });
  });
});

describe("buildCrearServicioPayload", () => {
  it("trims text and parses prices to number | null", () => {
    const payload = buildCrearServicioPayload({
      ...VALID,
      categoria: "  Electricista  ",
      rangoPrecioMax: "",
    });
    expect(payload).toEqual({
      categoria: "Electricista",
      descripcion: "Cableado y tableros",
      rangoPrecioMin: 1000,
      rangoPrecioMax: null,
      visible: true,
    });
  });
});
