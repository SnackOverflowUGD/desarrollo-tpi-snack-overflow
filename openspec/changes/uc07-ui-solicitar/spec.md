# Spec — MI-07.2 UI Solicitar contratación (UC07)

**Trazabilidad:** UC07 Solicitar contratación · RF-6.1 (la solicitud exige ubicación, prestador, fecha, franja y descripción; sin esos campos no se envía) · RF-4.2 (reserva de franja sin duplicación, reflejada como conflicto 409 en UI) · RU-C.3 (el cliente podrá solicitar la contratación indicando ubicación, fecha, franja horaria y descripción) · RN-AUTH-06 (sesión válida por `exp`) · RNF-A.1 (>85% completitud al 1er intento) · RNF-A.2 (Chrome/Firefox/Safari últimas 2 versiones desktop+móvil) · RNF-A.3 (≤5 pasos contratación) · RNF-S.1/S.4 (el token de sesión nunca se expone al cliente). Contrato backend: `POST /contrataciones` (ya implementado, verificado y mergeado, requiere auth rol CLIENTE).

---

## Propósito

Esta UI implementa el flujo de **solicitud de contratación** de UC07 en el cliente Next.js (`client/`), como acción de un **cliente autenticado**. Permite que un cliente logueado, partiendo del perfil público de un prestador (`/prestadores/[id]`, punto de entrada placeholder de UC04/MI-04.3), complete y envíe el formulario de solicitud (ubicación, fecha, franja horaria, descripción) consumiendo el endpoint ya construido `POST /contrataciones`, que crea la contratación en estado *solicitada*. El alcance es exclusivamente frontend: el CTA de entrada gobernado por el estado de sesión y el rol, el formulario con validación cliente, el mapeo de las respuestas del backend (201, 400, 401, 403, 404, 409, 422, red/5xx) a UX en es-AR, y el requisito de que la llamada sea **autenticada sin exponer el token al JavaScript del cliente**. La creación de la contratación, la reserva de franja, la máquina de estados (UC09) y la respuesta del prestador (UC08) están **fuera de alcance** (backend UC07 ya cerrado, más otras WIs).

---

## Alcance

**En alcance:**
- **CTA "Solicitar"** en el perfil público del prestador (`/prestadores/[id]`): su comportamiento depende del estado de sesión y rol (REQ-01).
- **Formulario de solicitud** (en `/prestadores/[id]/solicitar` o equivalente; la ubicación exacta es decisión de diseño): campos ubicación, fecha (date picker, hoy o futuro), franja horaria, descripción. `prestadorId` proviene del contexto del perfil, no es un campo editable (REQ-02).
- **Validación cliente** previa al envío: todos los campos requeridos no vacíos y fecha ≥ hoy, para prevenir 400/422 evitables (REQ-03).
- **Llamada autenticada**: solo un cliente con sesión válida puede enviar; el token de sesión NUNCA se expone al JS del cliente; si la sesión no existe o expiró, se redirige a `/login` preservando el destino (REQ-04).
- **Mapeo completo de respuestas**: 201 éxito + confirmación, 401 → login, 403 (no cliente), 404 (prestador inexistente/inactivo), 409 (franja ya no disponible), 422 (fecha pasada), 400 (validación), red/5xx (REQ-05 a REQ-11).

**Fuera de alcance:** ver sección final. **Explícito:** la bandeja/listado de solicitudes del cliente es **MI-09.3**; la respuesta del prestador (aceptar/proponer/rechazar) es **UC08/MI-08.2**; la máquina de estados es **UC09**. El único estado que toca esta WI es el `estado: 'solicitada'` que devuelve el 201.

---

## Requisitos

### REQ-01 — CTA "Solicitar" gobernado por sesión y rol

El perfil público `/prestadores/[id]` expone el CTA "Solicitar". Su comportamiento MUST depender del contexto del usuario:

| Contexto del usuario | Comportamiento del CTA |
|---|---|
| **Cliente autenticado** (rol `cliente`, sesión válida) | CTA activo; al accionarlo abre el formulario de solicitud (REQ-02). |
| **Visitante anónimo** (sin sesión) | CTA visible pero invita a iniciar sesión: al accionarlo redirige a `/login` preservando el destino (la URL del formulario o del perfil), para retomar el flujo tras autenticarse (REQ-04). |
| **Prestador autenticado** (rol `prestador`) | CTA **oculto o deshabilitado** con explicación: un prestador no puede contratarse a sí mismo ni a otros (mapea el 403 del backend, prevenido en cliente). |

El sistema MUST NOT mostrar el formulario de solicitud a un usuario cuyo rol no sea `cliente`. El prestador no debe poder iniciar el flujo desde la UI (defensa en profundidad: aunque el backend responda 403, la UI lo previene).

### REQ-02 — Campos del formulario de solicitud y origen de `prestadorId`

El formulario presenta los siguientes campos, mapeados al `CreateContratacionDto`:

| Campo UI | Campo backend | Obligatorio | Origen / validación cliente |
|---|---|---|---|
| Ubicación | `ubicacion` | Sí | Texto no vacío |
| Fecha | `fecha` | Sí | Date picker; ISO date; **hoy o futuro** (≥ fecha actual); previene 422 |
| Franja horaria | `franja` | Sí | Selección no vacía (franja horaria) |
| Descripción del problema | `descripcion` | Sí | Texto no vacío |
| (Prestador) | `prestadorId` | Sí (no editable) | UUID v4 tomado del contexto del perfil; NO es un campo del formulario |

El prestador objetivo MUST presentarse de forma legible (nombre/oficio del perfil de origen) para que el cliente confirme a quién está solicitando, pero `prestadorId` MUST NOT ser editable por el usuario. La validación cliente se ejecuta en `onBlur` por campo y antes del envío; **complementa, nunca reemplaza** la validación del servidor (RF-6.1).

### REQ-03 — Validación cliente previa al envío (campos requeridos + fecha)

El sistema MUST bloquear el submit en cliente (sin solicitud HTTP) cuando falte cualquier campo obligatorio o la fecha sea anterior a hoy. En ese caso MUST mostrar error inline en cada campo afectado (borde `error`, `aria-invalid="true"`, `aria-describedby` al id del error) y mover el foco al primer campo con error. Esto previene el 400 (campos faltantes/vacíos) y el 422 (fecha pasada) del backend. El date picker MUST impedir o marcar la selección de fechas pasadas (mínimo = hoy).

### REQ-04 — Llamada autenticada sin exponer el token (requisito de seguridad)

La solicitud de creación MUST realizarse de forma **autenticada**: el backend identifica al cliente a partir de su sesión (no se envía `clienteId` en el body; el backend lo deriva del token). El requisito de seguridad observable es:

- El token de sesión NUNCA MUST ser accesible ni legible por el JavaScript del cliente (preserva la confidencialidad del precedente UC02, que guarda el token en cookie httpOnly).
- Solo un cliente con sesión válida puede completar el envío. Si al accionar el CTA o al enviar no hay sesión válida (ausente o expirada por `exp`, RN-AUTH-06), el sistema MUST redirigir a `/login` **preservando el destino** para retomar la solicitud tras autenticarse.
- El **mecanismo técnico** de reenvío del token al backend (Route Handler de Next, Server Action, BFF, etc.) se decide en la etapa de **diseño**; esta spec solo fija el comportamiento observable y la garantía de seguridad.

### REQ-05 — Mapeo de respuesta 201 a UX (éxito)

Ante HTTP 201 con `ContratacionResponseDto` (`{ id, ubicacion, prestadorId, clienteId, fecha, franja, descripcion, estado: 'solicitada', createdAt, … }`): el sistema MUST confirmar al cliente que la solicitud fue enviada y queda en estado *solicitada*, visible para el prestador. La confirmación MUST comunicar el próximo paso (el prestador responderá con propuesta/aceptación/rechazo). El formulario MUST quedar bloqueado tras el éxito (no reenvío). El destino post-éxito MUST ser una vista coherente con el flujo; dado que la bandeja de solicitudes es MI-09.3 (fuera de alcance), por ahora el sistema MUST mostrar feedback de éxito (toast `role="status"`) y devolver al cliente al perfil del prestador o a una pantalla de confirmación, **sin** depender de la bandeja todavía inexistente. *(Decisión de aterrizaje exacto: ver Decisiones abiertas.)*

### REQ-06 — Mapeo de 401 (sesión inválida) a redirección a login

Ante HTTP 401 (token ausente, inválido o expirado en el momento del envío), el sistema MUST tratar al usuario como sin sesión: redirigir a `/login` preservando el destino para retomar la solicitud tras reautenticarse (consistente con REQ-04). MUST NOT mostrar el 401 como error técnico ni perder los datos del formulario más allá de lo que la reautenticación permita retomar.

### REQ-07 — Mapeo de 403 (rol no cliente)

Ante HTTP 403 (el usuario autenticado no tiene rol `cliente`), el sistema MUST mostrar un mensaje claro de que solo los clientes pueden solicitar contrataciones, sin exponer detalles técnicos. Este caso debe ser **prevenido en cliente** por REQ-01 (el CTA está oculto/deshabilitado para prestadores); el manejo del 403 es la defensa de último recurso.

### REQ-08 — Mapeo de 404 (prestador inexistente o inactivo)

Ante HTTP 404 ("Prestador not found or not available"), el sistema MUST informar que el prestador ya no está disponible para recibir solicitudes (pudo darse de baja o quedar inactivo entre la apertura del perfil y el envío), con un CTA para volver a la búsqueda (`/prestadores`). MUST NOT presentarlo como error técnico.

### REQ-09 — Mapeo de 409 (franja ya no disponible) — caso esperado por concurrencia

El HTTP 409 ("The selected time slot is no longer available. Please choose another.") es un **resultado esperado por concurrencia** (RF-4.2: la franja fue tomada por otra contratación o el prestador la quitó entre la selección y el envío). El sistema MUST mostrar un mensaje **accionable** (no un error genérico) que invite a elegir otra franja, MUST conservar el resto de los datos del formulario (ubicación, fecha, descripción) y MUST permitir reseleccionar la franja y reintentar sin recargar la página. El sistema MUST NOT tratar este caso como fallo del sistema.

### REQ-10 — Mapeo de 422 (fecha pasada) y 400 (validación de campos)

Ante HTTP 422 ("The date must be today or a future date"), el sistema MUST mostrar el error inline bajo el campo Fecha en español; este caso debe estar prevenido por REQ-03 (validación cliente), por lo que el 422 es la red de seguridad. Ante HTTP 400 (validación de campos: alguno vacío/ausente o `prestadorId` no UUID), el sistema MUST mapear el error al campo afectado en español; si no mapea a un campo, MUST mostrarlo en un resumen con `role="alert"` y mover el foco a él. En ambos casos el formulario retiene los valores ingresados y el botón vuelve al estado default.

### REQ-11 — Manejo de errores de red y servidor (5xx / sin conexión)

Ante fallo de red o respuesta 5xx, el sistema MUST mostrar un mensaje no técnico ("No pudimos enviar tu solicitud. Revisá tu conexión e intentá de nuevo.") en banner `role="alert"`, conservar los datos del formulario y permitir reintento. MUST NOT exponer trazas ni detalles internos.

### REQ-12 — Estado de envío y prevención de doble submit

Durante el `fetch` en curso, el botón "Enviar solicitud" entra en estado `loading` (spinner + texto, ancho estable, `aria-busy="true"`) y los campos quedan en `aria-disabled`. No puede dispararse una segunda solicitud hasta recibir respuesta (previene contrataciones duplicadas por doble clic). Tras una respuesta de error reintentable (409, 400, 422, 5xx) el botón vuelve al estado default; tras 201 queda bloqueado (REQ-05).

### REQ-13 — Accesibilidad WCAG 2.1 AA

Cumple DESIGN-SYSTEM §8: cada campo con `<label>` visible asociado y `aria-required="true"`; el date picker MUST ser operable por teclado y tener una alternativa de entrada accesible (no depender solo del calendario visual); campos con error con `aria-invalid` + `aria-describedby`; banner de error global con `role="alert"` (assertive); feedback de éxito con `role="status"` (polite); gestión de foco: al abrir el formulario el foco entra en el primer campo, ante error el foco va al primer campo afectado o al resumen; foco visible (`focus-visible`, ring 2px + offset 2px); orden de tabulación lógico; targets táctiles ≥44×44px; inputs `font-size ≥16px` (evita zoom iOS); contraste ≥4.5:1 en claro/oscuro; `lang="es-AR"` en el documento raíz; el mensaje del CTA deshabilitado para prestador (REQ-01) MUST ser perceptible por lectores de pantalla (no solo color/estado visual).

### REQ-14 — Compatibilidad, responsive y flujo (RNF-A.2 / RNF-A.3)

El formulario MUST funcionar sin errores críticos en Chrome, Firefox y Safari (últimas 2 versiones, desktop + móvil Android/iOS). Layout responsive (DESIGN-SYSTEM §4.7 / §5.4). La solicitud de contratación MUST mantenerse dentro del presupuesto de ≤5 pasos del flujo completo de contratación: desde el perfil, el formulario MUST resolverse en una pantalla/paso de captura (más el login intercalado solo si la sesión no existía).

---

## Escenarios

### ESC-UI-01 — Solicitud exitosa de un cliente autenticado (201 → confirmación)

**Satisface:** UC07 flujo básico (pasos 1–7), RF-6.1, REQ-01, REQ-02, REQ-04, REQ-05

```
Dado   un cliente autenticado (rol cliente, sesión válida) en el perfil /prestadores/[id]
Cuando acciona "Solicitar", completa ubicación, fecha (hoy o futuro), franja y descripción,
       y hace clic en "Enviar solicitud"
Entonces
  - el botón entra en estado loading (`aria-busy="true"`) y se previene el doble envío
  - la solicitud se realiza de forma autenticada (el token NO es accesible al JS del cliente;
    el body NO incluye clienteId — lo deriva el backend del token)
  - el backend responde 201 con ContratacionResponseDto { estado: 'solicitada', … }
  - la UI confirma el envío (toast `role="status"`) e indica que el prestador responderá
  - el formulario queda bloqueado (no reenvío) y el cliente vuelve al perfil o a una pantalla
    de confirmación
```

### ESC-UI-02 — CTA según sesión y rol (anónimo → login; prestador → oculto/deshabilitado)

**Satisface:** UC07 precondición (autenticado), REQ-01, REQ-04, REQ-07

```
Dado   un visitante anónimo en /prestadores/[id]
Cuando acciona el CTA "Solicitar"
Entonces es redirigido a /login preservando el destino, para retomar la solicitud tras autenticarse

Dado   un usuario autenticado con rol prestador en /prestadores/[id]
Cuando observa el perfil
Entonces el CTA "Solicitar" está oculto o deshabilitado con explicación accesible
         (un prestador no puede contratar); NO puede abrir el formulario (previene el 403)
```

### ESC-UI-03 — Validación cliente: campos faltantes o fecha pasada bloquean el submit

**Satisface:** UC07 flujo alternativo 4.1, RF-6.1, REQ-03, REQ-10

```
Dado   un cliente autenticado en el formulario de solicitud
Cuando deja vacío ubicación, franja o descripción, o elige una fecha anterior a hoy,
       e intenta hacer clic en "Enviar solicitud"
Entonces
  - el submit se bloquea en cliente (NO se realiza ninguna solicitud HTTP)
  - cada campo afectado muestra borde `error`, ErrorText en es-AR, `aria-invalid="true"`
    y `aria-describedby` al id del error
  - el date picker impide o marca fechas pasadas (mínimo = hoy), previniendo el 422
  - el foco se mueve al primer campo con error
```

### ESC-UI-04 — Franja ya no disponible (409) — caso esperado por concurrencia

**Satisface:** UC07 flujo alternativo 5.1, RF-4.2, REQ-09, REQ-12

```
Dado   un cliente autenticado que envió una solicitud con una franja seleccionada
Cuando el backend responde HTTP 409
       "The selected time slot is no longer available. Please choose another."
       (la franja fue tomada por otra contratación o el prestador la quitó)
Entonces
  - se muestra un mensaje accionable (NO error genérico):
    "Esa franja ya no está disponible. Elegí otra franja para tu solicitud."
  - se conservan ubicación, fecha y descripción ya ingresadas
  - el cliente puede reseleccionar la franja y reintentar sin recargar la página
  - el botón vuelve al estado default
```

### ESC-UI-05 — Prestador inexistente o inactivo (404)

**Satisface:** REQ-08

```
Dado   un cliente autenticado que envía la solicitud
Cuando el backend responde HTTP 404 "Prestador not found or not available"
       (el prestador se dio de baja o quedó inactivo entre abrir el perfil y enviar)
Entonces
  - se muestra "Este prestador ya no está disponible para recibir solicitudes."
    con CTA "Volver a la búsqueda" (hacia /prestadores)
  - NO se presenta como error técnico
```

### ESC-UI-06 — Sesión expirada al enviar (401) redirige a login preservando el destino

**Satisface:** RN-AUTH-06, REQ-04, REQ-06

```
Dado   un cliente cuya sesión expiró (claim exp vencido) sobre el formulario de solicitud
Cuando hace clic en "Enviar solicitud" y el backend responde HTTP 401
Entonces
  - el usuario es tratado como sin sesión y redirigido a /login preservando el destino
  - tras un login exitoso, retoma el flujo de solicitud sobre el mismo prestador
  - el token nunca fue accesible al JS del cliente
```

### ESC-UI-07 — Error de red / servidor

**Satisface:** REQ-11, REQ-12

```
Dado   un cliente autenticado que envía la solicitud
Cuando ocurre un fallo de red o el backend responde 5xx
Entonces
  - aparece un banner (`role="alert"`):
    "No pudimos enviar tu solicitud. Revisá tu conexión e intentá de nuevo."
  - los datos del formulario se conservan y se permite reintentar
  - no se exponen trazas ni detalles internos
```

---

## Catálogo de mensajes (es-AR)

| Situación | Mensaje |
|---|---|
| ubicación faltante (cliente/400) | "Ingresá la ubicación del trabajo." |
| franja faltante (cliente/400) | "Elegí una franja horaria." |
| descripción faltante (cliente/400) | "Contanos qué necesitás resolver." |
| fecha faltante (cliente) | "Elegí una fecha." |
| fecha pasada (cliente/422) | "La fecha debe ser hoy o una fecha futura." |
| CTA para anónimo | "Iniciá sesión para solicitar a este prestador." |
| CTA deshabilitado para prestador (403) | "Solo los clientes pueden solicitar una contratación." |
| éxito 201 | "¡Solicitud enviada! El prestador la recibirá y te responderá con una propuesta." |
| franja ya no disponible (409) | "Esa franja ya no está disponible. Elegí otra franja para tu solicitud." |
| prestador no disponible (404) | "Este prestador ya no está disponible para recibir solicitudes. Volvé a la búsqueda." |
| sesión expirada (401) | (sin mensaje de error: redirige a /login y retoma el flujo) |
| red / 5xx | "No pudimos enviar tu solicitud. Revisá tu conexión e intentá de nuevo." |

---

## Trazabilidad al contrato backend

| Endpoint | Respuesta | Requisito/Escenario UI |
|---|---|---|
| `POST /contrataciones` (auth, rol cliente) | 201 `ContratacionResponseDto` `{ estado: 'solicitada' }` | REQ-05 / ESC-UI-01 |
| `POST /contrataciones` | 401 sin auth / token inválido o expirado | REQ-04, REQ-06 / ESC-UI-06 |
| `POST /contrataciones` | 403 usuario no es rol cliente | REQ-01, REQ-07 / ESC-UI-02 (prevenido en cliente) |
| `POST /contrataciones` | 404 "Prestador not found or not available" | REQ-08 / ESC-UI-05 |
| `POST /contrataciones` | 409 "The selected time slot is no longer available…" | REQ-09 / ESC-UI-04 |
| `POST /contrataciones` | 422 "The date must be today or a future date" | REQ-03, REQ-10 / ESC-UI-03 (prevenido en cliente) |
| `POST /contrataciones` | 400 validación de campos | REQ-03, REQ-10 / ESC-UI-03 |
| `POST /contrataciones` | red / 5xx | REQ-11 / ESC-UI-07 |

---

## Reglas de negocio (UI) aplicables

- **RF-6.1** — la solicitud exige ubicación, prestador, fecha, franja y descripción; sin esos campos no se envía (reflejado como validación cliente REQ-03 + mapeo 400 REQ-10).
- **RF-4.2** — la reserva de franja evita duplicación; el intento sobre una franja ya tomada se refleja como 409 accionable en la UI (REQ-09).
- **Precondición UC07** — el actor debe estar autenticado y con rol cliente; la UI gobierna el CTA y la llamada por sesión+rol (REQ-01, REQ-04).
- **RN-AUTH-06** — la sesión es válida hasta el vencimiento del claim `exp`; al expirar, el cliente es tratado como sin sesión (REQ-06).
- **RNF-S (confidencialidad/seguridad)** — el token de sesión nunca se expone al JS del cliente; la llamada autenticada se resuelve server-side (mecanismo, en diseño) (REQ-04).

---

## Fuera de alcance

- **Bandeja / listado de solicitudes del cliente (MI-09.3):** esta WI confirma el envío pero NO implementa la vista de seguimiento; el destino post-201 no depende de ella (REQ-05).
- **Respuesta del prestador — aceptar / proponer / rechazar (UC08, MI-08.2):** otra WI; esta spec solo toca el estado `solicitada`.
- **Máquina de estados de la contratación (UC09):** lógica de transiciones del backend; no se gestiona en esta UI.
- **Cancelación de la contratación (UC10) y pago (RF-7):** fuera de este work item.
- **Mensajería entre las partes (RF-5):** otro caso de uso.
- **Reserva de franja, validación de disponibilidad y creación de la contratación:** lógica del backend UC07 (ya implementada y verificada); la UI solo consume el endpoint.
- **Decisión del mecanismo de reenvío del token** (Route Handler de Next vs. Server Action vs. BFF): se difiere a la etapa de **diseño**; esta spec fija el comportamiento observable y la garantía de seguridad (REQ-04).
- **Emisión/firma/validación de JWT y derivación de `clienteId`:** responsabilidad del backend UC02/UC07.
