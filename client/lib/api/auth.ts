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
