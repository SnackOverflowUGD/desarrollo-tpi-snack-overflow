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
