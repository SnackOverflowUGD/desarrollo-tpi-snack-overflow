# Design — MI-07.2 UI Solicitar contratación (UC07)

> **Fase:** Diseño (SDD 1.2). Deriva del `spec.md` aprobado, del `client/DESIGN-SYSTEM.md` y de los
> **precedentes directos** `uc02-ui-login/design.md` (cookie httpOnly `so_session`, Route Handler que
> traduce body→cookie, `proxy.ts` de protección de rutas, `SessionProvider`/`useSession`) y
> `uc04-ui-busqueda-perfil/design.md` (patrón `*-Result` discriminado, SSR, el `<SolicitarCta/>` placeholder
> que esta WI activa). NO contiene código de producción: firmas, tipos y estructura prescriptiva.
>
> **Stack verificado (igual UC01/02/04):** Next.js 16.2.9 (App Router) · React 19.2.4 · Tailwind v4 · TS
> strict · alias `@/*` → `client/` · RHF 7.79 + zod 4.4 (instalados) · vitest 4.1 (unit) · Playwright 1.60
> (E2E). Breaking Next 16: `params`/`searchParams` son **Promises**; `cookies()` async; el archivo de
> protección de rutas se llama **`proxy.ts`** (no `middleware.ts`), runtime Node por defecto.
>
> **Trazabilidad:** UC07 · RF-6.1 · RF-4.2 · RU-C.3 · RN-AUTH-06 · RNF-S.1/S.4 · spec REQ-01..REQ-14 ·
> ESC-UI-01..07 · contrato `POST /contrataciones`.

---

## Technical Approach

Esta WI activa el `<SolicitarCta/>` placeholder de UC04 y agrega la **primera mutación autenticada de la
app**. El problema central: el backend lee `Authorization: Bearer` pero el token vive en la cookie httpOnly
`so_session` (JS no la lee — precedente UC02). El rewrite ciego `/api/:path*` de `next.config.ts` reenvía la
respuesta pero **no puede leer la cookie ni agregar headers**. Por eso introducimos una **abstracción
server-side reusable** (`lib/server/backend-fetch.ts`) que lee la cookie, arma el Bearer y reenvía al
backend; un **Route Handler genérico** la usa para `POST /contrataciones`. El form (client) llama al Route
Handler same-origin con el patrón `{ok,kind}` discriminado ya establecido. Este patrón es el precedente para
**toda** llamada autenticada futura (MI-08.2 transiciones, MI-09.3 listado).

---

## Architecture Decisions (ADRs)

### ADR-07-01 — auth-forwarding: **`backendFetch` server-side + Route Handler (BFF)** [CENTRAL]

**Choice**: helper `backendFetch(path, init)` en `lib/server/backend-fetch.ts` (`server-only`) que lee
`readSessionToken()`, valida `!isExpired`, agrega `Authorization: Bearer <token>` y hace
`fetch(BACKEND_URL + path, …, cache:'no-store')`. Si no hay token o expiró → devuelve un sentinel
`{ unauthorized: true }` SIN llamar al backend. Lo consumen **Route Handlers** de Next (ej.
`app/api/contrataciones/route.ts`), que el client invoca same-origin con `fetch`.

**Alternatives considered**: (B) Server Actions que leen la cookie y llaman al backend. (C) extender el
rewrite ciego.

**Rationale**:
- (C) imposible: el rewrite es transparente, no ejecuta código → no lee cookie ni setea headers. Descartado.
- (A) vs (B): elegimos (A) por **consistencia con el modelo mental del proyecto** — el form hace
  `fetch('/api/...')` y el Verificador mockea `fetch`/`page.route()` (idéntico a UC01/02/04, ADR-UC02-02).
  Server Actions atan el form a un binding RSC más difícil de mockear en unit/E2E. El **helper** `backendFetch`
  es la pieza reusable: 08.2/09.3 hacen GET/PATCH autenticados reusándolo (un Route Handler delgado por
  recurso). El handler centraliza el mapeo de status (ver ADR-07-03), el helper centraliza el Bearer.
- **Seguridad (RNF-S.1/S.4):** el token nunca entra al bundle; viaja server→server. `backendFetch` es
  `server-only` (importarlo desde un client component es build error).

> **Impacto observable (para el gate):** el cliente nunca ve el token; llama a `/api/contrataciones`; un
> helper server-side lee la cookie httpOnly, arma el Bearer y reenvía al backend; 401/expiración → el cliente
> redirige a `/login?next=`; el resto de los status se mapean a resultado discriminado para el form.

### ADR-07-02 — Dónde vive el form: **ruta dedicada protegida `app/(protegido)/prestadores/[id]/solicitar`**

**Choice**: pantalla dedicada (no modal). Se crea un route group `(protegido)` y se **amplía el matcher de
`proxy.ts`** para incluir `/prestadores/:id/solicitar`. El `prestadorId` sale de `params`. El listado/perfil
público de UC04 (`/prestadores`, `/prestadores/:id`) sigue **fuera** del matcher.

**Alternatives considered**: modal sobre el perfil; ruta sin proteger (solo guard client).

**Rationale**:
- La acción **requiere sesión** (REQ-04); proteger en `proxy.ts` da SSR-safe redirect a `/login?next=` sin
  flash y sin guard client parpadeante (mismo razonamiento que UC02). Un anónimo que abra el deep-link
  `/prestadores/x/solicitar` es redirigido en el edge antes de pintar.
- Ruta > modal: la spec exige preservar el destino para retomar tras login (REQ-04/06) y mantenerse en ≤5
  pasos (REQ-14) — una URL es bookmarkeable y `next`-able; un modal no tiene URL propia para `next`.
- **`proxy.ts` AMPLIADO:** hoy `matcher: ["/cuenta/:path*"]`. Se agrega `"/prestadores/:id/solicitar"`. El
  matcher de Next NO soporta sufijo literal tras `:param` de forma robusta para excluir el padre, así que se
  usa el patrón explícito de dos entradas: `["/cuenta/:path*", "/prestadores/:id/solicitar"]`. El perfil
  público `/prestadores/:id` NO matchea (no termina en `/solicitar`).

### ADR-07-03 — Mapeo de status: **401→redirect, resto→resultado discriminado al form**

**Choice**: el Route Handler reenvía status+body del backend; `lib/api/contrataciones.ts` (client) los mapea
a `CrearSolicitudResult` discriminado. El **401** (token ausente/expirado, sea por el sentinel del helper o
por el backend) es el único que el form trata como "sin sesión" → `router.push('/login?next=…')`. 403/404/
409/422/400 → `kind` que el form mapea a UX inline/banner sin perder datos.

**Alternatives considered**: lanzar excepciones; tratar 409 como error genérico.

**Rationale**: espeja `loginUser`/`buscarPrestadores` (nunca throw para 4xx). El 409 es **esperado por
concurrencia** (RF-4.2) → `kind:'franja_ocupada'` accionable, conserva datos, permite reseleccionar franja
(REQ-09). El 403 está prevenido en cliente (REQ-01) → es defensa de último recurso.

### ADR-07-04 — CTA gobernado por sesión/rol: **`useSession()` en el client CTA**

**Choice**: `<SolicitarCta/>` (ya `'use client'`) lee `useSession()` → `{status, user?.role}` (hidratado
server-side, sin flash). Tres ramas (REQ-01): `cliente`+auth → `router.push('/prestadores/{id}/solicitar')`;
anónimo → `router.push('/login?next=/prestadores/{id}/solicitar')`; `prestador` → CTA deshabilitado con
explicación accesible (`copy` 403, `aria-disabled` + texto perceptible por SR).

**Rationale**: `useSession` ya expone `role` decodificado del JWT (decorativo, no autorización). La defensa
real es el backend 403 + el `proxy.ts` (sesión) — el rol en cliente solo gobierna la UI. NO se confía en el
claim para autorizar.

### ADR-07-05 — Validación cliente: **zod (fecha ≥ hoy + requeridos), espejo del patrón validation**

**Choice**: `lib/validation/solicitud.ts` con zod: `ubicacion`/`franja`/`descripcion` `trim().min(1)`,
`fecha` ISO date con `refine(fecha >= hoy)` comparando en local date (no datetime). El `<input type="date">`
fija `min={hoyISO}`. Bloquea submit sin HTTP (REQ-03), previene 400/422.

**Rationale**: idéntico a `login.ts`/`busqueda.ts`. La comparación de fecha es función pura testeable
(`esFechaValida(iso, hoy)`), aislada para no depender de `Date.now()` en tests.

---

## Data Flow

```
<SolicitarCta/> (client, useSession)
   │ cliente+auth → router.push
   ▼
app/(protegido)/prestadores/[id]/solicitar/page.tsx (Server, await params.id)
   │  proxy.ts ya garantizó sesión (sino redirect /login?next=)
   ▼
<SolicitudForm prestadorId={id}/> (client, RHF+zod)
   │ submit → crearSolicitud(payload)   [lib/api/contrataciones.ts]
   ▼  fetch('/api/contrataciones')                         (same-origin)
app/api/contrataciones/route.ts  ──→  backendFetch('/contrataciones', {POST, body})
   │                                      │ lee cookie so_session → Bearer
   │                                      ▼
   │                                   BACKEND POST /contrataciones
   │  201/403/404/409/422/400 ← reenvía status+body        401 ← sentinel|backend
   ▼
CrearSolicitudResult {ok,kind} → form mapea a UX
   201 → toast role=status + bloqueo + volver al perfil
   401 → router.push('/login?next=…')
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `lib/server/backend-fetch.ts` | Create | **[CENTRAL]** helper `server-only` cookie→Bearer reusable. Sentinel `unauthorized` si sin token/expirado. |
| `app/api/contrataciones/route.ts` | Create | Route Handler `POST`. Usa `backendFetch`; reenvía status+body; 502 ante red. |
| `lib/api/contrataciones.ts` | Create | `crearSolicitud(payload)` client → `fetch('/api/contrataciones')` → `CrearSolicitudResult` discriminado. + tipos `CrearContratacionPayload`/`ContratacionResponse`. |
| `lib/validation/solicitud.ts` | Create | schema zod + `esFechaValida(iso, hoy)` pura. |
| `lib/errors/field-errors.ts` | Modify | + `mapSolicitudError(result)` → banner/inline es-AR. |
| `lib/copy/es-AR.ts` | Modify | + `copy.solicitud.*` (labels, franjas, mensajes del catálogo). |
| `app/(protegido)/prestadores/[id]/solicitar/page.tsx` | Create | Server Component shell. `await params.id` → `<SolicitudForm/>`. |
| `components/catalogo/solicitud/solicitud-form.tsx` | Create | `'use client'` CORAZÓN: RHF+zod, submit, mapeo status, anti-doble-submit, a11y. |
| `components/catalogo/solicitud/solicitud-exito.tsx` | Create | confirmación 201 (`role=status`) + CTA volver al perfil. |
| `components/catalogo/perfil/solicitar-cta.tsx` | Modify | reemplaza el placeholder "Próximamente" por las 3 ramas REQ-01 (push a `/solicitar`). |
| `proxy.ts` | Modify | **matcher AMPLIADO**: `["/cuenta/:path*", "/prestadores/:id/solicitar"]`. |
| `e2e/solicitar.spec.ts` | Create | placeholder ESC-UI-01..07 (los escribe el Verificador). |

---

## Interfaces / Contracts

```ts
// lib/server/backend-fetch.ts  (server-only) — REUSABLE por 08.2/09.3
type BackendFetchResult =
  | { unauthorized: true }                 // sin cookie o exp vencido → NO llama al backend
  | { unauthorized: false; response: Response }; // status del backend tal cual (incl. 4xx)
declare function backendFetch(path: string, init?: RequestInit): Promise<BackendFetchResult>;

// lib/api/contrataciones.ts  (mirror EXACTO del contrato POST /contrataciones)
interface CrearContratacionPayload {
  ubicacion: string; prestadorId: string; fecha: string; // ISO date hoy/futuro
  franja: string; descripcion: string;                    // clienteId lo deriva el backend del token
}
interface ContratacionResponse {
  id: string; ubicacion: string; prestadorId: string; clienteId: string;
  fecha: string; franja: string; descripcion: string;
  estado: "solicitada"; createdAt: string;
}
type CrearSolicitudResult =
  | { ok: true; data: ContratacionResponse }                       // 201
  | { ok: false; kind: "unauthorized" }                            // 401 → form redirige a /login
  | { ok: false; kind: "forbidden" }                               // 403 (no cliente)
  | { ok: false; kind: "prestador_no_disponible" }                 // 404
  | { ok: false; kind: "franja_ocupada" }                          // 409 (esperado, accionable)
  | { ok: false; kind: "fecha_invalida" }                          // 422
  | { ok: false; kind: "validation"; raw: BackendValidationError } // 400
  | { ok: false; kind: "network" }                                 // transporte
  | { ok: false; kind: "server"; status: number };                 // 5xx/502
declare function crearSolicitud(p: CrearContratacionPayload): Promise<CrearSolicitudResult>;
```

**Aterrizaje post-201 (REQ-05, ADR sin acoplar a MI-09.3):** toast `role="status"` con
`copy.solicitud.exito` + form bloqueado + `<SolicitudExito/>` con CTA "Volver al perfil" →
`/prestadores/{id}`. NO se navega a una bandeja inexistente.

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `crearSolicitud` mapea cada status → `kind` (OCL) | vitest, mock `fetch` |
| Unit | `esFechaValida(iso, hoy)` (hoy ok, ayer falla, futuro ok) | vitest, fecha inyectada (sin `Date.now`) |
| Unit | `lib/validation/solicitud.ts` (requeridos vacíos bloquean) | vitest zod |
| Unit | `mapSolicitudError` (franja/404/403/422/400/red → mensaje es-AR) | vitest |
| Unit | `backend-fetch`: sin cookie → `{unauthorized:true}` sin llamar al backend; con token → agrega Bearer | vitest, mock `readSessionToken`/`fetch` |
| E2E | ESC-UI-01..07 (uno por escenario) | Playwright `page.route('**/api/contrataciones', …)` por status; assert toast/redirect/datos conservados/franja reseleccionable; assert token nunca en bundle |

OCL clave: `crearSolicitud` NUNCA lanza para 4xx; 201 ⇒ `{ok:true,data.estado:'solicitada'}`; el payload
NUNCA incluye `clienteId`; ningún `kind` expone trazas internas (REQ-11).

## Migration / Rollout

No migration required. Cambio aditivo + ampliación de matcher de `proxy.ts`.

## Open Questions

- [ ] **S1** — Franjas: ¿enum fijo en cliente o el backend define el set? Default: enum es-AR en `copy`
  (mañana/tarde/noche o rango horario). Confirmar contra el contrato del backend.
- [ ] **S2** — Matcher `/prestadores/:id/solicitar`: confirmar en implementación (test de humo) que NO
  matchea el padre `/prestadores/:id` (perfil público debe seguir accesible sin sesión).
- [ ] **S3** — Tras login desde el CTA anónimo, retomar el flujo: `next` apunta a `/solicitar`; el form
  pierde lo tipeado (aún no había datos) — aceptable, el form arranca vacío.
```
