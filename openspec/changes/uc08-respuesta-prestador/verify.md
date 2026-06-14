# Verification Report — UC08 Respuesta del prestador (MI-08.2) — full-stack

**Fecha:** 2026-06-13
**Rama:** `main`
**Verificador:** Agente SDD Verificador (stage 1.4)
**Suites:** `server/` Jest (backend) · `client/e2e/bandeja.spec.ts` (Playwright, Chromium) · `client/test/unit/*` (vitest) · runtime probes (curl con JWT firmado) contra backend NestJS :3000 / frontend Next :3001

---

## Veredicto final

**APROBADO-CON-OBSERVACIONES**

- **Backend (Jest):** 134 passed, 1 skipped — 13 suites (incl. `contratacion.service.spec.ts` rama `list()` PRESTADOR/CLIENTE + enriquecimiento + orden, `contratacion.controller.spec.ts` derivación token + `@IsEnum`). **Sin regresiones** en `proposal`/`reject`/`save`/`findById`.
- **Backend lint (ESLint):** 0 errores.
- **Frontend unit (vitest):** 224 passed — 19 archivos (incl. los 3 de UC08: `contrataciones-responder-api`, `proposal-schema`, `responder-errors`).
- **Frontend typecheck (`tsc --noEmit`):** 0 errores, incluye el spec E2E nuevo.
- **Frontend lint (ESLint):** 0 errores (1 warning pre-existente en `registro-form.tsx`, ajeno a UC08).
- **E2E UC08 (Playwright, Chromium):** 12/12 pass (`bandeja.spec.ts`).
- **E2E suite completa (Chromium):** 97/97 pass (85 previos + 12 nuevos) — **sin regresiones**.
- **GET role-aware en runtime:** **CONFIRMADO** con JWT de prestador firmado por el backend → `200 []` (filtrado por `sub`, seed vacío); sin auth → **401** (no 404, el endpoint existe y el `AuthGuard` corre).
- **Aislamiento (RN-CON-07):** **CONFIRMADO Y MÁS FUERTE QUE LA SPEC** — inyectar `?prestadorId=` ajeno → **422 "property prestadorId should not exist"** (el endpoint RECHAZA, no solo ignora, gracias a `forbidNonWhitelisted`).
- **Smoke proxy:** anónimo en `/cuenta/solicitudes` → 307 `/login?next=%2Fcuenta%2Fsolicitudes` (matcher `/cuenta/:path*`, `proxy.ts` SIN cambios).

La implementación cubre los 15 requisitos (REQ-01..15) y los 8 escenarios (ESC-UI-01..08) por código + Jest + vitest + E2E + runtime probes. **No se hallaron bugs.** El veredicto es APROBADO-CON-OBSERVACIONES por dos diferidos no bloqueantes (mismo patrón UC04/UC07): (a) la bandeja es un Server Component cuyo `backendFetch` corre server-side, por lo que `page.route` no intercepta el listado y, con seed vacío, los `<SolicitudCard/>` con datos (y sus forms presupuestar/rechazar) no rendean en E2E → cubiertos por unit + probes; (b) la matriz cross-browser completa la corre el tester humano/CI.

---

## 1. Bugs

**Ninguno.** Backend y frontend pasaron Jest (134) + lint + vitest (224) + tsc + 97 E2E + todos los runtime probes sin desviaciones de comportamiento. El contrato `GET /contrataciones` nuevo y los `proposal`/`reject` existentes se comportan según la spec.

> **No-bug a destacar (positivo):** el aislamiento es **más estricto** que lo que pedía la spec. La spec decía "el service ignora todo lo que no sea el token"; la implementación va más allá: el DTO con `forbidNonWhitelisted` hace que un `?prestadorId=ajeno` devuelva **422** (rechazo explícito), nunca un 200 de contrataciones ajenas. Defensa en profundidad correcta.

---

## 2. Resultado de la verificación final

| Tarea | Comando | Resultado |
|---|---|---|
| 8.1 backend test | `cd server && npm run test` | 134 passed, 1 skipped (13 suites) |
| 8.1 backend lint | `cd server && npm run lint` | 0 errores |
| 8.2 frontend typecheck | `cd client && npx tsc --noEmit` | 0 errores (incl. spec E2E nuevo) |
| 8.2 frontend lint | `cd client && npm run lint` | 0 errores (1 warning ajeno) |
| 8.3 frontend test:unit | `cd client && npm run test:unit` | 224 passed (19 archivos) |
| 8.4 frontend test:e2e (UC08) | `npx playwright test e2e/bandeja.spec.ts --project=chromium` | 12/12 pass |
| 8.4b frontend test:e2e (full) | `npx playwright test --project=chromium` | 97/97 pass (sin regresiones) |
| 8.5 smoke aislamiento + role-aware | curl con JWT firmado + proxy real | ver §5 / §6 |

---

## 3. Matriz Escenario → cobertura

| ESC | Cobertura | Detalle |
|---|---|---|
| **ESC-UI-01** (ver bandeja, GET→lista) | Jest + runtime + código + E2E parcial | Jest `service.list(PRESTADOR)` filtra por `prestadorId`; runtime probe → `200 []` filtrado por token; `page.tsx` SSR + `<BandejaSolicitudes>`/`<SolicitudCard>`/`<EstadoBadge>`. Render de cards con datos: diferido (OBS-01, seed). |
| **ESC-UI-02** (presupuestar 200 → presupuestada) | unit + código | `contrataciones-responder-api` (200⇒`{ok:true,data.estado}`, payload sin `id`/`prestadorId`); `presupuestar-form.tsx` (`setSucceeded`+toast `role=status`+`router.refresh()`+form bloqueado). E2E de UI: diferido (OBS-01). |
| **ESC-UI-03** (rechazar confirmación → 200 → cancelada) | unit + código | `responder-api` (reject 200⇒`cancelada`); `rechazar-confirm.tsx` (paso de confirmación explícito → `rechazarSolicitud` → toast + refresh). E2E de UI: diferido (OBS-01). |
| **ESC-UI-04** (409 concurrencia → accionable + refresh) | unit + código | `responder-api` (409→`estado_cambiado`); `mapResponderError` (409→banner accionable + `refresh:true`, NO error de sistema). |
| **ESC-UI-05** (validación cliente bloquea submit) | unit + código | `proposal-schema` (precio≤0, fecha pasada, franja vacía → bloquean, fecha inyectada); `presupuestar-form.tsx` RHF `mode:onBlur` + `<input type=number min=1>` + `<input type=date min={hoyISO}>` + `aria-invalid`/`aria-describedby` + `setFocus`. |
| **ESC-UI-06** (aislamiento, 404 ajena) | **runtime (probe)** + unit + código | Probe: `?prestadorId=ajeno`→**422** (rechazo); `responder-api` (404→`no_disponible`); `mapResponderError` (404→`noDisponible`+`refresh`). Sin UI por id ajeno (REQ-13). |
| **ESC-UI-07** (vacío / error listar) | **E2E** + unit + código | E2E: sesión válida + seed vacío → sin trace técnico; `bandeja-solicitudes.tsx` (`items=[]`→`copy.bandeja.vacio`, NO Alert); `bandeja-error.tsx` (`role=alert`+reintentar). `listarSolicitudes` (5xx/502→`server`, throw→`network`). |
| **ESC-UI-08** (401 sesión expirada → /login) | **E2E (loop real)** + unit + código | `bandeja.spec.ts`: anónimo /cuenta/solicitudes→307 /login?next=; sin cookie/expirada→401 sentinel; exp-futura sin firma→401 reenviado (GET+proposal+reject). `responder-api` (401→`unauthorized`); componentes→`router.push('/login?next=')`; `page.tsx` unauthorized→`redirect`. |

---

## 4. Cumplimiento por requisito (revisión de código + tests)

| REQ | Evidencia | Estado |
|---|---|---|
| REQ-01 GET role-aware + aislamiento | `controller.list` deriva `sub`/`role` de `req.user`; `service.list` bifurca por rol; `ListContratacionesQueryDto` solo `?estado=`; runtime probe 401/200/422 | OK |
| REQ-02 bandeja ruta protegida + datos legibles | `page.tsx` (protegido); `solicitud-card.tsx` muestra `clienteNombre`/ubicación/fecha/franja/descripción + badge; proxy E2E 307 | OK |
| REQ-03 loading/vacío/error | `bandeja-solicitudes.tsx` vacío neutro (NO error); `bandeja-error.tsx` `role=alert`+reintentar; loading SSR | OK |
| REQ-04 presupuestar campos + id no editable | `presupuestar-form.tsx` (`contratacionId` prop, NO input, NO en payload); `SendProposalPayload` sin `id`/`prestadorId` (tsc) | OK |
| REQ-05 200 → presupuestada | `responder-api` (200⇒`data.estado`); toast `role=status` + form bloqueado + `router.refresh()` | OK |
| REQ-06 rechazar + confirmación | `rechazar-confirm.tsx` (paso confirmación `copy.confirmarRechazar` → `rechazarSolicitud`); 200→`cancelada` | OK |
| REQ-07 validación cliente | `proposal.ts` zod (`esPrecioValido`>0 + `refine(esFechaValida)` + franja `min(1)`); `min={hoyISO}`; bloquea sin HTTP; unit | OK |
| REQ-08 auth sin exponer token | `backend-fetch.ts` server-only cookie→Bearer; 3 Route Handlers; E2E token-not-in-bundle + loop real; sesión expirada→`/login?next=` | OK |
| REQ-09 403 (no prestador) | `mapResponderError` 403→banner `forbidden`; prevenido por bandeja | OK |
| REQ-10 404 (ajena/inexistente) | `mapResponderError` 404→`noDisponible`+`refresh`; backend 404 indistinguible; probe aislamiento | OK |
| REQ-11 409 accionable | `mapResponderError` 409→banner `estadoCambiado`+`refresh`, NO error de sistema | OK |
| REQ-12 422/400 + red/5xx | `responder-api` (422/400→`validacion`, 5xx/502→`server`, throw→`network`); `mapResponderError` inline/banner sin trazas; handlers 502 | OK |
| REQ-13 aislamiento UI | bandeja solo de `GET /contrataciones`; sin input por `prestadorId`; backend rechaza identidad ajena (422) | OK |
| REQ-14 estado envío + a11y | `aria-busy`, botón `loading`+`disabled`, anti-doble-submit (`if(busy)return` en reject); Field label+aria-required+aria-invalid+aria-describedby; foco al banner; html lang=es-AR (E2E) | OK |
| REQ-15 badges semánticos | `estado-badge.tsx` texto SIEMPRE visible (WCAG 1.4.1) + tokens DESIGN-SYSTEM §estado (info/warning/error) | OK |

---

## 5. GET role-aware + aislamiento — VERIFICADO en runtime (JWT firmado por el backend)

Probes `curl` contra el backend vivo :3000 con un JWT de prestador **firmado con el secret real** (el `JwtStrategy` confía en el payload, sin lookup de DB):

| Caso | Resultado | Significado |
|---|---|---|
| `GET /contrataciones` sin auth | **401** | El endpoint EXISTE y `AuthGuard('jwt')` corre (no 404) |
| `GET /contrataciones` (prestador firmado) | **200 `[]`** | Lista filtrada por `prestadorId=sub`; seed vacío → `[]` |
| `GET /contrataciones?estado=solicitada` (firmado) | **200 `[]`** | El filtro `?estado=` se acepta y pasa al repo |
| `GET /contrataciones?estado=banana` (firmado) | **422** | `@IsEnum` rechaza el valor fuera del enum (ver OBS-02: 422, no 400) |
| `GET /contrataciones?prestadorId=ajeno` (firmado) | **422 "property prestadorId should not exist"** | **Aislamiento reforzado**: `forbidNonWhitelisted` RECHAZA identidad ajena, nunca devuelve 200 de otro prestador |

El api-client mapea cualquier 401 → `unauthorized` → redirect `/login?next=`. El cuerpo de error es el mensaje genérico de class-validator (sin trazas, REQ-12).

---

## 6. Loop auth BFF (cookie→Bearer→backend) — VERIFICADO end-to-end (sin mock)

`bandeja.spec.ts` ejercita los **tres** Route Handlers UC08 (GET list + POST proposal + POST reject) con `page.request`:

| Caso (cada uno × GET/proposal/reject) | Resultado | Significado |
|---|---|---|
| sin cookie | **401** sentinel (`{ok:false}`, sin trazas) | `backendFetch` devuelve `{unauthorized:true}` → backend NO llamado |
| cookie `exp` vencido | **401** sentinel | sentinel por expiración; backend NO llamado (RN-AUTH-06) |
| cookie `exp` futuro, JWT sin firma válida | **401** reenviado | `backendFetch` adjunta `Bearer` y LLAMA al backend; el backend rechaza la firma → 401 forwardeado. **Prueba el reenvío real** + que un token forjado no autentica |

El `id` viaja en la URL del proposal/reject, NUNCA en el body (REQ-04). El smoke proxy confirma que anónimo en `/cuenta/solicitudes` → 307 `/login?next=%2Fcuenta%2Fsolicitudes` (matcher `/cuenta/:path*`, sin cambios).

---

## 7. Invariantes clave (verificados)

| Invariante | Evidencia |
|---|---|
| `listarSolicitudes`/`enviarPropuesta`/`rechazarSolicitud` NUNCA lanzan para 4xx | unit `contrataciones-responder-api` (cada status → `kind`) |
| Payload de proposal NUNCA incluye `id`/`prestadorId` | `SendProposalPayload` no los declara (tsc); form arma el body sin ellos; `id` por URL |
| GET backend NUNCA acepta `prestadorId`/`clienteId` del query | `ListContratacionesQueryDto` solo `estado`; probe `?prestadorId=`→422 |
| Aislamiento por token (dimensión derivada del `sub`) | `service.list` bifurca por rol, nunca del input; Jest PRESTADOR/CLIENTE |
| Enriquecimiento `clienteNombre`, null→`'Cliente'` | `service.list` `userRepo.findById(clienteId)`; Jest enriquecimiento + placeholder |
| 200 acción ⇒ `estado ∈ {presupuestada, cancelada}` | `responder-api` valida el body; 200 sin body usable → `kind:'server'` |
| Token nunca en el bundle/DOM | `backend-fetch.ts` `import "server-only"`; E2E asserta JWT ausente + sin `Bearer ` |
| 409 ≠ error de sistema | `mapResponderError` 409→accionable+`refresh` (REQ-11) |
| no expone trazas | todos los `kind` → copy es-AR; E2E asserta ausencia de `stack`/`trace`/`Error:` |
| anti-doble-submit | form `aria-busy`+botón `loading`+`disabled`; reject `if(busy)return` |

---

## 8. Observaciones (no bloquean aprobación)

### OBS-01 — Render de cards y forms requiere seed (mismo diferido que UC04 OBS-02 / UC07 OBS-01)
La bandeja `/cuenta/solicitudes` es un **Server Component** que lista vía `backendFetch('/contrataciones?estado=solicitada')` **server-side**; el browser nunca emite ese fetch → `page.route` NO lo intercepta. Con la BD seed **vacía** (y sin sesión firmada por el backend en E2E), la lista resuelve a `[]` → render del **estado vacío neutro**, sin `<SolicitudCard/>`. En consecuencia, las interacciones de los forms presupuestar/rechazar sobre la UI real (toast/badge/refresh, validación zod inline, anti-doble-submit) NO se ejecutaron como E2E de UI. **Cobertura indirecta:** los 224 unit cubren el mapeo de status, el `proposalSchema`, `esPrecioValido`, `mapResponderError`, y el loop auth BFF de los 3 handlers se prueba real en `bandeja.spec.ts`; los componentes son composición de esas piezas + primitivas (Field/Alert/Select/toast) ya ejercitadas por UC02/UC04/UC07. Recomendado: un E2E con backend seedeado (un prestador con una contratación `solicitada`) + `page.route('**/api/contrataciones/*/proposal|reject**')` por status (las ACCIONES SÍ son browser-observables una vez el card rendere) para cerrar ESC-UI-02/03/04/05 al 100% sobre la UI real.

### OBS-02 — El error de validación del DTO es 422, no 400 (convención app-wide, NO desviación funcional)
La spec/design/tasks dicen "valor fuera del enum → **400** vía `@IsEnum`". El `ValidationPipe` global (`server/src/main.ts`) está configurado con `errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY` → **toda** falla de class-validator devuelve **422**, no 400. Por eso `?estado=banana`→422 y `?prestadorId=ajeno`→422. Es la convención de TODA la app (ya observada en UC07) y el frontend mapea **ambos** 422 y 400 a `validacion`, por lo que NO hay impacto de UX. La nota "400" en los artefactos es una imprecisión menor del contrato documentado; el comportamiento observable de seguridad (input inválido rechazado, identidad ajena rechazada) es **correcto**. No bloquea.

### OBS-03 — Matriz cross-browser pendiente (RNF-A.2 / REQ-14)
Los 12 E2E de UC08 (y los 97 totales) corren verdes en **Chromium**. WebKit/Mobile Safari requieren libs de sistema en Linux (`sudo npx playwright install-deps`). No se corrió la matriz de 5 proyectos para respetar el gotcha de NO ejecutar múltiples suites en paralelo contra el webServer reusado :3001. La corre el tester humano/CI con la imagen `mcr.microsoft.com/playwright`. Mismo diferido que UC01/UC02/UC04/UC07.

### OBS-04 — N+1 del enriquecimiento + paginación diferidos (ADR-08-02, aceptados para el TPI)
`service.list` resuelve `clienteNombre` con un `userRepo.findById` por ítem (N+1) y no pagina. Documentado y aceptado en el design (bandeja de pendientes naturalmente acotada). No se implementa batch/JOIN ahora (YAGNI). Open Questions S1/S2 quedan abiertas para confirmar con la cátedra. No bloquea.

---

## 9. Tareas (estado real vs. checklist)

- **Phases 1-6 (backend + foundation + BFF + api-client + UI + unit):** todas `[x]` — verificadas contra el código (DTOs, port/adapter `findByParticipante`, `service.list` role-aware + enriquecido, controller `@Get()`, copy/validación/errors, 3 Route Handlers, api-client discriminado, 6 componentes + página SSR, Jest service+controller, 3 vitest). Coinciden con el código.
- **Phase 7 (E2E, las escribe el Verificador):** **completada** — `e2e/bandeja.spec.ts` (12 tests: proxy/ESC-UI-08, estado vacío/ESC-UI-07, token-not-in-bundle, loop auth real ×3 handlers, aislamiento, a11y/es-AR). Recomendado marcar 7.1/7.2 `[x]` (nota: las interacciones de card con datos son diferido OBS-01).
- **Phase 8 (verificación final):** **completada** — 8.1 backend (134/1 skip + lint), 8.2 tsc+lint, 8.3 vitest 224, 8.4 E2E 12/97, 8.5 smoke aislamiento + role-aware (runtime probes §5/§6). Recomendado marcar 8.1-8.5 `[x]`.

---

## 10. Archivos creados/tocados por el Verificador

| Archivo | Tipo | Razón |
|---|---|---|
| `client/e2e/bandeja.spec.ts` | Tests (nuevo) | 12 tests: proxy/ESC-UI-08 (1), estado vacío/ESC-UI-07 (1), token-not-in-bundle (1), loop auth BFF real GET+proposal+reject (7), aislamiento REQ-01/13 (1), a11y/es-AR (1) |
| `openspec/changes/uc08-respuesta-prestador/verify.md` | Doc | Este reporte |

Sin cambios de producción: la implementación no requirió fixes.

---

## 11. Resolución del gate (coordinador)

**Veredicto: APROBADO-CON-OBSERVACIONES.** Backend 134 Jest (1 skip) + lint; frontend 224 vitest + tsc + lint limpios; 12/12 E2E UC08 (97/97 full, Chromium); GET role-aware + aislamiento verificados en runtime con JWT firmado (incl. rechazo de `?prestadorId=` ajeno → 422); loop auth BFF de los 3 handlers verificado end-to-end; invariantes de seguridad (token nunca en bundle, payload sin id/prestadorId, GET sin identidad ajena, sin trazas) verificados. **Cero bugs.**

Diferido a follow-up (no bloqueante): E2E con backend seedeado para las interacciones de card/forms sobre la UI real (ESC-UI-02/03/04/05) — OBS-01; matriz cross-browser completa en CI — OBS-03. Imprecisión documental 400-vs-422 — OBS-02 (sin impacto funcional).
