import { describe, it, expect } from "vitest";

import { navLinksFor, isActive } from "@/lib/nav/nav-links";
import { copy } from "@/lib/copy/es-AR";
import type { SessionState } from "@/lib/session/session-context";

// The navbar consumes copy.nav for its labels; the helper takes that subset.
const nav = copy.nav;

describe("navLinksFor", () => {
  it("anonymous → Ingresar + Crear cuenta (primary)", () => {
    const session: SessionState = { status: "anonymous" };
    const links = navLinksFor(session, nav);

    expect(links.map((l) => l.href)).toEqual(["/login", "/registro"]);
    expect(links.map((l) => l.label)).toEqual([nav.ingresar, nav.crearCuenta]);
    // "Crear cuenta" is the single primary CTA.
    expect(links.find((l) => l.href === "/registro")?.primary).toBe(true);
    expect(links.find((l) => l.href === "/login")?.primary).toBeUndefined();
  });

  it("authenticated cliente → Mis contrataciones only", () => {
    const session: SessionState = {
      status: "authenticated",
      user: { email: "cli@example.com", role: "cliente" },
    };
    const links = navLinksFor(session, nav);

    expect(links).toHaveLength(1);
    expect(links[0].href).toBe("/cuenta/contrataciones");
    expect(links[0].label).toBe(nav.misContrataciones);
  });

  it("authenticated prestador → Solicitudes + Mi perfil + Mis servicios", () => {
    const session: SessionState = {
      status: "authenticated",
      user: { email: "pre@example.com", role: "prestador" },
    };
    const links = navLinksFor(session, nav);

    expect(links.map((l) => l.href)).toEqual([
      "/cuenta/solicitudes",
      "/cuenta/perfil",
      "/cuenta/servicios",
    ]);
    expect(links.map((l) => l.label)).toEqual([
      nav.solicitudes,
      nav.miPerfil,
      nav.misServicios,
    ]);
    // Self-management links are secondary (no primary CTA in the authed navbar).
    expect(links.every((l) => l.primary === undefined)).toBe(true);
  });

  it("authenticated with unknown/absent role falls back to cliente", () => {
    const session: SessionState = {
      status: "authenticated",
      user: { email: "x@example.com" },
    };
    const links = navLinksFor(session, nav);

    expect(links[0].href).toBe("/cuenta/contrataciones");
  });
});

describe("isActive", () => {
  it("home matches only the exact root path", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/prestadores", "/")).toBe(false);
  });

  it("a non-home link matches its exact path", () => {
    expect(isActive("/prestadores", "/prestadores")).toBe(true);
  });

  it("a non-home link matches its sub-paths", () => {
    expect(isActive("/cuenta/contrataciones/123", "/cuenta/contrataciones")).toBe(
      true,
    );
  });

  it("does not match an unrelated path or a prefix collision", () => {
    expect(isActive("/registro", "/login")).toBe(false);
    // "/prestadores-x" must NOT match "/prestadores".
    expect(isActive("/prestadores-x", "/prestadores")).toBe(false);
  });
});
