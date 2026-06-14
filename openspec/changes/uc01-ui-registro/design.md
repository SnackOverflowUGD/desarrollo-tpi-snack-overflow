# Design — MI-01.3 UI Registro (UC01)

> **Fase:** Diseño (SDD 1.2). Deriva del `spec.md` aprobado y del `client/DESIGN-SYSTEM.md` (fuente
> única de diseño). Define el CÓMO arquitectónico. NO contiene código de producción: solo firmas,
> tipos y estructura prescriptiva para que el agente de Implementación no tenga ambigüedad.
>
> **Stack verificado:** Next.js 16.2.9 (App Router) · React 19.2.4 · Tailwind v4 (`@tailwindcss/postcss`,
> CSS-native `@theme { }`) · TS strict · alias `@/*` → `client/` · `output: "standalone"` · ESLint flat.
> Breaking Next 16: `params`/`searchParams` son **Promises**; Server Components por defecto, `'use client'`
> para estado/handlers/effects; Tailwind v4 sin `tailwind.config.js`.
>
> **Trazabilidad:** UC01 · RF-1.1 · RF-1.3 · RNF-A.1/A.2/A.3 · spec REQ-01..REQ-12 · ESC-UI-01..06.

---

## 1. Arquitectura de carpetas

Esta es la **primera Work Item de UI** del proyecto: además del feature de registro, establece la
**base compartida** del cliente (tokens, fuentes, theme, primitivas, librerías de soporte). Toda WI de
UI posterior reutiliza esta base. El árbol distingue ambos alcances.

```
client/
├─ app/
│  ├─ globals.css                  # [REEMPLAZA scaffold] tokens @theme §2.6 + .dark + base + a11y. BASE.
│  ├─ layout.tsx                   # [REEMPLAZA scaffold] fuentes next/font, ThemeProvider, lang="es-AR",
│  │                               #   skip-link, landmarks. BASE.
│  └─ (auth)/                      # route group sin segmento de URL: agrupa pantallas de cuenta.
│     └─ registro/
│        └─ page.tsx               # Server Component. Shell: card max-w-md centrada, h1, link a login,
│                                  #   caption términos. Renderiza <RegistroForm/>. FEATURE.
│
├─ components/
│  ├─ theme-provider.tsx           # 'use client'. Wrapper de next-themes (attribute="class",
│  │                               #   defaultTheme="system", enableSystem). BASE.
│  ├─ ui/                          # Primitivas shadcn re-themed con tokens. BASE (subset para esta WI).
│  │  ├─ button.tsx                #   variantes primary|outline|ghost|link + sizes sm/md/lg, loading.
│  │  ├─ input.tsx                 #   input base (font-size ≥16px), estados focus/error/disabled.
│  │  ├─ label.tsx                 #   label con asterisco condicional + aria-required.
│  │  ├─ select.tsx                #   select accesible (Radix) para el catálogo de oficios.
│  │  ├─ field.tsx                 #   compuesto: Label → control → HelpText|ErrorText (anatomía §5.2).
│  │  ├─ alert.tsx                 #   banner inline (variant warning|error|info) con ícono. role según uso.
│  │  ├─ toast.tsx + toaster.tsx   #   sistema de toasts (role=status|alert). BASE.
│  │  └─ password-strength.tsx     #   medidor de fuerza (barra/nivel). Usa solo tokens. FEATURE-near-base.
│  └─ cuentas/                     # feature por dominio "cuentas".
│     ├─ registro-form.tsx         # 'use client'. CORAZÓN del feature: estado, validación, submit,
│     │                            #   render de campos, role selector, trade condicional, aviso regulado,
│     │                            #   mapeo de errores a UI. FEATURE.
│     └─ role-selector.tsx         # 'use client'. Selector segmentado Cliente/Prestador (rad group ARIA). FEATURE.
│
├─ lib/
│  ├─ http.ts                      # fetch base tipado + resolución de API base URL. BASE.
│  ├─ api/
│  │  └─ auth.ts                   # registerUser(payload) + tipos request/response/error del contrato. FEATURE→BASE.
│  ├─ copy/
│  │  └─ es-AR.ts                  # catálogo centralizado de strings UI (labels, helptexts, mensajes,
│  │                               #   éxito). NINGÚN string hardcodeado fuera de acá. BASE.
│  ├─ errors/
│  │  └─ field-errors.ts           # mapValidationErrors(422) + map409 + mapGlobalError. es-AR catalog. BASE.
│  ├─ validation/
│  │  └─ registro.ts               # reglas zod del formulario (mirror del backend). FEATURE.
│  └─ trades.ts                    # catálogo estático de oficios + flag `regulated`. FEATURE (ver Supuesto S2).
│
└─ e2e/                            # Playwright (test:e2e ya en package.json). Tests los escribe Verificador.
   └─ registro.spec.ts             # (placeholder de referencia para ESC-UI-01..06).
```

**Convención de capas (DESIGN-SYSTEM §10.1) respetada:** tokens → `globals.css`; primitivas →
`components/ui/*`; compuestos/feature → `components/cuentas/*`; lógica no-visual → `lib/*`; pantalla →
`app/(auth)/registro/page.tsx`.

**`page.tsx` es Server Component** (sin interactividad). El formulario es Client Component aislado: así
el shell, el SEO de metadata y la estructura quedan en el servidor y solo el árbol interactivo paga
hidratación.

---

## 2. Decisión: shadcn vs hand-rolled · rhf+zod vs controlled

### ADR-UC01-01 — Primitivas: **shadcn/ui** (no hand-rolled)

- **Decisión:** instalar primitivas shadcn (`button`, `input`, `label`, `select`, `alert`, `toast`/sonner)
  vía CLI, re-themed con los tokens de `@theme`.
- **Por qué:** el DESIGN-SYSTEM lo manda explícitamente (§5 nota, §10.1, §10.3: "No reimplementar
  primitivas"). shadcn trae a11y de Radix (focus-trap, roving tabindex en select, `aria-*`) que cumplir
  a mano sería costoso y frágil para REQ-10. Es la **primera WI**: fija el precedente de toda la app.
- **Alternativa rechazada:** hand-rolled. Rechazada por costo de a11y (combobox/select navegable por
  teclado, REQ-10) y por contradecir el baseline vinculante.
- **Matiz:** shadcn no es una dependencia npm sino código copiado a `components/ui/*` (ownership local),
  lo que permite re-theming con tokens sin overrides. `password-strength` y `role-selector` no existen
  en shadcn → se construyen sobre las primitivas, no desde cero estilístico.

### ADR-UC01-02 — Validación: **react-hook-form + zod** (no controlled hand-rolled)

- **Decisión:** introducir `react-hook-form` + `zod` + `@hookform/resolvers` AHORA, en esta WI.
- **Por qué:** el baseline lo marca "recomendado pero fuera de alcance del baseline" — es decir, una
  decisión que esta fase debe tomar, y la tomo a favor. RHF da: validación `onBlur` + presubmit nativa
  (REQ-02), foco automático al primer campo con error (ESC-UI-03/06), estado de `isSubmitting` para el
  anti-doble-submit (REQ-09), y `setError` por campo para inyectar errores del servidor (REQ-07/08) sin
  reescribir estado a mano. zod es una **única fuente de verdad** del esquema, reusable por el Verificador
  en tests unitarios. Hand-rolling controlado significaría reimplementar todo esto para CINCO campos +
  condicional + medidor: más superficie de bug y de a11y.
- **Precedente:** al ser la 1ª WI de UI, fija RHF+zod como el patrón de formularios de toda la app —
  decisión consciente y deseable (forms se repiten en UC02, UC07, UC08).
- **Alternativa rechazada:** `useState` controlado + validación manual. Rechazada por duplicación de
  lógica de foco/errores/submit y peor mantenibilidad en los próximos forms.
- **Costo:** ~3 deps. Aceptable; RHF es liviano (no re-renderiza todo el form) y zod ya está en el árbol
  de `node_modules` (visto en el repo).

---

## 3. HTTP client

### ADR-UC01-03 — Llamada: **client-side `fetch` directo** (no Server Action proxy)

- **Decisión:** el `RegistroForm` (client component) llama a `registerUser()` que hace `fetch` directo al
  backend NestJS. **No** se usa Server Action ni route handler proxy.
- **Por qué:** el endpoint `POST /auth/register` ya existe en el backend y es público (sin sesión).
  No hay secreto que ocultar ni cookie a setear en este flujo (la sesión se crea en login, UC02). Un
  proxy agregaría un hop y latencia sin beneficio. El manejo de errores 409/422/400 necesita el body
  estructurado en el cliente para mapear inline → `fetch` directo lo entrega sin serialización extra.
- **Alternativa rechazada:** Server Action. Tendría sentido si hubiese que setear cookies httpOnly o
  esconder la URL del backend; acá no aplica. Reconsiderar en UC02 (login) donde sí hay token.

### Base URL

- Variable: **`NEXT_PUBLIC_API_URL`**, default **`http://localhost:3000`**.
- **Supuesto S1 (puerto):** se asume el backend NestJS en `:3000`. **PERO** Next.js dev también corre en
  `:3000` por defecto → colisión. Ver Supuestos: el front debe arrancar en otro puerto (`next dev -p 3001`)
  o el back moverse. Esto es una asunción a confirmar en el HITL gate, no un hecho verificado.
- `NEXT_PUBLIC_` es obligatorio para que la var sea legible en el bundle de cliente (Next 16). Se lee una
  sola vez en `lib/http.ts`.

### Firmas y tipos (mirror EXACTO del contrato)

```ts
// lib/api/auth.ts  (firmas ilustrativas, NO implementación)

type Role = 'cliente' | 'prestador';

interface RegisterPayload {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;          // 8..128
  role: Role;
  trade?: string;            // presente SOLO si role === 'prestador'
}

interface RegisterSuccess {   // HTTP 201
  id: string;
  email: string;
  role: Role;
  status: string;
  providerStatus: 'pendiente_habilitacion' | 'habilitado' | null;
  message: string;
}

interface BackendValidationError { // HTTP 422
  statusCode: 422;
  message: string[];          // una entrada por regla rota
  error: 'Unprocessable Entity';
}

interface BackendConflictError {   // HTTP 409
  statusCode: 409;
  message: string;            // "An account with this email already exists."
  error: 'Conflict';
}

interface BackendBadRequest {      // HTTP 400 (ej. prestador sin trade en server)
  statusCode: 400;
  message: string | string[];
  error: 'Bad Request';
}

// Resultado discriminado que consume el form (nunca lanza para errores de negocio):
type RegisterResult =
  | { ok: true; data: RegisterSuccess }
  | { ok: false; kind: 'validation'; raw: BackendValidationError }   // 422
  | { ok: false; kind: 'conflict'; raw: BackendConflictError }       // 409
  | { ok: false; kind: 'bad_request'; raw: BackendBadRequest }       // 400
  | { ok: false; kind: 'network' }                                   // fetch falló / sin respuesta
  | { ok: false; kind: 'server'; status: number };                  // 5xx u otro inesperado

declare function registerUser(payload: RegisterPayload): Promise<RegisterResult>;
```

`registerUser` **no lanza** para 4xx de negocio: devuelve un `RegisterResult` discriminado. Solo errores
de red devuelven `kind:'network'`. Esto hace el mapeo a UI puro y testeable.

---

## 4. Error-mapping design

Módulo `lib/errors/field-errors.ts`. Centraliza la traducción es-AR (DESIGN-SYSTEM §5.2, §10.1: el
parseo del 422 se hace UNA sola vez).

### Catálogo (forma)

```ts
type FieldKey = 'name' | 'lastName' | 'email' | 'phone' | 'password' | 'role' | 'trade';

// Mensaje es-AR por campo (texto al usuario, NUNCA el string crudo del backend en inglés).
const FIELD_ERROR_ES: Record<FieldKey, string> = {
  name:     'Ingresá tu nombre (máximo 100 caracteres).',
  lastName: 'Ingresá tu apellido (máximo 100 caracteres).',
  email:    'Ingresá un e-mail válido (ej. nombre@dominio.com).',
  phone:    'Ingresá un teléfono válido (formato AR, con o sin +54).',
  password: 'La contraseña debe tener entre 8 y 128 caracteres.',
  role:     'Elegí si te registrás como cliente o prestador.',
  trade:    'Seleccioná tu oficio.',
};

// 409 → siempre al campo email, con sugerencia + link a login.
const EMAIL_TAKEN_ES = 'Este e-mail ya está registrado. ¿Querés ingresar?';
```

### Parseo del 422 (`message: string[]`)

Cada string del backend (class-validator) **empieza por el nombre del campo** (ej.
`"name must be shorter than or equal to 100 characters"`, `"email must be an email"`). El parser:

```ts
// Extrae el primer token, lo matchea contra FieldKey conocidos.
// firma:
function mapValidationErrors(body: BackendValidationError): {
  fields: Partial<Record<FieldKey, string>>;  // campo → mensaje es-AR (desde catálogo)
  global: string[];                            // mensajes no asociables a campo (es-AR genérico)
};
```

- Por cada `msg` en `body.message`: tomar el primer token (`msg.split(/\s|:/, 1)[0]`), normalizar
  (lowercase), buscar en el set de `FieldKey`. Si matchea → `fields[key] = FIELD_ERROR_ES[key]`.
- Si NO matchea ningún campo → push a `global` con un mensaje es-AR genérico ("Revisá los datos del
  formulario."). Nunca se muestra el string crudo en inglés (REQ-07.3).
- Colisiones (dos mensajes para el mismo campo) → el primero gana; el catálogo es por-campo, no por-regla.

### 409 → campo email

```ts
function map409(): { fields: { email: string } }; // { email: EMAIL_TAKEN_ES }
```
El form, al recibir `kind:'conflict'`, hace `setError('email', …)` + render de link a login. Resto del
form intacto (REQ-08, ESC-UI-05).

### 400 / network / 5xx → resumen global `role="alert"`

```ts
function mapGlobalError(result: Extract<RegisterResult,{ok:false}>): string | null;
```
- `bad_request` (400, ej. prestador sin trade que el cliente no previno): mensaje global
  "Faltan datos obligatorios. Revisá el formulario." en banner `role="alert"` + mover foco al banner.
- `network`: "No pudimos conectarnos. Revisá tu conexión e intentá de nuevo."
- `server` (5xx): "Algo salió mal de nuestro lado. Intentá de nuevo en unos minutos." (DESIGN-SYSTEM §6,
  nunca culpar al usuario).
- `validation`/`conflict` → `null` (esos van inline, no al global).

Todos los textos viven en `lib/copy/es-AR.ts`; `field-errors.ts` los importa (no los hardcodea).

---

## 5. State & validation

### Forma del estado (RHF)

```ts
interface RegistroFormValues {
  role: '' | Role;          // '' = sin elegir (bloquea submit, REQ-01)
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  trade: string;            // '' por defecto; solo se envía si role==='prestador'
}
// Estado UI extra (fuera de RHF values): showPassword:boolean, strength:0..4 derivado, submitState.
```

### Reglas zod (`lib/validation/registro.ts`) — mirror del backend

| Campo | Regla cliente | Mensaje (catálogo) |
|---|---|---|
| `name` | no vacío, ≤100 | name |
| `lastName` | no vacío, ≤100 | lastName |
| `email` | regex con `@` + dominio, ≤255 | email |
| `phone` | no vacío, ≤30, regex AR tolerante `/^\+?54?[\s\-]?(\d[\s\-]?){8,}$/` (acepta con/sin +54, espacios, guiones) | phone |
| `password` | ≥8, ≤128 | password |
| `role` | enum `cliente\|prestador`, requerido | role |
| `trade` | **condicional**: requerido y no vacío SOLO si `role==='prestador'` (zod `superRefine`/`discriminatedUnion`) | trade |

- **Validación cliente complementa, no reemplaza** (RN-REG-03): el server revalida; por eso el 422 sigue
  mapeándose aunque el cliente valide. El cliente es deliberadamente tolerante en `phone`/`email` (no
  duplicar reglas exactas del server, evitar falsos negativos).
- **Trigger:** RHF `mode: 'onBlur'` (validación por campo al salir) + `handleSubmit` revalida todo antes
  de enviar (presubmit). Si hay error en submit → RHF mueve foco al primer campo inválido (ESC-UI-03/06).

### Medidor de fuerza (REQ-05)

```ts
function passwordStrength(pw: string): { score: 0|1|2|3|4; label: 'débil'|'media'|'fuerte' };
```
- Lógica simple y determinística (testeable): puntos por longitud (≥8, ≥12), variedad (minúscula+mayúscula,
  dígito, símbolo). `score` 0-1 → "débil", 2-3 → "media", 4 → "fuerte".
- **Informativo, no bloqueante**: con ≥8 chars el submit procede aunque sea "débil" (REQ-05).
- Render: barra cuyo ancho es valor dinámico → única excepción permitida de estilo inline (§10.2);
  color por token (`bg-error`/`bg-warning`/`bg-success`), nunca hex.

### Trade condicional + oficio regulado (REQ-03, REQ-04)

- `trade` se renderiza solo cuando `role==='prestador'` (watch de RHF). Al pasar a `cliente`, el valor se
  resetea y NO se incluye en el payload.
- **Supuesto S2 (fuente del flag regulado):** el catálogo de oficios vive en `lib/trades.ts` como lista
  estática `{ value, label, regulated:boolean }` (espejo de seeds de BD, spec PA-02). El subconjunto
  regulado (ej. Gasista, Electricista) se marca con `regulated:true`. Al seleccionar un oficio con
  `regulated:true`, se muestra inmediatamente el aviso `warning-subtle` + ícono reloj (REQ-04), debajo del
  select, antes del CTA. **No bloquea el submit.** A confirmar contra seeds reales en HITL.

### Submit / loading / anti-doble-submit (REQ-09)

- RHF `formState.isSubmitting` gobierna: botón en `loading` (spinner + texto, ancho estable, `aria-busy`),
  campos `aria-disabled`. `handleSubmit` no re-dispara mientras `isSubmitting` (guard adicional explícito
  por si el handler es async largo).
- Éxito (201): tras toast/mensaje, el form queda **bloqueado** (estado `submitted` local que deshabilita
  todo) hasta el redirect — no se puede reenviar (REQ-06, ESC-UI-01/02).

### Manejo del 201 (REQ-06)

- `providerStatus === null || 'habilitado'`: toast `role="status"` éxito + `router.push` a login (UC02).
- `providerStatus === 'pendiente_habilitacion'`: render de mensaje en pantalla `warning-subtle` (no solo
  toast) con el próximo paso (acreditar matrícula); luego redirect a login. **Supuesto S3 (target):** el
  destino post-201 es la ruta de login de UC02. Si esa ruta aún no existe al implementar, usar `/` (home
  público) como fallback temporal y dejar `TODO` trazado. A confirmar en HITL.

---

## 6. Token / theme wiring

### `app/globals.css` (estructura, REEMPLAZA el scaffold Geist/`@theme inline`)

Orden exacto del archivo:

1. `@import "tailwindcss";`
2. **Bloque `@theme { … }`** — copiado **verbatim** de DESIGN-SYSTEM §2.6 (todos los `--color-*` de
   superficie/marca/semánticos/estados-contratación + `--font-display/sans/mono` + `--radius-*` +
   `--shadow-*`). **Llaves `{ }`, NO `@theme inline`** (Tailwind v4 CSS-native). Las fuentes apuntan a
   `"Fraunces"`, `"Figtree"`, `"IBM Plex Mono"` como primer fallback de cada `--font-*` (los nombres los
   exponen las CSS vars de `next/font` — ver layout).
3. **Bloque `.dark { … }`** — overrides verbatim de §2.6 (incluye la corrección crítica
   `--color-on-primary: #1A1715` en dark).
4. **Base layer** (`@layer base`):
   - `html { font-family: var(--font-sans); }`
   - `body { background: var(--color-background); color: var(--color-foreground); }`
   - **focus-visible global:** `:focus-visible { outline: 2px solid var(--color-ring); outline-offset: 2px; }`
     (nunca `outline:none` sin reemplazo, §8/§10.2).
   - **inputs ≥16px:** asegurar `font-size: 1rem` mínimo en controles (evita zoom iOS, §3.2/§8).
   - **reduced-motion:** `@media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation:none!important; transition:none!important; } }` (§8).
   - **skip-link:** clase `.skip-link` posicionada fuera de pantalla que se vuelve visible en `:focus`
     (salta a `#main`).

> El scaffold actual (`--font-geist-sans`, `@theme inline`, `font-family: Arial`) se elimina por completo.

### `app/layout.tsx` (fuentes + provider + lang + landmarks)

```ts
// next/font/google — tres llamadas, cada una expone una CSS var que matchea los tokens @theme:
import { Fraunces, Figtree, IBM_Plex_Mono } from 'next/font/google';

const display = Fraunces({ subsets:['latin'], weight:['400','500','600'], variable:'--font-display' });
const sans    = Figtree ({ subsets:['latin'], weight:['400','500','600'], variable:'--font-sans' });
const mono    = IBM_Plex_Mono({ subsets:['latin'], weight:['400'],        variable:'--font-mono' });
```

- `<html lang="es-AR" className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>`
  (`suppressHydrationWarning` requerido por next-themes al togglear la clase `.dark`).
- `<body>`: skip-link como primer hijo → `<ThemeProvider>` → landmarks `header`/`main#main`/`footer` →
  `<Toaster/>`.
- `metadata`: title/description en es-AR (reemplaza "Create Next App").
- **Coherencia tokens↔fuentes:** las CSS vars de `next/font` (`--font-display/-sans/-mono`) son las MISMAS
  que el `@theme` referencia → `font-display`/`font-sans`/`font-mono` de Tailwind resuelven a las fuentes
  reales. Sin esta coincidencia de nombres, el `@theme` apuntaría a fuentes inexistentes.

---

## 7. Accesibilidad checklist (mapeado a componentes)

| Requisito (§8 / REQ-10) | Dónde se realiza |
|---|---|
| `<label>` visible + `for` + `aria-required` | `components/ui/field.tsx` (Label) en cada campo |
| `aria-invalid` + `aria-describedby` → id del error | `field.tsx`: cuando RHF reporta error, setea ambos al `ErrorText` |
| Resumen global `role="alert"` + foco al resumen | `registro-form.tsx`: banner `alert.tsx` para 400/network/5xx y 422 no-mapeables; `useEffect`/`ref.focus()` al aparecer |
| Toast éxito `role="status"`; error `role="alert"` | `ui/toast.tsx` / `toaster.tsx` |
| `focus-visible` ring 2px + offset 2px | global en `globals.css` + heredado por primitivas shadcn |
| Orden de tabulación lógico (DOM=visual) | orden de campos en `registro-form.tsx` = orden del blueprint §7.1 |
| Targets táctiles ≥44px mobile | `ui/button.tsx` size `md`→44px en mobile; selector de rol con áreas ≥44px |
| Inputs `font-size ≥16px` | base layer `globals.css` + `ui/input.tsx` |
| `aria-busy` durante submit | `ui/button.tsx` loading + contenedor del form |
| Skip-link "Saltar al contenido" | `layout.tsx` primer hijo de `body` → `#main` |
| `lang="es-AR"` | `<html>` en `layout.tsx` |
| Selector de rol y de oficio navegables por teclado | `role-selector.tsx` (radiogroup ARIA, flechas) + `ui/select.tsx` (Radix) |
| Aviso regulado no-solo-color | `alert.tsx` warning con ícono reloj + texto (REQ-04, §5.6 1.4.1) |
| Contraste AA claro/oscuro | garantizado por tokens §2.5 (no introducir colores fuera de `@theme`) |

---

## 8. Mapeo Escenario → implementación

| Escenario | Componente / función | Cómo se testea (insumo para el Verificador) |
|---|---|---|
| **ESC-UI-01** registro cliente OK (201→toast+redirect) | `registro-form.tsx` (submit) → `registerUser` → `kind:ok`, `providerStatus:null` → toast + `router.push(login)` | Playwright: mock 201, assert toast `role=status`, assert navegación a login, form bloqueado. Unit: `registerUser` mapea 201 a `{ok:true}` |
| **ESC-UI-02** prestador oficio regulado (201 pendiente) | `role-selector` → `trade` select (`trades.ts regulated`) → aviso `alert` warning → submit → mensaje `warning-subtle` en pantalla + redirect | Playwright: elegir Prestador → Gasista → assert aviso visible; mock 201 `providerStatus:pendiente_habilitacion` → assert mensaje en pantalla (no solo toast) + redirect |
| **ESC-UI-03** validación cliente presubmit (pass corta, email malo) | zod `registro.ts` + RHF `onBlur` + foco al primer error | Unit zod: password<8 y email sin `@` → issues esperados. Playwright: blur en campos, assert ErrorText + `aria-invalid`; submit bloqueado (sin request HTTP), foco en primer error |
| **ESC-UI-04** 422 → errores inline por campo | `mapValidationErrors` + `setError` por campo + banner global para no-mapeables | Unit: `mapValidationErrors({message:[...]})` → `{fields, global}` correctos. Playwright: mock 422, assert ErrorText por campo + valores conservados + botón vuelve a default |
| **ESC-UI-05** 409 email duplicado | `map409` → `setError('email')` + link a login | Unit: `map409()` → `{email: EMAIL_TAKEN_ES}`. Playwright: mock 409, assert error en email + link login + resto de campos con valores intactos |
| **ESC-UI-06** prestador sin oficio → UI previene | zod condicional `trade` + RHF foco | Unit zod: `role:prestador, trade:''` → issue en `trade`. Playwright: Prestador sin oficio + submit → sin request HTTP, ErrorText "Seleccioná tu oficio.", foco en `trade` |

---

## 9. Pre/postcondiciones OCL-style (ADR-006 → aserciones de test)

### `registerUser(payload: RegisterPayload): Promise<RegisterResult>`

```
context registerUser(payload)
  pre  P1: payload.role ∈ {'cliente','prestador'}
  pre  P2: payload.role = 'prestador' implies (payload.trade != null and payload.trade != '')
  pre  P3: payload.role = 'cliente'   implies payload.trade is absent (no se envía la key)
  pre  P4: 8 <= payload.password.length <= 128
  post Q1: result.ok = true  implies result.data.role = payload.role
  post Q2: result.ok = false implies result.kind ∈ {validation,conflict,bad_request,network,server}
  post Q3: HTTP 201 implies result = {ok:true} and result.data.providerStatus ∈ {null,'habilitado','pendiente_habilitacion'}
  post Q4: HTTP 422 implies result.kind = 'validation' and result.raw.message is string[]
  post Q5: HTTP 409 implies result.kind = 'conflict'
  post Q6: la función NUNCA lanza por respuestas 4xx; solo 'network' ante fallo de transporte
```

### `mapValidationErrors(body: BackendValidationError): { fields, global }`

```
context mapValidationErrors(body)
  pre  P1: body.statusCode = 422 and body.message is non-empty string[]
  post Q1: result.fields y result.global son disjuntos (un msg va a uno u otro, nunca ambos)
  post Q2: ∀ k ∈ keys(result.fields): k ∈ FieldKey and result.fields[k] ∈ values(FIELD_ERROR_ES)
  post Q3: ningún valor de result.fields ni de result.global es un string crudo en inglés del backend
  post Q4: |result.fields| + |result.global| >= 1   (todo 422 produce al menos un mensaje)
  post Q5: msg cuyo primer token ∉ FieldKey  ⇒  va a result.global (mensaje es-AR genérico)
```

---

## Supuestos (para el HITL gate)

| ID | Supuesto | Riesgo si falla | Default tomado |
|---|---|---|---|
| **S1** | Backend NestJS escucha en `http://localhost:3000`. Como Next dev usa `:3000` por defecto, **hay colisión de puertos** → el front debe correr en `:3001` (`next dev -p 3001`) o el back moverse. | Dev no arranca / requests fallan en local | `NEXT_PUBLIC_API_URL=http://localhost:3000`; documentar que el front corre en `:3001`. **Confirmar puerto real del back.** |
| **S2** | El catálogo de oficios y el flag `regulated` se modelan como lista estática en `lib/trades.ts` (espejo de seeds, PA-02). No hay endpoint de catálogo en alcance. | Lista desincronizada con BD; oficio regulado mal marcado | Lista estática con subconjunto regulado (Gasista, Electricista, etc.). **Confirmar contra seeds reales.** |
| **S3** | Destino del redirect post-201 = ruta de login de UC02. | Ruta inexistente al implementar UC01 antes que UC02 | Redirect a login; fallback `/` (home público) con `TODO` si la ruta de login no existe aún. |
| **S4** | El medidor de fuerza es puramente informativo (no hay política de complejidad del backend más allá de 8..128). | Si el back exige complejidad, el medidor confunde | Medidor heurístico no bloqueante; solo 8..128 bloquea. |
| **S5** | `next-themes` se adopta ahora (toggle dark de primera clase, §2.6) aunque UC01 no tenga botón de toggle visible. Habilita `.dark` correcto desde el inicio. | Re-trabajo si se difiere | ThemeProvider en layout desde esta WI. |

---

*Fin del diseño UC01-UI-Registro. Próxima fase: `sdd-tasks` (descomposición en pasos de implementación),
una vez aprobado este diseño en el HITL gate.*
