# Design — MI-02.2 UI Login + Manejo de sesión (UC02)

> **Fase:** Diseño (SDD 1.2). Deriva del `spec.md` aprobado, del `client/DESIGN-SYSTEM.md` (fuente única
> de diseño) y del **precedente directo** `uc01-ui-registro/design.md` (base compartida ya implementada:
> tokens, fuentes, theme, primitivas `components/ui/*`, `lib/http`-pattern, `lib/copy`, `lib/errors`,
> `lib/validation`, patrón `RegisterResult` discriminado). Define el CÓMO arquitectónico. NO contiene
> código de producción: solo firmas, tipos y estructura prescriptiva para que el agente de Implementación
> no tenga ambigüedad.
>
> **Stack verificado (igual que UC01):** Next.js 16.2.9 (App Router) · React 19.2.4 · Tailwind v4
> (`@tailwindcss/postcss`, CSS-native `@theme { }`) · TS strict · alias `@/*` → `client/` ·
> `output: "standalone"` · ESLint flat · RHF 7.79 + zod 4.4 + `@hookform/resolvers` 5.4 (YA instalados) ·
> vitest 4.1 + `@vitest/coverage-v8` (unit) · Playwright 1.60 (E2E). Breaking Next 16: `params`/`searchParams`
> son **Promises**; Server Components por defecto, `'use client'` para estado/handlers/effects;
> `cookies()` de `next/headers` es **async** y solo escribible desde Route Handler / Server Action;
> `middleware.ts` corre en edge runtime.
>
> **Trazabilidad:** UC02 · RF-1.2 · RF-1.6 · RNF-S.4 · RNF-A.1/A.2/A.3 · spec REQ-01..REQ-12 · ESC-UI-01..10.

---

## 0. Continuidad con UC01 (qué se reutiliza, qué se agrega)

UC01 dejó la **base compartida** del cliente operativa. UC02 NO la re-crea: la consume y la extiende.

| Activo de la base UC01 | Uso en UC02 |
|---|---|
| `app/globals.css`, `app/layout.tsx`, `theme-provider` | reutilizados sin cambios |
| `components/ui/{button,input,label,field,alert,toaster}` | reutilizados; login no requiere `select`/`password-strength` salvo reset (REQ-09) |
| Patrón `RegisterResult` discriminado en `lib/api/auth.ts` (nunca throw para 4xx) | **espejado** en `loginUser`/`requestPasswordReset`/`resetPassword` |
| Patrón form `'use client'` RHF + zod, `mode:"onBlur"`, `Field`/`Alert`, anti-doble-submit | **espejado** en `login-form.tsx` y forms de recuperación |
| `lib/copy/es-AR.ts`, `lib/errors/field-errors.ts`, `lib/validation/*` | **extendidos** (no reescritos) con secciones de login/recuperación |
| Transporte same-origin `/api/...` (rewrite ciego en `next.config.ts`) | **reutilizado para forgot/reset**; login NO (necesita Route Handler para setear cookie — ver ADR-UC02-02) |

**La diferencia estructural respecto a UC01:** UC01 era stateless (registro público, sin token). UC02
introduce **sesión persistente**. Esto obliga a tres piezas nuevas que UC01 no tenía: una capa server-side
que custodie el token (Route Handler + cookie), un `middleware.ts` para proteger rutas, y un contexto/hook
de sesión client-side. Estas decisiones fijan el **precedente de auth de TODA la app** y se resuelven con
ADRs explícitos (§2).

---

## 1. Arquitectura de carpetas

```
client/
├─ middleware.ts                     # [NUEVO · BASE-auth] protección de rutas (REQ-07). Lee la cookie de
│                                    #   sesión; redirige a /login?next=… si falta en ruta protegida.
│                                    #   matcher excluye assets y rutas públicas.
│
├─ app/
│  ├─ api/
│  │  └─ auth/
│  │     ├─ login/route.ts           # [NUEVO · BASE-auth] Route Handler POST. Llama al backend
│  │     │                           #   POST /auth/login, y ante 200 setea la cookie httpOnly con el
│  │     │                           #   accessToken. Reenvía el status/body al cliente. (ADR-UC02-01/02)
│  │     └─ logout/route.ts          # [NUEVO · BASE-auth] Route Handler POST. Borra la cookie de sesión.
│  │                                 #   (No llama al backend: no hay blocklist, REQ-06.)
│  │
│  └─ (auth)/                        # route group existente (creado en UC01).
│     ├─ login/
│     │  └─ page.tsx                 # [NUEVO] Server Component. Shell card max-w-md, h1, links a /registro
│     │                              #   y /recuperar-contrasena. Lee searchParams.next (Promise). Renderiza
│     │                              #   <LoginForm/>. FEATURE.
│     ├─ recuperar-contrasena/
│     │  └─ page.tsx                 # [NUEVO] Server Component shell. Renderiza <ForgotPasswordForm/>. FEATURE.
│     └─ restablecer-contrasena/
│        └─ page.tsx                 # [NUEVO] Server Component shell. Lee searchParams.token (Promise),
│                                    #   lo pasa a <ResetPasswordForm token={…}/>. FEATURE.
│
├─ components/
│  ├─ cuentas/
│  │  ├─ login-form.tsx              # [NUEVO] 'use client'. CORAZÓN del feature: RHF+zod, submit a
│  │  │                             #   loginUser, mapeo 200/401/403/423/422/red, toggle password, banner.
│  │  ├─ forgot-password-form.tsx    # [NUEVO] 'use client'. email → requestPasswordReset → mensaje neutro.
│  │  └─ reset-password-form.tsx     # [NUEVO] 'use client'. newPassword+confirm → resetPassword(token);
│  │                                 #   maneja éxito (redirect /login) y token vencido (pantalla expirado).
│  └─ session/
│     └─ logout-button.tsx           # [NUEVO · BASE-auth] 'use client'. POST /api/auth/logout → limpia
│                                    #   sesión client + router.push a vista pública (REQ-06).
│
├─ lib/
│  ├─ api/
│  │  └─ auth.ts                     # [EXTENDIDO] + loginUser / requestPasswordReset / resetPassword
│  │                                 #   + tipos LoginResult / ForgotResult / ResetResult discriminados.
│  ├─ session/
│  │  ├─ cookie.ts                   # [NUEVO · BASE-auth] nombre/opciones de la cookie + helpers
│  │  │                             #   server-only (setSessionCookie/clearSessionCookie/readSessionToken).
│  │  ├─ jwt.ts                      # [NUEVO · BASE-auth] decodeJwtExp(token): lee claim `exp` SIN verificar
│  │  │                             #   firma (solo para saber si expiró client/edge-side, RN-AUTH-06).
│  │  └─ session-context.tsx         # [NUEVO · BASE-auth] 'use client'. SessionProvider + useSession()
│  │                                 #   (estado {status:'authenticated'|'anonymous', user?}). (ADR-UC02-03)
│  ├─ copy/
│  │  └─ es-AR.ts                    # [EXTENDIDO] + copy.login / copy.forgot / copy.reset / copy.session.
│  ├─ errors/
│  │  └─ field-errors.ts             # [EXTENDIDO] + mapLoginError(LoginResult) → banner es-AR
│  │                                 #   + mapResetValidation. Reusa mapValidationErrors para 422.
│  └─ validation/
│     ├─ login.ts                    # [NUEVO] schema zod login (email formato + password no-vacío).
│     └─ reset-password.ts           # [NUEVO] schema zod reset (newPassword ≥8 + confirm coincide).
│
└─ e2e/
   └─ login.spec.ts                  # [NUEVO] (placeholder ESC-UI-01..10). Tests los escribe el Verificador.
```

**Convención de capas (DESIGN-SYSTEM §10.1) respetada e idéntica a UC01:** tokens → `globals.css`;
primitivas → `components/ui/*`; compuestos/feature → `components/cuentas/*` y `components/session/*`;
lógica no-visual → `lib/*`; pantalla → `app/(auth)/*/page.tsx`; **borde de servidor → `app/api/auth/*`
y `middleware.ts`** (capa nueva exclusiva de auth).

**`page.tsx` son Server Components** (sin interactividad); leen `searchParams` (Promise en Next 16) y
delegan la interacción a Client Components aislados — mismo patrón que `registro/page.tsx`.

---

## 2. Decisiones arquitectónicas (ADRs)

### ADR-UC02-01 — Token storage + protección de rutas: **httpOnly cookie + middleware** [CENTRAL]

Esta es la decisión más importante del diseño: fija el **precedente de auth de TODA la app**.

- **Decisión:** el `accessToken` que el backend devuelve en el body de `POST /auth/login` se guarda en una
  **cookie httpOnly** seteada **server-side** por un Route Handler propio (`app/api/auth/login/route.ts`).
  El token NUNCA toca JavaScript del navegador. Las rutas protegidas se custodian con `middleware.ts` de
  Next, que lee la cookie en el edge antes de renderizar.
- **Por qué (seguridad sin sobre-ingeniería):**
  - **XSS-safe:** una cookie `httpOnly` no es legible por `document.cookie` ni por `localStorage`. Si un
    script malicioso se cuela, NO puede exfiltrar el token. Es la diferencia de seguridad concreta frente
    a la opción (B). Para un marketplace con datos de usuario, este es el baseline esperable.
  - **SSR-friendly / sin flash:** el `middleware` decide en el servidor antes de pintar; no hay "flash de
    contenido protegido" ni guard client-side que parpadee (problema endémico de la opción B).
  - **Cero esfuerzo de transporte en requests protegidos:** la cookie viaja **automáticamente** en cada
    request same-origin a `/api/*` (que el rewrite reenvía al backend). No hay que adjuntar
    `Authorization` a mano en cada fetch.
- **Tradeoffs aceptados y cómo se mitigan:**
  - **Necesita una capa server-side propia.** El proxy actual (`next.config.ts` rewrite) es *ciego*: no
    puede setear cookies. Por eso login pasa por un Route Handler real (ADR-UC02-02). Costo: 2 archivos
    nuevos (`login/route.ts`, `logout/route.ts`). Aceptable y acotado.
  - **CSRF.** Una cookie que se envía automáticamente es vulnerable a CSRF. **Mitigación:** la cookie se
    setea con **`sameSite: 'lax'`** (bloquea envío en POST cross-site, permite navegación top-level GET) +
    `secure` (solo HTTPS en prod) + `httpOnly` + `path:'/'`. Para un TPI same-origin, `sameSite:lax` es la
    mitigación CSRF estándar y suficiente; no se agrega doble-submit token (sobre-ingeniería para el alcance).
  - **El backend NO setea la cookie** (devuelve `{accessToken}` en el body). Por eso es el Route Handler de
    Next quien la traduce body→cookie. El backend permanece stateless y agnóstico de cookies (consistente
    con que NO tiene CORS ni prefix — §next.config).
  - **Sin refresh token, invalidación solo por `exp` (RN-AUTH-06).** La cookie usa `maxAge` ≈ al `exp` del
    JWT (leído con `decodeJwtExp`, `lib/session/jwt.ts`). El `middleware` también chequea `exp` y trata un
    token expirado como sesión ausente (REQ-05). No hay blocklist server-side; logout solo borra la cookie.
- **Recomendación fundada:** **opción (A)**. Es la opción más segura *viable* para este TPI: el costo extra
  (un Route Handler + un middleware) es marginal y se amortiza en TODA la app, mientras que la opción (B)
  dejaría el token expuesto a XSS — un agujero que no querríamos sentar como precedente en un marketplace.
- **Alternativa rechazada — (B) localStorage/memory + `Authorization` header + guard client-side:**
  rechazada por (1) token legible por JS → riesgo XSS directo; (2) sin SSR → flash de contenido protegido y
  parpadeo en cada navegación protegida; (3) obliga a adjuntar `Authorization` manualmente en cada request;
  (4) `memory`-only pierde la sesión en cada recarda (violaría REQ-05 sin re-login). El único "beneficio"
  (simplicidad) no compensa el costo de seguridad como precedente de app entera.

> **Impacto observable resumido (lo que el gate humano debe entender):**
> el token vive en una cookie httpOnly seteada por Next; viaja solo al backend vía el proxy same-origin;
> las rutas se protegen en el edge con `middleware.ts`; logout borra la cookie (sin llamada al backend);
> en SSR el middleware ya conoce la sesión, así que no hay flash. CSRF mitigado con `sameSite:lax`+`secure`.

### ADR-UC02-02 — Setear la cookie: **Route Handler dedicado** (no extender el rewrite ciego)

- **Decisión:** login y logout NO pasan por el rewrite `/api/:path*` de `next.config.ts`. Se crean Route
  Handlers reales en `app/api/auth/login/route.ts` y `app/api/auth/logout/route.ts`. **Forgot/reset SÍ
  siguen usando el rewrite ciego** (son stateless, no setean cookie — igual que registro en UC01).
- **Por qué:** el rewrite de Next es un proxy *transparente*: reenvía la respuesta del backend tal cual y
  **no puede ejecutar `cookies().set()`**. Para traducir el `{accessToken}` del body a una cookie httpOnly
  hace falta código server-side propio. Un Route Handler en App Router puede llamar al backend (server→server,
  sin CORS), leer el body y usar `cookies()` de `next/headers` (async en Next 16) para setear/borrar la cookie.
- **Resolución de colisión de ruta (CRÍTICO para el implementador):** existe un rewrite `source:"/api/:path*"`
  y, a la vez, queremos un Route Handler en `/api/auth/login`. **En Next, un Route Handler de archivo gana
  sobre un rewrite para esa ruta exacta** (los rewrites se aplican a rutas que no resuelven a un handler/página).
  Por lo tanto: `/api/auth/login` y `/api/auth/logout` resuelven al handler; `/api/auth/forgot-password`,
  `/api/auth/reset-password`, `/api/auth/register` y el resto siguen cayendo al rewrite → backend.
  **No hay que tocar `next.config.ts`.**
- **Contrato del Route Handler de login:** recibe `{email,password}` del client form; hace
  `fetch(BACKEND_URL + '/auth/login')` server-side; si 200 → `cookies().set(SESSION_COOKIE, accessToken, opts)`
  y responde `200 {ok:true}` (NO reenvía el token al cliente); si 401/403/423/422 → reenvía status + body tal
  cual para que el client los mapee a UX; si red/5xx → 502/`{kind:'server'}`. El token jamás llega al bundle.
- **Alternativa rechazada — Server Action:** funcionalmente válida (también puede setear cookies), pero el
  precedente del proyecto (UC01 ADR-UC01-03) es **`fetch` desde el cliente a un endpoint `/api/...`**, y el
  Verificador ya razona en términos de mockear `fetch`. Un Route Handler conserva ese modelo mental (el form
  hace `fetch('/api/auth/login')`), es trivialmente testeable con Playwright (interceptar la ruta) y mantiene
  la API uniforme. Server Actions atarían el form a un binding RSC más difícil de mockear en unit/E2E.

### ADR-UC02-03 — Estructura de sesión client: **SessionContext + useSession()** hidratado server-side

- **Decisión:** un `SessionProvider` (`lib/session/session-context.tsx`, `'use client'`) expone
  `useSession()` con `{status:'authenticated'|'anonymous', user?: {email,role}}`. El **estado inicial se
  hidrata desde el servidor** (el `layout` lee la cookie/`exp` y pasa el estado inicial como prop), de modo
  que el primer render ya conoce si hay sesión (sin flash, coherente con ADR-UC02-01).
- **Por qué:** componentes de navegación (mostrar/ocultar "Cerrar sesión", saludo, links según rol) necesitan
  saber el estado de sesión SIN poder leer el token (que es httpOnly). El contexto guarda solo *metadata no
  sensible* (status + claims públicos como email/role decodificados del JWT, NO el token). Es el lugar único
  de verdad de sesión en el árbol React, evitando prop-drilling y refetch.
- **De dónde sale `user`:** del payload del JWT decodificado **sin verificar firma** (`decodeJwtExp` extiende
  a `decodeJwtClaims`) — solo para UI. La verificación real la hace el backend en cada request protegido.
  Nunca se confía en estos claims para autorización client-side (eso es decorativo; el backend es la verdad).
- **Logout:** `useSession().clear()` + POST `/api/auth/logout` (borra cookie) + `router.push('/login')` +
  `router.refresh()` (re-hidrata server-side a anonymous). REQ-06.
- **Alternativa rechazada — leer sesión ad-hoc en cada componente:** duplicaría lógica de decode/exp y
  produciría estados inconsistentes. Un contexto único es el patrón estándar y testeable.

### ADR-UC02-04 — `loginUser` y forms de recuperación: **espejo del patrón `RegisterResult`**

- **Decisión:** `loginUser`, `requestPasswordReset` y `resetPassword` devuelven **resultados discriminados**
  `{ok:true,...} | {ok:false, kind:...}`, **nunca lanzan** para 4xx de negocio (idéntico contrato a
  `registerUser`, UC01 §3 / OCL Q6). `loginUser` hace `fetch('/api/auth/login')` (al Route Handler, no al
  backend directo); forgot/reset hacen `fetch('/api/auth/forgot-password' | '/api/auth/reset-password')` (rewrite).
- **Por qué:** consistencia total con el precedente. El form mapea el `kind` a UX de forma pura y testeable;
  el Verificador reusa el mismo modelo mental (mockear `fetch`, assert `kind`). Solo `kind:'network'` ante
  fallo de transporte.
- **Alternativa rechazada:** throw + try/catch en el form. Rechazada por inconsistencia con UC01 y peor
  testabilidad (UC01 ADR explícito).

---

## 3. HTTP client — firmas y tipos (mirror EXACTO del contrato)

`lib/api/auth.ts` se **extiende** (no se reescribe). Transporte:
- `loginUser` → `POST /api/auth/login` (**Route Handler** de Next; éste habla con el backend y setea cookie).
- `requestPasswordReset` / `resetPassword` → `/api/auth/forgot-password` | `/api/auth/reset-password`
  (**rewrite ciego** → backend; stateless, sin cookie).

```ts
// lib/api/auth.ts  (firmas ilustrativas, NO implementación)

// ── Login ───────────────────────────────────────────────────────────────────
interface LoginPayload { email: string; password: string; }

// El Route Handler responde 200 {ok:true} SIN token (la cookie ya quedó seteada).
interface LoginSuccess { ok: true; }

// Resultado discriminado consumido por <LoginForm/>. Nunca lanza para 4xx.
type LoginResult =
  | { ok: true }                                                  // 200 (cookie seteada por el handler)
  | { ok: false; kind: 'invalid_credentials' }                   // 401
  | { ok: false; kind: 'suspended' }                             // 403
  | { ok: false; kind: 'locked' }                                // 423
  | { ok: false; kind: 'validation'; raw: BackendValidationError } // 422 (reusa el tipo de UC01)
  | { ok: false; kind: 'network' }                               // transporte falló
  | { ok: false; kind: 'server'; status: number };               // 5xx u otro inesperado

declare function loginUser(payload: LoginPayload): Promise<LoginResult>;

// ── Forgot password (siempre 200, anti-enumeración) ──────────────────────────
interface ForgotPayload { email: string; }
type ForgotResult =
  | { ok: true }                                  // 200 SIEMPRE (no revela existencia)
  | { ok: false; kind: 'network' }
  | { ok: false; kind: 'server'; status: number };

declare function requestPasswordReset(payload: ForgotPayload): Promise<ForgotResult>;

// ── Reset password (con token) ───────────────────────────────────────────────
interface ResetPayload { token: string; newPassword: string; } // newPassword min 8
type ResetResult =
  | { ok: true }                                                   // 200
  | { ok: false; kind: 'invalid_token' }                           // 4xx token vencido/usado
  | { ok: false; kind: 'validation'; raw: BackendValidationError } // 422 (pass corta server-side)
  | { ok: false; kind: 'network' }
  | { ok: false; kind: 'server'; status: number };

declare function resetPassword(payload: ResetPayload): Promise<ResetResult>;
```

Notas de mapeo de status (idéntica filosofía a `registerUser`):
- `loginUser`: 200→`{ok:true}` · 401→`invalid_credentials` · 403→`suspended` · 423→`locked` ·
  422→`validation` · 5xx/otro→`server` · throw de transporte→`network`.
- `requestPasswordReset`: **cualquier 2xx → `{ok:true}`**; el form muestra SIEMPRE el mensaje neutro (REQ-09,
  anti-enum). Solo red/5xx degradan a `network`/`server` (banner REQ-10).
- `resetPassword`: 200→`{ok:true}` · 400/404/410 (token vencido/usado)→`invalid_token` · 422→`validation`
  (pass <8 server-side) · resto igual.

`safeJson` (helper existente en `auth.ts`) se reutiliza.

---

## 4. Error-mapping design

`lib/errors/field-errors.ts` se **extiende**. El 401/403/423 de login NO son inline por campo: van a un
**banner global `role="alert"`** sobre el form (spec REQ-03). El 422 reusa `mapValidationErrors` de UC01.

```ts
// Mapea un LoginResult de error al mensaje de banner es-AR. null si el error va inline (422).
function mapLoginError(result: Extract<LoginResult, { ok: false }>): string | null;
//   'invalid_credentials' → copy.login.errors.invalidCredentials   (401, GENÉRICO, anti-enum)
//   'suspended'           → copy.login.errors.suspended            (403, con canal soporte)
//   'locked'              → copy.login.errors.locked               (423, + deshabilitar submit)
//   'network'             → copy.globalErrors.network              (reusa catálogo UC01)
//   'server'              → copy.globalErrors.server
//   'validation'          → null  (va inline vía mapValidationErrors)

// Reset: pass corta (422) → inline en newPassword; confirm-mismatch es 100% client (zod).
function mapResetValidation(body: BackendValidationError): { newPassword?: string; global?: string };
```

**Anti-enumeración (RNF-S.4, RN-AUTH-02) — invariante de diseño:** el mensaje de 401 es exactamente
`"E-mail o contraseña incorrectos."` y NUNCA distingue qué campo falló. No se mapea 401 a ningún campo
inline (eso filtraría señal). El form, ante `invalid_credentials`, además **limpia el campo password y
conserva el email** (spec REQ-03 / ESC-UI-02).

Todos los textos viven en `lib/copy/es-AR.ts` (sección nueva `copy.login` / `copy.forgot` / `copy.reset`),
`field-errors.ts` los importa.

---

## 5. State & validation

### 5.1 Login form (`login-form.tsx`)

```ts
interface LoginFormValues { email: string; password: string; }
// Estado UI extra (fuera de RHF): showPassword:boolean, globalError:string|null,
//   lockedOut:boolean (true tras 423 → submit permanece deshabilitado, REQ-03/ESC-UI-03),
//   submitting (RHF formState.isSubmitting).
```

Reglas zod (`lib/validation/login.ts`) — **deliberadamente laxas** (login NO valida longitud de password):

| Campo | Regla cliente | Mensaje (catálogo) |
|---|---|---|
| `email` | no vacío + regex con `@` (mismo regex que registro) | email |
| `password` | **solo no vacío** (NO min 8 — un pass viejo podría ser más corto, spec REQ-01) | requerido |

- **Trigger:** RHF `mode:'onBlur'` + revalidación presubmit (idéntico a registro). Foco al primer campo
  inválido en submit.
- **Flujo submit:** limpia `globalError` → `loginUser({email,password})`:
  - `ok:true` → `useSession().refresh()` (re-hidrata) → leer `next` de searchParams → `router.push(next ?? destinoPorRol)` → `router.refresh()`. Form bloqueado (`submitted`), sin reenvío (REQ-02/REQ-08).
  - `invalid_credentials` → `setGlobalError(mapLoginError)` + `setValue('password','')` + conservar email + foco al banner (`alertRef.focus()`, patrón UC01). Botón vuelve a default.
  - `suspended` → banner con canal soporte. Sin bloqueo de submit (reintento inútil pero permitido).
  - `locked` → banner + `setLockedOut(true)` → botón `disabled` permanente (sin reintento inmediato, REQ-03).
  - `validation` (422) → `mapValidationErrors` → `setError` por campo (email/password) + banner para no-mapeables.
  - `network`/`server` → banner genérico (REQ-10), conserva ambos campos, permite reintento.
- **Anti-doble-submit (REQ-08):** `locked = isSubmitting || submitted || lockedOut` deshabilita campos +
  botón `loading` (`aria-busy`, ancho estable) — mismo patrón que `registro-form`.
- **Destino post-login por rol (Supuesto S2):** `cliente`→`/`, `prestador`→`/`, `administrador`→`/` por
  ahora (dashboards aún no existen). Si `searchParams.next` está presente y es una ruta interna segura
  (empieza con `/`, no `//`), gana sobre el default (REQ-02/ESC-UI-07).

### 5.2 Forgot password form (`forgot-password-form.tsx`)

```ts
interface ForgotFormValues { email: string; }
// Estado UI: sent:boolean (tras éxito muestra mensaje neutro y oculta el form).
```
- zod: email no-vacío + formato. Submit → `requestPasswordReset` → ante `ok:true` (siempre, salvo red/5xx):
  `setSent(true)` y render del **mensaje neutro** `role="status"` (REQ-09/ESC-UI-08), sin confirmar existencia.
  `network`/`server` → banner REQ-10 + permitir reintento.

### 5.3 Reset password form (`reset-password-form.tsx`)

```ts
interface ResetFormValues { newPassword: string; confirmPassword: string; }
// Props: { token: string | undefined }  (viene de searchParams en page.tsx)
// Estado UI: showPassword, expired:boolean (token inválido → pantalla "Enlace expirado").
```
Reglas zod (`lib/validation/reset-password.ts`):

| Campo | Regla cliente | Mensaje |
|---|---|---|
| `newPassword` | ≥8, ≤128 | reset.passwordShort |
| `confirmPassword` | **debe coincidir** con `newPassword` (zod `superRefine`/`refine`, path `confirmPassword`) | reset.mismatch |

- Si `token` ausente/vacío en la URL → render directo de pantalla "Enlace expirado" (no se muestra el form).
- Submit → `resetPassword({token, newPassword})`:
  - `ok:true` → mensaje éxito `role="status"` (`copy.reset.success`) → `router.push('/login')` (ESC-UI-09).
  - `invalid_token` → `setExpired(true)` → pantalla "Enlace expirado" + CTA "Pedir un nuevo enlace" → `/recuperar-contrasena` (ESC-UI-09, UC02 ESC-07).
  - `validation` → inline en `newPassword`. `network`/`server` → banner REQ-10.
- Toggle mostrar/ocultar en ambos campos (mismo patrón ojo de registro, `aria-pressed`/`aria-label`).

---

## 6. Sesión, cookie y middleware (detalle de la capa nueva)

### 6.1 `lib/session/cookie.ts` (server-only)

```ts
export const SESSION_COOKIE = 'so_session';   // nombre estable; prefijo del proyecto.
export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',  // dev sobre http permite local
  sameSite: 'lax' as const,                        // mitigación CSRF (ADR-UC02-01)
  path: '/',
  // maxAge derivado del exp del JWT (decodeJwtExp); fallback conservador si no hay exp.
};
// Helpers server-only (usan cookies() de next/headers, async en Next 16):
//   setSessionCookie(token), clearSessionCookie(), readSessionToken(): string | undefined
```

### 6.2 `lib/session/jwt.ts`

```ts
// Decodifica el payload base64url del JWT SIN verificar firma (la firma la valida el backend).
// Solo para conocer exp (edge/SSR) y claims públicos de UI (email, role). NUNCA para autorizar.
function decodeJwtClaims(token: string): { exp?: number; email?: string; role?: string } | null;
function isExpired(token: string, nowSeconds?: number): boolean;  // exp <= now  (RN-AUTH-06)
```

### 6.3 `middleware.ts` (protección de rutas, REQ-07)

```ts
// Edge middleware. Lee SESSION_COOKIE del request. Lógica:
//  - Ruta pública (login, registro, recuperar/restablecer-contrasena, búsqueda pública UC04, assets) → next()
//  - Ruta protegida sin cookie  → redirect 307 a /login?next=<pathname original>
//  - Ruta protegida con cookie pero isExpired(token) → tratar como anónimo → mismo redirect (REQ-05)
//  - Ruta protegida con cookie válida → next()
export const config = { matcher: [ /* excluir _next, assets, /api, públicas */ ] };
```

- **`next` param:** se preserva el pathname original para que `<LoginForm/>` redirija ahí tras 200
  (ESC-UI-07). Se valida que sea ruta interna (`/` y no `//`) para evitar open-redirect.
- **Por qué exp en el edge:** evita renderizar SSR de una ruta protegida con token vencido (REQ-05). La
  verificación de firma sigue siendo del backend en cada request a `/api/*`.
- **Rutas protegidas iniciales:** como aún no hay dashboards por rol, el matcher protege un conjunto mínimo
  (placeholder, p.ej. `/cuenta/*`) y deja todo lo público accesible. Se amplía cuando lleguen UC07/UC08
  (Supuesto S3).

---

## 7. Accesibilidad checklist (mapeado a componentes)

| Requisito (spec REQ-11 / §8) | Dónde se realiza |
|---|---|
| `<label>` visible + `aria-required` por campo | `components/ui/field.tsx` (reusado) en login/forgot/reset |
| `aria-invalid` + `aria-describedby` → id del error | `field.tsx`: 422 inline en email/password/newPassword |
| Banner credenciales/estado `role="alert"` (assertive) + foco al banner | `login-form.tsx`: `Alert` + `alertRef.focus()` en `useEffect` (patrón UC01) |
| Feedback de éxito `role="status"` (polite) | mensaje neutro forgot + éxito reset + (opcional) toast login |
| `focus-visible` ring 2px + offset 2px | global `globals.css` (base UC01) + primitivas shadcn |
| Orden de tabulación lógico (DOM=visual) | orden email→password→toggle→submit en `login-form` |
| Targets táctiles ≥44px | `ui/button.tsx` size `lg`; botón toggle ojo `w-11` (≥44px, igual que registro) |
| Inputs `font-size ≥16px` | base layer `globals.css` + `ui/input.tsx` |
| Toggle password operable por teclado, `aria-pressed`/`aria-label` | mismo patrón Eye/EyeOff de `registro-form` |
| `aria-busy` durante submit | `ui/button.tsx loading` + contenedor del form |
| `lang="es-AR"` | `<html>` en `layout.tsx` (base UC01) |
| Contraste AA claro/oscuro | tokens §2.5 (no introducir colores fuera de `@theme`) |

---

## 8. Mapeo Escenario → implementación

| Escenario (spec) | Componente / función | Cómo se testea (insumo Verificador) |
|---|---|---|
| **ESC-UI-01** login 200 → sesión + redirect | `login-form` submit → `loginUser` `{ok:true}` → `useSession().refresh()` + `router.push(next ?? '/')` + form bloqueado; cookie seteada por `login/route.ts` | **Unit:** `loginUser` mapea 200→`{ok:true}`. **E2E:** mock route `/api/auth/login`→200+Set-Cookie; assert redirect, sesión persiste tras reload (cookie httpOnly presente), form bloqueado |
| **ESC-UI-02** 401 banner genérico | `loginUser`→`invalid_credentials` → `mapLoginError` banner + limpia password + conserva email | **Unit:** `mapLoginError({kind:'invalid_credentials'})` = mensaje genérico; assert NO menciona campo. **E2E:** mock 401, assert banner `role=alert`, email intacto, password vacío, botón vuelve a default |
| **ESC-UI-03** 423 bloqueo temporal | `loginUser`→`locked` → banner + `setLockedOut(true)` → submit `disabled` | **Unit:** `mapLoginError({kind:'locked'})`. **E2E:** mock 423, assert banner 30-min, submit deshabilitado, sin sesión |
| **ESC-UI-04** 403 suspendida | `loginUser`→`suspended` → banner con canal soporte | **Unit:** `mapLoginError({kind:'suspended'})` incluye soporte@. **E2E:** mock 403, assert banner + sin sesión |
| **ESC-UI-05** validación cliente + 422 inline | zod `login.ts` (onBlur) + `mapValidationErrors` + `setError` por campo | **Unit zod:** email sin `@` y password vacío → issues; password corto NO bloquea (no hay min). **E2E:** blur email inválido → ErrorText + `aria-invalid`; submit bloqueado sin request; mock 422 → inline por campo, valores conservados |
| **ESC-UI-06** sesión persiste + logout limpia | cookie httpOnly (persistencia) + `logout-button`→POST `/api/auth/logout` (borra cookie) + `router.push` público | **E2E:** login→reload (sigue auth)→logout→cookie borrada→navegar a ruta protegida redirige a /login |
| **ESC-UI-07** ruta protegida sin sesión → /login + retorno | `middleware.ts` redirect a `/login?next=…` + `login-form` honra `next` | **E2E:** sin cookie, GET ruta protegida → 307 a `/login?next=/cuenta`; login OK → redirige a `/cuenta`. **Unit:** validador de `next` rechaza `//evil` |
| **ESC-UI-08** forgot mensaje neutro | `forgot-password-form` → `requestPasswordReset` `{ok:true}` (siempre) → mensaje neutro `role=status` | **Unit:** `requestPasswordReset` mapea cualquier 200→`{ok:true}`. **E2E:** submit (email exista o no) → mismo mensaje neutro, sin confirmar existencia |
| **ESC-UI-09** reset con token / token vencido | `reset-password-form` → `resetPassword` `{ok:true}`→redirect /login; `invalid_token`→pantalla expirado + CTA | **Unit:** zod confirm-mismatch→issue; `resetPassword` mapea 410→`invalid_token`. **E2E:** token válido→éxito+redirect; token vencido→pantalla "Enlace expirado"+CTA a /recuperar-contrasena |
| **ESC-UI-10** error de red / 5xx | `mapLoginError`/`mapGlobalError`→banner `role=alert`; conserva datos | **Unit:** `kind:'network'`/`'server'` → mensaje no técnico. **E2E:** abortar request → banner, datos conservados, reintento posible, sin trazas |

---

## 9. Pre/postcondiciones OCL-style (→ aserciones de test)

### `loginUser(payload: LoginPayload): Promise<LoginResult>`

```
context loginUser(payload)
  pre  P1: payload.email is non-empty string
  pre  P2: payload.password is non-empty string
  post Q1: HTTP 200 implies result = {ok:true}  AND  el token NO está en result (vive en cookie httpOnly)
  post Q2: HTTP 401 implies result.kind = 'invalid_credentials'
  post Q3: HTTP 403 implies result.kind = 'suspended'
  post Q4: HTTP 423 implies result.kind = 'locked'
  post Q5: HTTP 422 implies result.kind = 'validation' and result.raw.message is string[]
  post Q6: la función NUNCA lanza por 4xx; solo 'network' ante fallo de transporte
  post Q7: ningún kind de error revela qué campo de credencial falló (anti-enum, RNF-S.4)
```

### `mapLoginError(result): string | null`

```
context mapLoginError(result)
  post Q1: 'invalid_credentials' ⇒ mensaje GENÉRICO es-AR, NO menciona 'email' ni 'contraseña' por separado
  post Q2: 'suspended' ⇒ mensaje incluye canal de contacto (soporte@…)
  post Q3: 'locked' ⇒ mensaje indica espera (~30 min)
  post Q4: 'validation' ⇒ null (se maneja inline)
  post Q5: 'network'|'server' ⇒ mensaje no técnico, sin trazas
```

### `requestPasswordReset(payload): Promise<ForgotResult>`

```
context requestPasswordReset(payload)
  post Q1: cualquier HTTP 2xx ⇒ result = {ok:true}  (anti-enum: idéntico sea cual sea el email)
  post Q2: result NUNCA distingue si el email existe o no (RN-AUTH-05, RNF-S.4)
  post Q3: solo fallo de transporte ⇒ 'network'; 5xx ⇒ 'server'
```

### `resetPassword(payload): Promise<ResetResult>`

```
context resetPassword(payload)
  pre  P1: payload.token is non-empty string
  pre  P2: payload.newPassword.length >= 8
  post Q1: HTTP 200 ⇒ result = {ok:true}
  post Q2: token vencido/usado (4xx) ⇒ result.kind = 'invalid_token'
  post Q3: HTTP 422 ⇒ result.kind = 'validation'
  post Q4: nunca lanza por 4xx
```

### `middleware` (protección de rutas)

```
context middleware(request)
  post Q1: ruta pública ⇒ next() (nunca redirige)
  post Q2: ruta protegida sin cookie válida (ausente o exp) ⇒ redirect 307 a /login?next=<pathname>
  post Q3: el valor de `next` es siempre una ruta interna ('/'+…, nunca '//' ni absoluta) — sin open-redirect
  post Q4: ruta protegida con cookie no expirada ⇒ next()
```

---

## 10. Plan de testing (alineado con UC01)

**Unit (vitest, `test:unit`)** — funciones puras nuevas, sin DOM:
- `lib/api/auth.ts`: `loginUser`/`requestPasswordReset`/`resetPassword` — mockear `fetch`, assert el `kind`
  por cada status (OCL §9). Verificar que `loginUser` NO expone token en el resultado (Q1).
- `lib/errors/field-errors.ts`: `mapLoginError` (todos los kinds, **incl. assert anti-enum Q7/Q1**),
  `mapResetValidation`.
- `lib/validation/login.ts`: email inválido bloquea, password vacío bloquea, password corto **NO** bloquea.
- `lib/validation/reset-password.ts`: <8 bloquea, confirm-mismatch bloquea.
- `lib/session/jwt.ts`: `decodeJwtClaims`/`isExpired` (token vencido vs vigente, token malformado→null).
- helper de validación de `next` (open-redirect): rechaza `//evil`, `http://`, acepta `/cuenta`.

**E2E (Playwright, `test:e2e`)** — uno por escenario ESC-UI-01..10 (ver §8), interceptando rutas
(`page.route('**/api/auth/login', …)`) para forzar cada status; assert de cookie httpOnly presente/borrada
para persistencia y logout; assert de redirect con `next` para ruta protegida.

El Verificador escribe los tests; este diseño le entrega firmas, OCL y mapeo escenario→aserción como contrato.

---

## 11. Supuestos (para el HITL gate)

| ID | Supuesto | Riesgo si falla | Default tomado |
|---|---|---|---|
| **S1** | Un Route Handler en `/api/auth/login` **gana** sobre el rewrite `/api/:path*` para esa ruta exacta (comportamiento de Next App Router). | Si el rewrite interceptara primero, el handler nunca correría y no se setearía la cookie. | Asumido por la semántica de Next (handlers/páginas tienen prioridad sobre rewrites). **Verificar en implementación** con un test de humo de la ruta. |
| **S2** | No hay dashboards por rol todavía → destino post-login = `/` (home) para todos los roles; `searchParams.next` gana si presente y seguro. | Redirect a ruta inexistente | Redirect a `/`; honrar `next` validado. Ampliar por rol cuando existan UC07/UC08. |
| **S3** | El conjunto de rutas protegidas inicial es mínimo (placeholder, p.ej. `/cuenta/*`); el resto es público (login, registro, recuperación, búsqueda UC04). | Proteger de más rompe navegación pública; de menos expone rutas | Matcher conservador con allowlist pública explícita. Confirmar rutas reales en HITL. |
| **S4** | El backend NO setea cookie (devuelve `{accessToken}` en body); el Route Handler de Next la traduce a httpOnly. | Si el backend ya seteara cookie, habría doble fuente | Confirmado por contrato (UC02 backend devuelve token en body). Handler es la única fuente de cookie. |
| **S5** | `sameSite:'lax'` + `secure`(prod) + `httpOnly` es mitigación CSRF suficiente para el alcance (same-origin, sin double-submit token). | CSRF si el alcance creciera a cross-site | Aceptado para TPI same-origin. Reevaluar si se agregan integraciones cross-site. |
| **S6** | `requestPasswordReset` trata **cualquier 2xx** como `{ok:true}` y SIEMPRE muestra el mensaje neutro (el backend ya garantiza 200 anti-enum). | Si el backend devolviera 4xx distinto por email inexistente, filtraría enumeración | Mapeo a `{ok:true}` en 2xx; el front nunca distingue. Confirmado por contrato (forgot → 200 siempre). |

---

*Fin del diseño UC02-UI-Login. Próxima fase: `sdd-tasks` (descomposición en pasos de implementación), una vez
aprobado este diseño en el HITL gate. La decisión central (httpOnly cookie + middleware) sienta el precedente
de autenticación de toda la app.*
