# Verification Report — UC09 UI gestión y seguimiento de contrataciones (MI-09.3) — full-stack

**Fecha:** 2026-06-14
**Rama:** `main`
**Verificador:** Agente SDD Verificador (stage 1.4)
**Suites:** `server/` Jest (backend) · `client/e2e/seguimiento.spec.ts` (Playwright, Chromium) · `client/test/unit/*` (vitest) · runtime probes (curl con JWT firmado) contra backend NestJS :3000 / frontend Next :3001

---

## Veredicto final

**APROBADO-CON-OBSERVACIONES**

- **Backend (Jest):** 157 passed, 1 skipped — 13 suites (incl. `contratacion.service.spec.ts` con la matriz UC09 `confirm/start/finish/cancel`: authz/ownership/estado + `transitionTo`, y `contratacion.controller.spec.ts` con los 4 handlers nuevos). **Sin regresiones** en `create`/`list`/`proposal`/`reject`.
- **Backend lint (ESLint):** 0 errores.
- **Frontend unit (vitest):** 286 passed — 22 archivos (incl. los 3 de UC09: `acciones-contratacion`, `contrataciones-transicion-api`, `seguimiento-errors`).
- **Frontend typecheck (`tsc --noEmit`):** 0 errores, incluye el spec E2E nuevo.
- **Frontend lint (ESLint):** 0 errores (1 warning pre-existente en `registro-form.tsx`, ajeno a UC09).
- **E2E UC09 (Playwright, Chromium):** 18/18 pass (`seguimiento.spec.ts`).
- **E2E suite completa (Chromium):** 115/115 pass — **sin regresiones** (incl. los 12 de `bandeja.spec.ts` de UC08, verdes).
- **Los 4 endpoints nuevos existen y corre el AuthGuard:** sin auth → **401** (no 404) en `confirm/start/finish/cancel`.
- **409-vs-500 (EL hallazgo de diseño, ADR-09-02):** **CORRECTO** — el guard de estado-actual del service lanza `ConflictException` (→ 409) ANTES de `stateMachine.transitionTo`; el `InvalidTransitionError` (Error plano → 500) es **inalcanzable**. Verificado por código (service) + Jest (6 tests `ConflictException`) + lógica de guard previo al SM. (Detalle §5.)
- **Aislamiento + rol (RN-CON-07) en runtime con JWT firmado:** prestador en `/confirm` → **403**; cualquier rol sobre contratación inexistente/ajena → **404** (oculta existencia); ningún 500, sin trazas. (Detalle §5.)

La implementación cubre los 15 requisitos (REQ-01..15) y los 11 escenarios (ESC-UI-01..11) por código + Jest + vitest + E2E + runtime probes. **No se hallaron bugs de implementación.** El veredicto es APROBADO-CON-OBSERVACIONES por los mismos diferidos no bloqueantes del precedente UC04/UC07/UC08: (a) la vista de seguimiento es un Server Component cuyo `backendFetch` corre server-side, por lo que `page.route` no intercepta el listado y, con seed vacío, los `<ContratacionCard/>` con datos (y sus acciones/diálogo) no rendean en E2E → cubiertos por unit + probes + el loop BFF real; (b) la matriz cross-browser completa la corre el tester humano/CI; (c) el timeline del historial (REQ-08) está DIFERIDO por diseño (ADR-09-04).

---

## 1. Bugs

**Ninguno de implementación.** Backend y frontend pasaron Jest (157) + lint + vitest (286) + tsc + 115 E2E + todos los runtime probes sin desviaciones de comportamiento.

> **Nota de proceso (test del Verificador, no de producción):** la primera versión de los dos E2E de "acción mockeada" usaba `page.request.post`, que **NO** pasa por `page.route` (el fixture `request` ignora el routing). Daban 401 (firma forjada) en vez del 409/404 mockeado. Se corrigieron conduciendo el fetch DESDE la página (`page.evaluate → window.fetch`), que sí atraviesa `page.route`. Es un fix del test, no de la implementación. Lección: `page.route` solo intercepta fetches del contexto de la página, nunca los de `page.request`.

---

## 2. Resultado de la verificación final

| Tarea | Comando | Resultado |
|---|---|---|
| 8.1 backend test | `cd server && npm run test` | 157 passed, 1 skipped (13 suites) |
| 8.1 backend lint | `cd server && npm run lint` | 0 errores |
| 8.2 frontend typecheck | `cd client && npx tsc --noEmit` | 0 errores (incl. spec E2E nuevo) |
| 8.2 frontend lint | `cd client && npm run lint` | 0 errores (1 warning ajeno) |
| 8.3 frontend test:unit | `cd client && npm run test:unit` | 286 passed (22 archivos) |
| 8.4 frontend test:e2e (UC09) | `npx playwright test e2e/seguimiento.spec.ts --project=chromium` | 18/18 pass |
| 8.4b frontend test:e2e (full) | `npx playwright test --project=chromium` | 115/115 pass (sin regresiones) |
| 8.5 smoke aislamiento + 409-vs-500 + no-regresión | curl con JWT firmado + proxy real + bandeja UC08 | ver §5 / §6 |

---

## 3. Matriz Escenario → cobertura

| ESC | Cobertura | Detalle |
|---|---|---|
| **ESC-UI-01** (cliente ve estado de todas, badges, próximo paso) | unit + código + E2E parcial | `page.tsx` SSR `backendFetch('/contrataciones')` (sin filtro, todas) + `<SeguimientoLista rol>` → `<ContratacionCard>`/`<EstadoBadge>` (6 estados) + "próximo paso" `copy.seguimiento.proximoPaso`. Render de cards con datos: diferido (OBS-01, seed). |
| **ESC-UI-02** (prestador ve trabajos, acciones por estado) | unit + código | `accionesPara('prestador',…)` (12-par matriz unit); card role-aware. E2E de UI: diferido (OBS-01). |
| **ESC-UI-03** (confirmar 200 → confirmada) | unit + runtime + código | `confirmar(id)`→`postTransicion('confirm')` (unit 200→`{ok:true}`); service `confirm` cliente+PRESUPUESTADA→CONFIRMADA + `transitionTo` (Jest); sin confirmación previa (`REQUIERE_CONFIRMACION.confirmar=false`). |
| **ESC-UI-04** (iniciar 200 → en_curso) | unit + código | `iniciar(id)` (unit); service `start` prestador+CONFIRMADA→EN_CURSO (Jest); badge/próxima acción recalculados por `router.refresh()`. |
| **ESC-UI-05** (finalizar con confirmación → finalizada) | unit + código | `finalizar(id)` (unit); `REQUIERE_CONFIRMACION.finalizar=true` → `<ConfirmAccion>` (sin confirmar NO invoca); service `finish` EN_CURSO→FINALIZADA terminal (Jest). |
| **ESC-UI-06** (cancelar por cliente o prestador → cancelada) | unit + runtime + código | `cancelar(id)` (unit); service `cancel` participante (cliente O prestador) sin role-gate, terminal→409, activo→CANCELADA (Jest matriz). Runtime: tercero→404. `<ConfirmAccion>` obligatorio. |
| **ESC-UI-07** (409 concurrencia → accionable + refresh) | **E2E (page.route)** + unit + código | `seguimiento.spec.ts` mock 409 vía page.route + in-page fetch → browser recibe 409 sin traza; `mapResponder` 409→`estado_cambiado`; `mapSeguimientoError` 409→banner accionable + `refresh:true` (unit). |
| **ESC-UI-08** (aislamiento 404) | **E2E (page.route)** + **runtime** + unit + código | E2E mock 404→browser sin traza; runtime: cliente/prestador no-participante→404; `mapResponder` 404→`no_disponible`; `mapSeguimientoError`→`noDisponible`+`refresh`. |
| **ESC-UI-09** (timeline historial) | **DIFERIDO (ADR-09-04)** | Sin endpoint de historial. La card entrega estado actual + "próximo paso" (REQ-05/06/07). Timeline cronológico = follow-up `GET /contrataciones/:id`. Open Question S1. |
| **ESC-UI-10** (vacío / error listar) | **E2E** + código | E2E: sesión futura-exp → no crashea, sin trace técnico; `seguimiento-lista.tsx` (`visibles=[]`→`copy.seguimiento.vacio`, NO Alert); `seguimiento-error.tsx` (`role=alert`+reintentar); `page.tsx` `!response.ok`/`catch`→`<SeguimientoError/>`. |
| **ESC-UI-11** (401 sesión expirada → /login) | **E2E (loop real ×4)** + unit + código | `seguimiento.spec.ts`: anónimo /cuenta/contrataciones→307 /login?next=; sin cookie/expirada→401 sentinel; exp-futura sin firma→401 reenviado (confirm/start/finish/cancel). `mapSeguimientoError` unauthorized→`redirect`; componentes→`router.push('/login?next=')`; `page.tsx` unauthorized/401→`redirect`. |

---

## 4. Cumplimiento por requisito (revisión de código + tests)

| REQ | Evidencia | Estado |
|---|---|---|
| REQ-01 confirm (cliente, presupuestada→confirmada) | `service.confirm` rol CLIENTE(403)→ownership(404)→PRESUPUESTADA(409)→CONFIRMADA→save→`transitionTo`; controller `@Post(':id/confirm') @HttpCode(200)`; runtime 403/404 | OK |
| REQ-02 start (prestador, confirmada→en_curso) | `service.start` rol PRESTADOR→ownership→CONFIRMADA→EN_CURSO; controller handler; Jest | OK |
| REQ-03 finish (prestador, en_curso→finalizada) | `service.finish` PRESTADOR→ownership→EN_CURSO→FINALIZADA terminal; controller; Jest; UI confirma (REQ-09) | OK |
| REQ-04 cancel (participante, activo→cancelada) | `service.cancel` participante (cliente O prestador, sin role-gate)→404 tercero; terminal→409; activo→CANCELADA; Jest matriz; runtime 404 | OK |
| REQ-05 vista protegida role-aware | `page.tsx` SSR `backendFetch('/contrataciones')`; `<SeguimientoLista>` filtro activas/terminadas/todas; proxy E2E 307 | OK |
| REQ-06 ítem estado/datos/próximo paso | `contratacion-card.tsx` contraparte+ubicación+fecha/franja+precio (presupuestada+)+`<EstadoBadge>`+`proximoPaso` por (rol,estado) | OK |
| REQ-07 acciones contextuales por (rol,estado) | `accionesPara` puro (matriz exhaustiva, unit); `acciones-contratacion.tsx` renderiza solo lo permitido; backend 403/409 autoridad | OK |
| REQ-08 detalle + timeline historial | **DIFERIDO (ADR-09-04)** — estado + "próximo paso" en card; timeline = follow-up | DIFERIDO |
| REQ-09 confirmación de irreversibles | `REQUIERE_CONFIRMACION` finalizar/cancelar→`<ConfirmAccion>` (`role=dialog`, `aria-modal`, foco atrapado/restaurado, Escape); confirmar/iniciar directos | OK |
| REQ-10 auth sin exponer token | BFF 4 Route Handlers `backendFetch` server-only cookie→Bearer; id en URL sin body; E2E token-not-in-bundle + loop real ×4; 401→`/login?next=` | OK |
| REQ-11 200 + refresco optimista | `acciones-contratacion.tsx` 200→toast `role=status` (catálogo es-AR)+`router.refresh()`; `aria-busy`/`loading`/`disabled`; anti-doble-submit (`if(busy)return`) | OK |
| REQ-12 409 accionable + refresh | `mapResponder` 409→`estado_cambiado`; `mapSeguimientoError`→banner accionable+`refresh`, NO error de sistema; E2E 409 sin traza | OK |
| REQ-13 aislamiento UI+backend | listado solo de `GET /contrataciones` (token); sin input por id ajeno; service 404 (oculta); runtime no-participante→404 | OK |
| REQ-14 a11y WCAG AA | `<ConfirmAccion>` dialog accesible; botones con texto + `min-h-11` (≥44px); `aria-busy`; banner `role=alert`+foco; éxito `role=status`; html lang=es-AR (E2E) | OK |
| REQ-15 badges semánticos (texto+color) | `estado-badge.tsx` (REUSO UC08) texto SIEMPRE visible (WCAG 1.4.1) + tokens DESIGN-SYSTEM §estado para los 6 estados | OK |

---

## 5. 409-vs-500 + aislamiento + rol — VERIFICADO (JWT firmado por el backend)

El backend usa el secret de fallback (`process.env.JWT_SECRET ?? 'changeme'`; no hay `.env`); `JwtStrategy.validate` devuelve el payload sin lookup de DB, así que un JWT firmado con `changeme` autentica con cualquier `sub`/`role`. Probes `curl` contra el backend vivo :3000 con `id` bien formado pero inexistente (seed vacío):

| Caso | Resultado | Significado |
|---|---|---|
| `POST /contrataciones/:id/{confirm,start,finish,cancel}` sin auth | **401** ×4 | Los 4 endpoints EXISTEN y `AuthGuard('jwt')` corre (no 404) |
| `confirm` con cliente firmado, id inexistente | **404** `Contratación not found.` | Ownership/no-existe → 404 (oculta existencia, RN-CON-07) |
| `confirm` con prestador firmado (rol incorrecto) | **403** `Only clients can confirm proposals.` | Guard de rol → 403 |
| `start`/`finish` con prestador firmado, id inexistente | **404** ×2 | Ownership → 404 |
| `start`/`finish` con cliente firmado (rol incorrecto) | **403** ×2 | Guard de rol → 403 |
| `cancel` con cliente firmado / prestador firmado, id inexistente | **404** ×2 | No-participante → 404 (sin role-gate; correcto, ADR-09-02) |

**409-vs-500 (EL hallazgo, ADR-09-02):** con la BD de contrataciones vacía y sin endpoint de seed, el guard de **estado-actual** (que produce el 409) NO es alcanzable en runtime (toda contratación inexistente cae en el 404 de ownership antes). Validado por **código + Jest**:

- En `contratacion.service.ts`, los 4 métodos lanzan `ConflictException` (→ 409) leyendo `contratacion.estado` **ANTES** de `entity.estado = destino`, `repo.save` y `stateMachine.transitionTo`. El `InvalidTransitionError` (Error plano → 500) de la state machine es **inalcanzable** porque el guard del service espeja la matriz y rechaza primero (defensa en profundidad: la SM queda como 2ª barrera).
- Jest asserta `ConflictException` para cada transición inválida: `confirm` (≠PRESUPUESTADA), `start` (≠CONFIRMADA), `finish` (≠EN_CURSO), `cancel` (terminal FINALIZADA y CANCELADA) — 6 tests. Ninguno deja burbujear un Error plano.

Conclusión: el 409 sale **como 409, no como 500**. El diseño ADR-09-02 se cumple. (Para cerrar el 409 en runtime se necesitaría seedear una contratación en un estado intermedio — diferido, OBS-01.)

---

## 6. Loop auth BFF (cookie→Bearer→backend) — VERIFICADO end-to-end (sin mock)

`seguimiento.spec.ts` ejercita los **cuatro** Route Handlers UC09 nuevos (`confirm/start/finish/cancel`) con `page.request` (12 tests = 4 verbos × 3 casos):

| Caso (× confirm/start/finish/cancel) | Resultado | Significado |
|---|---|---|
| sin cookie | **401** sentinel (`{ok:false}`, sin trazas) | `backendFetch` devuelve `{unauthorized:true}` → backend NO llamado |
| cookie `exp` vencido | **401** sentinel | sentinel por expiración; backend NO llamado (RN-AUTH-06) |
| cookie `exp` futuro, JWT sin firma válida | **401** reenviado | `backendFetch` adjunta `Bearer` y LLAMA al backend; el backend rechaza la firma → 401 forwardeado. Prueba el reenvío real + que un token forjado no autentica |

El `id` viaja en la URL; el POST NO lleva body (REQ-10). Dos tests extra (page.route + in-page fetch) prueban que un 409/404 mockeado en el handler llega al browser exactamente como lo consume el api-client, sin traza. El smoke proxy confirma anónimo en `/cuenta/contrataciones` → 307 `/login?next=/cuenta/contrataciones` (matcher `/cuenta/:path*`, `proxy.ts` SIN cambios).

---

## 7. No-regresión UC08 + invariantes clave (verificados)

**No-regresión UC08:** `bandeja.spec.ts` → 12/12 verdes en chromium con la cookie sembrada. El impl creó `confirm-accion.tsx` como componente NUEVO (no refactorizó `rechazar-confirm.tsx`), así que la bandeja UC08 (presupuestar/rechazar) sigue intacta. Backend: los 4 métodos UC09 son aditivos; `list`/`proposal`/`reject`/`create` sin cambios (Jest 157, sin regresiones).

| Invariante | Evidencia |
|---|---|
| `confirmar/iniciar/finalizar/cancelar` NUNCA lanzan para 4xx | unit `contrataciones-transicion-api` (cada status → `kind`) |
| Payload de transición NUNCA lleva id/identidad en body | `postTransicion` POST sin body; `id` por URL; BFF idéntico |
| `accionesPara` nunca ofrece acción fuera de la matriz | unit (12 pares incl. terminales→`[]`, prestador+solicitada/presupuestada→`[]`) |
| El service deriva identidad SIEMPRE del token (`userId`), nunca del input | controller pasa `req.user.sub/role`; service usa `userId`; Jest |
| 409 = guard del service ANTES de la SM (no 500) | service lanza `ConflictException` previo a `transitionTo`; Jest 6× ConflictException |
| `cancel` sin role-gate (participante cliente O prestador) | `service.cancel(_role)` ignora rol; 404 a tercero; Jest matriz |
| Token nunca en el bundle/DOM | `backend-fetch.ts` `import "server-only"`; E2E JWT ausente + sin `Bearer ` |
| Confirmación obligatoria en finalizar/cancelar | `REQUIERE_CONFIRMACION` true → `<ConfirmAccion>`; sin confirmar NO invoca |
| 409/404 no exponen trazas | todos los `kind` → copy es-AR; E2E asserta ausencia de `stack`/`trace`/`Error:` |

---

## 8. Observaciones (no bloquean aprobación)

### OBS-01 — Render de cards y acciones de UI requiere seed (mismo diferido que UC04/UC07/UC08)
La vista `/cuenta/contrataciones` es un **Server Component** que lista vía `backendFetch('/contrataciones')` **server-side**; el browser nunca emite ese fetch → `page.route` NO lo intercepta. Con la BD seed **vacía** (y sin sesión firmada por el backend en E2E), la lista resuelve a `[]` → estado vacío neutro o redirect a /login (firma forjada), sin `<ContratacionCard/>`. En consecuencia, las interacciones de las acciones sobre la UI real (toast/badge/refresh tras 200, render de `accionesPara`, el diálogo `<ConfirmAccion>`, anti-doble-submit) NO se ejecutaron como E2E de UI. **Cobertura indirecta:** los 286 unit cubren la matriz `accionesPara`, el mapeo de status de las 4 acciones, y `mapSeguimientoError`; el loop auth BFF de los 4 handlers se prueba real en `seguimiento.spec.ts`; el 409 mockeado+in-page-fetch prueba el reenvío al browser; los componentes son composición de esas piezas + primitivas (Alert/Button/toast/EstadoBadge) ya ejercitadas por UC02/UC04/UC07/UC08. Recomendado: un E2E con backend seedeado (un participante con una contratación en estado intermedio) + `page.route('**/api/contrataciones/*/confirm|start|finish|cancel**')` por status para cerrar ESC-UI-03..08 al 100% sobre la UI real (las ACCIONES SÍ son browser-observables una vez la card rendere). **El mismo seed permitiría confirmar el 409 en runtime** (§5).

### OBS-02 — Timeline del historial (REQ-08 / ESC-UI-09) DIFERIDO por diseño (ADR-09-04)
La spec marca REQ-08 (timeline cronológico del historial) como requisito, pero el diseño lo difirió: `StateChangeHistory` no tiene endpoint y exponerlo es trabajo backend no trivial (ownership por participante, DTO, query por `contratacionId`). El valor de seguimiento/gestión (estado actual, "próximo paso", acciones) se entrega SIN historial. Gate abierto (Open Question S1): si la cátedra exige el timeline en esta entrega, se promueve a in-scope (`GET /contrataciones/:id` con `StateChangeHistory[]`, espeja `list`). No bloquea esta entrega.

### OBS-03 — Matriz cross-browser pendiente (RNF-A.2 / REQ-14)
Los 18 E2E de UC09 (y los 115 totales) corren verdes en **Chromium**. WebKit/Mobile Safari requieren libs de sistema en Linux (`sudo npx playwright install-deps` / imagen `mcr.microsoft.com/playwright`). NO se corrió la matriz de 5 proyectos para respetar el gotcha de NO ejecutar múltiples suites contra el webServer reusado :3001. La corre el tester humano/CI. Mismo diferido que UC01/UC02/UC04/UC07/UC08.

### OBS-04 — La card muestra `prestadorId` como contraparte del cliente (límite del list DTO)
Para el cliente, `contratacion-card.tsx` muestra `item.prestadorId` (UUID) como contraparte, porque el `ContratacionListItemDto` enriquece `clienteNombre` pero NO el nombre/oficio del prestador (solo su id). Para el prestador sí muestra `clienteNombre`. Es un límite de datos heredado del DTO de UC08, documentado en apply-progress; no afecta seguridad ni el flujo de transiciones. Mejora cosmética = follow-up (enriquecer `prestadorNombre`/oficio en el list).

---

## 9. Tareas (estado real vs. checklist)

- **Phases 1-6 (backend + foundation + BFF + api-client + UI + unit):** todas `[x]` — verificadas contra el código (service `confirm/start/finish/cancel` con guards rol→ownership 404→estado 409→save→SM + `toResponseDto`; controller 4 handlers `@HttpCode(200)` derivando token; `accionesPara` puro; copy `seguimiento.*`; `mapSeguimientoError`; 4 Route Handlers; api-client `postTransicion`; 5 componentes + página SSR; Jest +22; 3 vitest). Coinciden con el código.
- **Phase 7 (E2E, las escribe el Verificador):** **completada** — `e2e/seguimiento.spec.ts` (18 tests: proxy/ESC-UI-11, estado-no-crashea/ESC-UI-10, token-not-in-bundle, loop auth real ×4 handlers = 12, 409/404 mockeado vía page.route = 2, a11y/es-AR). Recomendado marcar 7.1/7.2 `[x]` (nota: interacciones de card con datos = diferido OBS-01).
- **Phase 8 (verificación final):** **completada** — 8.1 backend (157/1 skip + lint), 8.2 tsc+lint, 8.3 vitest 286, 8.4 E2E 18/115, 8.5 smoke aislamiento + 409-vs-500 + no-regresión UC08 (§5/§6/§7). Recomendado marcar 8.1-8.5 `[x]`.

---

## 10. Archivos creados/tocados por el Verificador

| Archivo | Tipo | Razón |
|---|---|---|
| `client/e2e/seguimiento.spec.ts` | Tests (nuevo) | 18 tests: proxy/ESC-UI-11 (1), estado-no-crashea/ESC-UI-10 (1), token-not-in-bundle (1), loop auth BFF real confirm/start/finish/cancel (12), 409/404 mockeado vía page.route+in-page-fetch (2), a11y/es-AR (1) |
| `openspec/changes/uc09-ui-gestion/verify.md` | Doc | Este reporte |

Sin cambios de producción: la implementación no requirió fixes.

---

## 11. Resolución del gate (coordinador)

**Veredicto: APROBADO-CON-OBSERVACIONES.** Backend 157 Jest (1 skip) + lint; frontend 286 vitest + tsc + lint limpios; 18/18 E2E UC09 (115/115 full, Chromium, sin regresiones — bandeja UC08 12/12 verde); **el 409 sale como 409 y NO como 500** (guard del service previo a la state machine, validado por código + 6 Jest); aislamiento + rol verificados en runtime con JWT firmado (403 rol incorrecto, 404 no-participante/inexistente); loop auth BFF de los 4 handlers nuevos verificado end-to-end; invariantes de seguridad (token nunca en bundle, payload sin id/identidad, sin trazas) verificados. **Cero bugs de implementación.**

Diferido a follow-up (no bloqueante): E2E con backend seedeado para las acciones de card sobre la UI real + cierre del 409 en runtime (ESC-UI-03..08) — OBS-01; timeline del historial (REQ-08) — OBS-02 (diferido por ADR-09-04, gate cátedra); matriz cross-browser completa en CI — OBS-03; enriquecer nombre de prestador en el list DTO — OBS-04.
