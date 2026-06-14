import { describe, it, expect } from "vitest";
import { loginSchema } from "@/lib/validation/login";
import { resetPasswordSchema } from "@/lib/validation/reset-password";

describe("loginSchema (ESC-UI-05)", () => {
  it("valid email + non-empty password parses", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("email without @ is blocked", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });

  it("empty email is blocked", () => {
    expect(loginSchema.safeParse({ email: "", password: "x" }).success).toBe(false);
  });

  it("empty password is blocked", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });

  it("SHORT password does NOT block (login has no min length, REQ-01)", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "123" }).success).toBe(true);
  });
});

describe("resetPasswordSchema (ESC-UI-09)", () => {
  it("matching password >=8 parses", () => {
    expect(resetPasswordSchema.safeParse({ newPassword: "longenough", confirmPassword: "longenough" }).success).toBe(true);
  });

  it("password < 8 is blocked", () => {
    expect(resetPasswordSchema.safeParse({ newPassword: "short", confirmPassword: "short" }).success).toBe(false);
  });

  it("mismatched confirmation is blocked (path confirmPassword)", () => {
    const result = resetPasswordSchema.safeParse({ newPassword: "longenough", confirmPassword: "different1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "confirmPassword")).toBe(true);
    }
  });
});
