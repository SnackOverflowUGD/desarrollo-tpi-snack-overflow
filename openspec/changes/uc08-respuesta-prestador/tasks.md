# Tasks: MI-08.2 Respuesta del prestador a solicitudes (UC08) — full-stack

> Deriva de `spec.md` (REQ-01..15, ESC-UI-01..08, catálogo es-AR) y `design.md` (ADR-08-01..05,
> §File Changes, §Interfaces, §Testing). Rutas backend relativas a `server/`, frontend a `client/`.
> `[P]` = paralelizable dentro de la misma fase (sin dependencia de orden entre ellas).
>
> **Orden global:** BACKEND primero (el frontend consume su contrato). Backend aditivo
> (hexagonal: port → adapter → service → controller, `AuthGuard('jwt')` ya a nivel `@Controller`).
> Frontend reusa TOTAL de UC07: `backendFetch` server-only, Route Handler BFF, patrón `{ok,kind}`,
> `esFechaValida`/`hoyISO`. `proxy.ts` **SIN CAMBIOS** (matcher `/cuenta/:path*` ya cubre la bandeja).
>
> **Stack:** Backend NestJS + TypeORM + Jest · Frontend Next 16.2.9 App Router (`params`/`searchParams`
> Promise) · React 19 · Tailwind v4 · TS strict · RHF 7.79 + zod 4.4 · vitest 4.1 · Playwright 1.60.
> **Decisión S3 (bandeja):** vista única "Pendientes" (`?estado=solicitada`); solapas para otros estados
> fuera de alcance UC08 (las consume MI-09.x).

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700-850 (backend: 2 DTO + port + adapter + service + controller + Jest; frontend: 3 Route Handlers + api-client + validación + copy/errors + 6 componentes + página + vitest + E2E) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (backend completo: DTOs + port/adapter + service.list + controller GET + Jest) → PR 2 (frontend foundation + BFF + api-client) → PR 3 (frontend UI: página + componentes) → PR 4 (vitest + E2E + verificación final) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Backend `GET /contrataciones` role-aware: DTOs + `findByParticipante` + `service.list` enriquecido + controller + Jest | PR 1 | Contrato que el frontend consume. Reusable por MI-09.3 (rama CLIENTE). Base: main |
| 2 | Frontend foundation (copy/validación/tipos) + BFF (3 Route Handlers) + api-client discriminado | PR 2 | Depende de Unit 1 (contrato). Sin DOM. Base: main (stacked) |
| 3 | Frontend UI: página bandeja SSR + card + badge + form presupuestar + confirmar rechazar + estados | PR 3 | Depende de Unit 2. Base: main (stacked) |
| 4 | vitest (puro) + E2E Playwright ESC-UI-01..08 + verificación final (incl. `npm run test` server) | PR 4 | Tests los escribe el Verificador. Base: main |

---

## Phase 1: Backend — `GET /contrataciones` role-aware (port → adapter → service → controller → Jest)

- [x] 1.1 `[P]` Crear `server/.../contratacion/dto/list-contrataciones-query.dto.ts`: `{ estado?: ContratacionEstado }`
  con `@IsOptional() @IsEnum(ContratacionEstado)`. Valida `?estado=`; valor fuera del enum → 400. (design §File Changes, REQ-01)
- [x] 1.2 `[P]` Crear `server/.../contratacion/dto/contratacion-list-item.dto.ts`: campos de `ContratacionResponseDto`
  + `clienteNombre: string`; constructor `Object.assign`. Es el read model del listado. (ADR-08-02, REQ-01/02)
- [x] 1.3 Modificar `server/.../contratacion/ports/contratacion-repository.port.ts`: agregar interface
  `ContratacionFiltro { prestadorId?; clienteId?; estado? }` y método `findByParticipante(filtro): Promise<Contratacion[]>`.
  NO romper `save`/`findById`. (ADR-08-01)
- [x] 1.4 Modificar `server/.../contratacion/adapters/typeorm-contratacion.repository.ts` (depende de 1.3): impl
  `findByParticipante` → arma `where` desde el filtro (solo claves seteadas) + `order: { createdAt: 'DESC' }`. (ADR-08-01, REQ-01)
- [x] 1.5 Modificar `server/.../contratacion/application/contratacion.service.ts` (depende de 1.2/1.4): método
  `list(userId, role, query)` — bifurca dimensión por rol (PRESTADOR→`prestadorId=userId`, CLIENTE→`clienteId=userId`),
  llama `findByParticipante`, enriquece cada ítem con `userRepo.findById(clienteId)` → `clienteNombre = name+' '+lastName`
  (null → `'Cliente'` placeholder). NO reordena (respeta orden del repo). (ADR-08-01/02, REQ-01/02)
- [x] 1.6 Modificar `server/.../contratacion/contratacion.controller.ts` (depende de 1.1/1.5): `@Get()` `@HttpCode(OK)` —
  deriva `sub`/`role` de `req.user` (JwtPayload, NUNCA del query), pasa `query.estado` a `service.list`. `AuthGuard('jwt')`
  ya a nivel controller → 401 sin sesión sin código extra. (ADR-08-01, REQ-01/08)

## Phase 2: Frontend foundation — copy, validación, tipos (sin I/O, sin DOM)

- [x] 2.1 `[P]` Extender `client/lib/copy/es-AR.ts`: agregar `copy.bandeja.*` con textos EXACTOS del catálogo es-AR del
  spec — labels (cliente/ubicación/fecha/franja/descripción/precio), badges (`Solicitada`/`Presupuestada`/`Cancelada`),
  mensajes (éxito presupuestar/rechazar, confirmación rechazar, 409, 404, 403, vacío, error listar, error responder).
  (spec §Catálogo, REQ-05/06/09/10/11/15)
- [x] 2.2 `[P]` Crear `client/lib/validation/proposal.ts`: schema zod presupuestar — `precioEstimado` number `>0`,
  `fecha` ISO date `refine(esFechaValida(v, hoyISO()))` (REUSO de `lib/validation/solicitud.ts`), `franja` `trim().min(1)`.
  Exportar `esPrecioValido(n)` **pura**. Mensajes desde `copy.bandeja`. (ADR-08-05, REQ-07, ESC-UI-05)

## Phase 3: Frontend BFF — Route Handlers (todos sobre `backendFetch` de UC07)

- [x] 3.1 Modificar `client/app/api/contrataciones/route.ts`: agregar `GET` handler — reenvía `?estado=` vía
  `backendFetch('/contrataciones'+qs)`; sentinel `unauthorized`→401; status+body verbatim; `catch` red→502. Mantiene el
  `POST` de UC07. (ADR-08-03, REQ-01/08)
- [x] 3.2 `[P]` Crear `client/app/api/contrataciones/[id]/proposal/route.ts`: `POST` — `const {id}=await ctx.params`,
  body raw → `backendFetch('/contrataciones/'+id+'/proposal', POST, content-type)`; sentinel→401; verbatim; red→502.
  `id` en URL, NUNCA en body. (ADR-08-03, REQ-04/05)
- [x] 3.3 `[P]` Crear `client/app/api/contrataciones/[id]/reject/route.ts`: `POST` — `await ctx.params.id`, SIN body →
  `backendFetch('/contrataciones/'+id+'/reject', POST)`; sentinel→401; verbatim; red→502. (ADR-08-03, REQ-06)

## Phase 4: Frontend api-client — funciones discriminadas (`lib/api/contrataciones.ts`)

- [x] 4.1 `[P]` Extender `client/lib/api/contrataciones.ts` con tipos: `ContratacionListItem` (mirror del DTO enriquecido,
  con `clienteNombre`), `SendProposalPayload` (`fecha`/`franja`/`precioEstimado`, **sin `id`/`prestadorId`**), `ListarResult`
  y `ResponderResult` discriminados. NO toca `crearSolicitud`/tipos de UC07. (design §Interfaces, REQ-04)
- [x] 4.2 `client/lib/api/contrataciones.ts` (depende de 4.1): `listarSolicitudes(filtros?)` → `fetch('/api/contrataciones'+qs)`;
  mapeo 200→`{ok:true,items}` · 401→`unauthorized` · 5xx/502→`server` · throw→`network`. **NUNCA lanza.** Reusar `safeJson`. (ADR-08-03, REQ-01, OCL §Testing)
- [x] 4.3 `client/lib/api/contrataciones.ts` (depende de 4.1): `enviarPropuesta(id,p)` y `rechazarSolicitud(id)` →
  `fetch('/api/contrataciones/'+id+'/proposal'|'/reject', POST)`; mapeo 200→`{ok:true,data}` · 401→`unauthorized` ·
  403→`forbidden` · 404→`no_disponible` · 409→`estado_cambiado` · 422/400→`validacion` · 5xx/502→`server` · throw→`network`.
  **NUNCA lanza 4xx.** (ADR-08-03, REQ-05..12, OCL §Testing)
- [x] 4.4 `[P]` Extender `client/lib/errors/field-errors.ts`: `mapResponderError(result)` → mensaje es-AR por `kind` desde
  `copy.bandeja` (forbidden/no_disponible/estado_cambiado→accionable, validacion→inline, network/server→banner). NO expone trazas. (REQ-09/10/11/12)

## Phase 5: Frontend UI — bandeja SSR + componentes (`components/cuentas/bandeja/`)

- [x] 5.1 `[P]` Crear `client/components/cuentas/bandeja/estado-badge.tsx`: badge texto+color por estado (tokens
  DESIGN-SYSTEM §estado: `solicitada`=info, `presupuestada`=warning, `cancelada`=error), texto SIEMPRE visible (WCAG 1.4.1). (REQ-15)
- [x] 5.2 `[P]` Crear `client/components/cuentas/bandeja/bandeja-error.tsx`: banner `role="alert"` (`copy.bandeja.errorListar`)
  + botón reintentar. (REQ-03, ESC-UI-07)
- [x] 5.3 Crear `client/components/cuentas/bandeja/presupuestar-form.tsx` (`'use client'`, depende de 2.1/2.2/4.3/4.4): CORAZÓN.
  RHF+zod `mode:'onBlur'`; `<input type="number" min>0>` + `<input type="date" min={hoyISO}>` + franja; `contratacionId` por
  prop (no editable, no en payload). Submit → `enviarPropuesta` → mapeo por `kind` (`unauthorized`→`router.push('/login?next=/cuenta/solicitudes')`;
  200→toast `role=status` + form bloqueado + `router.refresh()`; 409/404→mensaje accionable + `router.refresh()`; 422/400→inline;
  red→banner conservando datos). Anti-doble-submit (`aria-busy`, botón loading). a11y REQ-14. (ADR-08-04/05, REQ-04/05/07/11/12/14, ESC-UI-02/04/05)
- [x] 5.4 `[P]` Crear `client/components/cuentas/bandeja/rechazar-confirm.tsx` (`'use client'`, depende de 4.3/4.4): confirmación
  explícita (`copy.bandeja.confirmarRechazar`, REQ-06) antes de `rechazarSolicitud(id)`; 200→toast `role=status` + `router.refresh()`;
  errores→mapeo + refresh. Anti-doble-submit. (ADR-08-04, REQ-06, ESC-UI-03)
- [x] 5.5 Crear `client/components/cuentas/bandeja/solicitud-card.tsx` (`'use client'`, depende de 5.1/5.3/5.4): muestra
  `clienteNombre`/ubicación/fecha/franja/descripción + `<EstadoBadge/>`; abre `<PresupuestarForm/>` / `<RechazarConfirm/>` con
  `contratacionId` del ítem (REQ-04/13). a11y por ítem. (REQ-02/04/13/14, REQ-15)
- [x] 5.6 Crear `client/components/cuentas/bandeja/bandeja-solicitudes.tsx` (depende de 5.5): recibe `items`; vacío→estado vacío
  (`copy.bandeja.vacio`, NO error, REQ-03) : lista de `<SolicitudCard/>`. Navegable por teclado. (REQ-02/03/14, ESC-UI-07)
- [x] 5.7 Crear `client/app/(...)/cuenta/solicitudes/page.tsx` (Server Component, depende de 5.2/5.6): `backendFetch('/contrataciones?estado=solicitada')`;
  unauthorized→`redirect('/login?next=/cuenta/solicitudes')` (REQ-08); error→`<BandejaError/>` (REQ-03); ok→`<BandejaSolicitudes items/>`
  (REQ-01/02). `proxy.ts` ya protege la ruta (SIN cambios). (ADR-08-01/03/04, REQ-01/02/03/08, ESC-UI-01/07/08)

## Phase 6: Unit tests — Jest backend + vitest frontend (los escribe el Verificador)

- [x] 6.1 `[P]` Jest service `server/.../contratacion`: `list(PRESTADOR)`→filtra por `prestadorId`; `list(CLIENTE)`→por
  `clienteId` (rama 09.3); `?estado=` pasa al repo (`where`), sin estado→todas; enriquecimiento `clienteNombre` (null→`'Cliente'`);
  orden delegado al repo. Mock `findByParticipante`+`userRepo.findById`. (design §Testing)
- [x] 6.2 `[P]` Jest controller: `list` deriva `sub`/`role` de `req.user` (NUNCA del query), pasa `query.estado` al service;
  `?estado=` inválido → 400 vía `ListContratacionesQueryDto` (`@IsEnum`+ValidationPipe). (design §Testing, REQ-01/08)
- [x] 6.3 `[P]` vitest `client/lib/api/contrataciones.ts`: mock `fetch`; `listarSolicitudes`/`enviarPropuesta`/`rechazarSolicitud`
  mapean cada status → `kind` (200/401/403/404/409/422/400/5xx/throw); assert NUNCA lanza 4xx; 200 acción ⇒ `estado ∈
  {presupuestada,cancelada}`; payload proposal NUNCA incluye `id`/`prestadorId`. (OCL §Testing) → `test/unit/contrataciones-responder-api.test.ts`
- [x] 6.4 `[P]` vitest `client/lib/validation/proposal.ts`: `esPrecioValido` (0/neg→false, >0→true); `proposalSchema`
  (precio≤0, fecha pasada, franja vacía bloquean) con fecha inyectada. (REQ-07, ESC-UI-05) → `test/unit/proposal-schema.test.ts`
- [x] 6.5 `[P]` vitest `client/lib/errors/field-errors.ts`: `mapResponderError` (403/404/409/422/400/red → mensaje es-AR del
  catálogo; sin trazas). (REQ-09..12) → `test/unit/responder-errors.test.ts`

## Phase 7: E2E tests (Playwright — los escribe el Verificador)

- [ ] 7.1 Crear `client/e2e/bandeja-prestador.spec.ts` — bandeja + acciones OK: ESC-UI-01 (mock GET 200 → lista filtrada,
  badge "Solicitada", `clienteNombre`, token NUNCA en bundle); ESC-UI-02 (mock proposal 200 → toast `role=status`, badge
  "Presupuestada", form bloqueado, refresh, body sin `id`/`prestadorId`); ESC-UI-03 (rechazar → confirmación → 200 → badge
  "Cancelada"). Interceptar `**/api/contrataciones**`. (§Testing, REQ-01/04/05/06)
- [ ] 7.2 `[P]` `client/e2e/bandeja-prestador.spec.ts` — validación + errores + aislamiento: ESC-UI-04 (mock 409 → accionable +
  refresh, sin fallo de sistema); ESC-UI-05 (precio≤0/fecha pasada/franja vacía → sin HTTP, `aria-invalid`, foco, `min=hoy`);
  ESC-UI-06 (mock 404 → "no disponible" + refresh; sin UI por id ajeno); ESC-UI-07 (GET `[]`→vacío NO error; GET 500→`role=alert`
  + reintentar); ESC-UI-08 (mock 401 → `/login?next=/cuenta/solicitudes`). (§Testing, REQ-03/07/10/11/12, ESC-UI-04..08)

## Phase 8: Verificación final

- [ ] 8.1 Backend: correr `npm run test` del **server** (Jest) — service+controller verdes (rama PRESTADOR y CLIENTE, derivación
  token, `@IsEnum` 400). Confirmar cambios aditivos (no rompe tests de `proposal`/`reject`/`save`/`findById` existentes).
- [ ] 8.2 Frontend: correr `lint` (ESLint) + `tsc --noEmit` — 0 errores en archivos nuevos/modificados. Confirmar que los
  Route Handlers usan `backendFetch` (`server-only`) y que el token NUNCA entra al bundle (importarlo desde client = build error).
- [ ] 8.3 Frontend: correr `test:unit` (vitest) — todos verdes; cubren OCL §Testing (mapeo status, `esPrecioValido`, schema, errores).
- [ ] 8.4 Frontend: correr `test:e2e` (Playwright) — ESC-UI-01..08 verdes en Chrome/Firefox/Safari.
- [ ] 8.5 **Smoke aislamiento (crítico):** confirmar que `/cuenta/solicitudes` redirige a `/login?next=` sin sesión (matcher
  `proxy.ts`, SIN cambios) y que un cliente logueado ve bandeja vacía (backend filtra por `prestadorId=sub`, no por rol del JWT). (design §Notas de seguridad)
