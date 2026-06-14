import { describe, it, expect } from "vitest";
import { mapLoginError, mapResetValidation } from "@/lib/errors/field-errors";
import { copy } from "@/lib/copy/es-AR";

describe("mapLoginError", () => {
  it("'invalid_credentials' → generic message that NEVER names a field (Q1/Q7)", () => {
    const msg = mapLoginError({ ok: false, kind: "invalid_credentials" });
    expect(msg).toBe(copy.login.errors.invalidCredentials);
    // Anti-enumeration: must not single out e-mail vs contraseña.
    expect(msg).not.toMatch(/sólo|solo el|únicamente/i);
    // The generic message mentions both together, not which one failed.
    expect(msg).toBe("E-mail o contraseña incorrectos.");
  });

  it("'suspended' → includes the support contact channel (Q2)", () => {
    const msg = mapLoginError({ ok: false, kind: "suspended" });
    expect(msg).toContain("soporte@snackoverflow.com");
  });

  it("'locked' → mentions the ~30 minute wait (Q3)", () => {
    const msg = mapLoginError({ ok: false, kind: "locked" });
    expect(msg).toMatch(/30/);
  });

  it("'validation' → null (handled inline, Q4)", () => {
    expect(mapLoginError({ ok: false, kind: "validation", raw: { statusCode: 422, message: [], error: "Unprocessable Entity" } })).toBeNull();
  });

  it("'network'/'server' → non-technical message, no stack traces (Q5)", () => {
    const net = mapLoginError({ ok: false, kind: "network" });
    const srv = mapLoginError({ ok: false, kind: "server", status: 500 });
    expect(net).toBe(copy.globalErrors.network);
    expect(srv).toBe(copy.globalErrors.server);
    for (const m of [net, srv]) {
      expect(m).not.toMatch(/stack|trace|undefined|null|Error:/i);
    }
  });
});

describe("mapResetValidation", () => {
  it("short password → inline newPassword message", () => {
    const result = mapResetValidation({ statusCode: 422, message: ["newPassword must be longer"], error: "Unprocessable Entity" });
    expect(result.newPassword).toBe(copy.reset.passwordShort);
    expect(result.global).toBeUndefined();
  });

  it("also maps a 'password'-prefixed message to newPassword", () => {
    const result = mapResetValidation({ statusCode: 422, message: ["password is too weak"], error: "Unprocessable Entity" });
    expect(result.newPassword).toBe(copy.reset.passwordShort);
  });

  it("unmappable message → generic global banner", () => {
    const result = mapResetValidation({ statusCode: 422, message: ["something else"], error: "Unprocessable Entity" });
    expect(result.global).toBe(copy.globalErrors.generic);
    expect(result.newPassword).toBeUndefined();
  });
});
