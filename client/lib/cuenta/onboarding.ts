/**
 * Post-registration onboarding routing (ONBOARDING-REQ-01). Pure + directly
 * unit-testable (no DOM, no I/O), mirroring lib/nav/nav-links.ts.
 *
 * Registration does NOT log the user in — it always lands on /login. For a newly
 * registered, ACTIVE prestador we pre-set `next` to the profile page in
 * onboarding mode, so after they log in they land on a non-mandatory
 * "completá tu perfil" step guiding them to publish their first servicio (which
 * makes them searchable, RN-CAT-01). A prestador left `pendiente_habilitacion`
 * is not routed to onboarding (they first need to be enabled); clientes just go
 * to login.
 */

/** Profile page in onboarding mode (the post-registration completion step). */
export const ONBOARDING_PERFIL_PATH = "/cuenta/perfil?onboarding=1";

/**
 * Computes the redirect target after a successful registration.
 *  - active prestador  → `/login?next=<onboarding profile>` (guided completion)
 *  - pending prestador → `/login` (must be enabled first)
 *  - cliente / other   → `/login`
 */
export function postRegistroRedirect(
  role: string,
  providerStatus: string | null,
): string {
  if (role === "prestador" && providerStatus !== "pendiente_habilitacion") {
    return `/login?next=${encodeURIComponent(ONBOARDING_PERFIL_PATH)}`;
  }
  return "/login";
}
