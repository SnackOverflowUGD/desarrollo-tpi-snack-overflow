/**
 * Open-redirect guard for the post-login `next` parameter (design §6.3, REQ-07,
 * ESC-UI-07). Only internal, absolute-path targets are honoured; anything that
 * could escape the origin (protocol-relative `//evil`, absolute URLs, backslash
 * tricks) is rejected and the caller falls back to the default destination.
 *
 * Pure function — no I/O — so it is shared by the proxy (edge) and the form.
 */

/** Default post-login destination when `next` is absent or unsafe (Supuesto S2). */
export const DEFAULT_POST_LOGIN = "/";

/**
 * Returns true only for safe internal paths: must start with a single "/",
 * must NOT start with "//" (protocol-relative) and must NOT contain a scheme
 * or a backslash (which some browsers normalise to "/").
 */
export function isSafeInternalPath(value: string | null | undefined): boolean {
  if (typeof value !== "string" || value.length === 0) return false;
  if (value[0] !== "/") return false; // must be an absolute internal path
  if (value[1] === "/" || value[1] === "\\") return false; // protocol-relative
  if (value.includes("\\")) return false; // backslash escape trick
  // Defensive: reject anything that parses as an absolute URL with a scheme.
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) return false;
  return true;
}

/** Returns `next` when it is a safe internal path, otherwise the default. */
export function safeRedirectTarget(
  next: string | null | undefined,
  fallback: string = DEFAULT_POST_LOGIN,
): string {
  return isSafeInternalPath(next) ? (next as string) : fallback;
}
