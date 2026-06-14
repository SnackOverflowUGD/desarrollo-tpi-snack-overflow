import { describe, it, expect } from "vitest";
import { registroSchema, registroDefaults } from "@/lib/validation/registro";
import { copy } from "@/lib/copy/es-AR";

const VALID_CLIENTE = {
  role: "cliente" as const,
  name: "Juan",
  lastName: "Pérez",
  email: "juan@example.com",
  phone: "1165432100",
  password: "12345678",
  trade: "",
};

const VALID_PRESTADOR = {
  role: "prestador" as const,
  name: "María",
  lastName: "González",
  email: "maria@example.com",
  phone: "+541165432100",
  password: "securepass",
  trade: "Electricista",
};

describe("registroSchema — valid cases", () => {
  it("valid cliente parses successfully", () => {
    const result = registroSchema.safeParse(VALID_CLIENTE);
    expect(result.success).toBe(true);
  });

  it("valid prestador with trade parses successfully", () => {
    const result = registroSchema.safeParse(VALID_PRESTADOR);
    expect(result.success).toBe(true);
  });
});

describe("registroSchema — phone tolerance", () => {
  it('local number without +54 ("1165432100") validates', () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, phone: "1165432100" });
    expect(result.success).toBe(true);
  });

  it('full number with +54 ("+541165432100") validates', () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, phone: "+541165432100" });
    expect(result.success).toBe(true);
  });

  it("number with spaces validates", () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, phone: "11 6543 2100" });
    expect(result.success).toBe(true);
  });

  it("number with +54 and spaces validates", () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, phone: "+54 11 6543 2100" });
    expect(result.success).toBe(true);
  });

  it("too-short phone (< 8 digits) fails", () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, phone: "12345" });
    expect(result.success).toBe(false);
  });

  it("empty phone fails with phone field error", () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, phone: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "phone");
      expect(issue).toBeDefined();
      expect(issue?.message).toBe(copy.fieldErrors.phone);
    }
  });
});

describe("registroSchema — prestador trade requirement", () => {
  it("prestador without trade → issue on trade path", () => {
    const result = registroSchema.safeParse({ ...VALID_PRESTADOR, trade: "" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const tradeIssue = result.error.issues.find((i) => i.path[0] === "trade");
      expect(tradeIssue).toBeDefined();
      expect(tradeIssue?.message).toBe(copy.fieldErrors.trade);
    }
  });

  it("prestador with whitespace-only trade → issue on trade", () => {
    const result = registroSchema.safeParse({ ...VALID_PRESTADOR, trade: "   " });
    expect(result.success).toBe(false);
    if (!result.success) {
      const tradeIssue = result.error.issues.find((i) => i.path[0] === "trade");
      expect(tradeIssue).toBeDefined();
    }
  });

  it("cliente with empty trade → parses ok (trade not required for cliente)", () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, trade: "" });
    expect(result.success).toBe(true);
  });
});

describe("registroSchema — password", () => {
  it("password < 8 chars → issue on password path", () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, password: "short" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "password");
      expect(issue).toBeDefined();
      expect(issue?.message).toBe(copy.fieldErrors.password);
    }
  });

  it("password exactly 8 chars → valid", () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, password: "12345678" });
    expect(result.success).toBe(true);
  });

  it("password > 128 chars → issue", () => {
    const result = registroSchema.safeParse({
      ...VALID_CLIENTE,
      password: "a".repeat(129),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "password");
      expect(issue).toBeDefined();
    }
  });
});

describe("registroSchema — email", () => {
  it("bad email → issue on email path", () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, email: "not-an-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "email");
      expect(issue).toBeDefined();
      expect(issue?.message).toBe(copy.fieldErrors.email);
    }
  });

  it("email with spaces fails regex", () => {
    const result = registroSchema.safeParse({ ...VALID_CLIENTE, email: "a b@c.com" });
    expect(result.success).toBe(false);
  });
});

describe("registroSchema — name / lastName length", () => {
  it("name > 100 chars → issue", () => {
    const result = registroSchema.safeParse({
      ...VALID_CLIENTE,
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "name");
      expect(issue).toBeDefined();
      expect(issue?.message).toBe(copy.fieldErrors.name);
    }
  });

  it("lastName > 100 chars → issue", () => {
    const result = registroSchema.safeParse({
      ...VALID_CLIENTE,
      lastName: "b".repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "lastName");
      expect(issue).toBeDefined();
      expect(issue?.message).toBe(copy.fieldErrors.lastName);
    }
  });
});

describe("registroDefaults", () => {
  it("has all required shape keys", () => {
    const keys: Array<keyof typeof registroDefaults> = [
      "role",
      "name",
      "lastName",
      "email",
      "phone",
      "password",
      "trade",
    ];
    for (const key of keys) {
      expect(registroDefaults).toHaveProperty(key);
    }
  });

  it("all default values are empty strings (blank initial form)", () => {
    for (const val of Object.values(registroDefaults)) {
      expect(val).toBe("");
    }
  });
});
