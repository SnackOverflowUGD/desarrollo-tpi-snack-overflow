# Verification Report — UC02 UI Login + Manejo de sesión (MI-02.2)

**Fecha:** 2026-06-14
**Rama:** `main` (apply UC02 ya integrado)
**Verificador:** Agente SDD Verificador (stage 1.4)
**Suites:** `client/e2e/login.spec.ts` + `client/e2e/recuperacion.spec.ts` (Playwright, Chromium) · `client/test/unit/*` (vitest)

---

## Veredicto final

**APROBADO**

- **Unit (vitest):** 105/105 pass (8 archivos, ~356ms).
- **E2E (Playwright, Chromium):** 31/31 pass (login 19/19 + recuperación 12/12).
- **Lint (ESLint flat):** 0 errores (1 warning pre-existente en `registro-form.tsx`, ajeno a UC02).
- **Typecheck (`tsc --noEmit`, equivalente al type-check de `next build`):** 0 errores, incluye specs E2E nuevos.
- **Smoke S1 (riesgo crítico):** confirmado — `/api/auth/login` resuelve al Route Handler, no al rewrite ciego.

La implementación cubre los 10 escenarios del spec (ESC-UI-01..10) y los 12 requisitos (REQ-01..12). Los invariantes de seguridad UX (anti-enumeración 401/forgot, lockout 423 con submit deshabilitado, token httpOnly nunca expuesto al cliente) están verificados en runtime. **No se hallaron bugs.** Se documentan 4 observaciones no bloqueantes.

---

## 1. Resultado de la verificación final (Phase 8)

| Tarea | Comando | Resultado |
|---|---|---|
| 8.1 lint | `npm run lint` | 0 errores (1 warning ajeno a UC02) |
| 8.2 test:unit | `npm run test:unit` (+ `--coverage`) | 105/105 pass |
| 8.3 test:e2e | `npx playwright test {login,recuperacion}.spec.ts --project=chromium` | 31/31 pass |
| 8.4 smoke S1 | `curl -i -X POST /api/auth/login` | 502 `{ok:false}` del HANDLER (no passthrough) ✔ |

---

## 2. Matriz de cumplimiento Escenario → test

### login.spec.ts (19 tests)

| # | Test | ESC | REQ | Resultado |
|---|------|-----|-----|-----------|
| 1 | 200 → POST enviado, redirige a destino, form bloqueado (sin token en el request) | ESC-UI-01 | REQ-01/02/05/08 | PASS |
| 2 | botón en aria-busy durante el envío | ESC-UI-01 | REQ-08 | PASS |
| 3 | 401 banner GENÉRICO role=alert; conserva email, limpia password, reintento, anti-enum | ESC-UI-02 | REQ-03, RNF-S.4 | PASS |
| 4 | 423 banner 30 min + submit deshabilitado, sin filtrar inglés | ESC-UI-03 | REQ-03, RN-AUTH-04 | PASS |
| 5 | 403 banner con canal soporte@; submit reintentable; sin revelar credenciales | ESC-UI-04 | REQ-03, RN-AUTH-01 | PASS |
| 6 | email sin @ en blur → inline + aria-invalid + aria-describedby | ESC-UI-05 | REQ-01/04 | PASS |
| 7 | error de cliente NO dispara HTTP | ESC-UI-05 | REQ-01/04 | PASS |
| 8 | password corto NO bloquea (login no valida longitud) | ESC-UI-05 | REQ-01 | PASS |
| 9 | 422 servidor → inline es-AR por campo, sin inglés crudo | ESC-UI-05 | REQ-04 | PASS |
| 10 | GET /cuenta sin cookie → 307 /login?next=/cuenta (proxy REAL) | ESC-UI-07 | REQ-07 | PASS |
| 11 | login OK con ?next=/cuenta honra el destino original | ESC-UI-07 | REQ-02/07 | PASS |
| 12 | next inseguro (//evil) ignorado → cae a '/' (open-redirect guard) | ESC-UI-07 | REQ-07 | PASS |
| 13 | fallo de red → banner role=alert, conserva ambos campos, reintento | ESC-UI-10 | REQ-10 | PASS |
| 14 | 502/5xx → banner genérico, sin trazas técnicas | ESC-UI-10 | REQ-10 | PASS |
| 15 | campos con label visible + aria-required | — | REQ-11 | PASS |
| 16 | toggle password operable + aria-pressed + type toggle | — | REQ-11 | PASS |
| 17 | html lang=es-AR + skip-link presente | — | REQ-11 | PASS |
| 18 | foco se mueve al banner role=alert al aparecer | — | REQ-11 | PASS |
| 19 | links a /registro y a recuperación presentes | — | REQ-12 | PASS |

### recuperacion.spec.ts (12 tests)

| # | Test | ESC | REQ | Resultado |
|---|------|-----|-----|-----------|
| 1 | forgot: email exista o no → SIEMPRE mismo mensaje neutro (role=status), anti-enum | ESC-UI-08 | REQ-09, RN-AUTH-05 | PASS |
| 2 | forgot: email inválido en blur → inline, no envía | ESC-UI-08 | REQ-09 | PASS |
| 3 | forgot: error de red → banner role=alert reintentable | ESC-UI-10 | REQ-10 | PASS |
| 4 | reset: sin token en URL → pantalla "Enlace expirado" + CTA (sin form) | ESC-UI-09 | REQ-09 | PASS |
| 5 | reset: confirmación no coincide → inline (zod) | ESC-UI-09 | REQ-09 | PASS |
| 6 | reset: password <8 → inline, no envía | ESC-UI-09 | REQ-09 | PASS |
| 7 | reset: 200 → éxito role=status → redirige a /login | ESC-UI-09 | REQ-09 | PASS |
| 8 | reset: token vencido 410 → pantalla "Enlace expirado" + CTA, sin cambio | ESC-UI-09 | REQ-09 | PASS |
| 9 | reset: 422 (pass corta servidor) → inline en newPassword, sin inglés | ESC-UI-09 | REQ-09 | PASS |
| 10 | reset: error de red → banner role=alert reintentable | ESC-UI-10 | REQ-10 | PASS |
| 11 | forgot: label visible + aria-required | — | REQ-11 | PASS |
| 12 | reset: toggle password con aria-pressed | — | REQ-11 | PASS |

---

## 3. ESC-UI-06 (sesión persiste + logout) — verificación complementaria

ESC-UI-06 exige el ciclo completo de cookie httpOnly (login setea → reload persiste → logout borra). Como en E2E el Route Handler `/api/auth/login` está MOCKEADO (no se setea la cookie real), el loop completo se verifica vía **probes de runtime sobre los endpoints reales** en lugar de un único test E2E:

- **Logout borra la cookie (REQ-06):** `POST /api/auth/logout` → `200 {"ok":true}` con
  `set-cookie: so_session=; Path=/; Max-Age=0; HttpOnly; SameSite=lax` — atributos exactos de `cookieOptions`.
- **Persistencia (REQ-05):** cookie seteada con `maxAge` derivado del `exp` del JWT (`maxAgeFromToken`), `getInitialSession` rehidrata el `SessionProvider` server-side sin flash. Mecanismo cubierto por unit (`session-jwt.test.ts`: `isExpired`/`decodeJwtClaims`) + estructura del layout.
- **Proxy honra sesión válida (REQ-07 happy path):** con una cookie `so_session` JWT no expirada, `GET /cuenta` devuelve 404 (ruta placeholder S3, ruta inexistente) en lugar de 307 → el proxy dejó pasar la sesión válida; sin cookie devuelve 307 a `/login`.

El logout-button (`components/session/logout-button.tsx`) encadena `fetch(/api/auth/logout)` + `clear()` + `router.push('/login')` + `router.refresh()` — coherente con el diseño.

---

## 4. Invariantes de seguridad UX (verificados)

| Invariante | Evidencia |
|---|---|
| **Anti-enum 401** — banner genérico "E-mail o contraseña incorrectos.", nunca revela qué campo | login.spec #3: assert texto exacto + `not.toHaveText` sobre variantes que filtrarían el campo + `body` no contiene "Invalid credentials" |
| **Anti-enum forgot** — mensaje neutro idéntico exista o no la cuenta | recuperacion.spec #1 |
| **Lockout 423** — submit deshabilitado, sin reintento inmediato | login.spec #4: `toBeDisabled()` |
| **403 con canal soporte**, submit reintentable | login.spec #5 |
| **Token httpOnly nunca al cliente** — handler responde `{ok:true}` sin token; el request del form no contiene `accessToken` | login.spec #1 (`postData not.toContain accessToken`) + unit `login-api.test.ts` (Q1) + handler `route.ts:80` |
| **Open-redirect guard** — `//evil`, esquemas, backslash rechazados | login.spec #12 + unit `session-jwt.test.ts` (next-redirect) |
| **Sin trazas técnicas en 5xx/red** | login.spec #13/#14 |

---

## 5. Smoke S1 (riesgo crítico del diseño) — RESUELTO

`POST /api/auth/login` con backend ausente devuelve **`HTTP 502 {"ok":false}`** con headers `vary: rsc, next-router-state-tree, …`. Esa respuesta es la del **Route Handler propio** (su `try/catch` alrededor del `fetch` al backend que falla en :3000), NO un passthrough del rewrite ciego `/api/:path*`. Confirma la semántica asumida en S1: **un Route Handler de archivo gana sobre el rewrite para esa ruta exacta**. La cookie httpOnly puede setearse. `next.config.ts` no necesita cambios.

---

## 6. Coverage (funciones puras nuevas, vitest)

| Archivo | % Stmts | % Branch | % Funcs | % Lines | Líneas sin cubrir |
|---|---|---|---|---|---|
| `lib/api/auth.ts` | 98.24 | 86.04 | 100 | 98.07 | 313 |
| `lib/errors/field-errors.ts` | 93.02 | 81.81 | 100 | 95 | 114, 151 |
| `lib/session/jwt.ts` | 85.18 | 83.33 | 100 | 90.9 | 32, 61 |
| `lib/session/next-redirect.ts` | 84.61 | 88.23 | 100 | 100 | 22-24 |

Global: 93.93% stmts / 86.48% branch / 100% funcs / 96.47% lines. Cubre las pre/postcondiciones OCL §9 (Q1-Q7 login, forgot, reset, next-validator).

---

## 7. Observaciones (no bloquean aprobación)

### OBS-01 — Matriz cross-browser pendiente (RNF-A.2)
Los 31 E2E corren verdes en **Chromium**. WebKit/Mobile Safari requieren libs de sistema (`sudo npx playwright install-deps`) ausentes en la máquina local. Firefox/Mobile Chrome ejecutables pero no corridos en esta verificación para respetar el gotcha de NO correr múltiples suites en paralelo contra el webServer reusado. La matriz completa (5 proyectos) la corre el tester humano / CI con la imagen `mcr.microsoft.com/playwright`. Mismo diferido que UC01.

### OBS-02 — ESC-UI-06 loop completo de cookie requiere backend real
La persistencia de sesión tras reload no se testea como un único E2E end-to-end porque el Route Handler de login está mockeado (no setea cookie real). Se verificó por partes vía probes de runtime sobre los endpoints reales (logout borra cookie, proxy honra/bloquea según cookie) + unit de `isExpired`/`decodeJwtClaims`. Un test de humo con backend NestJS vivo cerraría el loop al 100% — recomendado para la fase de integración.

### OBS-03 — Test "next honra destino" siembra cookie de sesión
`login.spec` test #11 inyecta una cookie `so_session` (JWT con exp futuro) ANTES de navegar, porque sin la cookie real (handler mockeado) el proxy rebotaría `/cuenta` de vuelta a `/login`. Esto aísla la aserción "el form hace `router.push(next)`" del proxy. Es un workaround de harness legítimo, no oculta ningún defecto.

### OBS-04 — `requestPasswordReset`/`resetPassword` van por el rewrite ciego
forgot/reset NO pasan por Route Handler (son stateless, sin cookie) — usan el rewrite `/api/auth/*` → backend. En E2E se mockean igual con `page.route('**/api/auth/forgot-password' | '…reset-password')`. Comportamiento correcto por diseño (ADR-UC02-02); se documenta para el tester humano que con backend vivo estas dos rutas sí golpean NestJS directamente.

---

## 8. Tareas (estado real vs. checklist)

Phases 1-6 (30 tareas) marcadas `[x]` en `tasks.md` — verificadas contra el código: copy/validación/tipos, capa BASE-auth (jwt/cookie/route handlers/proxy/session-context/layout/logout-button), api-client discriminado, forms, páginas, unit tests. Coinciden con el estado del código.

Phase 7 (E2E, las escribe el Verificador): **completadas en esta verificación** — `e2e/login.spec.ts` (7.1+7.2) y `e2e/recuperacion.spec.ts` (7.3).
Phase 8 (verificación final 8.1-8.4): **completada** — ver §1.

Recomendación: marcar 7.1-7.3 y 8.1-8.4 como `[x]` en `tasks.md`.

---

## 9. Archivos creados/tocados por el Verificador

| Archivo | Tipo | Razón |
|---|---|---|
| `client/e2e/login.spec.ts` | Tests (nuevo) | 19 tests ESC-UI-01..05/07/10 + a11y, espejando `registro.spec.ts` |
| `client/e2e/recuperacion.spec.ts` | Tests (nuevo) | 12 tests ESC-UI-08/09/10 + a11y |
| `openspec/changes/uc02-ui-login/verify.md` | Doc | Este reporte |

**No se modificó código de producción** (a diferencia de UC01, donde se arreglaron 3 bugs). La implementación pasó la verificación sin defectos.

---

## 10. Resolución del gate (coordinador)

**Veredicto: APROBADO.** 105/105 unit + 31/31 E2E (Chromium) + lint/typecheck limpios + smoke S1 resuelto + invariantes de seguridad UX verificados. Sin bugs.

Diferido a follow-up (no bloqueante): matriz cross-browser completa (WebKit/Mobile Safari) en CI; test de humo ESC-UI-06 con backend NestJS vivo para cerrar el loop de cookie al 100%.
