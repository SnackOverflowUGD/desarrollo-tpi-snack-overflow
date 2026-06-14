# Design — MI-09.3 UI gestión y seguimiento de contrataciones (UC09) — full-stack

> **Fase:** Diseño (SDD 1.2). Deriva del `spec.md` aprobado de esta WI, del `client/DESIGN-SYSTEM.md` y de
> los **precedentes directos** —REUSO máximo, no se reinventa nada:
> - `uc08-respuesta-prestador/design.md` → backend hexagonal de `contratacion/` (controller → service → port
>   → adapter → state machine), `GET /contrataciones` role-aware (reusado tal cual), Route Handlers BFF
>   dinámicos `[id]`, api-client discriminado `ResponderResult`, bandeja + `EstadoBadge` + `RechazarConfirm`.
> - `uc07-ui-solicitar/design.md` → `backendFetch` server-only (cookie httpOnly → Bearer), patrón `{ok,kind}`.
> - `uc09-gestionar-estados/specs/state-machine/spec.md` → matriz de transiciones, historial inmutable.
>
> **Stack verificado:** Backend NestJS + TypeORM hexagonal, `AuthGuard('jwt')` a nivel `@Controller`,
> `req.user = JwtPayload{sub, role}`. La state machine deriva el **estado actual del HISTORIAL** (último
> `estadoNuevo`), NO de `entity.estado`. `InvalidTransitionError` es un `Error` plano (no NestException).
> Frontend Next 16 (App Router, `params` Promise, `cookies()` async, `proxy.ts` matcher `/cuenta/:path*`)
> · React 19 · Tailwind v4 · TS strict · vitest 4.1 · Playwright 1.60. Backend tests: Jest.
>
> **Trazabilidad:** UC09/UC21/UC20/UC13/UC10 · RF-6.6..6.9/7.2 · RN-SM-01..05 · RN-CON-07 · RN-AUTH-06 ·
> RNF-S.1/S.4 · REQ-01..15 · ESC-UI-01..11 · contratos NUEVOS `POST /contrataciones/:id/{confirm,start,finish,cancel}`
> + reuso de `GET /contrataciones`.

---

## Technical Approach

Dos mitades sobre el mismo contrato HTTP nuevo. **Backend:** 4 handlers de transición en el controller, cada
uno deriva `sub`/`role` del token y delega en un método de service que **espeja `reject`**: guard de rol →
guard de ownership (404) → guard de estado-actual (409) → `entity.estado = destino` → `repo.save` →
`stateMachine.transitionTo`. **Frontend:** la vista de seguimiento `/cuenta/contrataciones` (role-aware) reusa
`GET /contrataciones` ya existente; un helper PURO `accionesPara(rol, estado)` calcula las acciones
contextuales; 4 Route Handlers BFF `[id]/{confirm,start,finish,cancel}` clonan el de `reject`; el api-client
gana `confirmar/iniciar/finalizar/cancelar` reusando el `mapResponder` discriminado de UC08; las acciones
irreversibles reusan `RechazarConfirm` generalizado. Tras 200/404/409 → `router.refresh()`. El precedente UC08
(`/cuenta/solicitudes`) queda **intacto**.

---

## Architecture Decisions (ADRs)

### ADR-09-01 — Verbos/rutas: **4 POST por acción** (`confirm|start|finish|cancel`) [CENTRAL]

| Opción | Tradeoff | Decisión |
|---|---|---|
| **(A) POST `/:id/{confirm,start,finish,cancel}`** | 4 rutas explícitas; authz por acción; espeja `proposal`/`reject` ya en pie | **ELEGIDA** |
| (B) PATCH `/:id` con `{estado}` en body | 1 ruta, pero authz por valor de body diluye permisos y obliga a un switch frágil | rechazada |
| (C) POST `/:id/transition` con `{accion}` | igual problema que B, indirección extra | rechazada |

**Rationale**: cada transición tiene **distinto actor y guard** (confirmar=cliente, iniciar/finalizar=
prestador, cancelar=ambos). Rutas explícitas hacen la autorización legible y testeable por endpoint, y
**continúan exactamente el patrón `POST /:id/proposal|reject` ya verificado** (consistencia > genericidad). El
controller queda trivial: 4 handlers `@Post(':id/<verbo>') @HttpCode(200)` que sacan `sub`/`role` de
`req.user` y delegan. Cancelar y confirmar/iniciar/finalizar son métodos de service distintos (guards
distintos).

### ADR-09-02 — Guard de estado-actual **en el service ANTES de la state machine** (no dejar burbujear)

| Opción | Tradeoff | Decisión |
|---|---|---|
| **(A) service valida `entity.estado` y tira `ConflictException`** | 409 con mensaje claro; espeja `reject`; no depende del tipo del error de SM | **ELEGIDA** |
| (B) dejar que `InvalidTransitionError` burbujee → filter lo mapea a 409 | `InvalidTransitionError` es `Error` plano → hoy daría **500**, no 409; requiere filter nuevo | rechazada |

**Rationale**: la state machine deriva su estado del **historial**, mientras el guard del service lee
`entity.estado` — ambos deben coincidir, y el service ya es la capa que conoce el ownership. Validar en el
service (igual que `reject`/`sendProposal`) garantiza **409 determinístico** sin introducir un exception
filter ni tocar `InvalidTransitionError`. La SM queda como segunda barrera (defensa en profundidad): si el
estado-actual del guard pasara pero la matriz lo rechazara, hoy sería 500 — caso imposible si el guard espeja
la matriz. **Cancelar**: el guard rechaza con 409 solo los estados **terminales** (`finalizada`/`cancelada`);
desde cualquier estado activo (`solicitada|presupuestada|confirmada|en_curso`) procede — coincide con la
columna CANCELADA de la matriz. El "rechazar propuesta" del cliente (`presupuestada → cancelada`, UC21)
**REUSA `cancel`** (no hay método nuevo).

### ADR-09-03 — Ruta UI: **vista nueva `/cuenta/contrataciones` role-aware**; bandeja UC08 intacta

| Opción | Tradeoff | Decisión |
|---|---|---|
| **(A) `/cuenta/contrataciones` lista TODAS las del usuario, filtrable por estado** | role-aware vía `GET /contrataciones`; no toca UC08; matcher ya cubre | **ELEGIDA** |
| (B) extender `/cuenta/solicitudes` con tabs | riesgo de romper UC08 verificado; mezcla "pendientes prestador" con "seguimiento" | rechazada |

**Rationale**: la spec pide seguimiento de **todas** las contrataciones (cliente y prestador); UC08
`/cuenta/solicitudes` es la bandeja de **pendientes del prestador** (`?estado=solicitada`) y está verificada
(35 tests). La vista nueva consume el MISMO `GET /contrataciones` **sin filtro** (todas) con
agrupación/filtro client-side por estado (activas vs. terminadas, o `?estado=`). `proxy.ts` matcher
`/cuenta/:path*` ya la protege → **sin cambios**. Coherencia: UC08 sigue siendo el "inbox" de trabajo
entrante; UC09 es el "seguimiento" del ciclo de vida.

### ADR-09-04 — Historial: **diferir el timeline detallado**; mostrar estado + "próximo paso" + acciones

| Opción | Tradeoff | Decisión |
|---|---|---|
| **(A) NO endpoint nuevo; ítem muestra estado actual + "próximo paso" + acciones contextuales** | cumple seguimiento/gestión (REQ-05/06/07) con backend cero; el timeline RF-6.7 queda como follow-up | **ELEGIDA (mínimo que cumple)** |
| (B) `GET /contrataciones/:id` que devuelve la contratación + `StateChangeHistory[]` | satisface REQ-08 plenamente; costo: caso de uso + DTO + ownership + adapter de historial | follow-up documentado |

**Rationale**: la spec marca REQ-08 (timeline del historial) como requisito, pero `StateChangeHistory` **no
tiene endpoint** y exponerlo es trabajo backend no trivial (ownership por participante, DTO, query por
`contratacionId`). El **valor de seguimiento/gestión** (estado actual, "próximo paso", acciones) se entrega
SIN historial. El badge de estado + el texto "próximo paso" ya comunican dónde está la contratación. El
timeline cronológico se documenta como **follow-up (opción B)** — gate: si la cátedra exige el timeline en
esta entrega, se promueve B a in-scope (1 caso de uso de lectura + DTO, espeja `list`). Se anota en Open
Questions.

### ADR-09-05 — `accionesPara(rol, estado)`: **helper puro testeable** (defensa en profundidad)

**Choice**: función pura en `lib/api/acciones-contratacion.ts` que dado `(rol, estado)` devuelve el array de
acciones permitidas, espejando la matriz del backend (REQ-07). La UI renderiza solo esas; el backend es la
autoridad real (403/409). Sin DOM → unit test directo.

```ts
export type AccionContratacion = "confirmar" | "iniciar" | "finalizar" | "cancelar";
// matriz UI (espeja state-machine + actor de la spec):
//  cliente   + presupuestada            → ["confirmar", "cancelar"]   (cancelar = rechazar UC21)
//  cliente   + solicitada|confirmada|en_curso → ["cancelar"]
//  prestador + confirmada               → ["iniciar", "cancelar"]
//  prestador + en_curso                 → ["finalizar", "cancelar"]
//  *         + finalizada|cancelada      → []   (terminales, RN-SM-02)
export function accionesPara(rol: "cliente" | "prestador", estado: ContratacionEstado): AccionContratacion[];
```

### ADR-09-06 — Refresh + confirmación: **`router.refresh()`** y **`ConfirmDialog` genérico** (de `RechazarConfirm`)

**Choice**: tras 200/404/409 de cualquier transición → `router.refresh()` (re-ejecuta el Server Component con
`backendFetch cache:'no-store'`, ADR-08-04) → recalcula badge + acciones sin recarga manual (REQ-11/12).
Acciones **irreversibles** (finalizar, cancelar/rechazar) → paso de confirmación accesible (`role="dialog"`,
`aria-modal`, foco atrapado) generalizando `rechazar-confirm.tsx` → `confirm-accion.tsx` (mensaje +
`onConfirm` parametrizables). Confirmar/iniciar (no destructivas) → sin confirmación (REQ-09).

---

## Data Flow

```
─────────  SEGUIMIENTO (lectura, SSR)  ─────────
GET /cuenta/contrataciones   (proxy.ts ya garantizó sesión)
  ▼ page.tsx (Server) → backendFetch('/contrataciones')   [server-only, todas las del user]
     unauthorized/401 → redirect('/login?next=/cuenta/contrataciones')   (ESC-UI-11)
     200 → ContratacionListItem[]  ·  5xx/red → <SeguimientoError role=alert> (ESC-UI-10)
  ▼ <SeguimientoLista items rol={user.role}/> → vacío? estado vacío : <ContratacionCard/> por ítem
     cada card: contraparte, ubicación, fecha/franja, precio?, <EstadoBadge>, "próximo paso",
                <AccionesContratacion acciones={accionesPara(rol, estado)}/>

─────────  ACCIÓN (transición)  ─────────
<AccionesContratacion> (client)
  │ confirmar/iniciar → directo   │ finalizar/cancelar → <ConfirmAccion> (REQ-09)
  ▼ confirmar|iniciar|finalizar|cancelar(id)   [lib/api/contrataciones.ts]
  ▼ fetch('/api/contrataciones/{id}/{confirm|start|finish|cancel}')   (same-origin)
  ▼ Route Handler BFF [id]/<verbo> → backendFetch('/contrataciones/{id}/<verbo>', POST)
     │ cookie so_session → Bearer  →  BACKEND POST  → service: rol→ownership(404)→estado(409)→save→SM
  ▼ ResponderResult {ok,kind} → UX:
     200 → toast role=status (catálogo es-AR) + router.refresh()       (REQ-11)
     401 → router.push('/login?next=/cuenta/contrataciones')           (ESC-UI-11)
     403 → copy "sin permiso" (prevenido por accionesPara)             (REQ-07)
     404 → copy "ya no disponible" + router.refresh()                  (ESC-UI-08)
     409 → copy "estado cambió" + router.refresh()                     (ESC-UI-07)
     red/5xx → banner no técnico, reintentar                           (ESC-UI-10)
```

---

## File Changes

### Backend (`server/`)

| File | Action | Description |
|------|--------|-------------|
| `contratacion/contratacion.controller.ts` | Modify | + 4 handlers `@Post(':id/{confirm,start,finish,cancel}') @HttpCode(200)`; cada uno deriva `sub`/`role` de `req.user`, delega en el service. Espeja `reject`. |
| `contratacion/application/contratacion.service.ts` | Modify | + `confirm/start/finish/cancel(id, userId, role)`. Espejan `reject`: guard rol → ownership (404) → estado-actual (409 `ConflictException`) → `entity.estado=destino` → `repo.save` → `stateMachine.transitionTo`. `cancel` valida participante (cliente **o** prestador) y rechaza solo terminales (ADR-09-02). |

> `GET /contrataciones`, repo, adapter, DTOs, módulo: **SIN CAMBIOS** (reuso UC08). `AuthGuard('jwt')` ya da
> 401. No migration: `entity.estado` ya tiene los 6 valores; el historial ya se registra.

### Frontend (`client/`)

| File | Action | Description |
|------|--------|-------------|
| `app/api/contrataciones/[id]/confirm/route.ts` | Create | clon de `reject/route.ts` → `backendFetch('/contrataciones/{id}/confirm', POST)`, sin body. |
| `app/api/contrataciones/[id]/start/route.ts` | Create | idem → `.../start`. |
| `app/api/contrataciones/[id]/finish/route.ts` | Create | idem → `.../finish`. |
| `app/api/contrataciones/[id]/cancel/route.ts` | Create | idem → `.../cancel`. |
| `lib/api/contrataciones.ts` | Modify | + `confirmar/iniciar/finalizar/cancelar(id)` reusando `mapResponder` + `safeJson` ya existentes. NO toca lo de UC07/UC08. |
| `lib/api/acciones-contratacion.ts` | Create | helper puro `accionesPara(rol, estado)` (ADR-09-05). |
| `lib/copy/es-AR.ts` | Modify | + `copy.seguimiento.*`: "próximo paso" por (rol,estado), labels de acción, mensajes de éxito/confirmación del catálogo es-AR de la spec. |
| `app/(protegido)/cuenta/contrataciones/page.tsx` | Create | Server Component: `backendFetch('/contrataciones')`; unauthorized→`redirect`; error→`<SeguimientoError/>`; ok→`<SeguimientoLista rol={...}/>`. |
| `components/cuentas/seguimiento/seguimiento-lista.tsx` | Create | recibe `items`+`rol`; filtro por estado (activas/terminadas); vacío/lista; navegable por teclado (REQ-14). |
| `components/cuentas/seguimiento/contratacion-card.tsx` | Create | `'use client'`: datos + `<EstadoBadge>` (REUSO) + "próximo paso" + `<AccionesContratacion>`. |
| `components/cuentas/seguimiento/acciones-contratacion.tsx` | Create | `'use client'` CORAZÓN: renderiza `accionesPara`, dispara api-client, anti-doble-submit (`aria-busy`), mapeo status, `router.refresh()`. |
| `components/cuentas/bandeja/rechazar-confirm.tsx` → `confirm-accion.tsx` | Modify/Generalize | dialog accesible parametrizado (mensaje + `onConfirm`) reusado por finalizar/cancelar/rechazar (REQ-09). |
| `components/cuentas/seguimiento/seguimiento-error.tsx` | Create | banner `role="alert"` + reintentar (ESC-UI-10). |
| `e2e/seguimiento-contrataciones.spec.ts` | Create | placeholder ESC-UI-01..11 (los escribe el Verificador). |

> `EstadoBadge` ya cubre los 6 estados (REQ-15). `proxy.ts` **sin cambios**.

---

## Interfaces / Contracts

```ts
// lib/api/contrataciones.ts  (se AGREGA; mismo ResponderResult/mapResponder de UC08)
// id en la URL, sin body; el backend deriva participante del token (REQ-10).
export function confirmar(id: string): Promise<ResponderResult>;  // 200 → estado 'confirmada'
export function iniciar(id: string): Promise<ResponderResult>;    // 200 → 'en_curso'
export function finalizar(id: string): Promise<ResponderResult>;  // 200 → 'finalizada'
export function cancelar(id: string): Promise<ResponderResult>;   // 200 → 'cancelada'
```

```ts
// contratacion.service.ts — método NUEVO (espejo de reject; los 4 comparten estructura)
async confirm(id: string, userId: string, role: string): Promise<ContratacionResponseDto> {
  if ((role as UserRole) !== UserRole.CLIENTE) throw new ForbiddenException(...);     // 403
  const c = await this.contratacionRepo.findById(id);
  if (!c || c.clienteId !== userId) throw new NotFoundException(...);                 // 404 (oculta)
  if (c.estado !== ContratacionEstado.PRESUPUESTADA) throw new ConflictException(...);// 409
  c.estado = ContratacionEstado.CONFIRMADA;
  const saved = await this.contratacionRepo.save(c);
  await this.stateMachine.transitionTo(saved.id, ContratacionEstado.CONFIRMADA);     // 2ª barrera
  return new ContratacionResponseDto({ ...saved });
}
// start: PRESTADOR + c.prestadorId===userId + estado CONFIRMADA → EN_CURSO
// finish: PRESTADOR + c.prestadorId===userId + estado EN_CURSO → FINALIZADA
// cancel: c.clienteId===userId || c.prestadorId===userId (sino 404);
//         estado terminal (FINALIZADA|CANCELADA) → 409; resto → CANCELADA
```

---

## Mapeo escenario → componente / función

| Escenario | Componente / función | Mecanismo |
|---|---|---|
| ESC-UI-01/02 seguimiento role-aware | `page.tsx` SSR → `<SeguimientoLista rol>` → `<ContratacionCard>`/`<EstadoBadge>` | `GET /contrataciones` filtrado por token |
| ESC-UI-03 confirmar | `accionesPara('cliente','presupuestada')` → `confirmar(id)` → refresh | 200 → badge "Confirmada", sin confirmación |
| ESC-UI-04 iniciar | `accionesPara('prestador','confirmada')` → `iniciar(id)` → refresh | 200 → "En curso" → próxima acción "Finalizar" |
| ESC-UI-05 finalizar | `<ConfirmAccion>` → `finalizar(id)` → refresh | 200 → "Finalizada", sin acciones (terminal) |
| ESC-UI-06 cancelar (ambos) | `<ConfirmAccion>` → `cancelar(id)` → refresh | 200 → "Cancelada"; service valida participante |
| ESC-UI-07 409 concurrencia | `mapResponder('estado_cambiado')` + `router.refresh()` | accionable, no error de sistema |
| ESC-UI-08 aislamiento 404 | service ownership → 404; `kind:'no_disponible'` + refresh | indistinguible inexistente/ajena |
| ESC-UI-09 historial | DIFERIDO (ADR-09-04) — estado + "próximo paso" en card | follow-up `GET /contrataciones/:id` |
| ESC-UI-10 vacío/error | `<SeguimientoLista>` vacío vs `<SeguimientoError>` `role=alert` | 200 `[]` vs 5xx/red |
| ESC-UI-11 401 | `page.tsx` redirect; api-client `unauthorized`→`router.push('/login?next=')` | sentinel o backend |

---

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Jest (service) | `confirm`: cliente no-dueño/no-cliente → 403/404; estado≠presupuestada → 409; ok → CONFIRMADA + `transitionTo` llamado | mock repo + SM; assert guards y estado destino |
| Jest (service) | `start`/`finish`: prestador-dueño + estado correcto; rol/ownership/estado errados → 403/404/409 | idem por transición |
| Jest (service) | `cancel`: participante (cliente Y prestador) ok desde activos; tercero → 404; terminal → 409 | matriz de (actor, estado) |
| Jest (controller) | los 4 handlers derivan `sub`/`role` de `req.user` (nunca del body) y delegan | mock service, `req.user` fake |
| vitest (puro) | `accionesPara(rol, estado)` para los 12 pares de la matriz (incl. terminales → `[]`) | tabla de casos |
| vitest (puro) | `confirmar/iniciar/finalizar/cancelar` mapean status → `kind` (OCL: nunca throw 4xx) | mock `fetch` |
| Playwright (E2E) | ESC-UI-01..11 (uno por escenario) | `page.route('**/api/contrataciones**', …)` por status; assert badge/toast/refresh/confirmación/redirect; token NUNCA en bundle |

**OCL clave:** las 4 funciones del api-client NUNCA lanzan para 4xx; el payload de transición NUNCA lleva id/
identidad en body (va en URL); `accionesPara` nunca ofrece una acción fuera de la matriz; el service deriva
identidad SIEMPRE de `userId` (token), nunca del input.

---

## Notas de seguridad

- **Aislamiento (RN-CON-07):** los 4 service methods derivan participante de `userId=req.user.sub`; ownership
  errado → **404** (oculta existencia, no 403). La UI no ofrece input para id ajeno; `GET /contrataciones`
  filtra por token. `accionesPara` es defensa client-side, no autoridad.
- **Token no expuesto (RNF-S.1/S.4):** lectura (SSR) y transiciones pasan por `backendFetch` (`server-only`,
  cookie httpOnly → Bearer server→server). El id es el único dato client→server, en la URL.
- **Sesión expirada (RN-AUTH-06):** sentinel `unauthorized` del helper + 401 del backend → ambos redirigen a
  `/login?next=` preservando destino.

## Migration / Rollout

No migration. Backend **aditivo**: 4 handlers + 4 métodos de service; cero cambios de esquema, repo o módulo.
Frontend aditivo + generalización de `rechazar-confirm`. `proxy.ts` sin cambios.

## Open Questions

- [ ] **S1 — Historial/timeline (REQ-08):** diferido (ADR-09-04). Confirmar con la cátedra si el timeline
  cronológico se exige en esta entrega → si sí, promover `GET /contrataciones/:id` con `StateChangeHistory[]`.
- [ ] **S2 — Política de cancelación por estado (UC10):** se adopta "cualquier estado activo → cancelada"
  (coincide con la matriz). Confirmar si el negocio restringe (ej. cliente no cancela `en_curso`).
- [ ] **S3 — Filtro de la vista:** default agrupación client-side activas/terminadas; confirmar si se quiere
  `?estado=` en la URL (bookmarkeable) en tasks.
