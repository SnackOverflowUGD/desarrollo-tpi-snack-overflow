/**
 * Prestador self-management API client (PSM-REQ-01..08). Mirrors the
 * discriminated `*-Result` pattern of lib/api/contrataciones.ts and
 * lib/api/auth.ts: every HTTP outcome maps to `{ ok:true, data } | { ok:false,
 * kind }` and the functions NEVER throw for business 4xx.
 *
 * Transport: the browser calls the SAME-ORIGIN relative paths under
 * `/api/prestadores/me*` (the Next Route Handlers / BFF), which attach the
 * session Bearer server-side (cookie→Bearer). The token is NEVER visible to
 * this layer. The prestador is addressed by the JWT `sub` only — no id ever
 * travels in the path for the profile, and servicio ids travel in the URL, not
 * the payload.
 */

/** Availability state — EXACT mirror of the backend `DisponibilidadEstado`. */
export type DisponibilidadEstado =
  | "disponible_esta_semana"
  | "proxima_disponible"
  | "sin_disponibilidad";

/** Mirror of the stored `disponibilidadResumen` jsonb shape. */
export interface DisponibilidadResumen {
  estado: DisponibilidadEstado;
  proximaFecha?: string;
  franjasDisponiblesProximos7Dias?: number;
}

/**
 * A servicio as seen by its OWNER (self-management view) — includes the
 * `visible` flag and hidden servicios, unlike the public `Servicio`. EXACT
 * mirror of the backend `MiPerfilServicioDto`.
 */
export interface MiServicio {
  id: string;
  categoria: string;
  descripcion: string;
  rangoPrecioMin: number | null;
  rangoPrecioMax: number | null;
  visible: boolean;
}

/**
 * The authenticated prestador's own profile — EXACT mirror of the backend
 * `MiPerfilDto`. Carries the editable fields plus the app-owned publish flag
 * and ALL servicios (including hidden ones). `zonaCobertura` is an opaque
 * server-owned polygon shape (regenerated in-service on localidad change); the
 * client never constructs it, so it is typed as `unknown`.
 */
export interface MiPerfil {
  id: string;
  nombreCompleto: string;
  categoria: string;
  oficios: string[];
  localidad: string | null;
  zonaCobertura: unknown | null;
  disponibilidadResumen: DisponibilidadResumen | null;
  visible: boolean;
  tieneServiciosPublicados: boolean;
  servicios: MiServicio[];
}

/**
 * PATCH /prestadores/me payload — EXACT mirror of the backend
 * `ActualizarPerfilDto`. All keys optional (PATCH); the service applies only
 * the keys present and regenerates `zonaCobertura` when `localidad` changes.
 */
export interface ActualizarPerfilPayload {
  oficios?: string[];
  categoria?: string;
  localidad?: string;
  disponibilidadResumen?: DisponibilidadResumen;
  visible?: boolean;
}

/** Discriminated result of `getProfile`. NEVER thrown for HTTP errors. */
export type MiPerfilResult =
  | { ok: true; data: MiPerfil } // 200
  | { ok: false; kind: "unauthorized" } // 401 → redirect /login
  | { ok: false; kind: "forbidden" } // 403 (non-prestador role)
  | { ok: false; kind: "network" } // transport failure
  | { ok: false; kind: "server"; status: number }; // 5xx / 502 / invalid body

/**
 * Discriminated result of `updateProfile`. NEVER thrown for business 4xx.
 * `validation` (400) covers BOTH an unknown localidad (rejected by
 * `getCoordsForLocalidad`) and an invalid enum/shape (class-validator) — the
 * form restricts inputs to valid values, so a 400 is a safety-net banner.
 */
export type ActualizarPerfilResult =
  | { ok: true; data: MiPerfil } // 200
  | { ok: false; kind: "unauthorized" } // 401
  | { ok: false; kind: "forbidden" } // 403
  | { ok: false; kind: "validation"; raw: unknown } // 400 (unknown localidad / bad enum)
  | { ok: false; kind: "network" } // transport failure
  | { ok: false; kind: "server"; status: number }; // 5xx / 502 / unexpected

const ENDPOINT = "/api/prestadores/me";

async function safeJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** Minimal structural guard for a MiPerfil body (never trust a 2xx blindly). */
function isMiPerfil(body: unknown): body is MiPerfil {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return typeof b.id === "string" && Array.isArray(b.servicios);
}

/**
 * Read the authenticated prestador's own profile (PSM-REQ-01).
 *
 * Postconditions (OCL): 200 with valid shape → `{ ok:true, data }`; 401 →
 * 'unauthorized'; 403 → 'forbidden'; 5xx/502/invalid body → 'server'; transport
 * failure → 'network'. NEVER throws.
 */
export async function getProfile(): Promise<MiPerfilResult> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, { method: "GET" });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 200) {
    const body = await safeJson(response);
    if (!isMiPerfil(body)) {
      return { ok: false, kind: "server", status: response.status };
    }
    return { ok: true, data: body };
  }

  if (response.status === 401) return { ok: false, kind: "unauthorized" };
  if (response.status === 403) return { ok: false, kind: "forbidden" };

  return { ok: false, kind: "server", status: response.status };
}

/**
 * Update the authenticated prestador's own profile (PSM-REQ-02/03/04).
 *
 * Postconditions (OCL): 200 → `{ ok:true, data }`; 401 → 'unauthorized'; 403 →
 * 'forbidden'; 400 → 'validation' (carries raw); 5xx/502/other → 'server';
 * transport → 'network'. NEVER throws for 4xx.
 */
export async function updateProfile(
  payload: ActualizarPerfilPayload,
): Promise<ActualizarPerfilResult> {
  let response: Response;
  try {
    response = await fetch(ENDPOINT, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 200) {
    const body = await safeJson(response);
    if (!isMiPerfil(body)) {
      return { ok: false, kind: "server", status: response.status };
    }
    return { ok: true, data: body };
  }

  if (response.status === 401) return { ok: false, kind: "unauthorized" };
  if (response.status === 403) return { ok: false, kind: "forbidden" };
  if (response.status === 400) {
    return { ok: false, kind: "validation", raw: await safeJson(response) };
  }

  return { ok: false, kind: "server", status: response.status };
}

// ─────────────────────────────────────────────────────────────────────────────
// PSM-REQ-05..08 — servicio CRUD over the /api/prestadores/me/servicios* BFF.
// Ownership is enforced server-side (404 on a foreign servicio); soft-delete
// (archivar) is a DELETE that sets visible=false and returns 204. `prestadorId`
// is NEVER sent — the backend derives it from the token; the servicio `id`
// travels in the URL, never the payload.
// ─────────────────────────────────────────────────────────────────────────────

/** POST /prestadores/me/servicios payload — mirror of `CrearServicioDto`. */
export interface CrearServicioPayload {
  categoria: string;
  descripcion: string;
  rangoPrecioMin?: number | null;
  rangoPrecioMax?: number | null;
  visible?: boolean;
}

/** PATCH payload — mirror of `ActualizarServicioDto` (all optional). */
export interface ActualizarServicioPayload {
  categoria?: string;
  descripcion?: string;
  rangoPrecioMin?: number | null;
  rangoPrecioMax?: number | null;
  visible?: boolean;
}

/** Discriminated result of `crearServicio`. NEVER thrown for business 4xx. */
export type CrearServicioResult =
  | { ok: true; data: MiServicio } // 201
  | { ok: false; kind: "unauthorized" } // 401
  | { ok: false; kind: "forbidden" } // 403
  | { ok: false; kind: "validation"; raw: unknown } // 400 (invalid price range/shape)
  | { ok: false; kind: "network" }
  | { ok: false; kind: "server"; status: number };

/** Discriminated result of `actualizarServicio`. NEVER thrown for business 4xx. */
export type ActualizarServicioResult =
  | { ok: true; data: MiServicio } // 200
  | { ok: false; kind: "unauthorized" } // 401
  | { ok: false; kind: "forbidden" } // 403
  | { ok: false; kind: "no_disponible" } // 404 (inexistent or foreign — ownership)
  | { ok: false; kind: "validation"; raw: unknown } // 400
  | { ok: false; kind: "network" }
  | { ok: false; kind: "server"; status: number };

/** Discriminated result of `eliminarServicio` (soft delete). NEVER thrown. */
export type EliminarServicioResult =
  | { ok: true } // 204
  | { ok: false; kind: "unauthorized" } // 401
  | { ok: false; kind: "forbidden" } // 403
  | { ok: false; kind: "no_disponible" } // 404 (inexistent or foreign)
  | { ok: false; kind: "network" }
  | { ok: false; kind: "server"; status: number };

const SERVICIOS_ENDPOINT = "/api/prestadores/me/servicios";

/** Minimal structural guard for a MiServicio body. */
function isMiServicio(body: unknown): body is MiServicio {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return typeof b.id === "string" && typeof b.visible === "boolean";
}

/**
 * Create a servicio on the authenticated prestador's own profile (PSM-REQ-05).
 *
 * Postconditions (OCL): 201 → `{ ok:true, data }`; 401 → 'unauthorized'; 403 →
 * 'forbidden'; 400 → 'validation'; 5xx/502/other → 'server'; transport →
 * 'network'. NEVER throws for 4xx.
 */
export async function crearServicio(
  payload: CrearServicioPayload,
): Promise<CrearServicioResult> {
  let response: Response;
  try {
    response = await fetch(SERVICIOS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 201) {
    const body = await safeJson(response);
    if (!isMiServicio(body)) {
      return { ok: false, kind: "server", status: response.status };
    }
    return { ok: true, data: body };
  }

  if (response.status === 401) return { ok: false, kind: "unauthorized" };
  if (response.status === 403) return { ok: false, kind: "forbidden" };
  if (response.status === 400) {
    return { ok: false, kind: "validation", raw: await safeJson(response) };
  }

  return { ok: false, kind: "server", status: response.status };
}

/**
 * Update a servicio owned by the authenticated prestador (PSM-REQ-06/07). Also
 * the publish/hide toggle (`{ visible }`). Ownership is enforced server-side.
 *
 * Postconditions (OCL): 200 → `{ ok:true, data }`; 401 → 'unauthorized'; 403 →
 * 'forbidden'; 404 → 'no_disponible'; 400 → 'validation'; 5xx/502 → 'server';
 * transport → 'network'. NEVER throws for 4xx.
 */
export async function actualizarServicio(
  id: string,
  payload: ActualizarServicioPayload,
): Promise<ActualizarServicioResult> {
  let response: Response;
  try {
    response = await fetch(`${SERVICIOS_ENDPOINT}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 200) {
    const body = await safeJson(response);
    if (!isMiServicio(body)) {
      return { ok: false, kind: "server", status: response.status };
    }
    return { ok: true, data: body };
  }

  if (response.status === 401) return { ok: false, kind: "unauthorized" };
  if (response.status === 403) return { ok: false, kind: "forbidden" };
  if (response.status === 404) return { ok: false, kind: "no_disponible" };
  if (response.status === 400) {
    return { ok: false, kind: "validation", raw: await safeJson(response) };
  }

  return { ok: false, kind: "server", status: response.status };
}

/**
 * Soft-delete (archivar) a servicio owned by the authenticated prestador
 * (PSM-REQ-08): the backend sets `visible=false` and returns 204 (the row is
 * preserved and re-publishable). Ownership is enforced server-side.
 *
 * Postconditions (OCL): 204 → `{ ok:true }`; 401 → 'unauthorized'; 403 →
 * 'forbidden'; 404 → 'no_disponible'; 5xx/502 → 'server'; transport →
 * 'network'. NEVER throws for 4xx.
 */
export async function eliminarServicio(
  id: string,
): Promise<EliminarServicioResult> {
  let response: Response;
  try {
    response = await fetch(`${SERVICIOS_ENDPOINT}/${id}`, { method: "DELETE" });
  } catch {
    return { ok: false, kind: "network" };
  }

  if (response.status === 204 || response.status === 200) {
    return { ok: true };
  }

  if (response.status === 401) return { ok: false, kind: "unauthorized" };
  if (response.status === 403) return { ok: false, kind: "forbidden" };
  if (response.status === 404) return { ok: false, kind: "no_disponible" };

  return { ok: false, kind: "server", status: response.status };
}
