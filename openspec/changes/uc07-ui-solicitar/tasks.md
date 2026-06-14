# Tasks: MI-07.2 UI Solicitar contratación (UC07)

> Deriva de `spec.md` (REQ-01..14, ESC-UI-01..07, catálogo es-AR) y `design.md` (ADR-07-01..05,
> §File Changes, §Interfaces, §Testing). Todas las rutas son relativas a `client/`.
> `[P]` = paralelizable dentro de la misma fase (sin dependencia de orden entre ellas).
>
> **Stack (verificado vs UC02/UC04):** Next 16.2.9 App Router · React 19.2 · Tailwind v4 · TS strict ·
> RHF 7.79 + zod 4.4 · vitest 4.1 · Playwright 1.60. Breaking Next 16: `params` es **Promise**
> (`await`); `cookies()` async; protección de rutas en **`proxy.ts`** (no `middleware.ts`).
> Precedentes: cookie httpOnly `so_session` + `readSessionToken`/`isExpired` (UC02);
> `<SolicitarCta/>` placeholder + patrón `{ok,kind}` discriminado (UC04).
> **Leer `node_modules/next/dist/docs/` antes de codear (AGENTS.md del client).**

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~600-750 (helper + Route Handler + api-client + validación + 3 componentes + página + copy/errors + proxy + tests) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (auth-fetch helper + Route Handler + api-client + validación + copy/errors) → PR 2 (componentes form/exito + página protegida + activar CTA + proxy matcher) → PR 3 (unit + E2E + verificación) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Infra auth (`backendFetch` REUSABLE) + Route Handler BFF + api-client + validación + copy/errors | PR 1 | Fundación server-side reusable por 08.2/09.3. Sin DOM. Base: main |
| 2 | Componentes form + éxito + página protegida + activar CTA + ampliar proxy matcher | PR 2 | Depende de Unit 1. Base: main (stacked tras PR 1) |
| 3 | Unit (vitest) + E2E (Playwright) ESC-UI-01..07 + smoke matcher + verificación final | PR 3 | Depende de Units 1-2. Los tests los escribe el Verificador. Base: main |

---

## Phase 1: Foundation — copy, franjas, validación (sin I/O, sin DOM)

- [x] 1.1 `[P]` **Resolver S1 (franjas) primero:** fijar el set de franjas horarias como fuente única en
  `lib/copy/es-AR.ts` (`copy.solicitud.franjas`). Confirmar contra el contrato `POST /contrataciones`
  si el backend valida un enum; default es-AR (mañana/tarde/noche o rangos) si es texto libre. El select (4.1)
  y el schema (1.3) DEBEN consumir ESTA fuente, no valores inventados. (design S1, REQ-02)
- [x] 1.2 Extender `lib/copy/es-AR.ts`: agregar `copy.solicitud.*` con textos EXACTOS del catálogo es-AR del spec —
  labels (ubicación/fecha/franja/descripción), `errors.*` (ubicación/franja/descripción/fecha faltante, fecha pasada),
  `cta.anonimo`/`cta.prestador`, `exito`, `franjaOcupada` (409), `noDisponible` (404), `redServer` (5xx/red).
  (spec §Catálogo de mensajes, REQ-01/05/07/08/09/10/11)
- [x] 1.3 Crear `lib/validation/solicitud.ts`: schema zod — `ubicacion`/`franja`/`descripcion` `trim().min(1)`;
  `fecha` ISO date con `refine`. Exportar `esFechaValida(iso, hoy)` **pura** (fecha inyectada, no `Date.now()`).
  Mensajes desde `copy.solicitud.errors`. (ADR-07-05, REQ-03, ESC-UI-03)

## Phase 2: Infra auth — `backendFetch` server-side REUSABLE (espejo cookie→Bearer de UC02)

- [x] 2.1 Crear `lib/server/backend-fetch.ts` (`server-only`) **[CENTRAL, reusable por 08.2/09.3]**: helper
  `backendFetch(path, init?)` → lee `readSessionToken()`; si ausente o `isExpired` → devuelve sentinel
  `{ unauthorized: true }` SIN llamar al backend; si válido → agrega `Authorization: Bearer <token>` y hace
  `fetch(BACKEND_URL + path, {...init, cache:'no-store'})` → `{ unauthorized: false, response }` (status del
  backend tal cual, incl. 4xx). Tipo `BackendFetchResult`. NO mapea status (eso vive en el handler/api-client).
  (ADR-07-01, REQ-04, RNF-S.1/S.4, design §Interfaces)

## Phase 3: Route Handler BFF + api-client (resultado discriminado)

- [x] 3.1 Crear `app/api/contrataciones/route.ts` (depende de 2.1): handler `POST` same-origin. Llama
  `backendFetch('/contrataciones', { method:'POST', body, headers content-type })`; sentinel `unauthorized` → 401;
  si no, reenvía `status + body` del backend tal cual; `catch` de red → 502. NO contiene lógica de UX.
  (ADR-07-01/03, REQ-04/06)
- [x] 3.2 `[P]` Crear tipos en `lib/api/contrataciones.ts`: `CrearContratacionPayload` (ubicacion, prestadorId, fecha,
  franja, descripcion — **NUNCA `clienteId`**, lo deriva el backend del token), `ContratacionResponse`
  (`estado:'solicitada'`), `CrearSolicitudResult` discriminado (`ok:true,data` | kinds
  `unauthorized`/`forbidden`/`prestador_no_disponible`/`franja_ocupada`/`fecha_invalida`/`validation`/`network`/`server`).
  (design §Interfaces, REQ-05..11)
- [x] 3.3 `lib/api/contrataciones.ts`: `crearSolicitud(payload)` (client) → `fetch('/api/contrataciones', POST)`
  same-origin. Mapeo a `kind`: 201→`{ok:true,data}` · 401→`unauthorized` · 403→`forbidden` · 404→`prestador_no_disponible`
  · 409→`franja_ocupada` · 422→`fecha_invalida` · 400→`validation` · 5xx/502→`server` · throw→`network`.
  **NUNCA lanza para 4xx.** Reusar `safeJson` del patrón `lib/api/auth.ts`. (ADR-07-03, REQ-05..11, OCL §Testing)
- [x] 3.4 `[P]` Extender `lib/errors/field-errors.ts`: `mapSolicitudError(result)` → mensaje/banner/inline es-AR desde
  `copy.solicitud.*` (franja_ocupada→accionable, 404→CTA volver, 422→inline fecha, 400→por campo o resumen `role=alert`,
  network/server→banner). NO expone trazas (REQ-11). (REQ-07/08/09/10/11)

## Phase 4: Componentes (`components/catalogo/solicitud/`)

- [x] 4.1 Crear `components/catalogo/solicitud/solicitud-form.tsx` (`'use client'`, depende de 1.2/1.3/3.3/3.4): CORAZÓN.
  RHF+zod `mode:'onBlur'`, prop `prestadorId` (no editable, no en payload editable). `<input type="date" min={hoyISO}>`;
  select de franjas desde `copy.solicitud.franjas` (1.1). Submit: zod OK → `crearSolicitud` → mapeo por `kind`
  (`unauthorized`→`router.push('/login?next='+destino)`; 409→reseleccionar franja conservando datos; 404→CTA;
  resto→banner/inline). Anti-doble-submit (`aria-busy`, botón loading, campos `aria-disabled`). a11y REQ-13.
  (ADR-07-03, REQ-02/03/05..13, ESC-UI-01/03/04/05/06/07)
- [x] 4.2 `[P]` Crear `components/catalogo/solicitud/solicitud-exito.tsx` (depende de 1.2): confirmación 201 con
  `role="status"` (`copy.solicitud.exito`), comunica próximo paso, form bloqueado, CTA "Volver al perfil" →
  `/prestadores/{id}`. NO navega a bandeja inexistente (MI-09.3 fuera de alcance). (REQ-05, ESC-UI-01)

## Phase 5: Página protegida + activar CTA + proxy

- [x] 5.1 Crear `app/(protegido)/prestadores/[id]/solicitar/page.tsx` (Server Component, depende de 4.1): route group
  `(protegido)`; `await params` → `id`; renderiza `<SolicitudForm prestadorId={id}/>` (+ nombre/oficio legible del
  prestador para confirmación, REQ-02). `proxy.ts` ya garantiza sesión. (ADR-07-02, REQ-02/04/14)
- [x] 5.2 Modificar `components/catalogo/perfil/solicitar-cta.tsx` (`'use client'`, activa placeholder UC04): leer
  `useSession()` → 3 ramas (REQ-01): `cliente`+auth → `router.push('/prestadores/{id}/solicitar')`; anónimo →
  `router.push('/login?next=/prestadores/{id}/solicitar')`; `prestador` → deshabilitado con `copy.solicitud.cta.prestador`
  (`aria-disabled` + texto perceptible por SR, NO solo color). El rol es decorativo, la defensa real es backend+proxy.
  (ADR-07-04, REQ-01/07, ESC-UI-02, REQ-13)
- [x] 5.3 Modificar `client/proxy.ts`: ampliar `config.matcher` a `["/cuenta/:path*", "/prestadores/:id/solicitar"]`
  (patrón explícito de dos entradas; el padre `/prestadores/:id` NO matchea por no terminar en `/solicitar`).
  Actualizar el comentario del archivo. (ADR-07-02, REQ-04, S2)

## Phase 6: Unit tests (vitest — los escribe el Verificador)

- [x] 6.1 `[P]` `lib/server/backend-fetch.ts`: mock `readSessionToken`/`isExpired`/`fetch`; sin cookie ∨ expirado →
  `{unauthorized:true}` SIN llamar a `fetch`; con token válido → agrega `Authorization: Bearer` + `cache:'no-store'` y
  reenvía la `response`. (design §Testing) → `test/unit/backend-fetch.test.ts`
- [x] 6.2 `[P]` `lib/api/contrataciones.ts`: mock `fetch`; `crearSolicitud` mapea cada status → `kind`
  (201/401/403/404/409/422/400/5xx/throw); assert NUNCA lanza 4xx; 201 ⇒ `estado:'solicitada'`; payload NUNCA incluye
  `clienteId`. (OCL §Testing) → `test/unit/contrataciones-api.test.ts`
- [x] 6.3 `[P]` `lib/validation/solicitud.ts`: requeridos vacíos bloquean; `esFechaValida` (hoy ok, ayer falla, futuro ok)
  con fecha inyectada. (REQ-03, ESC-UI-03) → `test/unit/solicitud-schema.test.ts`
- [x] 6.4 `[P]` `lib/errors/field-errors.ts`: `mapSolicitudError` (franja/404/403/422/400/red → mensaje es-AR; sin trazas).
  (REQ-07..11) → `test/unit/solicitud-errors.test.ts`

## Phase 7: E2E tests (Playwright — los escribe el Verificador)

- [ ] 7.1 Crear `e2e/solicitar.spec.ts` — éxito + CTA: ESC-UI-01 (mock 201 → toast `role=status`, form bloqueado, CTA
  volver, body sin `clienteId`, token NUNCA en bundle); ESC-UI-02 (anónimo → `/login?next=`; prestador → CTA
  deshabilitado accesible, no abre form). Interceptar `**/api/contrataciones`. (§Testing, REQ-01/04/05)
- [ ] 7.2 `[P]` `e2e/solicitar.spec.ts` — validación + errores: ESC-UI-03 (vacíos/fecha pasada → sin HTTP, `aria-invalid`,
  foco al faltante, `min=hoy`); ESC-UI-04 (mock 409 → mensaje accionable, datos conservados, reselección de franja, sin
  reload, botón default); ESC-UI-05 (mock 404 → "no disponible" + CTA `/prestadores`); ESC-UI-06 (mock 401 →
  `/login?next=`); ESC-UI-07 (abort/500 → `role=alert`, datos conservados, sin trazas). (§Testing, REQ-03/06/09/10/11)

## Phase 8: Verificación final

- [x] 8.1 Correr `lint` (ESLint flat) + `tsc --noEmit` — 0 errores en archivos nuevos/modificados. Confirmar que
  `backend-fetch.ts` es `server-only` (importarlo desde un client component es build error).
- [x] 8.2 Correr `test:unit` (vitest) — todos verdes, cubren OCL §Testing (mapeo de status, sentinel, validación, errores).
- [ ] 8.3 Correr `test:e2e` (Playwright) — ESC-UI-01..07 verdes en Chrome/Firefox/Safari.
- [ ] 8.4 **Smoke S2 (crítico):** confirmar que el matcher `/prestadores/:id/solicitar` redirige a `/login` sin sesión
  PERO `/prestadores/:id` (perfil público de UC04) sigue accesible SIN sesión (no capturado por el matcher). (design S2)
