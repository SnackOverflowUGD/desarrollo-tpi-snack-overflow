# Tasks: MI-02.2 UI Login + Manejo de sesión (UC02)

> Deriva de `spec.md` (REQ-01..12, ESC-UI-01..10) y `design.md` (ADR-UC02-01..04, §1 árbol de archivos).
> Todas las rutas son relativas a `client/`. `[P]` = puede correr en paralelo dentro de la fase.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700-900 (3 forms + 2 route handlers + middleware + session layer + lib + tests) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (BASE-auth: cookie/jwt/route handlers/middleware) → PR 2 (login feature + session ctx) → PR 3 (recuperación) → PR 4 (E2E) |
| Delivery strategy | auto-chain |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Capa BASE-auth: cookie + jwt + route handlers + middleware + session context | PR 1 | Fundación; sienta precedente auth. Incluye unit tests de jwt/next-validator. Base: main |
| 2 | Login feature (api-client + validación + copy + form + page) | PR 2 | Depende de Unit 1 (cookie/route handler). Base: main (stacked tras PR 1) |
| 3 | Recuperación de contraseña (forgot + reset, api-client + forms + pages) | PR 3 | Independiente del login form; reusa transporte rewrite. Base: main |
| 4 | Suite E2E Playwright ESC-UI-01..10 + verificación | PR 4 | Depende de Units 1-3. La escribe el Verificador. Base: main |

## Phase 1: Foundation — copy, validación, tipos api-client (sin I/O)

- [x] 1.1 `[P]` Extender `lib/copy/es-AR.ts`: agregar `copy.login` (errors.invalidCredentials/suspended/locked), `copy.forgot`, `copy.reset` (success/passwordShort/mismatch/expired), `copy.session` — textos exactos del catálogo es-AR del spec. (REQ-03/09/10)
- [x] 1.2 `[P]` Crear `lib/validation/login.ts`: schema zod — `email` no-vacío + regex `@` (mismo que registro), `password` solo no-vacío (NO min 8). (REQ-01 / ESC-UI-05)
- [x] 1.3 `[P]` Crear `lib/validation/reset-password.ts`: schema zod — `newPassword` ≥8 ≤128, `confirmPassword` debe coincidir (`refine`, path confirmPassword). (REQ-09 / ESC-UI-09)
- [x] 1.4 `[P]` Crear `lib/session/next-redirect.ts` (o helper en validation): validador de `next` que rechaza `//`, `http://`, acepta solo rutas internas `/…`. (REQ-07 / ESC-UI-07, anti open-redirect)

## Phase 2: BASE-auth — sesión server-side (fundación, sienta precedente)

- [x] 2.1 Crear `lib/session/jwt.ts`: `decodeJwtClaims(token)` (base64url payload, sin verificar firma → exp/email/role) + `isExpired(token, now?)`, malformado→null. (ADR-UC02-03, RN-AUTH-06)
- [x] 2.2 Crear `lib/session/cookie.ts` (server-only): `SESSION_COOKIE='so_session'`, `cookieOptions` (httpOnly, secure prod, sameSite:'lax', path:'/', maxAge desde exp), helpers async `setSessionCookie`/`clearSessionCookie`/`readSessionToken`. (ADR-UC02-01)
- [x] 2.3 Crear `app/api/auth/login/route.ts`: POST → `fetch(BACKEND+/auth/login)` server-side; 200→`setSessionCookie(accessToken)`+`{ok:true}` (sin token al cliente); 401/403/423/422→reenvía status+body; red/5xx→502. (ADR-UC02-02, S1, S4)
- [x] 2.4 `[P]` Crear `app/api/auth/logout/route.ts`: POST → `clearSessionCookie()` → `{ok:true}` (sin llamada al backend). (REQ-06)
- [x] 2.5 Crear `proxy.ts` (Next 16 renombró `middleware.ts`→`proxy.ts`): lee `SESSION_COOKIE`; público→`next()`; protegida sin cookie o `isExpired`→307 `/login?next=<pathname>`; válida→`next()`; `config.matcher` protege placeholder `/cuenta/*`. (REQ-07, S3 / ESC-UI-07)
- [x] 2.6 Crear `lib/session/session-context.tsx` (`'use client'`): `SessionProvider` + `useSession()` → `{status, user?}` + `refresh()`/`clear()`; estado inicial hidratado por prop. (ADR-UC02-03)
- [x] 2.7 Wire `SessionProvider` en `app/layout.tsx`: leer cookie/exp server-side y pasar estado inicial como prop (sin flash). (ADR-UC02-01/03)
- [x] 2.8 Crear `components/session/logout-button.tsx` (`'use client'`): POST `/api/auth/logout` → `useSession().clear()` + `router.push('/login')` + `router.refresh()`. (REQ-06 / ESC-UI-06)

## Phase 3: api-client — resultados discriminados (espejo RegisterResult)

- [x] 3.1 Extender `lib/api/auth.ts`: tipos `LoginResult`/`ForgotResult`/`ResetResult` discriminados + payloads. (ADR-UC02-04, §3)
- [x] 3.2 Extender `lib/api/auth.ts`: `loginUser` → `fetch('/api/auth/login')`; mapeo 200→`{ok:true}` (sin token), 401→`invalid_credentials`, 403→`suspended`, 423→`locked`, 422→`validation`, 5xx→`server`, throw→`network`. Nunca lanza 4xx. (OCL §9 Q1-Q7)
- [x] 3.3 `[P]` Extender `lib/api/auth.ts`: `requestPasswordReset` → `/api/auth/forgot-password` (rewrite); cualquier 2xx→`{ok:true}`, red/5xx→`network`/`server`. (OCL §9, anti-enum)
- [x] 3.4 `[P]` Extender `lib/api/auth.ts`: `resetPassword` → `/api/auth/reset-password` (rewrite); 200→`{ok:true}`, 400/404/410→`invalid_token`, 422→`validation`. (OCL §9)
- [x] 3.5 Extender `lib/errors/field-errors.ts`: `mapLoginError(result)→string|null` (validation→null, resto→banner es-AR, 401 genérico anti-enum) + `mapResetValidation(body)`. Reusa `mapValidationErrors`. (REQ-03/04, §4)

## Phase 4: Componentes form (corazón del feature)

- [x] 4.1 Crear `components/cuentas/login-form.tsx` (`'use client'`): RHF+zod `mode:'onBlur'`, toggle password (`aria-pressed`), banner `role="alert"`+`alertRef.focus()`, anti-doble-submit (`aria-busy`). (REQ-01/08/11)
- [x] 4.2 En `login-form.tsx`: flujo submit — `ok:true`→`useSession().refresh()`+`router.push(next??'/')`+bloqueo; `invalid_credentials`→banner+limpia password+conserva email; `suspended`→banner soporte; `locked`→banner+`setLockedOut`; `validation`→inline; `network`/`server`→banner. (ESC-UI-01/02/03/04/05/10, S2)
- [x] 4.3 `[P]` Crear `components/cuentas/forgot-password-form.tsx` (`'use client'`): email→`requestPasswordReset`→`ok:true` muestra mensaje neutro `role="status"`; red/5xx→banner. (REQ-09 / ESC-UI-08)
- [x] 4.4 `[P]` Crear `components/cuentas/reset-password-form.tsx` (`'use client'`): props `{token}`; token ausente→pantalla "Enlace expirado"; submit→`ok:true` redirect `/login`, `invalid_token`→expirado+CTA, `validation`→inline newPassword. Toggle ambos campos. (REQ-09 / ESC-UI-09)

## Phase 5: Páginas (Server Components, shell)

- [x] 5.1 Crear `app/(auth)/login/page.tsx`: Server Component, card `max-w-md`, h1, links `/registro` y `/recuperar-contrasena`; lee `searchParams.next` (Promise) y lo pasa a `<LoginForm/>`. (REQ-12 / ESC-UI-07)
- [x] 5.2 `[P]` Crear `app/(auth)/recuperar-contrasena/page.tsx`: shell Server Component → `<ForgotPasswordForm/>`. (REQ-09)
- [x] 5.3 `[P]` Crear `app/(auth)/restablecer-contrasena/page.tsx`: shell; lee `searchParams.token` (Promise) → `<ResetPasswordForm token={…}/>`. (REQ-09)

## Phase 6: Unit tests (vitest)

- [x] 6.1 `[P]` `lib/api/auth.ts`: mockear `fetch`, assert `kind` por status de `loginUser`/`requestPasswordReset`/`resetPassword`; assert `loginUser` NO expone token (Q1) + anti-enum (Q7). (OCL §9, §10) → `test/unit/login-api.test.ts`
- [x] 6.2 `[P]` `lib/errors/field-errors.ts`: `mapLoginError` todos los kinds (assert 401 genérico no menciona campo) + `mapResetValidation`. (Q1-Q5) → `test/unit/login-errors.test.ts`
- [x] 6.3 `[P]` `lib/validation/login.ts` + `reset-password.ts`: email inválido/password vacío bloquean, password corto NO bloquea (login); <8 y confirm-mismatch bloquean (reset). (ESC-UI-05/09) → `test/unit/login-schema.test.ts`
- [x] 6.4 `[P]` `lib/session/jwt.ts`: `decodeJwtClaims`/`isExpired` (vigente/vencido/malformado) + validador `next` rechaza `//evil`/`http://`, acepta `/cuenta`. (§10) → `test/unit/session-jwt.test.ts`

## Phase 7: E2E tests (Playwright — los escribe el Verificador)

- [x] 7.1 Crear `e2e/login.spec.ts`: ESC-UI-01..05 (login 200+cookie+redirect+bloqueo; 401 banner+password vacío; 423 submit disabled; 403 soporte; 422 inline) interceptando `**/api/auth/login`. (§8)
- [x] 7.2 `e2e/login.spec.ts`: ESC-UI-06/07 sesión persiste tras reload + logout borra cookie + ruta protegida sin cookie→307 `/login?next=` → login honra `next`. (§8)
- [x] 7.3 `[P]` Crear `e2e/recuperacion.spec.ts`: ESC-UI-08 (mensaje neutro), ESC-UI-09 (reset éxito→/login; token vencido→pantalla expirado+CTA), ESC-UI-10 (red/5xx banner). (§8)

## Phase 8: Verificación final

- [x] 8.1 Correr `lint` (ESLint flat) — sin errores en archivos nuevos/extendidos.
- [x] 8.2 Correr `test:unit` (vitest + coverage-v8) — todos los unit verdes, cubren OCL §9.
- [x] 8.3 Correr `test:e2e` (Playwright) — ESC-UI-01..10 verdes en los 3 browsers.
- [x] 8.4 Smoke test de S1: confirmar que `/api/auth/login` resuelve al Route Handler (no al rewrite ciego) y setea cookie httpOnly. (S1, riesgo crítico)
