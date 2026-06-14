# Spec — MI-02.2 UI Login + Manejo de sesión (UC02)

**Trazabilidad:** UC02 Autenticarse · RF-1.2 (login con e-mail y contraseña; bloqueo tras 5 fallidos) · RF-1.6 (recuperación de contraseña por token de un solo uso) · RNF-S.4 (anti-enumeración: no revelar qué campo falló) · RNF-A.1 (>85% completitud al 1er intento) · RNF-A.2 (Chrome/Firefox/Safari últimas 2 versiones desktop+móvil) · RNF-A.3 (≤5 pasos contratación). Contrato backend: `POST /auth/login`, `POST /auth/forgot-password`, `POST /auth/reset-password` (ya implementados y verificados).

---

## Propósito

Esta UI implementa la pantalla de inicio de sesión de UC02 en el cliente Next.js (`client/`) y el manejo de sesión a alto nivel. Permite que un usuario registrado (cliente, prestador o administrador) inicie sesión consumiendo el endpoint `POST /auth/login`, y que recupere su contraseña vía `POST /auth/forgot-password` + `POST /auth/reset-password`. El alcance es exclusivamente frontend: presentación de formularios, validación cliente, mapeo de respuestas del backend (200, 401, 403, 423, 422 y errores de red/servidor), persistencia funcional de la sesión, rutas protegidas y logout. La lógica de autenticación, emisión/firma de JWT, hashing y reglas de bloqueo del servidor están **fuera de alcance** de esta especificación (UC02 backend, ya cerrado).

---

## Alcance

**En alcance (prioridad alta):**
- Pantalla `/login`: formulario e-mail + contraseña (toggle mostrar/ocultar), submit con prevención de doble envío.
- Mapeo de los 4 estados de error del contrato (401, 403, 423, 422) + red/servidor.
- Manejo de sesión: redirección post-login, persistencia entre recargas, logout, rutas protegidas.
- Links a `/registro` y a recuperación de contraseña.

**En alcance (prioridad secundaria):**
- `/recuperar-contrasena` (forgot-password): solicitar enlace, mensaje neutro siempre.
- `/restablecer-contrasena` (reset-password, vía token): nueva contraseña + confirmación; manejo de token vencido/usado.

**Fuera de alcance:** ver sección final.

---

## Requisitos

### REQ-01 — Campos del formulario de login y validación cliente

| Campo UI | Campo backend | Obligatorio | Validación cliente |
|---|---|---|---|
| E-mail | `email` | Sí | Formato de e-mail válido (debe incluir `@`), no vacío |
| Contraseña | `password` | Sí | No vacío |

La validación cliente se ejecuta en `onBlur` por campo y antes del envío; **complementa, nunca reemplaza** la validación del servidor. El campo `password` incluye un toggle de visibilidad (icono ojo) mostrar/ocultar. No se aplica validación de longitud mínima en login (un password viejo podría ser más corto que la política actual); la regla de 8 caracteres aplica solo en reset (REQ-09).

### REQ-02 — Mapeo de respuesta 200 a UX (éxito)

Ante HTTP 200 con `{ accessToken: string }`: el sistema MUST establecer la sesión (REQ-05), mostrar feedback breve de éxito y redirigir al destino post-login. El destino por defecto es el home/dashboard del usuario; si el ingreso provino de una ruta protegida (REQ-07), MUST redirigir a esa ruta original. El formulario queda bloqueado tras el éxito (no reenvío).

### REQ-03 — Mapeo de errores de credenciales/estado de cuenta (banner genérico)

Las respuestas de error de autenticación se presentan en un **banner sobre el formulario** (`role="alert"`), no inline por campo. El sistema MUST mapear así:

| HTTP | Significado | Mensaje es-AR (banner) | Acción UI |
|---|---|---|---|
| 401 | Credenciales inválidas | "E-mail o contraseña incorrectos." | Banner; conserva e-mail, limpia password; permite reintento |
| 403 | Cuenta suspendida | "Tu cuenta está suspendida. Escribinos a soporte@snackoverflow.com." | Banner con canal de contacto; sin reintento útil |
| 423 | Cuenta bloqueada temporalmente | "Cuenta bloqueada temporalmente por demasiados intentos. Probá de nuevo en unos 30 minutos." | Banner; **deshabilitar submit**; no reintento inmediato |

El mensaje de 401 MUST ser genérico y NUNCA revelar si falló el e-mail o la contraseña (RNF-S.4, anti-enumeración, RN-AUTH-02). El sistema MUST NOT exponer ningún dato de la cuenta.

### REQ-04 — Mapeo de respuesta 422 a errores inline por campo

Ante HTTP 422 (validación de campos: e-mail mal formado o vacíos), el cuerpo contiene `{ statusCode: 422, message: string[], error: "Unprocessable Entity" }`. El sistema MUST parsear el array `message`, mapear cada item al campo correspondiente y mostrar el mensaje traducido al español bajo el campo afectado (borde `error`, ícono de alerta, `aria-invalid="true"`, `aria-describedby`). Si un mensaje no mapea a ningún campo, MUST mostrarse en el resumen de errores con `role="alert"` y mover el foco a él. El formulario retiene los valores ingresados.

### REQ-05 — Persistencia de sesión (requisito funcional)

Tras login exitoso, la sesión MUST persistir entre recargas de página y navegaciones dentro de la app, sin volver a pedir credenciales mientras el token sea válido. El sistema MUST manejar la expiración del token (claim `exp`, RN-AUTH-06): una vez expirado, el usuario es tratado como sin sesión. El mecanismo concreto de almacenamiento del token (httpOnly cookie vs. localStorage vs. memory) se decide en la etapa de **diseño**; esta spec solo fija el comportamiento observable. La invalidación es solo por expiración: no hay blocklist del lado servidor (RN-AUTH-06).

### REQ-06 — Logout

El sistema MUST ofrecer una acción de cierre de sesión accesible desde la navegación con sesión iniciada. Al ejecutarla, MUST limpiar la sesión persistida del cliente y redirigir a una vista pública (`/login` o home público). Tras logout, intentar acceder a una ruta protegida MUST comportarse como sin sesión (REQ-07). No requiere llamada al backend (no hay blocklist, RN-AUTH-06).

### REQ-07 — Rutas protegidas y redirección

Las rutas que requieren sesión MUST redirigir a `/login` cuando no hay sesión válida (ausente o expirada). El sistema SHOULD preservar la ruta destino original para redirigir a ella tras un login exitoso (REQ-02). Las rutas públicas conocidas (`/login`, `/registro`, `/recuperar-contrasena`, `/restablecer-contrasena`, búsqueda pública UC04) MUST ser accesibles sin sesión.

### REQ-08 — Estado de envío y prevención de doble submit

Durante el `fetch` en curso, el botón "Ingresar" entra en estado `loading` (spinner + texto, ancho estable, `aria-busy="true"`) y los campos quedan en `aria-disabled`. No puede dispararse una segunda solicitud hasta recibir respuesta. Tras respuesta de error, el botón vuelve al estado default (salvo 423, que lo deshabilita, REQ-03).

### REQ-09 — Recuperación de contraseña (secundario)

**Paso 1 — solicitar enlace (`/recuperar-contrasena`):** formulario con campo `email`. Al enviar, llama `POST /auth/forgot-password`. La respuesta es SIEMPRE 200; el sistema MUST mostrar un mensaje **neutro** ("Si ese e-mail está registrado, te enviamos un enlace para restablecer tu contraseña.") sin confirmar ni negar la existencia de la cuenta (anti-enumeración, RN-AUTH-05, UC02 ESC-08).

**Paso 2 — restablecer (`/restablecer-contrasena?token=…`):** formulario con `newPassword` (mínimo 8 caracteres) + confirmación. Al enviar, llama `POST /auth/reset-password` con `{ token, newPassword }`. Ante 200, mostrar éxito y redirigir a `/login`. Ante token vencido/usado (4xx), MUST mostrar una pantalla "Enlace expirado" con CTA "Pedir un nuevo enlace" hacia el paso 1 (UC02 ESC-07).

### REQ-10 — Manejo de errores de red y servidor (5xx / sin conexión)

Ante fallo de red o respuesta 5xx en cualquier endpoint, el sistema MUST mostrar un mensaje no técnico ("No pudimos conectar. Revisá tu conexión e intentá de nuevo.") en banner `role="alert"`, conservar los datos del formulario y permitir reintento. MUST NOT exponer trazas ni detalles internos.

### REQ-11 — Accesibilidad WCAG 2.1 AA

Cumple DESIGN-SYSTEM §8: cada campo con `<label>` visible asociado y `aria-required="true"`; campos con error con `aria-invalid` + `aria-describedby`; banner de error de credenciales con `role="alert"` (assertive); feedback de éxito con `role="status"` (polite); foco visible (`focus-visible`, ring 2px + offset 2px); orden de tabulación lógico; targets táctiles ≥44×44px; inputs `font-size ≥16px` (evitar zoom iOS); contraste ≥4.5:1 en claro/oscuro; `lang="es-AR"` en el documento raíz. El toggle mostrar/ocultar contraseña es operable por teclado con `aria-pressed`/`aria-label` descriptivo.

### REQ-12 — Compatibilidad y flujo (RNF-A.2 / RNF-A.3)

El login funciona sin errores críticos en Chrome, Firefox y Safari (últimas 2 versiones, desktop + móvil Android/iOS). El login es una pantalla única (1 paso) y no excede el presupuesto de ≤5 pasos del flujo de contratación. Layout: card centrada `max-w-md` (DESIGN-SYSTEM §7.2).

---

## Escenarios

### ESC-UI-01 — Login exitoso (200 → sesión + redirect)

**Satisface:** UC02 ESC-01, RN-AUTH-06, REQ-01, REQ-02, REQ-05

```
Dado   un usuario registrado con cuenta activa en la pantalla /login
Cuando ingresa e-mail y contraseña correctos y hace clic en "Ingresar"
Entonces
  - el botón entra en estado loading (`aria-busy="true"`)
  - el backend responde 200 con { accessToken }
  - la sesión queda establecida y persiste entre recargas
  - la UI redirige al destino post-login (home/dashboard, o la ruta protegida de origen)
  - el formulario queda bloqueado (no reenvío posible)
```

### ESC-UI-02 — Credenciales inválidas: banner genérico (401)

**Satisface:** UC02 ESC-03, RN-AUTH-02, RNF-S.4, REQ-03

```
Dado   un usuario en /login
Cuando ingresa un e-mail o contraseña incorrectos y hace clic en "Ingresar"
       y el backend responde HTTP 401 "Invalid credentials."
Entonces
  - aparece un banner sobre el form (`role="alert"`) con el mensaje genérico
    "E-mail o contraseña incorrectos."
  - el mensaje NO revela si falló el e-mail o la contraseña
  - el campo e-mail conserva su valor; el campo contraseña se limpia
  - el botón vuelve al estado default y se permite reintentar
```

### ESC-UI-03 — Cuenta bloqueada temporalmente (423)

**Satisface:** UC02 ESC-04, RN-AUTH-04, REQ-03

```
Dado   un usuario cuya cuenta fue bloqueada por 5 intentos fallidos consecutivos
Cuando hace clic en "Ingresar" y el backend responde HTTP 423
       "Account temporarily locked. Try again in 30 minutes."
Entonces
  - aparece un banner (`role="alert"`):
    "Cuenta bloqueada temporalmente por demasiados intentos. Probá de nuevo en unos 30 minutos."
  - el botón "Ingresar" queda deshabilitado (sin reintento inmediato)
  - no se establece ninguna sesión
```

### ESC-UI-04 — Cuenta suspendida (403)

**Satisface:** UC02 ESC-05, RN-AUTH-01, REQ-03

```
Dado   un usuario cuya cuenta fue suspendida por un Administrador
Cuando hace clic en "Ingresar" y el backend responde HTTP 403
       "Account suspended. Contact support."
Entonces
  - aparece un banner (`role="alert"`):
    "Tu cuenta está suspendida. Escribinos a soporte@snackoverflow.com."
  - el banner ofrece el canal de contacto a soporte
  - no se establece ninguna sesión y el mensaje no revela si las credenciales eran válidas
```

### ESC-UI-05 — Validación cliente y 422 inline

**Satisface:** RN-AUTH-02, REQ-01, REQ-04

```
Dado   un usuario en /login
Cuando deja el e-mail vacío o sin "@" y sale del campo (onBlur)
Entonces
  - el campo e-mail muestra borde `error`, ErrorText "Ingresá un e-mail válido (ej. nombre@dominio.com)."
    y `aria-invalid="true"` con `aria-describedby` al id del error
  - intentar enviar con el error presente bloquea el submit en cliente (sin solicitud HTTP)

Cuando el servidor rechaza con HTTP 422 (e-mail mal formado / campos vacíos)
Entonces
  - la UI mapea cada item de `message` al campo y muestra el ErrorText en español
  - los valores no afectados se conservan; el botón vuelve al estado default
```

### ESC-UI-06 — Sesión persiste y logout la limpia

**Satisface:** RN-AUTH-06, REQ-05, REQ-06, REQ-07

```
Dado   un usuario con sesión iniciada
Cuando recarga la página
Entonces sigue autenticado sin reingresar credenciales

Cuando ejecuta "Cerrar sesión"
Entonces
  - la sesión persistida del cliente se limpia
  - es redirigido a una vista pública
  - intentar acceder a una ruta protegida lo redirige a /login
```

### ESC-UI-07 — Ruta protegida sin sesión redirige a /login

**Satisface:** REQ-07, REQ-02

```
Dado   un visitante sin sesión (o con token expirado)
Cuando intenta acceder a una ruta protegida
Entonces
  - es redirigido a /login
  - tras un login exitoso, es redirigido a la ruta protegida que pidió originalmente
```

### ESC-UI-08 — Recuperación: solicitar enlace (mensaje neutro, secundario)

**Satisface:** UC02 ESC-08, RN-AUTH-05, RNF-S.4, REQ-09

```
Dado   un usuario en /recuperar-contrasena
Cuando ingresa un e-mail (exista o no) y hace clic en "Enviar enlace"
       y el backend responde SIEMPRE HTTP 200
Entonces
  - se muestra un mensaje neutro:
    "Si ese e-mail está registrado, te enviamos un enlace para restablecer tu contraseña."
  - el mensaje NO confirma ni niega la existencia de la cuenta (anti-enumeración)
```

### ESC-UI-09 — Recuperación: restablecer con token (secundario)

**Satisface:** UC02 ESC-06, ESC-07, RN-AUTH-05, REQ-09

```
Dado   un usuario que abre /restablecer-contrasena?token=… desde el enlace
Cuando ingresa una nueva contraseña (≥8 caracteres) y su confirmación coincide,
       y el backend responde HTTP 200
Entonces
  - se muestra éxito y se redirige a /login

Cuando el token está vencido o ya usado (el backend responde 4xx)
Entonces
  - se muestra la pantalla "Enlace expirado" con CTA "Pedir un nuevo enlace" hacia /recuperar-contrasena
  - no se actualiza la contraseña
```

### ESC-UI-10 — Error de red / servidor

**Satisface:** REQ-10

```
Dado   un usuario que envía cualquier formulario de auth
Cuando ocurre un fallo de red o el backend responde 5xx
Entonces
  - aparece un banner (`role="alert"`): "No pudimos conectar. Revisá tu conexión e intentá de nuevo."
  - los datos del formulario se conservan y se permite reintentar
  - no se exponen trazas ni detalles internos
```

---

## Catálogo de mensajes (es-AR)

| Situación | Mensaje |
|---|---|
| 401 credenciales | "E-mail o contraseña incorrectos." |
| 423 bloqueo | "Cuenta bloqueada temporalmente por demasiados intentos. Probá de nuevo en unos 30 minutos." |
| 403 suspendida | "Tu cuenta está suspendida. Escribinos a soporte@snackoverflow.com." |
| e-mail inválido (cliente/422) | "Ingresá un e-mail válido (ej. nombre@dominio.com)." |
| campo requerido | "Este campo es obligatorio." |
| red / 5xx | "No pudimos conectar. Revisá tu conexión e intentá de nuevo." |
| forgot (neutro) | "Si ese e-mail está registrado, te enviamos un enlace para restablecer tu contraseña." |
| reset éxito | "Tu contraseña fue actualizada. Ya podés ingresar." |
| reset password corta | "La contraseña debe tener al menos 8 caracteres." |
| reset confirmación no coincide | "Las contraseñas no coinciden." |
| token vencido | "El enlace expiró o ya fue usado. Pedí uno nuevo." |

---

## Trazabilidad al contrato backend

| Endpoint | Respuesta | Requisito/Escenario UI |
|---|---|---|
| `POST /auth/login` | 200 `{ accessToken }` | REQ-02, REQ-05 / ESC-UI-01 |
| `POST /auth/login` | 401 `Invalid credentials.` | REQ-03 / ESC-UI-02 |
| `POST /auth/login` | 403 `Account suspended. Contact support.` | REQ-03 / ESC-UI-04 |
| `POST /auth/login` | 423 `Account temporarily locked…` | REQ-03 / ESC-UI-03 |
| `POST /auth/login` | 422 validación | REQ-04 / ESC-UI-05 |
| `POST /auth/forgot-password` | 200 (siempre) | REQ-09 / ESC-UI-08 |
| `POST /auth/reset-password` | 200 / 4xx token | REQ-09 / ESC-UI-09 |

---

## Fuera de alcance

- **Registro de cuenta (UC01):** cubierto por MI-01.3 (ya cerrada).
- **Decisión de almacenamiento del token** (httpOnly cookie vs. localStorage vs. memory): se difiere a la etapa de **diseño**; esta spec solo fija el comportamiento observable (REQ-05).
- **Emisión/firma/validación de JWT, hashing, conteo de intentos y bloqueo:** lógica del backend UC02 (ya implementada).
- **Envío real del e-mail de recuperación y generación del token:** responsabilidad del backend.
- **Rate limiting del lado frontend:** no requerido en esta iteración (backend aplica 3 solicitudes/hora, RN-AUTH-05).
- **Autenticación multifactor (MFA) y login con OAuth de terceros:** no referenciados en el documento fuente.
- **Refresh tokens / renovación silenciosa de sesión:** no contemplados (invalidación solo por `exp`, RN-AUTH-06); evaluable en diseño si surge necesidad.
