/**
 * Backend error → UI mapping for the registration form (design §4).
 * Translates English class-validator output into the es-AR catalog. The 422
 * parse happens exactly once here (DESIGN-SYSTEM §5.2, §10.1).
 */
import { copy } from "@/lib/copy/es-AR";
import type {
  BackendValidationError,
  RegisterResult,
  LoginResult,
} from "@/lib/api/auth";
import type {
  CrearSolicitudResult,
  ResponderResult,
} from "@/lib/api/contrataciones";

export type FieldKey =
  | "name"
  | "lastName"
  | "email"
  | "phone"
  | "password"
  | "role"
  | "trade";

const FIELD_KEYS: readonly FieldKey[] = [
  "name",
  "lastName",
  "email",
  "phone",
  "password",
  "role",
  "trade",
];

// Case-insensitive lookup from the first token of a backend message to a FieldKey.
const FIELD_KEY_BY_LOWER: Record<string, FieldKey> = FIELD_KEYS.reduce(
  (acc, key) => {
    acc[key.toLowerCase()] = key;
    return acc;
  },
  {} as Record<string, FieldKey>,
);

export interface MappedValidation {
  fields: Partial<Record<FieldKey, string>>;
  global: string[];
}

/**
 * Parse a 422 body into per-field es-AR messages + a global bucket.
 *
 * Postconditions (design §9):
 *  - fields and global are disjoint (each message goes to one bucket).
 *  - every fields[k] is an es-AR catalog value (never a raw English string).
 *  - any message whose first token is not a known FieldKey goes to `global`
 *    as a generic es-AR message.
 *  - a non-empty 422 yields at least one message.
 */
export function mapValidationErrors(
  body: BackendValidationError,
): MappedValidation {
  const fields: Partial<Record<FieldKey, string>> = {};
  const global: string[] = [];
  let pushedGeneric = false;

  for (const msg of body.message ?? []) {
    if (typeof msg !== "string" || msg.trim() === "") continue;

    // First token: everything up to the first whitespace or colon.
    const firstToken = msg.trim().split(/[\s:]+/, 1)[0]?.toLowerCase() ?? "";
    const key = FIELD_KEY_BY_LOWER[firstToken];

    if (key) {
      // First message for a field wins (catalog is per-field, not per-rule).
      if (!fields[key]) fields[key] = copy.fieldErrors[key];
    } else if (!pushedGeneric) {
      global.push(copy.globalErrors.generic);
      pushedGeneric = true;
    }
  }

  // A non-empty 422 with no mappable field still surfaces something.
  if (
    Object.keys(fields).length === 0 &&
    global.length === 0 &&
    (body.message?.length ?? 0) > 0
  ) {
    global.push(copy.globalErrors.generic);
  }

  return { fields, global };
}

/** 409 (duplicate email) always maps to the email field. */
export function map409(): { fields: { email: string } } {
  return { fields: { email: copy.emailTaken } };
}

/**
 * Map a non-inline failure to a single global banner message (role="alert").
 * Returns null for validation/conflict (those are handled inline).
 */
export function mapGlobalError(
  result: Extract<RegisterResult, { ok: false }>,
): string | null {
  switch (result.kind) {
    case "bad_request":
      return copy.globalErrors.badRequest;
    case "network":
      return copy.globalErrors.network;
    case "server":
      return copy.globalErrors.server;
    case "validation":
    case "conflict":
      return null;
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UC02 — login + reset error mapping (design §4).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a login error to a banner message (role="alert"). Returns null for
 * 'validation' (handled inline via mapValidationErrors).
 *
 * Postconditions (OCL §9 / design §4):
 *  - 'invalid_credentials' → a GENERIC message that NEVER names which field
 *    failed (anti-enumeration, RNF-S.4, Q1/Q7).
 *  - 'suspended' → message includes the support contact channel.
 *  - 'locked' → message indicates the ~30 min wait.
 *  - 'network'/'server' → non-technical message, no stack traces.
 *  - 'validation' → null (inline).
 */
export function mapLoginError(
  result: Extract<LoginResult, { ok: false }>,
): string | null {
  switch (result.kind) {
    case "invalid_credentials":
      return copy.login.errors.invalidCredentials;
    case "suspended":
      return copy.login.errors.suspended;
    case "locked":
      return copy.login.errors.locked;
    case "network":
      return copy.globalErrors.network;
    case "server":
      return copy.globalErrors.server;
    case "validation":
      return null;
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UC07 — hiring request error mapping (ADR-07-03, REQ-07..11).
// ─────────────────────────────────────────────────────────────────────────────

/** Field keys the request form can surface inline. */
export type SolicitudFieldKey = "fecha" | "franja";

/**
 * Structured UI mapping for a failed `crearSolicitud`. The form interprets it:
 *  - `redirect: true` (401)            → router.push('/login?next=…'); no message.
 *  - `field` set (422/some 400)        → inline error under that field.
 *  - `noDisponible: true` (404)        → "no disponible" + "Volver a la búsqueda".
 *  - `reselectFranja: true` (409)      → actionable banner, keep data, reselect.
 *  - `banner` set (403/400/network/5xx)→ role="alert" summary, retry allowed.
 *
 * NEVER exposes backend traces or internal detail (REQ-11) — every string is an
 * es-AR catalog value.
 */
export interface MappedSolicitudError {
  redirect?: true;
  field?: { key: SolicitudFieldKey; message: string };
  banner?: string;
  noDisponible?: true;
  reselectFranja?: true;
}

export function mapSolicitudError(
  result: Extract<CrearSolicitudResult, { ok: false }>,
): MappedSolicitudError {
  switch (result.kind) {
    case "unauthorized":
      // 401 → treat as no session; the form redirects. No visible message.
      return { redirect: true };

    case "franja_ocupada":
      // 409 → actionable, keep the rest of the data, reselect franja (REQ-09).
      return {
        banner: copy.solicitud.franjaOcupada,
        reselectFranja: true,
        field: { key: "franja", message: copy.solicitud.franjaOcupada },
      };

    case "prestador_no_disponible":
      // 404 → provider gone; offer "Volver a la búsqueda" (REQ-08).
      return { banner: copy.solicitud.noDisponible, noDisponible: true };

    case "fecha_invalida":
      // 422 → inline under Fecha (safety net behind client validation, REQ-10).
      return {
        field: { key: "fecha", message: copy.solicitud.errors.fechaPasada },
      };

    case "validation":
      // 400 → no per-field mapping from this endpoint; generic summary (REQ-10).
      return { banner: copy.solicitud.validacionGenerica };

    case "forbidden":
      // 403 → prevented client-side (REQ-01); last-resort generic message.
      return { banner: copy.solicitud.cta.prestador };

    case "network":
    case "server":
      // Transport / 5xx → non-technical banner, retry allowed (REQ-11).
      return { banner: copy.solicitud.redServer };

    default:
      return { banner: copy.solicitud.redServer };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UC08 — responder (presupuestar/rechazar) error mapping (ADR-08-03, REQ-09..12).
// ─────────────────────────────────────────────────────────────────────────────

/** Field keys the proposal form can surface inline. */
export type ResponderFieldKey = "precioEstimado" | "fecha" | "franja";

/**
 * Structured UI mapping for a failed `enviarPropuesta`/`rechazarSolicitud`. The
 * component interprets it:
 *  - `redirect: true` (401)             → router.push('/login?next=…'); no message.
 *  - `refresh: true` (404/409)          → router.refresh() to reflect real state.
 *  - `field` set (422 mapped)           → inline error under that field.
 *  - `banner` set (403/409/404/4xx/red) → role="alert" message, actionable/retry.
 *
 * NEVER exposes backend traces (REQ-12) — every string is an es-AR catalog value.
 */
export interface MappedResponderError {
  redirect?: true;
  refresh?: true;
  field?: { key: ResponderFieldKey; message: string };
  banner?: string;
}

export function mapResponderError(
  result: Extract<ResponderResult, { ok: false }>,
): MappedResponderError {
  switch (result.kind) {
    case "unauthorized":
      // 401 → treat as no session; the component redirects. No visible message.
      return { redirect: true };

    case "estado_cambiado":
      // 409 → actionable, refresh the inbox to reflect the new state (REQ-11).
      return { banner: copy.bandeja.estadoCambiado, refresh: true };

    case "no_disponible":
      // 404 → inexistent or foreign; refresh + non-error message (REQ-10).
      return { banner: copy.bandeja.noDisponible, refresh: true };

    case "validacion":
      // 422/400 → prevented client-side; surface the price/date rule inline.
      return {
        field: {
          key: "precioEstimado",
          message: copy.bandeja.errors.precioInvalido,
        },
      };

    case "forbidden":
      // 403 → prevented by the inbox (REQ-09); last-resort generic message.
      return { banner: copy.bandeja.forbidden };

    case "network":
    case "server":
      // Transport / 5xx → non-technical banner, retry allowed (REQ-12).
      return { banner: copy.bandeja.errorResponder };

    default:
      return { banner: copy.bandeja.errorResponder };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UC09 — seguimiento (confirm/start/finish/cancel) error mapping (ADR-09-06,
// REQ-07/12/13). Maps the shared `ResponderResult` kinds to the es-AR catalog
// under `copy.seguimiento`. NEVER exposes backend traces (REQ-12).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Structured UI mapping for a failed transition. The component interprets it:
 *  - `redirect: true` (401)            → router.push('/login?next=…'); no message.
 *  - `refresh: true` (404/409)         → router.refresh() to reflect real state.
 *  - `banner` set (403/409/404/4xx/red)→ role="alert" message, actionable/retry.
 */
export interface MappedSeguimientoError {
  redirect?: true;
  refresh?: true;
  banner?: string;
}

export function mapSeguimientoError(
  result: Extract<ResponderResult, { ok: false }>,
): MappedSeguimientoError {
  switch (result.kind) {
    case "unauthorized":
      // 401 → treat as no session; the component redirects. No visible message.
      return { redirect: true };

    case "estado_cambiado":
      // 409 → actionable, refresh to reflect the real state (REQ-12).
      return { banner: copy.seguimiento.estadoCambiado, refresh: true };

    case "no_disponible":
      // 404 → inexistent or foreign; refresh + non-error message (REQ-13).
      return { banner: copy.seguimiento.noDisponible, refresh: true };

    case "forbidden":
      // 403 → prevented client-side by accionesPara (REQ-07); generic message.
      return { banner: copy.seguimiento.forbidden };

    case "validacion":
    case "network":
    case "server":
      // Transport / 5xx / unexpected → non-technical banner, retry (REQ-12).
      return { banner: copy.seguimiento.errorAccionar };

    default:
      return { banner: copy.seguimiento.errorAccionar };
  }
}

/**
 * Map a 422 reset body to inline/global messages. The only field-mappable
 * server rule is a short password → newPassword; anything else is a generic
 * global banner. (Confirm-mismatch is 100% client-side via zod.)
 */
export function mapResetValidation(
  body: BackendValidationError,
): { newPassword?: string; global?: string } {
  for (const msg of body.message ?? []) {
    if (typeof msg !== "string") continue;
    const firstToken = msg.trim().split(/[\s:]+/, 1)[0]?.toLowerCase() ?? "";
    if (firstToken === "newpassword" || firstToken === "password") {
      return { newPassword: copy.reset.passwordShort };
    }
  }
  return { global: copy.globalErrors.generic };
}
