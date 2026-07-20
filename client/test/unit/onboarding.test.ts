import { describe, it, expect } from "vitest";

import {
  postRegistroRedirect,
  ONBOARDING_PERFIL_PATH,
} from "@/lib/cuenta/onboarding";

describe("postRegistroRedirect (ONBOARDING-REQ-01)", () => {
  it("active prestador → /login?next=<onboarding profile>", () => {
    const target = postRegistroRedirect("prestador", "habilitado");
    expect(target).toBe(
      `/login?next=${encodeURIComponent(ONBOARDING_PERFIL_PATH)}`,
    );
  });

  it("active prestador with null providerStatus → onboarding next", () => {
    const target = postRegistroRedirect("prestador", null);
    expect(target).toContain("next=");
    expect(target).toContain(encodeURIComponent("onboarding=1"));
  });

  it("pending prestador → plain /login (not onboarding)", () => {
    expect(postRegistroRedirect("prestador", "pendiente_habilitacion")).toBe(
      "/login",
    );
  });

  it("cliente → plain /login", () => {
    expect(postRegistroRedirect("cliente", null)).toBe("/login");
  });

  it("the onboarding path targets the perfil page in onboarding mode", () => {
    expect(ONBOARDING_PERFIL_PATH).toBe("/cuenta/perfil?onboarding=1");
  });
});
