# Verification Report — UC07 UI Solicitar contratación (MI-07.2)

**Fecha:** 2026-06-13
**Rama:** `main`
**Verificador:** Agente SDD Verificador (stage 1.4)
**Suites:** `client/e2e/solicitar.spec.ts` (Playwright, Chromium) · `client/test/unit/*` (vitest) · runtime probes (curl) contra backend NestJS :3000 / frontend Next :3001

---

## Veredicto final

**APROBADO-CON-OBSERVACIONES**

- **Unit (vitest):** 183/183 pass (16 archivos, ~467ms) — incluye los 4 nuevos de UC07 (35 tests: backend-fetch 3, contrataciones-api 13, solicitud-schema 11, solicitud-errors 8).
- **E2E UC07 (Playwright, Chromium):** 9/9 pass (`solicitar.spec.ts`).
- **E2E suite completa (Chromium):** 85/85 pass (UC07 9 + login/registro/recuperación/prestadores/perfil/smoke 76) — **sin regresiones**.
- **Lint (ESLint flat):** 0 errores (1 warning pre-existente en `registro-form.tsx`, ajeno a UC07).
- **Typecheck (`tsc --noEmit`):** 0 errores, incluye el spec E2E nuevo.
- **Smoke S2 (riesgo crítico):** **CONFIRMADO** — `/prestadores/:id/solicitar` redirige 307 a `/login?next=…` sin sesión; `/prestadores/:id` (perfil público) y `/prestadores` (listado) siguen accesibles SIN sesión (no capturados por el matcher).
- **Loop auth BFF (cookie→Bearer→backend):** **CONFIRMADO end-to-end contra el backend vivo** (sin mock).

La implementación cubre los 14 requisitos (REQ-01..14) y los 7 escenarios (ESC-UI-01..07) por código + unit + E2E. **No se hallaron bugs.** El veredicto es APROBADO-CON-OBSERVACIONES por un diferido no bloqueante: las pantallas (CTA + formulario) son Server Components cuyo fetch de perfil corre server-side, y la BD de prestadores está vacía → el render del formulario y del CTA con datos requiere seed (mismo diferido que UC04 OBS-02). Las interacciones del formulario (validación, mapeo 201/409/404/422/5xx, anti-doble-submit) quedan cubiertas por los 35 unit + revisión de código.

---

## 1. Bugs

**Ninguno.** A diferencia de UC04 (BUG-001 en el DTO backend) y UC01 (3 bugs), la implementación de UC07 pasó lint + tsc + 183 unit + 85 E2E + todos los runtime probes sin desviaciones. El contrato backend `POST /contrataciones` ya estaba verificado y mergeado; el frontend lo consume fielmente.

---

## 2. Resultado de la verificación final

| Tarea | Comando | Resultado |
|---|---|---|
| 8.1 lint | `npm run lint` | 0 errores (1 warning ajeno) |
| 8.1 typecheck | `npx tsc --noEmit` | 0 errores (incl. spec E2E nuevo) |
| 8.2 test:unit | `npm run test:unit` | 183/183 pass (16 archivos) |
| 8.3 test:e2e (UC07) | `npx playwright test e2e/solicitar.spec.ts --project=chromium` | 9/9 pass |
| 8.3b test:e2e (full) | `npx playwright test --project=chromium` | 85/85 pass (sin regresiones) |
| 8.4 smoke S2 | curl + Playwright (proxy real) | matcher correcto (ver §6) |
| — loop auth BFF | curl POST /api/contrataciones (3 casos) | sentinel/forward 401 correctos (ver §5) |

---

## 3. Matriz Escenario → cobertura

| ESC | Cobertura | Detalle |
|---|---|---|
| **ESC-UI-01** (201 → éxito) | unit + código | `contrataciones-api` (201⇒`{ok:true,data.estado:'solicitada'}`, payload sin `clienteId`); `solicitud-form.tsx` (`setSucceeded`→`<SolicitudExito role=status>` + bloqueo + "Volver al perfil"). E2E de render del form: diferido (OBS-01, requiere seed). |
| **ESC-UI-02** (CTA anónimo/prestador) + **S2** | **E2E (3 tests)** + código | `solicitar.spec.ts`: `/solicitar` sin sesión → 307 `/login?next=<destino>`; perfil y listado públicos accesibles. CTA 3-ramas en `solicitar-cta.tsx` (cliente→push form, anónimo→`/login?next=`, prestador→`aria-disabled`+texto SR). |
| **ESC-UI-03** (validación cliente) | unit + código | `solicitud-schema` (requeridos vacíos bloquean; `esFechaValida` hoy ok / ayer falla / futuro ok); `solicitud-form.tsx` RHF `mode:onBlur` + `<input type=date min={hoyISO}>` + `aria-invalid`/`aria-describedby` + `setFocus`. |
| **ESC-UI-04** (409 franja ocupada) | unit + código | `contrataciones-api` (409→`franja_ocupada`); `mapSolicitudError` (409→banner accionable + `reselectFranja` + `field:franja`, conserva datos). |
| **ESC-UI-05** (404 prestador) | unit + código | `contrataciones-api` (404→`prestador_no_disponible`); `mapSolicitudError` (404→`noDisponible`+banner); form muestra link "Volver a la búsqueda" → `/prestadores`. |
| **ESC-UI-06** (401 sesión expirada) | **E2E (3 tests, loop real)** + unit | `solicitar.spec.ts`: sin cookie/expirada → 401 sentinel; exp-futura sin firma → 401 reenviado del backend. `contrataciones-api` (401→`unauthorized`); form → `router.push('/login?next=')`. |
| **ESC-UI-07** (red / 5xx) | unit + código | `contrataciones-api` (throw→`network`, 5xx/502→`server`); `mapSolicitudError` (network/server→`redServer` banner); Route Handler `catch`→502. |

---

## 4. Cumplimiento por requisito (revisión de código + tests)

| REQ | Evidencia | Estado |
|---|---|---|
| REQ-01 CTA por rol | `solicitar-cta.tsx` 3 ramas (`useSession().status/role`); E2E S2; copy `cta.anonimo`/`cta.prestador` | OK |
| REQ-02 campos + prestadorId no editable | `solicitud-form.tsx` (`prestadorId` prop, no input; ubicación/fecha/franja/descripción); página muestra nombre/oficio legible | OK |
| REQ-03 validación cliente | `solicitud.ts` zod (`trim().min(1)` + `refine(esFechaValida)`); `min={hoyISO}`; bloquea submit sin HTTP; unit `solicitud-schema` | OK |
| REQ-04 auth sin exponer token | `backend-fetch.ts` `server-only` cookie→Bearer; Route Handler same-origin; payload sin `clienteId`; E2E token-not-in-bundle | OK |
| REQ-05 201 → éxito | `contrataciones-api` (201⇒`solicitada`); `<SolicitudExito role=status>` + bloqueo + CTA perfil | OK |
| REQ-06 401 → login | `contrataciones-api` 401→`unauthorized`; form `router.push('/login?next=')`; E2E loop real | OK |
| REQ-07 403 (no cliente) | `mapSolicitudError` 403→banner `cta.prestador`; prevenido client por CTA | OK |
| REQ-08 404 | `mapSolicitudError` 404→`noDisponible`+`volverABusqueda` link `/prestadores` | OK |
| REQ-09 409 accionable | `mapSolicitudError` 409→banner+`reselectFranja`+field franja; conserva datos | OK |
| REQ-10 422/400 | 422→inline fecha; 400→`validacionGenerica` banner role=alert; valores retenidos | OK |
| REQ-11 red/5xx | `redServer` banner role=alert, sin trazas; handler 502 | OK |
| REQ-12 anti-doble-submit | `isSubmitting`→`aria-busy`, botón `loading`+`disabled`, campos `disabled`; 201 bloquea, error reintenta | OK |
| REQ-13 a11y WCAG AA | Field con label+aria-required+aria-invalid+aria-describedby; date min; Select accesible; foco al banner/campo; html lang=es-AR (E2E) | OK |
| REQ-14 compat/≤5 pasos | una pantalla de captura; responsive (clases Tailwind); matriz cross-browser diferida (OBS-02) | OK (matriz diferida) |

---

## 5. Loop auth BFF (cookie→Bearer→backend) — VERIFICADO end-to-end (sin mock)

Probes `curl`/`page.request` contra el Route Handler real `POST /api/contrataciones` (que internamente usa `backendFetch` → backend :3000):

| Caso | Resultado | Significado |
|---|---|---|
| sin cookie | **401** (body `{ok:false}`, sin trazas) | `backendFetch` devuelve sentinel `{unauthorized:true}` → backend NO llamado (RN-AUTH-06) |
| cookie `exp` vencido | **401** | sentinel por expiración; backend NO llamado |
| cookie `exp` futuro, JWT sin firma válida | **401** reenviado (`{"message":"Unauthorized","statusCode":401}`) | `backendFetch` adjunta `Bearer` y LLAMA al backend; el backend rechaza la firma → 401 forwardeado. **Prueba que el reenvío cookie→Bearer→backend ocurre de verdad** y que un token forjado NO puede autenticar (defensa en profundidad) |

El api-client mapea cualquier 401 → `kind:'unauthorized'` → el form redirige a `/login?next=`. El cuerpo forwardeado es el mensaje genérico del backend (sin trazas, REQ-11).

---

## 6. Smoke S2 (riesgo crítico del diseño) — RESUELTO

Probes directos (curl, sin sesión):

```
GET /prestadores/<uuid>/solicitar  → 307  Location: /login?next=%2Fprestadores%2F<uuid>%2Fsolicitar
GET /prestadores/<uuid>            → 200  (perfil público, NO redirige)
GET /prestadores                   → 200  (listado público, NO redirige)
```

El matcher `["/cuenta/:path*", "/prestadores/:id/solicitar"]` protege exactamente la ruta del formulario y deja público el padre `/prestadores/:id` (no termina en `/solicitar`). El param de redirección es `next` (convención del repo), URL-encodeado. Confirmado además por 3 tests E2E (proxy REAL, sin mock). **S2 cerrado.**

---

## 7. Invariantes clave (verificados)

| Invariante | Evidencia |
|---|---|
| `crearSolicitud` NUNCA lanza para 4xx | unit `contrataciones-api` (cada status → `kind`, ningún throw salvo transporte) |
| Payload NUNCA incluye `clienteId` | `CrearContratacionPayload` no lo declara (tsc); form arma el body sin `clienteId`; backend lo deriva del token |
| Token nunca en el bundle/DOM | `backend-fetch.ts` `import "server-only"`; E2E asserta JWT ausente del `page.content()` y sin `Bearer ` en el DOM |
| 201 ⇒ `estado:'solicitada'` | `contrataciones-api` valida el body; un 201 sin body usable → `kind:'server'` (defensivo) |
| 409 ≠ error de sistema | `mapSolicitudError` 409→accionable+`reselectFranja`, conserva datos (REQ-09) |
| no expone trazas | todos los `kind` mapean a copy es-AR; E2E asserta ausencia de `stack`/`trace`/`Error:` |
| matcher no captura el perfil público | §6 (S2) |

---

## 8. Observaciones (no bloquean aprobación)

### OBS-01 — Render del formulario y del CTA requieren seed (mismo diferido que UC04 OBS-02)
El formulario vive en `/prestadores/[id]/solicitar` (Server Component) y el CTA dentro de `<PerfilPrestador/>` en `/prestadores/[id]` (Server Component). Ambos hacen `obtenerPerfil(id)` **server-side** contra `BACKEND_URL`; el browser nunca emite ese fetch → `page.route` NO puede interceptarlo. Con la BD de prestadores **vacía**, todo id resuelve a `not_found` → la página renderiza `<PerfilNoEncontrado/>`, no el form ni el CTA. Verificado por probe (`/solicitar` con cookie válida + uuid inexistente → "No encontramos…", no el form). En consecuencia, las interacciones del formulario con datos (submit 201 → toast/bloqueo/volver; 409 reselección; 404 CTA; 422 inline; 5xx banner; anti-doble-submit) NO se ejecutaron como E2E de UI. **Cobertura indirecta:** los 35 unit cubren el mapeo de status, la validación, los mensajes y el sentinel; el comportamiento del form es composición de esas piezas + primitivas (Field/Alert/Select) ya ejercitadas por UC02/UC04. Recomendado: un E2E con backend seedeado (un prestador activo con perfil geocodeado) en la fase de integración para cerrar ESC-UI-01/03/04/05/07 al 100% sobre la UI real, más `page.route('**/api/contrataciones')` por status (el POST del form SÍ es browser-observable y mockeable una vez el form rendere).

### OBS-02 — Matriz cross-browser pendiente (RNF-A.2 / REQ-14)
Los 9 E2E de UC07 (y los 85 totales) corren verdes en **Chromium**. WebKit/Mobile Safari requieren libs de sistema en Linux (`sudo npx playwright install-deps`). No se corrió la matriz de 5 proyectos para respetar el gotcha de NO ejecutar múltiples suites en paralelo contra el webServer reusado :3001. La corre el tester humano / CI con la imagen `mcr.microsoft.com/playwright`. Mismo diferido que UC01/UC02/UC04.

### OBS-03 — `franja` es TEXTO LIBRE (grounding S1), no enum
El schema zod sólo exige `franja` no-vacía; el set curado (`copy.solicitud.franjas`: "Mañana (08–12)", "Mediodía (12–14)", "Tarde (14–18)", "Noche (18–22)") vive en `copy` y alimenta el `<Select>`. El backend valida disponibilidad, no un enum cerrado. Decisión correcta y consistente con el grounding de UC04 (oficio texto libre). No es desviación.

### OBS-04 — El backend valida la firma del JWT (defensa en profundidad confirmada)
El loop auth (§5) mostró que un JWT con `exp` futuro pero firma inválida es rechazado por el backend con 401. Esto confirma que `backendFetch` no es la única barrera: aun si un atacante fabricara una cookie con `exp` futuro, el backend rechaza la firma. El claim `role` que lee `useSession` (CTA) es **decorativo**; la autorización real es backend (403) + proxy (sesión). Coherente con ADR-07-04.

---

## 9. Tareas (estado real vs. checklist)

- **Phases 1-6 (foundation, infra, BFF, componentes, página/proxy, unit):** todas `[x]` — verificadas contra el código (backend-fetch server-only, Route Handler, api-client discriminado, validación zod, copy/errors, form/éxito, página protegida, CTA 3-ramas, proxy matcher, 4 unit). Coinciden.
- **Phase 7 (E2E, las escribe el Verificador):** **completada** — `e2e/solicitar.spec.ts` (7.1 CTA/S2/token + 7.2 loop auth/no-disponible). Recomendado marcar 7.1/7.2 `[x]`.
- **Phase 8.3 (test:e2e) y 8.4 (smoke S2):** **completadas** — ver §2/§5/§6. Recomendado marcar 8.3/8.4 `[x]`.

---

## 10. Archivos creados/tocados por el Verificador

| Archivo | Tipo | Razón |
|---|---|---|
| `client/e2e/solicitar.spec.ts` | Tests (nuevo) | 9 tests: S2/matcher (3), token-not-in-bundle + proxy con sesión (2), loop auth BFF real (3), a11y/es-AR (1) |
| `openspec/changes/uc07-ui-solicitar/verify.md` | Doc | Este reporte |

Sin cambios de producción: la implementación no requirió fixes.

---

## 11. Resolución del gate (coordinador)

**Veredicto: APROBADO-CON-OBSERVACIONES.** 183/183 unit + 9/9 E2E UC07 (85/85 full, Chromium) + lint/tsc limpios + smoke S2 resuelto + loop auth BFF verificado end-to-end + invariantes de seguridad (token nunca en bundle, payload sin clienteId, sin trazas) verificados. **Cero bugs.**

Diferido a follow-up (no bloqueante): E2E con backend seedeado para las interacciones del formulario sobre la UI real (ESC-UI-01/03/04/05/07) — OBS-01; matriz cross-browser completa en CI — OBS-02.
