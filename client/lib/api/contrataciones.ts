/**
 * Hiring request API client (ADR-07-03, REQ-05..11). Mirrors the discriminated
 * `*-Result` pattern of lib/api/auth.ts and lib/api/catalogo.ts: every HTTP
 * outcome maps to `{ ok:true, data } | { ok:false, kind }` and the function
 * NEVER throws for business 4xx.
 *
 * Transport: the browser POSTs to the SAME-ORIGIN relative path
 * `/api/contrataciones` (the Next Route Handler / BFF), which attaches the
 * session Bearer server-side. The token is NEVER visible to this layer (REQ-04).
 *
 * OCL invariants:
 *  - `crearSolicitud` NEVER throws for 4xx (only transport → 'network').
 *  - 201 ⇒ `{ ok:true, data.estado: 'solicitada' }`.
 *  - The payload NEVER includes `clienteId` — the backend derives it from the
 *    token. The `CrearContratacionPayload` type does not even declare it.
 *  - No `kind` exposes backend traces / internal detail (REQ-11).
 */
import type { BackendValidationError } from "@/lib/api/auth";

/**
 * EXACT mirror of the backend `CreateContratacionDto`. `clienteId` is
 * DELIBERATELY absent — the backend derives it from the session token (REQ-04).
 */
export interface CrearContratacionPayload {
  ubicacion: string;
  prestadorId: string; // UUID v4 from the profile context (not user-editable)
  fecha: string; // ISO date `YYYY-MM-DD`, today or future
  franja: string; // free text (curated set in copy; backend validates availability)
  descripcion: string;
}

/** EXACT mirror of the backend `ContratacionResponseDto` (HTTP 201). */
export interface ContratacionResponse {
  id: string;
  ubicacion: string;
  prestadorId: string;
  clienteId: string; // present in the RESPONSE (set by the backend), not the payload
  fecha: string;
  franja: string;
  descripcion: string;
  estado: "solicitada";
  createdAt: string;
}

/**
 * Discriminated result consumed by the form. Never thrown for business 4xx.
 * The `unauthorized` kind is the ONLY one the form treats as "no session"
 * (→ redirect to /login). `franja_ocupada` (409) is an EXPECTED concurrency
 * outcome (RF-4.2), not a system failure (REQ-09).
 */
export type CrearSolicitudResult =
  | { ok: true; data: ContratacionResponse } // 201
  | { ok: false; kind: "unauthorized" } // 401 → form redirects to /login?next=
  | { ok: false; kind: "forbidden" } // 403 (non-cliente; prevented client-side)
  | { ok: false; kind: "prestador_no_disponible" } // 404
  | { ok: false; kind: "franja_ocupada" } // 409 (expected, actionable)
  | { ok: false; kind: "fecha_invalida" } // 422 (date in the past)
  | { ok: false; kind: "validation"; raw: BackendValidationError } // 400
  | { ok: false; kind: "network" } // transport failure
  | { ok: false; kind: "server"; status: number }; // 5xx / 502 / unexpected

const ENDPOINT = "/api/contrataciones";

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Create a hiring request.
 *
 * Preconditions (caller-enforced via zod, ADR-07-05): all fields non-empty,
 * `fecha` today or future, `prestadorId` from the profile context.
 *
 * Postconditions (OCL / ADR-07-03): 201 → `{ ok:true, data }`; 401 →
 * 'unauthorized'; 403 → 'forbidden'; 404 → 'prestador_no_disponible'; 409 →
 * 'franja_ocupada'; 422 → 'fecha_invalida'; 400 → 'validation'; 5xx/502/other →
 * 'server'; transport failure → 'network'. Never throws for 4xx.
 */
export async function crearSolicitud(
  payload: CrearContratacionPayload,
): Promise<CrearSolicitudResult> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 201) {
    const data = (await safeJson(response)) as ContratacionResponse | null;
    if (!data || typeof data !== "object" || data.estado !== "solicitada") {
      // A 201 without a usable body is an unexpected server condition.
      return { ok: false, kind: "server", status: response.status };
    }
    return { ok: true, data };
  }

  if (response.status === 401) return { ok: false, kind: "unauthorized" };
  if (response.status === 403) return { ok: false, kind: "forbidden" };
  if (response.status === 404) {
    return { ok: false, kind: "prestador_no_disponible" };
  }
  if (response.status === 409) return { ok: false, kind: "franja_ocupada" };
  if (response.status === 422) return { ok: false, kind: "fecha_invalida" };

  if (response.status === 400) {
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

// ─────────────────────────────────────────────────────────────────────────────
// UC08 — Prestador inbox + responder (ADR-08-01/03, REQ-01/04..12).
// ─────────────────────────────────────────────────────────────────────────────

/** Estado strings shared by the backend enum (full set, for the read model). */
export type ContratacionEstado =
  | "solicitada"
  | "presupuestada"
  | "confirmada"
  | "cancelada"
  | "en_curso"
  | "finalizada";

/**
 * Mirror of the backend `ContratacionListItemDto` (GET /contrataciones,
 * enriched with `clienteNombre`; ADR-08-02). `createdAt` is a string over the
 * wire (JSON-serialized Date).
 */
export interface ContratacionListItem {
  id: string;
  ubicacion: string;
  prestadorId: string;
  clienteId: string;
  clienteNombre: string;
  prestadorNombre: string;
  fecha: string;
  franja: string;
  descripcion: string;
  fechaPropuesta?: string | null;
  franjaPropuesta?: string | null;
  precioEstimado?: number | null;
  estado: ContratacionEstado;
  createdAt: string;
}

/**
 * Mirror of the backend `SendProposalDto`. The contratación `id` travels in the
 * URL, NEVER in the payload (REQ-04); `prestadorId` is derived from the token.
 */
export interface SendProposalPayload {
  fecha: string; // ISO date `YYYY-MM-DD`, today or future
  franja: string;
  precioEstimado: number; // > 0
}

/** Discriminated result of `listarSolicitudes`. NEVER thrown for HTTP errors. */
export type ListarResult =
  | { ok: true; items: ContratacionListItem[] } // 200
  | { ok: false; kind: "unauthorized" } // 401 → redirect /login
  | { ok: false; kind: "network" } // transport failure
  | { ok: false; kind: "server"; status: number }; // 5xx / 502

/**
 * Discriminated result of `enviarPropuesta` / `rechazarSolicitud`. NEVER thrown
 * for business 4xx. `estado_cambiado` (409) is an EXPECTED concurrency outcome
 * (REQ-11), not a system failure.
 */
export type ResponderResult =
  | { ok: true; data: ContratacionListItem } // 200 (new estado)
  | { ok: false; kind: "unauthorized" } // 401 → redirect /login
  | { ok: false; kind: "forbidden" } // 403 (non-prestador; prevented)
  | { ok: false; kind: "no_disponible" } // 404 (inexistent or foreign)
  | { ok: false; kind: "estado_cambiado" } // 409 (concurrency, actionable)
  | { ok: false; kind: "validacion"; raw?: unknown } // 422 / 400
  | { ok: false; kind: "network" } // transport failure
  | { ok: false; kind: "server"; status: number }; // 5xx / 502

/**
 * List the authenticated user's contrataciones (REQ-01). The backend filters by
 * the token (prestadorId for a PRESTADOR); only `?estado=` is forwarded.
 *
 * Postconditions (OCL): 200 → `{ ok:true, items }`; 401 → 'unauthorized';
 * 5xx/502 → 'server'; transport failure → 'network'. NEVER throws.
 */
export async function listarSolicitudes(
  filtros?: { estado?: string },
): Promise<ListarResult> {
  const qs =
    filtros?.estado != null && filtros.estado !== ""
      ? `?estado=${encodeURIComponent(filtros.estado)}`
      : "";

  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}${qs}`, { method: "GET" });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 200) {
    const data = (await safeJson(response)) as ContratacionListItem[] | null;
    if (!Array.isArray(data)) {
      return { ok: false, kind: "server", status: response.status };
    }
    return { ok: true, items: data };
  }

  if (response.status === 401) return { ok: false, kind: "unauthorized" };

  // 5xx, 502, or any other unexpected status.
  return { ok: false, kind: "server", status: response.status };
}

/**
 * Shared mapper for proposal/reject responses — both endpoints return the same
 * status surface and a `ContratacionListItemDto`-shaped body on 200.
 */
function mapResponder(
  response: Response,
  data: unknown,
): ResponderResult {
  if (response.status === 200) {
    const item = data as ContratacionListItem | null;
    if (!item || typeof item !== "object" || typeof item.estado !== "string") {
      return { ok: false, kind: "server", status: response.status };
    }
    return { ok: true, data: item };
  }

  if (response.status === 401) return { ok: false, kind: "unauthorized" };
  if (response.status === 403) return { ok: false, kind: "forbidden" };
  if (response.status === 404) return { ok: false, kind: "no_disponible" };
  if (response.status === 409) return { ok: false, kind: "estado_cambiado" };
  if (response.status === 422 || response.status === 400) {
    return { ok: false, kind: "validacion", raw: data ?? undefined };
  }

  // 5xx, 502, or any other status.
  return { ok: false, kind: "server", status: response.status };
}

/**
 * Send a proposal for a contratación (REQ-04/05). `id` goes in the URL; the
 * payload NEVER carries `id`/`prestadorId`.
 *
 * Postconditions (OCL): 200 → `{ ok:true, data }`; 401 → 'unauthorized'; 403 →
 * 'forbidden'; 404 → 'no_disponible'; 409 → 'estado_cambiado'; 422/400 →
 * 'validacion'; 5xx/502 → 'server'; transport → 'network'. NEVER throws for 4xx.
 */
export async function enviarPropuesta(
  id: string,
  payload: SendProposalPayload,
): Promise<ResponderResult> {
  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}/${id}/proposal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  return mapResponder(response, await safeJson(response));
}

/**
 * Reject a contratación (REQ-06). No body — the backend processes the intent.
 *
 * Postconditions (OCL): same status surface as `enviarPropuesta`. NEVER throws.
 */
export async function rechazarSolicitud(
  id: string,
): Promise<ResponderResult> {
  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}/${id}/reject`, { method: "POST" });
  } catch {
    return { ok: false, kind: "network" };
  }

  return mapResponder(response, await safeJson(response));
}

// ─────────────────────────────────────────────────────────────────────────────
// UC09 — state transitions (ADR-09-01, REQ-01..04/07..13). Each function POSTs
// to a same-origin BFF Route Handler with the `id` in the URL and NO body — the
// backend derives the participant from the token (REQ-10). All reuse
// `mapResponder` and NEVER throw for business 4xx (OCL §Testing).
// ─────────────────────────────────────────────────────────────────────────────

/** Shared no-body POST → mapResponder for the 4 UC09 transitions. */
async function postTransicion(
  id: string,
  verbo: "confirm" | "start" | "finish" | "cancel",
): Promise<ResponderResult> {
  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}/${id}/${verbo}`, { method: "POST" });
  } catch {
    return { ok: false, kind: "network" };
  }

  return mapResponder(response, await safeJson(response));
}

/** Confirm a proposal (cliente, presupuestada → confirmada). REQ-01. */
export async function confirmar(id: string): Promise<ResponderResult> {
  return postTransicion(id, "confirm");
}

/** Start work (prestador, confirmada → en_curso). REQ-02. */
export async function iniciar(id: string): Promise<ResponderResult> {
  return postTransicion(id, "start");
}

/** Finish service (prestador, en_curso → finalizada). REQ-03. */
export async function finalizar(id: string): Promise<ResponderResult> {
  return postTransicion(id, "finish");
}

/** Cancel (cliente or prestador participant, active → cancelada). REQ-04. */
export async function cancelar(id: string): Promise<ResponderResult> {
  return postTransicion(id, "cancel");
}

// ─────────────────────────────────────────────────────────────────────────────
// UC09 — detail + state timeline (GET /contrataciones/:id). Read-only drill-in
// over the SAME-ORIGIN BFF Route Handler; never throws for business 4xx.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * One state-change timeline entry. Mirror of the backend
 * `ContratacionHistorialItem`. `timestamp` is an ISO string over the wire.
 */
export interface ContratacionHistorialItem {
  estadoAnterior: ContratacionEstado | null;
  estadoNuevo: ContratacionEstado;
  timestamp: string;
}

/**
 * Mirror of the backend `ContratacionDetailDto`: the contratación shape plus the
 * enriched `clienteNombre`/`prestadorNombre` and the chronological `historial`.
 */
export interface ContratacionDetail {
  id: string;
  ubicacion: string;
  prestadorId: string;
  prestadorNombre: string;
  clienteId: string;
  clienteNombre: string;
  fecha: string;
  franja: string;
  descripcion: string;
  fechaPropuesta?: string | null;
  franjaPropuesta?: string | null;
  precioEstimado?: number | null;
  estado: ContratacionEstado;
  createdAt: string;
  historial: ContratacionHistorialItem[];
}

/** Discriminated result of `obtenerDetalle`. NEVER thrown for HTTP errors. */
export type DetalleResult =
  | { ok: true; data: ContratacionDetail } // 200
  | { ok: false; kind: "unauthorized" } // 401 → redirect /login
  | { ok: false; kind: "no_disponible" } // 404 (inexistent or foreign)
  | { ok: false; kind: "network" } // transport failure
  | { ok: false; kind: "server"; status: number }; // 5xx / 502

/**
 * Fetch a contratación detail + state timeline (UC09 drill-in). The `id` travels
 * in the URL; the backend enforces the participant guard (404 if foreign).
 *
 * Postconditions (OCL): 200 → `{ ok:true, data }`; 401 → 'unauthorized'; 404 →
 * 'no_disponible'; 5xx/502 → 'server'; transport → 'network'. NEVER throws.
 */
export async function obtenerDetalle(id: string): Promise<DetalleResult> {
  let response: Response;
  try {
    response = await fetch(`${ENDPOINT}/${id}`, { method: "GET" });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 200) {
    const data = (await safeJson(response)) as ContratacionDetail | null;
    if (
      !data ||
      typeof data !== "object" ||
      typeof data.estado !== "string" ||
      !Array.isArray(data.historial)
    ) {
      return { ok: false, kind: "server", status: response.status };
    }
    return { ok: true, data };
  }

  if (response.status === 401) return { ok: false, kind: "unauthorized" };
  if (response.status === 404) return { ok: false, kind: "no_disponible" };

  // 5xx, 502, or any other unexpected status.
  return { ok: false, kind: "server", status: response.status };
}
