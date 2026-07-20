/**
 * Pure navigation model for the global <Navbar> (no DOM, no I/O → directly
 * unit-testable, mirroring lib/api/acciones-contratacion.ts).
 *
 * The role read from the session is DECORATIVE only (the JWT claim is unsigned;
 * proxy.ts + the backend are the real authority). Role values match the
 * codebase convention: lowercase `"cliente"` / `"prestador"` (see
 * components/catalogo/perfil/solicitar-cta.tsx and the seguimiento page).
 * Any authenticated, non-"prestador" role is treated as a cliente.
 */
import type { SessionState } from "@/lib/session/session-context";

export interface NavLink {
  /** Stable key for React lists / test assertions. */
  key: string;
  href: string;
  label: string;
  /** Render as a primary-styled Button (the single account CTA). */
  primary?: boolean;
}

/** Copy keys the navbar consumes — kept narrow so the helper stays pure. */
export interface NavCopy {
  buscar: string;
  ingresar: string;
  crearCuenta: string;
  misContrataciones: string;
  solicitudes: string;
  miPerfil: string;
  misServicios: string;
}

/**
 * Links shown on the RIGHT side of the navbar, derived from the session.
 *  - anonymous            → Ingresar + Crear cuenta (primary)
 *  - authenticated cliente → Mis contrataciones
 *  - authenticated prestador → Solicitudes + Mi perfil
 * The brand (→/) and "Buscar" (→/prestadores) links are always-on and live in
 * the component itself (they do not depend on the session).
 */
export function navLinksFor(session: SessionState, copy: NavCopy): NavLink[] {
  if (session.status !== "authenticated") {
    return [
      { key: "login", href: "/login", label: copy.ingresar },
      { key: "registro", href: "/registro", label: copy.crearCuenta, primary: true },
    ];
  }

  if (session.user?.role === "prestador") {
    return [
      {
        key: "solicitudes",
        href: "/cuenta/solicitudes",
        label: copy.solicitudes,
      },
      {
        key: "mi-perfil",
        href: "/cuenta/perfil",
        label: copy.miPerfil,
      },
      {
        key: "mis-servicios",
        href: "/cuenta/servicios",
        label: copy.misServicios,
      },
    ];
  }

  // Authenticated cliente (or any non-prestador role).
  return [
    {
      key: "contrataciones",
      href: "/cuenta/contrataciones",
      label: copy.misContrataciones,
    },
  ];
}

/**
 * True when `href` is the active route for aria-current. The home link ("/")
 * matches only the exact path; every other link matches its path or any
 * sub-path (so /cuenta/contrataciones/anything still highlights the tab).
 */
export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
