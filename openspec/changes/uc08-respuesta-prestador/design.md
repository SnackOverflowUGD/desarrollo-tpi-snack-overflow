# Design — MI-08.2 Respuesta del prestador a solicitudes (UC08) — full-stack

> **Fase:** Diseño (SDD 1.2). Deriva del `spec.md` aprobado de esta WI, del `client/DESIGN-SYSTEM.md`
> y de los **precedentes directos**:
> - `uc07-ui-solicitar/design.md` → `backendFetch` server-only (cookie→Bearer, ADR-07-01), Route
>   Handler BFF, patrón `*-Result` discriminado, `proxy.ts`, validación zod con fechas puras. **REUSO total.**
> - Backend hexagonal de `contratacion/` (controller / service / port / adapter TypeORM / DTO) ya en pie:
>   esta WI **agrega** un caso de uso de lectura `GET /contrataciones` y **reusa** `proposal`/`reject` ya
>   verificados.
>
> **Stack verificado:** Backend NestJS + TypeORM (hexagonal: controller → service → port → adapter),
> `AuthGuard('jwt')` a nivel controller, `req.user` = `JwtPayload {sub, role}`. Frontend Next.js 16.2.9
> (App Router; `params`/`searchParams` Promises; `cookies()` async; archivo de protección `proxy.ts` runtime
> Node) · React 19 · Tailwind v4 · TS strict · alias `@/*` → `client/` · RHF 7.79 + zod 4.4 · vitest 4.1 ·
> Playwright 1.60. Backend tests: Jest.
>
> **Trazabilidad:** UC08 · RF-6.2/6.3 · RU-P · RN-CON-07/08/09/10 · RN-AUTH-06 · RNF-S.1/S.4 ·
> spec REQ-01..REQ-15 · ESC-UI-01..08 · contrato `GET /contrataciones` (NUEVO) + `POST .../proposal` +
> `POST .../reject` (existentes).

---

## Technical Approach

La WI tiene **dos mitades** que se encuentran en un contrato HTTP nuevo:

1. **Backend — `GET /contrataciones` role-aware [CENTRAL].** El controller, ya protegido por
   `AuthGuard('jwt')`, deriva `userId = req.user.sub` y `role = req.user.role` (NUNCA del input) y delega en
   `ContratacionService.list(userId, role, filtros)`. El service decide la dimensión de filtrado según el
   rol: PRESTADOR → `prestadorId = userId`; CLIENTE → `clienteId = userId`. Esta bifurcación role-aware se
   diseña **ahora** aunque UC08 solo ejerza la rama PRESTADOR, porque **MI-09.3 reusa exactamente este
   endpoint** desde la perspectiva del CLIENTE sin tocar el backend (solo agrega su UI). El repo —hoy
   `save`/`findById`— gana un método de query por dimensión; el adapter TypeORM lo implementa con
   `order by created_at desc` y filtro opcional por estado. El response se **enriquece** con el nombre del
   cliente (ver ADR-08-02) reusando el `USER_REPOSITORY` ya inyectado en el módulo.

2. **Frontend — bandeja + acciones, todo sobre `backendFetch`.** Tres Route Handlers BFF
   (`GET /api/contrataciones`, `POST /api/contrataciones/:id/proposal`, `POST /api/contrataciones/:id/reject`)
   reusan el helper server-only de UC07 — el token jamás toca el cliente. La bandeja vive en
   `/cuenta/solicitudes` (ya protegida por el matcher `/cuenta/:path*` de `proxy.ts`, **sin cambios**). Un
   Server Component lista server-side (vía `backendFetch` directo, sin round-trip al propio BFF); client
   components manejan las acciones (presupuestar / rechazar) con el patrón `{ok,kind}` discriminado de UC07.
   Tras una acción exitosa la bandeja se refresca con `router.refresh()` (ADR-08-04).

El precedente queda intacto: el form hace `fetch('/api/...')` same-origin, el Verificador mockea
`fetch`/`page.route()`, y `backendFetch` (`server-only`) garantiza RNF-S.1/S.4.

---

## Architecture Decisions (ADRs)

### ADR-08-01 — `GET /contrataciones` **role-aware, dimensión derivada del token** [CENTRAL]

**Choice**: un único endpoint `GET /contrataciones` (no `/mis-solicitudes` ni `/prestador/...`). El service
recibe `(userId, role, { estado? })` y elige la columna de filtrado por rol:

```
role = PRESTADOR  →  repo.findByParticipante({ prestadorId: userId }, estado?)
role = CLIENTE    →  repo.findByParticipante({ clienteId: userId },  estado?)
```

El controller toma `userId`/`role` SOLO de `req.user` (JwtPayload). El query string acepta `?estado=` (uno
de `ContratacionEstado`); **no** acepta `prestadorId`/`clienteId` (RN-CON-07: aislamiento por token).

```ts
// contratacion.controller.ts — método NUEVO
@Get()
@HttpCode(HttpStatus.OK)
async list(
  @Query() query: ListContratacionesQueryDto,   // { estado?: ContratacionEstado }
  @Req() req: Request,
): Promise<ContratacionListItemDto[]> {
  const user = req.user as JwtPayload;
  return this.contratacionService.list(user.sub, user.role, query);
}
```

**Alternatives considered**: (B) dos endpoints separados `/contrataciones/recibidas` (prestador) y
`/contrataciones/mias` (cliente). (C) un endpoint con `?rol=` explícito en el query.

**Rationale**:
- (B) duplica routing/guard/tests y obliga a MI-09.3 a agregar backend nuevo en vez de **solo UI** — rompe
  la dependencia anotada en la spec ("MI-09.3 reusa este mismo endpoint"). Descartado.
- (C) inseguro/redundante: el rol ya viaja firmado en el JWT; aceptarlo del query abre la puerta a
  inconsistencias y validación extra. La verdad está en el token.
- (A) un solo endpoint role-aware es **el contrato mínimo que sirve a las dos WIs**. La rama por rol vive en
  el **service** (lógica de aplicación), no en el controller (transporte) — coherente con la arquitectura
  hexagonal existente. Un rol futuro que no participe en contrataciones (p. ej. ADMIN) → lista vacía o 403
  según se decida en su WI; hoy PRESTADOR/CLIENTE cubren el universo.

**Repo port — método NUEVO (genérico por dimensión, no dos métodos gemelos):**

```ts
// ports/contratacion-repository.port.ts  (se AGREGA, no se rompe lo existente)
export interface ContratacionFiltro {
  prestadorId?: string;   // exactamente UNA de las dos se setea (la del rol)
  clienteId?: string;
  estado?: ContratacionEstado;
}
export interface IContratacionRepository {
  save(contratacion: Contratacion): Promise<Contratacion>;
  findById(id: string): Promise<Contratacion | null>;
  findByParticipante(filtro: ContratacionFiltro): Promise<Contratacion[]>;  // NUEVO
}
```

```ts
// adapters/typeorm-contratacion.repository.ts — impl NUEVA
async findByParticipante(f: ContratacionFiltro): Promise<Contratacion[]> {
  const where: Record<string, unknown> = {};
  if (f.prestadorId) where.prestadorId = f.prestadorId;
  if (f.clienteId)   where.clienteId   = f.clienteId;
  if (f.estado)      where.estado      = f.estado;
  return this.repo.find({ where, order: { createdAt: 'DESC' } });  // REQ-01: orden por creación
}
```

Un solo método genérico (no `findByPrestador` + `findByCliente`) porque la query es idéntica salvo la
columna; el service garantiza que exactamente una dimensión de identidad se setea.

> **Impacto observable (gate):** un prestador autenticado recibe SOLO sus contrataciones
> (`prestadorId = sub`), filtrables por `?estado=`, ordenadas por `created_at desc`; nunca puede listar por
> id ajeno; sin sesión → 401 (lo da el `AuthGuard`).

### ADR-08-02 — Shape del response: **DTO de listado enriquecido con `clienteNombre`** (no `ContratacionResponseDto[]` plano)

**Choice**: un `ContratacionListItemDto` dedicado = todos los campos de `ContratacionResponseDto` **más**
`clienteNombre: string` (`name + ' ' + lastName` del User). El service resuelve el nombre vía el
`USER_REPOSITORY` ya inyectado en `ContratacionService`.

```ts
// dto/contratacion-list-item.dto.ts — NUEVO
export class ContratacionListItemDto {
  id: string; ubicacion: string; prestadorId: string; clienteId: string;
  clienteNombre: string;                  // ENRIQUECIDO (REQ-02: mostrar "cliente" legible)
  fecha: string; franja: string; descripcion: string;
  fechaPropuesta?: string | null; franjaPropuesta?: string | null; precioEstimado?: number | null;
  estado: ContratacionEstado; createdAt: Date;
  constructor(p: Partial<ContratacionListItemDto>) { Object.assign(this, p); }
}
```

**Alternatives considered**: (B) devolver `ContratacionResponseDto[]` plano y que la UI muestre solo
`clienteId` (UUID). (C) enriquecer también con teléfono/email del cliente. (D) endpoint separado de "detalle
con datos del cliente".

**Rationale**:
- (B) **viola la legibilidad que pide REQ-02** ("cada ítem MUST mostrar de forma legible: **cliente**,
  ubicación, …"). Un UUID no es legible; mostrarlo es UX inaceptable. Descartado.
- (C) sobre-ingeniería: la bandeja del prestador (REQ-02) solo necesita identificar al cliente por su
  nombre; teléfono/email son datos de contacto que UC08 no requiere y agregan superficie PII innecesaria
  (minimización de datos). Si una WI futura los necesita, los agrega entonces.
- (D) parte el flujo en dos llamadas para algo que la lista resuelve de una.
- **(A) es lo más simple que CUMPLE la spec sin sobre-ingeniería.** Un DTO distinto del de creación/acción
  deja explícito que el listado es un *read model* con su propio shape (puede divergir sin romper el
  contrato de `proposal`/`reject`). El nombre del cliente se resuelve en el service —que YA tiene
  `userRepo`— manteniendo el adapter del repo de contrataciones ignorante del agregado User (no se mete un
  JOIN cross-aggregate en el repo de contrataciones, se compone en la capa de aplicación).
- **Enriquecimiento (resolución N+1 acotada):** el service hace `userRepo.findById(clienteId)` por ítem.
  Para el TPI esto es **aceptable y se documenta como límite**: la bandeja de pendientes de un prestador
  tiene decenas de ítems, no miles. Optimización (batch `findByIds` / JOIN en query builder) queda anotada
  como mejora futura, NO se implementa ahora (YAGNI). Si `findById` del cliente devuelve null (caso
  defensivo, no debería pasar), `clienteNombre = 'Cliente'` placeholder — nunca rompe la lista.

**Paginación:** **lista simple sin paginar** para el TPI. Se documenta el límite explícitamente: el endpoint
devuelve TODAS las contrataciones del usuario que matcheen el filtro. La bandeja de pendientes
(`?estado=solicitada`) es naturalmente acotada. Si el volumen creciera, se agregaría `?limit/offset` o
cursor en una WI futura — el shape `ContratacionListItemDto[]` es compatible con envolverlo luego en
`{ items, total }` sin romper a los consumidores actuales si se versiona. (Anotado en Open Questions.)

### ADR-08-03 — Route Handlers BFF: **dinámicos `[id]` + GET de lista**, todos sobre `backendFetch`

**Choice**: tres Route Handlers que reusan `backendFetch` (UC07), cada uno delgado, sin UX propia:

| Handler | Archivo | Backend | Devuelve |
|---|---|---|---|
| `GET /api/contrataciones` | `app/api/contrataciones/route.ts` (se AGREGA `GET` al archivo que ya tiene `POST` de UC07) | `GET /contrataciones${qs}` | 200 lista \| 401 \| 502 |
| `POST /api/contrataciones/[id]/proposal` | `app/api/contrataciones/[id]/proposal/route.ts` (NUEVO) | `POST /contrataciones/:id/proposal` | 200 \| 4xx verbatim \| 401 \| 502 |
| `POST /api/contrataciones/[id]/reject` | `app/api/contrataciones/[id]/reject/route.ts` (NUEVO) | `POST /contrataciones/:id/reject` (sin body) | 200 \| 4xx verbatim \| 401 \| 502 |

- El `GET` reenvía el query string (`?estado=`) al backend tal cual y forwardea status+body. `unauthorized`
  del sentinel → 401.
- Los `[id]` leen `id` de los params (Next 16: `params` es **Promise** → `const { id } = await params`),
  reconstruyen el path backend `/contrataciones/${id}/proposal|reject`, y reenvían (proposal con body raw;
  reject sin body). El `id` viaja en la URL, NUNCA en el body — el backend valida pertenencia (404 si ajena,
  RN-CON-07).

**Alternatives considered**: (B) un único handler catch-all `[...slug]`; (C) Server Actions para las
acciones.

**Rationale**:
- (B) catch-all mezcla recursos y complica el mapeo de status por acción; los handlers explícitos son
  triviales de testear y leer.
- (C) descartado por el MISMO motivo que ADR-07-01: rompe el modelo mental `fetch('/api/...')` y dificulta
  el mock en unit/E2E. Consistencia > novedad.
- Los handlers **no mapean UX** (igual que UC07): reenvían status verbatim; el api-client del cliente los
  traduce a `kind`. La excepción es el GET server-side de la **página** (Server Component), que llama
  `backendFetch` directo (no su propio BFF) para evitar un hop HTTP innecesario server→self→backend — el
  handler `GET /api/contrataciones` existe igualmente para refrescos client-side (`router.refresh` re-ejecuta
  el Server Component, así que en la práctica el GET BFF queda como superficie para tests/futuro; se
  documenta).

### ADR-08-04 — Refresh tras acción: **`router.refresh()` re-ejecuta el Server Component**

**Choice**: tras un 200 de proposal/reject, el client component llama `router.refresh()`. Como la bandeja la
pinta un **Server Component** que listó vía `backendFetch` (`cache: 'no-store'`), `router.refresh()`
re-renderiza server-side con datos frescos → el ítem aparece con su nuevo badge (`Presupuestada`/`Cancelada`)
sin recarga manual (REQ-05/06). En 409 (concurrencia) y 404 (ajena) **también** se llama `router.refresh()`
para reflejar el estado real (REQ-10/11).

**Alternatives considered**: (B) optimistic update en estado client local; (C) `revalidatePath` desde un
Server Action.

**Rationale**:
- (B) optimistic duplica la fuente de verdad y puede divergir del backend ante 409 concurrente
  (justamente el caso que la spec marca como esperado). `router.refresh()` re-deriva del servidor → siempre
  consistente. El feedback inmediato (toast `role="status"` + form bloqueado) cubre la percepción de
  rapidez sin mentir sobre el estado.
- (C) `revalidatePath` requiere Server Action (descartado en ADR-08-03). `router.refresh()` es la
  contraparte client-side natural del fetch BFF.
- Coherente con `cache: 'no-store'` que ya fuerza `backendFetch`: nunca hay caché stale que limpiar.

### ADR-08-05 — Validación cliente presupuestar: **zod, reuso de `esFechaValida`/`hoyISO` de UC07**

**Choice**: `lib/validation/proposal.ts` con zod: `precioEstimado` number `> 0`; `fecha` ISO date
`refine(esFechaValida(value, hoyISO()))` (REUSO de las funciones puras de `lib/validation/solicitud.ts`);
`franja` `trim().min(1)`. El `<input type="date">` fija `min={hoyISO()}` y `<input type="number">` fija
`min` > 0 (step adecuado). Bloquea submit sin HTTP (REQ-07), previene 422/400. El `id` de la contratación
NO es campo del form: viaja por contexto del ítem (REQ-04).

**Rationale**: idéntico patrón a UC07. `esFechaValida(iso, hoy)` ya existe, es pura y testeada — se importa,
no se reescribe. La validación de precio es función pura nueva trivial (`esPrecioValido(n) => n > 0`)
testeable sin DOM.

---

## Data Flow

```
─────────────────────────  BANDEJA (lectura, SSR)  ─────────────────────────
GET /cuenta/solicitudes
  │  proxy.ts (matcher /cuenta/:path*) ya garantizó sesión (sino 307 /login?next=)
  ▼
app/(...)/cuenta/solicitudes/page.tsx  (Server Component)
  │  backendFetch('/contrataciones?estado=solicitada')   [server-only, cookie→Bearer]
  │     unauthorized → redirect('/login?next=/cuenta/solicitudes')   (REQ-08, ESC-UI-08)
  │     200 → ContratacionListItemDto[]                              (REQ-01, ESC-UI-01)
  │     5xx/red → render estado error (banner role=alert, reintentar) (REQ-03, ESC-UI-07)
  ▼
<BandejaSolicitudes items={...}/>  → vacío? estado vacío (REQ-03) : lista de <SolicitudCard/>
                                       cada card: cliente(nombre), ubicación, fecha/franja, desc, badge

─────────────────────  ACCIÓN presupuestar / rechazar  ─────────────────────
<SolicitudCard/> (client)
  │ presupuestar → <PresupuestarForm contratacionId={id}/> (RHF+zod, ADR-08-05)
  │ rechazar     → <RechazarConfirm contratacionId={id}/>  (confirmación, REQ-06)
  ▼ submit → enviarPropuesta(id, payload) | rechazarSolicitud(id)   [lib/api/contrataciones.ts]
  ▼  fetch('/api/contrataciones/{id}/proposal'|'/reject')           (same-origin)
app/api/contrataciones/[id]/{proposal|reject}/route.ts ─→ backendFetch('/contrataciones/{id}/...')
  │                                                          │ cookie so_session → Bearer
  │                                                          ▼  BACKEND POST .../proposal|reject
  │  200/403/404/409/422/400 ← status+body verbatim          401 ← sentinel | backend
  ▼
ResponderResult {ok,kind} → componente mapea a UX:
  200 → toast role=status (presupuestada/cancelada) + form bloqueado + router.refresh()   (REQ-05/06)
  401 → router.push('/login?next=/cuenta/solicitudes')                                     (ESC-UI-08)
  403 → copy "solo prestadores" (defensa última, prevenido por la bandeja)                 (REQ-09)
  404 → copy "ya no disponible" + router.refresh()                                         (REQ-10)
  409 → copy accionable "estado cambió" + router.refresh()                                 (REQ-11)
  422 → error inline en campo (prevenido por zod)                                          (REQ-12)
  400 → mapeo a campo o banner role=alert                                                  (REQ-12)
  red/5xx → banner no técnico, conserva datos, reintentar                                  (REQ-12)
```

---

## File Changes

### Backend (`server/`)

| File | Action | Description |
|------|--------|-------------|
| `contratacion/dto/list-contrataciones-query.dto.ts` | Create | `{ estado?: ContratacionEstado }` con `@IsOptional()@IsEnum(...)`. Valida el `?estado=`; rechaza valores fuera del enum (400). |
| `contratacion/dto/contratacion-list-item.dto.ts` | Create | DTO de listado = campos de `ContratacionResponseDto` + `clienteNombre` (ADR-08-02). |
| `contratacion/ports/contratacion-repository.port.ts` | Modify | + `ContratacionFiltro` y `findByParticipante(filtro)`. NO rompe `save`/`findById`. |
| `contratacion/adapters/typeorm-contratacion.repository.ts` | Modify | impl `findByParticipante`: `find({ where, order:{createdAt:'DESC'} })`. |
| `contratacion/application/contratacion.service.ts` | Modify | + `list(userId, role, query)`: bifurca dimensión por rol (ADR-08-01), llama `findByParticipante`, enriquece con `userRepo.findById(clienteId)` → `clienteNombre` (ADR-08-02). |
| `contratacion/contratacion.controller.ts` | Modify | + `@Get()` que deriva `sub`/`role` de `req.user` y delega en `service.list`. |

> El `AuthGuard('jwt')` ya está a nivel `@Controller` → el `GET` queda autenticado sin cambios (401 sin
> sesión, dado por el guard). El módulo ya importa `User` y bindea `USER_REPOSITORY` → el enriquecimiento no
> requiere wiring nuevo.

### Frontend (`client/`)

| File | Action | Description |
|------|--------|-------------|
| `app/api/contrataciones/route.ts` | Modify | + `GET` handler: reenvía `?estado=` vía `backendFetch`, status+body verbatim; sentinel→401, red→502. (Mantiene el `POST` de UC07.) |
| `app/api/contrataciones/[id]/proposal/route.ts` | Create | `POST`: `await params.id`, body raw → `backendFetch('/contrataciones/{id}/proposal', POST)`. |
| `app/api/contrataciones/[id]/reject/route.ts` | Create | `POST`: `await params.id`, sin body → `backendFetch('/contrataciones/{id}/reject', POST)`. |
| `lib/api/contrataciones.ts` | Modify | + `listarSolicitudes(filtros?)`, `enviarPropuesta(id, payload)`, `rechazarSolicitud(id)` discriminados; + tipos `ContratacionListItem`, `SendProposalPayload`, `ListarResult`, `ResponderResult`. NO toca `crearSolicitud`. |
| `lib/validation/proposal.ts` | Create | schema zod presupuestar + `esPrecioValido(n)` pura; reusa `esFechaValida`/`hoyISO` de `solicitud.ts`. |
| `lib/errors/field-errors.ts` | Modify | + `mapResponderError(result)` → mensaje es-AR por `kind`. |
| `lib/copy/es-AR.ts` | Modify | + `copy.bandeja.*` (labels, badges de estado, mensajes del catálogo es-AR de la spec). |
| `components/cuentas/bandeja/bandeja-solicitudes.tsx` | Create | (server-friendly) recibe `items`; estados vacío/lista; navegable por teclado (REQ-14). |
| `components/cuentas/bandeja/solicitud-card.tsx` | Create | `'use client'`: muestra datos del ítem + `<EstadoBadge/>`; abre presupuestar/rechazar. |
| `components/cuentas/bandeja/estado-badge.tsx` | Create | badge texto+color por estado (REQ-15, tokens DESIGN-SYSTEM §estado). |
| `components/cuentas/bandeja/presupuestar-form.tsx` | Create | `'use client'` CORAZÓN: RHF+zod, submit `enviarPropuesta`, mapeo status, anti-doble-submit, a11y (REQ-04/05/07/14). |
| `components/cuentas/bandeja/rechazar-confirm.tsx` | Create | `'use client'`: confirmación explícita (REQ-06) → `rechazarSolicitud`. |
| `components/cuentas/bandeja/bandeja-error.tsx` | Create | banner `role="alert"` + reintentar (REQ-03). |
| `app/(...)/cuenta/solicitudes/page.tsx` | Create | Server Component: `backendFetch` lista; unauthorized→`redirect('/login?next=...')`; error→`<BandejaError/>`; ok→`<BandejaSolicitudes/>`. |
| `e2e/bandeja-prestador.spec.ts` | Create | placeholder ESC-UI-01..08 (los escribe el Verificador). |

> `proxy.ts`: **SIN CAMBIOS.** El matcher `/cuenta/:path*` ya cubre `/cuenta/solicitudes` → la bandeja queda
> protegida (anónimo → 307 `/login?next=/cuenta/solicitudes`). Esto cumple REQ-02/REQ-08 sin tocar el
> precedente. (El no-prestador autenticado pasa el matcher de sesión pero ve bandeja vacía: el backend filtra
> por `prestadorId=sub`; un cliente logueado no tiene contrataciones donde sea prestador → REQ-02 garantía
> reforzada por el backend, no solo por UI.)

---

## Interfaces / Contracts

```ts
// lib/api/contrataciones.ts  (se AGREGA; mirror del GET /contrataciones + acciones)

/** Mirror del ContratacionListItemDto del backend (GET, enriquecido). */
export interface ContratacionListItem {
  id: string; ubicacion: string; prestadorId: string; clienteId: string;
  clienteNombre: string;                       // ENRIQUECIDO (ADR-08-02)
  fecha: string; franja: string; descripcion: string;
  fechaPropuesta?: string | null; franjaPropuesta?: string | null; precioEstimado?: number | null;
  estado: "solicitada" | "presupuestada" | "confirmada" | "cancelada" | "en_curso" | "finalizada";
  createdAt: string;
}

/** Mirror del SendProposalDto. `id` viaja en la URL, NO en el payload (REQ-04). */
export interface SendProposalPayload {
  fecha: string;          // ISO date hoy/futuro
  franja: string;
  precioEstimado: number; // > 0
}

export type ListarResult =
  | { ok: true; items: ContratacionListItem[] }   // 200
  | { ok: false; kind: "unauthorized" }           // 401 → redirect /login
  | { ok: false; kind: "network" }                // transporte
  | { ok: false; kind: "server"; status: number };// 5xx/502

export type ResponderResult =
  | { ok: true; data: ContratacionListItem }       // 200 (estado nuevo)
  | { ok: false; kind: "unauthorized" }            // 401 → redirect /login
  | { ok: false; kind: "forbidden" }               // 403 (no prestador; prevenido)
  | { ok: false; kind: "no_disponible" }           // 404 (inexistente o ajena — indistinguible)
  | { ok: false; kind: "estado_cambiado" }         // 409 (concurrencia, accionable)
  | { ok: false; kind: "validacion"; raw?: unknown }// 422/400
  | { ok: false; kind: "network" }
  | { ok: false; kind: "server"; status: number };

declare function listarSolicitudes(filtros?: { estado?: string }): Promise<ListarResult>;
declare function enviarPropuesta(id: string, p: SendProposalPayload): Promise<ResponderResult>;
declare function rechazarSolicitud(id: string): Promise<ResponderResult>;
```

```ts
// app/api/contrataciones/[id]/proposal/route.ts (Next 16: params es Promise)
export const dynamic = "force-dynamic";
export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;
  const body = await request.text();
  const r = await backendFetch(`/contrataciones/${id}/proposal`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body,
  });               // try/catch → 502; r.unauthorized → 401; else status+body verbatim
}
```

---

## Mapeo escenario → componente / función

| Escenario | Componente / función | Status / mecanismo |
|---|---|---|
| ESC-UI-01 ver bandeja | `page.tsx` (SSR `backendFetch`) → `<BandejaSolicitudes>`/`<SolicitudCard>`/`<EstadoBadge>` | 200 lista, filtrada por token, orden `created_at desc` |
| ESC-UI-02 presupuestar OK | `<PresupuestarForm>` → `enviarPropuesta(id,p)` → toast + `router.refresh()` | 200 → badge `Presupuestada`, form bloqueado |
| ESC-UI-03 rechazar OK | `<RechazarConfirm>` → `rechazarSolicitud(id)` → toast + `router.refresh()` | 200 → badge `Cancelada`, confirmación previa |
| ESC-UI-04 concurrencia | `mapResponderError('estado_cambiado')` + `router.refresh()` | 409 accionable, no error de sistema |
| ESC-UI-05 validación cliente | `lib/validation/proposal.ts` (zod, `esFechaValida`/`esPrecioValido`) | bloquea submit sin HTTP, inline + foco |
| ESC-UI-06 aislamiento | backend `service.list` filtra por `sub`; `mapResponderError('no_disponible')` + refresh | sin UI por id ajeno; 404 indistinguible |
| ESC-UI-07 vacío / error listar | `<BandejaSolicitudes>` estado vacío (no error) / `<BandejaError>` `role=alert` | 200 `[]` vs 5xx/red |
| ESC-UI-08 sesión expirada | `page.tsx` unauthorized→`redirect`; api-client `unauthorized`→`router.push('/login?next=')` | 401 (sentinel o backend) |

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Jest (service) | `list(userId, PRESTADOR)` → filtra por `prestadorId`; `list(userId, CLIENTE)` → por `clienteId` (rama 09.3) | mock `contratacionRepo.findByParticipante` + `userRepo.findById`; assert filtro correcto por rol |
| Jest (service) | `list` con `?estado=` pasa el filtro al repo; sin estado → todas | mock repo, assert `where` |
| Jest (service) | enriquecimiento: cada ítem gana `clienteNombre = name+' '+lastName`; cliente null → `'Cliente'` placeholder | mock `userRepo.findById` |
| Jest (service) | orden `created_at desc` delegado al repo (no se reordena en service) | assert se respeta el orden del repo |
| Jest (controller) | `list` deriva `sub`/`role` de `req.user` (NUNCA del query); pasa `query.estado` al service | mock service, `req.user` fake |
| Jest (controller) | `?estado=` inválido → 400 por `ListContratacionesQueryDto` (`@IsEnum`) | ValidationPipe |
| vitest (front, puro) | `listarSolicitudes`/`enviarPropuesta`/`rechazarSolicitud` mapean cada status → `kind` (OCL: nunca throw 4xx) | mock `fetch` |
| vitest | `esPrecioValido(n)` (0/neg → false, >0 → true); `proposalSchema` (precio≤0, fecha pasada, franja vacía bloquean) | vitest zod, fecha inyectada |
| vitest | `mapResponderError` (403/404/409/422/400/red → mensaje es-AR del catálogo) | vitest |
| Playwright (E2E) | ESC-UI-01..08 (uno por escenario) | `page.route('**/api/contrataciones**', …)` por status; assert badge/toast/redirect/refresh/estado vacío vs error; assert token NUNCA en bundle |

**OCL clave:** las tres funciones del api-client NUNCA lanzan para 4xx; 200 de acción ⇒
`{ok:true, data.estado ∈ {presupuestada,cancelada}}`; el payload de proposal NUNCA incluye `id`/`prestadorId`
del cliente; ningún `kind` expone trazas; el GET backend NUNCA acepta `prestadorId`/`clienteId` del query.

---

## Notas de seguridad

- **Aislamiento por usuario (RN-CON-07):** la dimensión de filtrado (`prestadorId`/`clienteId`) se deriva
  SIEMPRE de `req.user.sub`; el query string solo admite `?estado=`. El backend devuelve 404 (no 403) ante
  acciones sobre contrataciones ajenas → oculta su existencia (REQ-10). La UI no ofrece ningún input para id
  ajeno (REQ-13).
- **Token no expuesto (RNF-S.1/S.4):** lectura (página SSR) y acciones pasan por `backendFetch`
  (`server-only`, cookie httpOnly → Bearer server→server). El token jamás entra al bundle; importarlo desde
  un client component es build error. El `?estado=` y el `id` son los únicos datos client→server.
- **Sesión expirada (RN-AUTH-06):** sentinel `{unauthorized:true}` de `backendFetch` (sin tocar el backend)
  + 401 del backend → ambos mapean a redirect `/login?next=` preservando destino.
- **Rol en cliente decorativo:** la bandeja se muestra a cualquier sesión válida (matcher de `proxy.ts` solo
  chequea sesión), pero el backend filtra por `prestadorId=sub` → un no-prestador ve bandeja vacía. La
  autorización real de las acciones es el 403 del backend (`Only prestadores can…`), no el rol del JWT en
  cliente.

---

## Migration / Rollout

No migration. Backend: cambios **aditivos** (un método de port/adapter, un caso de uso de lectura, dos DTOs);
no se altera el esquema (`ContratacionListItemDto` se compone en runtime, no es columna). Frontend: aditivo;
`proxy.ts` **sin cambios** (el matcher ya cubre `/cuenta/*`).

## Open Questions

- [ ] **S1 — Paginación:** se difiere (lista simple para el TPI, límite documentado en ADR-08-02). Confirmar
  con la cátedra que no se exige paginación en la entrega.
- [ ] **S2 — N+1 del enriquecimiento:** aceptado para el TPI; si se midiera lento, batch `findByIds` o JOIN
  en query builder. NO implementar ahora (YAGNI).
- [ ] **S3 — Estados visibles en la bandeja:** la spec se centra en `?estado=solicitada` (pendientes). ¿La
  bandeja del prestador muestra solapas/filtros para `presupuestada`/`cancelada` o solo pendientes? Default
  diseño: pestaña "Pendientes" (solicitada) como vista principal; resto fuera de alcance de UC08 (las
  consume MI-09.x). Confirmar en tasks.
- [ ] **S4 — `clienteNombre` null defensivo:** placeholder `'Cliente'`; confirmar copy es-AR exacta con el
  Verificador.
