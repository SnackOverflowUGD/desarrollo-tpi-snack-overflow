/**
 * Registration API client. Mirrors the EXACT backend contract for
 * POST /auth/register and maps every HTTP outcome to a discriminated
 * `RegisterResult` so the form layer can map to UI without ever catching
 * thrown errors for business 4xx (design §3, OCL Q6).
 *
 * Transport: the browser POSTs to the SAME-ORIGIN relative path
 * `/api/auth/register`, which Next rewrites to the backend (next.config.ts).
 * No NEXT_PUBLIC_API_URL and no CORS needed.
 */

export type Role = "cliente" | "prestador";

export interface RegisterPayload {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string; // 8..128
  role: Role;
  trade?: string; // present ONLY when role === 'prestador'
}

export interface RegisterSuccess {
  // HTTP 201
  id: string;
  email: string;
  role: "cliente" | "prestador" | "administrador";
  status: "activo" | "suspendido";
  providerStatus: "habilitado" | "pendiente_habilitacion" | null;
  message: string;
}

export interface BackendValidationError {
  // HTTP 422
  statusCode: 422;
  message: string[]; // one entry per broken rule (class-validator)
  error: "Unprocessable Entity";
}

export interface BackendConflictError {
  // HTTP 409
  statusCode?: 409;
  message: string; // "An account with this email already exists."
  error?: "Conflict";
}

export interface BackendBadRequest {
  // HTTP 400 (e.g. prestador sin trade reaching the server)
  statusCode?: 400;
  message: string | string[];
  error?: "Bad Request";
}

/**
 * Discriminated result consumed by the form. Never thrown for business 4xx;
 * only transport failures yield `kind: 'network'`.
 */
export type RegisterResult =
  | { ok: true; data: RegisterSuccess }
  | { ok: false; kind: "validation"; raw: BackendValidationError }
  | { ok: false; kind: "conflict"; raw: BackendConflictError }
  | { ok: false; kind: "bad_request"; raw: BackendBadRequest }
  | { ok: false; kind: "network" }
  | { ok: false; kind: "server"; status: number };

const REGISTER_ENDPOINT = "/api/auth/register";

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Register a new user.
 *
 * Preconditions (caller-enforced via zod, design §9):
 *  - payload.role ∈ {'cliente','prestador'}
 *  - role === 'prestador'  ⇒ payload.trade is a non-empty string
 *  - role === 'cliente'    ⇒ payload.trade key is absent
 *  - 8 <= payload.password.length <= 128
 *
 * Postconditions: returns a `RegisterResult`; never throws for 4xx; HTTP 201
 * maps to `{ ok: true }`, 422 → 'validation', 409 → 'conflict', 400 →
 * 'bad_request', 5xx/unexpected → 'server', transport failure → 'network'.
 */
export async function registerUser(
  payload: RegisterPayload,
): Promise<RegisterResult> {
  let response: Response;
  try {
    response = await fetch(REGISTER_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 201) {
    const data = (await safeJson(response)) as RegisterSuccess | null;
    if (!data) return { ok: false, kind: "server", status: response.status };
    return { ok: true, data };
  }

  if (response.status === 422) {
    const raw = (await safeJson(response)) as BackendValidationError | null;
    return {
      ok: false,
      kind: "validation",
      raw: raw ?? { statusCode: 422, message: [], error: "Unprocessable Entity" },
    };
  }

  if (response.status === 409) {
    const raw = (await safeJson(response)) as BackendConflictError | null;
    return {
      ok: false,
      kind: "conflict",
      raw: raw ?? { message: "An account with this email already exists." },
    };
  }

  if (response.status === 400) {
    const raw = (await safeJson(response)) as BackendBadRequest | null;
    return {
      ok: false,
      kind: "bad_request",
      raw: raw ?? { message: "Bad Request" },
    };
  }

  // 5xx or any other unexpected status.
  return { ok: false, kind: "server", status: response.status };
}

// ─────────────────────────────────────────────────────────────────────────────
// UC02 — Login + password recovery (design §3, ADR-UC02-04). Mirrors the
// `RegisterResult` pattern: discriminated results, never thrown for business
// 4xx. `loginUser` talks to the Next Route Handler (which owns the cookie);
// forgot/reset use the blind same-origin rewrite (stateless, no cookie).
// ─────────────────────────────────────────────────────────────────────────────

// ── Login ────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Discriminated login result. The success case carries NO token — the
 * accessToken lives in the httpOnly cookie set by the Route Handler (OCL Q1).
 * No error kind reveals which credential field failed (anti-enum, OCL Q7).
 */
export type LoginResult =
  | { ok: true } // 200 (cookie set by /api/auth/login)
  | { ok: false; kind: "invalid_credentials" } // 401
  | { ok: false; kind: "suspended" } // 403
  | { ok: false; kind: "locked" } // 423
  | { ok: false; kind: "validation"; raw: BackendValidationError } // 422
  | { ok: false; kind: "network" } // transport failed
  | { ok: false; kind: "server"; status: number }; // 5xx / 502 / unexpected

// The login form fetches the Next Route Handler, NOT the rewrite. The handler
// sets the cookie and returns 200 { ok:true } without the token.
const LOGIN_ENDPOINT = "/api/auth/login";

/**
 * Authenticate a user.
 *
 * Preconditions (caller-enforced via zod, design §9):
 *  - payload.email is a non-empty string
 *  - payload.password is a non-empty string
 *
 * Postconditions (OCL §9): 200 → { ok:true } (no token); 401 →
 * 'invalid_credentials'; 403 → 'suspended'; 423 → 'locked'; 422 → 'validation';
 * 5xx/502/other → 'server'; transport failure → 'network'. Never throws for 4xx.
 */
export async function loginUser(payload: LoginPayload): Promise<LoginResult> {
  let response: Response;
  try {
    response = await fetch(LOGIN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 200) {
    // The token is NOT in the body — the cookie is already set server-side.
    return { ok: true };
  }

  if (response.status === 401) return { ok: false, kind: "invalid_credentials" };
  if (response.status === 403) return { ok: false, kind: "suspended" };
  if (response.status === 423) return { ok: false, kind: "locked" };

  if (response.status === 422) {
    const raw = (await safeJson(response)) as BackendValidationError | null;
    return {
      ok: false,
      kind: "validation",
      raw: raw ?? { statusCode: 422, message: [], error: "Unprocessable Entity" },
    };
  }

  // 5xx, 502 (handler→backend transport failure), or any other status.
  return { ok: false, kind: "server", status: response.status };
}

// ── Forgot password (always 200, anti-enumeration) ───────────────────────────
export interface ForgotPayload {
  email: string;
}

export type ForgotResult =
  | { ok: true } // any 2xx — never reveals if the email exists
  | { ok: false; kind: "network" }
  | { ok: false; kind: "server"; status: number };

// Stateless: uses the blind rewrite → backend (no cookie to set).
const FORGOT_ENDPOINT = "/api/auth/forgot-password";

/**
 * Request a password-reset link. The backend ALWAYS returns 200 (anti-enum,
 * RN-AUTH-05). Postconditions (OCL §9): any 2xx → { ok:true }; transport
 * failure → 'network'; 5xx → 'server'. Never distinguishes email existence.
 */
export async function requestPasswordReset(
  payload: ForgotPayload,
): Promise<ForgotResult> {
  let response: Response;
  try {
    response = await fetch(FORGOT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status >= 200 && response.status < 300) {
    return { ok: true };
  }

  return { ok: false, kind: "server", status: response.status };
}

// ── Reset password (with token) ──────────────────────────────────────────────
export interface ResetPayload {
  token: string;
  newPassword: string; // min 8 (validated client + server)
}

export type ResetResult =
  | { ok: true } // 200
  | { ok: false; kind: "invalid_token" } // 400/404/410 token expired/used
  | { ok: false; kind: "validation"; raw: BackendValidationError } // 422
  | { ok: false; kind: "network" }
  | { ok: false; kind: "server"; status: number };

// Stateless: uses the blind rewrite → backend.
const RESET_ENDPOINT = "/api/auth/reset-password";

/**
 * Set a new password using a one-time token.
 *
 * Preconditions (design §9): payload.token non-empty; payload.newPassword
 * length >= 8. Postconditions: 200 → { ok:true }; 400/404/410 → 'invalid_token';
 * 422 → 'validation'; 5xx/other → 'server'; transport failure → 'network'.
 */
export async function resetPassword(
  payload: ResetPayload,
): Promise<ResetResult> {
  let response: Response;
  try {
    response = await fetch(RESET_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 200) return { ok: true };

  // Token expired / already used / not found.
  if (
    response.status === 400 ||
    response.status === 404 ||
    response.status === 410
  ) {
    return { ok: false, kind: "invalid_token" };
  }

  if (response.status === 422) {
    const raw = (await safeJson(response)) as BackendValidationError | null;
    return {
      ok: false,
      kind: "validation",
      raw: raw ?? { statusCode: 422, message: [], error: "Unprocessable Entity" },
    };
  }

  return { ok: false, kind: "server", status: response.status };
}
