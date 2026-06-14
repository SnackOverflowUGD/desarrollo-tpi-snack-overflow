# Tasks: MI-09.3 UI gestión y seguimiento de contrataciones (UC09) — full-stack

> Deriva de `spec.md` (REQ-01..15, ESC-UI-01..11, catálogo es-AR) y `design.md` (ADR-09-01..06,
> §File Changes, §Interfaces, §Testing). Rutas backend relativas a `server/src/`, frontend a `client/`.
> `[P]` = paralelizable dentro de la misma fase (sin dependencia de orden entre ellas).
>
> **Orden global:** BACKEND primero (el frontend consume su contrato). Backend **aditivo y total**
> (hexagonal, `AuthGuard('jwt')` ya a nivel `@Controller`): 4 service methods + 4 controller handlers;
> CERO cambios de esquema, repo, adapter, DTOs ni módulo (reuso UC08). Frontend reusa TOTAL de UC07/UC08:
> `backendFetch` server-only, Route Handler BFF clonado de `reject`, patrón discriminado `{ok,kind}` /
> `mapResponder`, `EstadoBadge`, generalización de `rechazar-confirm`. `proxy.ts` **SIN CAMBIOS** (matcher
> `/cuenta/:path*` ya cubre la vista nueva).
>
> **Stack:** Backend NestJS + TypeORM + Jest · Frontend Next 16 App Router (`params`/`cookies()` async,
> `proxy.ts`) · React 19 · Tailwind v4 · TS strict · vitest 4.1 · Playwright 1.60.
>
> **Decisiones cerradas (NO reabrir):** 4 POST `/contrataciones/:id/{confirm,start,finish,cancel}` (ADR-09-01);
> guard de estado-actual **en el service → `ConflictException` 409** ANTES de la state machine, NO dejar
> burbujear `InvalidTransitionError` (Error plano → 500) (ADR-09-02); vista nueva `/cuenta/contrataciones`
> role-aware, bandeja UC08 **intacta** (ADR-09-03); **historial/timeline DIFERIDO** — mostrar estado +
> "próximo paso" + acciones, sin endpoint nuevo (ADR-09-04); helper puro `accionesPara(rol, estado)` (ADR-09-05);
> `router.refresh()` + `ConfirmAccion` generalizado para finalizar/cancelar (ADR-09-06).

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700-900 (backend: 4 service methods + 4 controller handlers + Jest; frontend: 4 Route Handlers + api-client + helper puro + copy + 5 componentes + página + generalización confirm + vitest + E2E) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (backend completo: 4 service methods + 4 controller handlers + Jest) → PR 2 (frontend foundation: copy + helper puro + BFF 4 Route Handlers + api-client) → PR 3 (frontend UI: página + componentes + generalización confirm) → PR 4 (vitest + E2E + verificación final) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend: 4 service methods (`confirm/start/finish/cancel` con guards rol→ownership 404→estado 409→save→SM) + 4 controller handlers + Jest | PR 1 | Contrato que el frontend consume. Espeja `reject`. Base: main |
| 2 | Frontend foundation: copy es-AR + helper puro `accionesPara` + mapeo errores + BFF (4 Route Handlers) + api-client (4 acciones discriminadas) | PR 2 | Depende de Unit 1 (contrato). Sin DOM. Base: main (stacked) |
| 3 | Frontend UI: página seguimiento SSR + card con acciones contextuales + `ConfirmAccion` generalizado + filtro estado + loading/empty/error | PR 3 | Depende de Unit 2. Base: main (stacked) |
| 4 | vitest (puro) + E2E Playwright ESC-UI-01..11 + verificación final (incl. `npm run test` server) | PR 4 | Tests los escribe el Verificador. Base: main |

---

## Phase 1: Backend — 4 service methods + 4 controller handlers + Jest (espeja `reject`)

- [x] 1.1 Modificar `server/src/contratacion/application/contratacion.service.ts`: agregar `confirm(id, userId, role)`.
  Guard rol `CLIENTE` (sino `ForbiddenException` 403) → `findById`; `!c || c.clienteId !== userId` → `NotFoundException`
  404 (oculta existencia) → `c.estado !== PRESUPUESTADA` → **`ConflictException` 409** (NO dejar burbujear
  `InvalidTransitionError`) → `c.estado = CONFIRMADA` → `repo.save` → `stateMachine.transitionTo(saved.id, CONFIRMADA)`
  (2ª barrera) → `new ContratacionResponseDto`. Espeja `reject`. (ADR-09-01/02, REQ-01, ESC-UI-03)
- [x] 1.2 Modificar `server/src/contratacion/application/contratacion.service.ts` (mismo archivo que 1.1): agregar
  `start(id, userId, role)`. Guard rol `PRESTADOR` (403) → ownership `c.prestadorId !== userId` → 404 → `c.estado !==
  CONFIRMADA` → 409 → `EN_CURSO` → save → `transitionTo`. (ADR-09-01/02, REQ-02, ESC-UI-04)
- [x] 1.3 Modificar `server/src/contratacion/application/contratacion.service.ts` (mismo archivo): agregar
  `finish(id, userId, role)`. Guard rol `PRESTADOR` (403) → ownership `prestadorId` → 404 → `c.estado !== EN_CURSO` →
  409 → `FINALIZADA` (terminal) → save → `transitionTo`. (ADR-09-01/02, REQ-03, ESC-UI-05)
- [x] 1.4 Modificar `server/src/contratacion/application/contratacion.service.ts` (mismo archivo): agregar
  `cancel(id, userId, role)`. Guard **participante**: `c.clienteId === userId || c.prestadorId === userId` (sino 404,
  NO 403 — cualquier rol participa) → estado **terminal** (`FINALIZADA | CANCELADA`) → 409 → resto activo
  (`solicitada|presupuestada|confirmada|en_curso`) → `CANCELADA` (terminal) → save → `transitionTo`. Reusado por el
  "rechazar propuesta" del cliente (UC21). (ADR-09-01/02, REQ-04, ESC-UI-06)
- [x] 1.5 Modificar `server/src/contratacion/contratacion.controller.ts` (depende de 1.1..1.4): agregar 4 handlers
  `@Post(':id/confirm'|'start'|'finish'|'cancel') @HttpCode(200)`. Cada uno deriva `sub`/`role` de `req.user`
  (`JwtPayload`, **NUNCA del body** — sin body), pasa `(id, req.user.sub, req.user.role)` al service method. `AuthGuard('jwt')`
  ya a nivel controller → 401 sin código extra. (ADR-09-01, REQ-10)
- [x] 1.6 `[P]` Jest service `server/src/contratacion/application/contratacion.service.spec.ts`: `confirm` —
  rol≠CLIENTE→403; no-dueño→404; estado≠presupuestada→409; ok→CONFIRMADA + `transitionTo` llamado con destino correcto.
  Mock `findById`/`save`/`stateMachine`. (design §Testing, REQ-01)
- [x] 1.7 `[P]` Jest service (mismo spec): `start` y `finish` — prestador-dueño + estado correcto→ok; rol/ownership/estado
  errados→403/404/409; verificar destino (`EN_CURSO`/`FINALIZADA`) y `transitionTo`. (design §Testing, REQ-02/03)
- [x] 1.8 `[P]` Jest service (mismo spec): `cancel` — matriz (actor, estado): cliente participante desde activo→ok;
  prestador participante desde activo→ok; tercero (ni cliente ni prestador)→404; estado terminal→409; verificar destino
  `CANCELADA`. (design §Testing, REQ-04)
- [x] 1.9 `[P]` Jest controller `server/src/contratacion/contratacion.controller.spec.ts`: los 4 handlers derivan
  `sub`/`role` de `req.user` (NUNCA del body) y delegan en el service method correspondiente; `@HttpCode(200)`. Mock
  service, `req.user` fake. (design §Testing, REQ-10)

## Phase 2: Frontend foundation — copy, helper puro, mapeo errores (sin I/O, sin DOM)

- [x] 2.1 `[P]` Crear `client/lib/api/acciones-contratacion.ts`: helper PURO `accionesPara(rol, estado)` → `AccionContratacion[]`
  (`"confirmar"|"iniciar"|"finalizar"|"cancelar"`), espejando la matriz del backend (ADR-09-05): cliente+presupuestada→
  `["confirmar","cancelar"]`; cliente+(solicitada|confirmada|en_curso)→`["cancelar"]`; prestador+confirmada→`["iniciar","cancelar"]`;
  prestador+en_curso→`["finalizar","cancelar"]`; *+terminal→`[]`. Sin DOM. (ADR-09-05, REQ-07)
- [x] 2.2 `[P]` Extender `client/lib/copy/es-AR.ts`: agregar `copy.seguimiento.*` con textos EXACTOS del catálogo es-AR del
  spec — "próximo paso" por (rol,estado) (6 entradas), labels de acción (confirmar/iniciar/finalizar/cancelar/rechazar),
  mensajes de éxito (confirmar/iniciar/finalizar/cancelar), confirmaciones (finalizar/cancelar), 409/404/403, vacío,
  error listar, error accionar. (spec §Catálogo, REQ-06/09/11/12)
- [x] 2.3 `[P]` Extender mapeo de errores en `client/lib/errors/field-errors.ts` (o reusar `mapResponderError` de UC08):
  asegurar `kind` → mensaje es-AR desde `copy.seguimiento` (`forbidden`→sin permiso, `no_disponible`→"ya no disponible"
  accionable, `estado_cambiado`→"estado cambió" accionable, `network`/`server`→banner). NO expone trazas. (REQ-07/12/13)

## Phase 3: Frontend BFF — 4 Route Handlers (clonados del de `reject`, sobre `backendFetch`)

- [x] 3.1 `[P]` Crear `client/app/api/contrataciones/[id]/confirm/route.ts`: `POST` — `const {id} = await ctx.params`, SIN
  body → `backendFetch('/contrataciones/'+id+'/confirm', POST)`; sentinel `unauthorized`→401; status+body verbatim; `catch`
  red→502. `id` en URL, NUNCA identidad en body. (design §File Changes, REQ-01/10)
- [x] 3.2 `[P]` Crear `client/app/api/contrataciones/[id]/start/route.ts`: idem 3.1 → `.../start`. (REQ-02/10)
- [x] 3.3 `[P]` Crear `client/app/api/contrataciones/[id]/finish/route.ts`: idem 3.1 → `.../finish`. (REQ-03/10)
- [x] 3.4 `[P]` Crear `client/app/api/contrataciones/[id]/cancel/route.ts`: idem 3.1 → `.../cancel`. (REQ-04/10)

## Phase 4: Frontend api-client — 4 acciones discriminadas (`lib/api/contrataciones.ts`)

- [x] 4.1 Extender `client/lib/api/contrataciones.ts` (depende de Phase 3): agregar `confirmar/iniciar/finalizar/cancelar(id)`
  → `fetch('/api/contrataciones/'+id+'/'+{confirm|start|finish|cancel}, POST)`; reusar `mapResponder` + `safeJson` de UC08;
  mapeo 200→`{ok:true,data}` · 401→`unauthorized` · 403→`forbidden` · 404→`no_disponible` · 409→`estado_cambiado` ·
  5xx/502→`server` · throw→`network`. **NUNCA lanza 4xx.** Payload SIN `id`/identidad (va en URL). NO toca lo de UC07/UC08.
  (design §Interfaces, REQ-07..13, OCL §Testing)

## Phase 5: Frontend UI — página seguimiento SSR + componentes (`components/cuentas/seguimiento/`)

- [x] 5.1 `[P]` Generalizar `client/components/cuentas/bandeja/rechazar-confirm.tsx` → `confirm-accion.tsx` (`'use client'`):
  dialog accesible parametrizado (`role="dialog"`, `aria-modal`, foco atrapado y restaurado, cierre por teclado) con `mensaje`
  + `onConfirm` por prop. Reusado por finalizar/cancelar/rechazar. UC08 debe seguir funcionando (rechazar). (ADR-09-06, REQ-09/14)
- [x] 5.2 `[P]` Crear `client/components/cuentas/seguimiento/seguimiento-error.tsx`: banner `role="alert"`
  (`copy.seguimiento.errorListar`) + botón reintentar. (REQ-14, ESC-UI-10)
- [x] 5.3 Crear `client/components/cuentas/seguimiento/acciones-contratacion.tsx` (`'use client'`, depende de 2.1/2.2/2.3/4.1/5.1):
  CORAZÓN. Renderiza SOLO `accionesPara(rol, estado)`; confirmar/iniciar → directo; finalizar/cancelar → `<ConfirmAccion>`
  (REQ-09). Dispara la fn del api-client; anti-doble-submit (`aria-busy`, botón loading, REQ-11); mapeo `kind`:
  200→toast `role=status` (catálogo es-AR) + `router.refresh()`; 401→`router.push('/login?next=/cuenta/contrataciones')`
  (ESC-UI-11); 403→copy sin permiso; 404→"ya no disponible" + refresh (ESC-UI-08); 409→"estado cambió" + refresh
  (ESC-UI-07); red/5xx→banner. a11y target ≥44px, texto en botones. (ADR-09-05/06, REQ-07/09/11/12/13/14, ESC-UI-03..08/11)
- [x] 5.4 `[P]` Crear `client/components/cuentas/seguimiento/contratacion-card.tsx` (`'use client'`, depende de 5.3): muestra
  contraparte (prestador/oficio o cliente según rol), ubicación, fecha/franja, precio si `presupuestada`+, `<EstadoBadge/>`
  (REUSO de UC08, cubre los 6 estados, REQ-15) + texto "próximo paso" por (rol,estado) desde `copy.seguimiento`
  + `<AccionesContratacion>`. a11y por ítem. (REQ-06/14/15)
- [x] 5.5 Crear `client/components/cuentas/seguimiento/seguimiento-lista.tsx` (depende de 5.4): recibe `items` + `rol`; filtro
  client-side por estado (activas vs. terminadas); vacío→estado vacío (`copy.seguimiento.vacio`, NO error, ESC-UI-10) : lista
  de `<ContratacionCard rol/>`. Navegable por teclado. (REQ-05/14, ESC-UI-01/02/10)
- [x] 5.6 Crear `client/app/(protegido)/cuenta/contrataciones/page.tsx` (Server Component, depende de 5.2/5.5):
  `backendFetch('/contrataciones')` (TODAS las del user, sin filtro); unauthorized→`redirect('/login?next=/cuenta/contrataciones')`
  (ESC-UI-11); error→`<SeguimientoError/>` (ESC-UI-10); ok→`<SeguimientoLista items rol={user.role}/>`. **NO tocar
  `/cuenta/solicitudes`** (bandeja UC08). `proxy.ts` ya protege (SIN cambios). (ADR-09-03/04, REQ-05/10/13, ESC-UI-01/02/10/11)

## Phase 6: Unit tests — Jest backend (cubierto en Phase 1) + vitest frontend (los escribe el Verificador)

- [x] 6.1 `[P]` vitest `client/lib/api/acciones-contratacion.ts`: `accionesPara` para los pares de la matriz (cliente×
  presupuestada/solicitada/confirmada/en_curso, prestador×confirmada/en_curso, ambos×finalizada/cancelada→`[]`); assert
  NUNCA ofrece acción fuera de la matriz. (ADR-09-05, design §Testing) → `test/unit/acciones-contratacion.test.ts`
- [x] 6.2 `[P]` vitest `client/lib/api/contrataciones.ts`: mock `fetch`; `confirmar/iniciar/finalizar/cancelar` mapean cada
  status → `kind` (200/401/403/404/409/5xx/throw); assert NUNCA lanza 4xx; payload NUNCA incluye `id`/identidad.
  (OCL §Testing) → `test/unit/contrataciones-transicion-api.test.ts`
- [x] 6.3 `[P]` vitest mapeo errores (`client/lib/errors/field-errors.ts`): `kind` (forbidden/no_disponible/estado_cambiado/
  network/server) → mensaje es-AR del catálogo `copy.seguimiento`; sin trazas. (REQ-07/12/13) → `test/unit/seguimiento-errors.test.ts`

## Phase 7: E2E tests (Playwright — los escribe el Verificador)

- [ ] 7.1 Crear `client/e2e/seguimiento-contrataciones.spec.ts` — seguimiento + acciones OK: ESC-UI-01 (cliente, mock GET 200
  → lista filtrada por token, badges correctos, "próximo paso", token NUNCA en bundle); ESC-UI-02 (prestador, lista role-aware
  + acciones por estado); ESC-UI-03 (confirmar → 200 → badge "Confirmada", sin "Confirmar", sin confirmación previa);
  ESC-UI-04 (iniciar → 200 → "En curso" → próxima acción "Finalizar"). Interceptar `**/api/contrataciones**`. (§Testing, REQ-01/02/05/07/11)
- [ ] 7.2 `[P]` `client/e2e/seguimiento-contrataciones.spec.ts` — irreversibles + errores + aislamiento: ESC-UI-05 (finalizar
  → confirmación → 200 → "Finalizada", sin más acciones; sin confirmar NO invoca); ESC-UI-06 (cancelar cliente/prestador →
  confirmación → 200 → "Cancelada"); ESC-UI-07 (mock 409 → accionable + refresh, sin fallo de sistema); ESC-UI-08 (mock 404
  → "ya no disponible" + refresh; sin UI por id ajeno); ESC-UI-10 (GET `[]`→vacío NO error; GET 500→`role=alert` + reintentar);
  ESC-UI-11 (mock 401 → `/login?next=/cuenta/contrataciones`). (§Testing, REQ-04/09/11/12/13, ESC-UI-05..08/10/11)

## Phase 8: Verificación final

- [x] 8.1 Backend: correr `npm run test` del **server** (Jest) — service (`confirm/start/finish/cancel`: authz/ownership 404/409/ok
  + `transitionTo`) y controller (4 handlers derivan token, `@HttpCode(200)`) verdes. Confirmar cambios aditivos: NO rompe tests
  de `list`/`proposal`/`reject`/`save`/`findById` existentes. (design §Testing)
- [x] 8.2 Frontend: correr `lint` (ESLint) + `tsc --noEmit` — 0 errores en archivos nuevos/modificados. Confirmar que los 4
  Route Handlers usan `backendFetch` (`server-only`) y que el token NUNCA entra al bundle (importarlo desde client = build error).
  (design §Notas de seguridad, REQ-10)
- [x] 8.3 Frontend: correr `test:unit` (vitest) — todos verdes; cubren OCL §Testing (`accionesPara` matriz, mapeo status de las
  4 acciones, mapeo errores). (design §Testing)
- [ ] 8.4 Frontend: correr `test:e2e` (Playwright) — ESC-UI-01..11 verdes en Chrome/Firefox/Safari. (RNF-A.2)
- [ ] 8.5 **Smoke aislamiento + no-regresión (crítico):** confirmar que `/cuenta/contrataciones` redirige a `/login?next=` sin
  sesión (matcher `proxy.ts`, SIN cambios); que la vista lista solo las del usuario (backend filtra por token, 404 en ajenas);
  y que `/cuenta/solicitudes` (bandeja UC08) sigue intacta y verde. (ADR-09-03, design §Notas de seguridad, REQ-13)
