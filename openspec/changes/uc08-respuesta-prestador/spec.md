# Spec — MI-08.2 Respuesta del prestador a solicitudes (UC08) — full-stack

**Trazabilidad:** UC08 Responder solicitud / Gestionar solicitudes recibidas · RF-6.2 (el prestador puede responder presupuestando o rechazando) · RF-6.3 (la propuesta exige fecha, franja y precio estimado) · RU-P (el prestador podrá ver y responder las solicitudes que recibió) · RN-CON-07/08/09/10 (solo el prestador destino responde; estado `solicitada`; propuesta requiere fecha≥hoy, franja, precio>0; rechazo sin campos) · RN-AUTH-06 (sesión válida por `exp`) · RNF-A.1 (>85% completitud al 1er intento) · RNF-A.2 (Chrome/Firefox/Safari últimas 2 versiones desktop+móvil) · RNF-S.1/S.4 (el token de sesión nunca se expone al cliente). Contrato backend de acciones: `POST /contrataciones/:id/proposal` y `POST /contrataciones/:id/reject` (ya implementados, verificados, requieren auth rol PRESTADOR). Endpoint de listado `GET /contrataciones` (auth): **NUEVO, lo agrega esta WI**.

---

## Propósito

Esta WI **full-stack** implementa el flujo de **respuesta del prestador** de UC08. Tiene dos partes: (a) un **endpoint backend NUEVO de listado** `GET /contrataciones` que devuelve, para el usuario autenticado, las contrataciones donde participa —para un PRESTADOR, aquellas donde es el prestador asignado—, filtrable por estado; y (b) la **UI de bandeja y respuesta del prestador** en el cliente Next.js (`client/`), que consume ese listado y los endpoints de acción ya construidos (`proposal`/`reject`). Un prestador logueado ve las solicitudes que recibió (estado `solicitada` como pendientes) con los datos de cada una, y sobre cada solicitud puede **presupuestar** (enviar propuesta con precio estimado + fecha/franja → `presupuestada`) o **rechazar** (→ `cancelada`). El alcance cubre: el requisito observable del endpoint de listado (qué ve, filtros, orden, aislamiento por usuario), la UI de bandeja con estados loading/empty/error, los forms de presupuestar y rechazar, el mapeo de respuestas (200, 400, 403, 404, 409, 422, red/5xx) a UX en es-AR, y la garantía de **llamada autenticada sin exponer el token**. Esta WI solo toca transiciones `solicitada → presupuestada | cancelada`.

---

## Alcance

**En alcance:**
- **Endpoint NUEVO `GET /contrataciones`** (auth): bandeja del usuario logueado; para un PRESTADOR devuelve sus contrataciones recibidas, filtrable por estado (ej. `?estado=solicitada`), ordenadas por fecha de creación, con **aislamiento por usuario** (REQ-01).
- **Bandeja del prestador** (ruta protegida, ej. `/cuenta/solicitudes`; ubicación exacta = decisión de diseño): lista de solicitudes recibidas con datos por ítem (cliente, ubicación, fecha/franja pedida, descripción) y badge de estado; estados loading / vacío / error (REQ-02, REQ-03).
- **Acción presupuestar**: form (precio estimado, confirmar/ajustar fecha y franja) → 200 → ítem pasa a `presupuestada` (REQ-04, REQ-05).
- **Acción rechazar**: confirmación → 200 → ítem pasa a `cancelada` (REQ-06).
- **Validación cliente** previa al envío de la propuesta (precio>0, fecha≥hoy, franja no vacía) para prevenir 422/400 evitables (REQ-07).
- **Llamada autenticada** sin exponer el token; sesión expirada → `/login` (REQ-08).
- **Mapeo completo de respuestas**: 200, 401, 403, 404, 409, 422, 400, red/5xx (REQ-05 a REQ-12).
- **Aislamiento en UI**: el prestador solo ve y actúa sobre SUS solicitudes (REQ-01, REQ-13).
- **a11y y badges semánticos** (REQ-14, REQ-15).

**Fuera de alcance:** ver sección final. **Explícito:** la confirmación del cliente, la vista de seguimiento del cliente y las transiciones posteriores (`confirmada`/`en_curso`/`finalizada`) son **MI-09.3** (reusará este mismo `GET /contrataciones` desde la perspectiva del CLIENTE — dependencia anotada). La máquina de estados es **UC09**. El shape exacto del response/paginación del endpoint y la ruta de la bandeja son decisión de **diseño**.

---

## Requisitos

### REQ-01 — Endpoint NUEVO `GET /contrataciones`: bandeja del usuario autenticado (backend)

El sistema **MUST** exponer un endpoint autenticado `GET /contrataciones` que devuelva las contrataciones en las que **participa el usuario logueado**. Para un usuario con rol PRESTADOR, **MUST** devolver únicamente las contrataciones cuyo `prestadorId` coincide con el usuario autenticado (**aislamiento por usuario**). El endpoint:

- **MUST** soportar filtrar por estado (ej. `?estado=solicitada` para la bandeja de pendientes); los valores aceptados pertenecen a `'solicitada'|'presupuestada'|'confirmada'|'cancelada'|'en_curso'|'finalizada'`.
- **MUST** devolver los resultados ordenados por fecha de creación (orden por defecto = más recientes primero, salvo decisión de diseño en contrario).
- **MUST NOT** devolver contrataciones de otros prestadores ni filtrables por `prestadorId` arbitrario tomado del request: el destinatario se deriva siempre del token, nunca del input del cliente.
- Cada ítem **MUST** exponer, como mínimo, los datos que la bandeja necesita renderizar: identificador, cliente, ubicación, fecha y franja pedidas, descripción, estado y fecha de creación (consistentes con `ContratacionResponseDto`).

Sin sesión válida → 401. El **shape exacto del response, la paginación y la representación del cliente** (id vs. datos legibles) son decisión de **diseño**; esta spec fija el comportamiento observable. *(Dependencia: MI-09.3 reusa este endpoint desde la perspectiva del CLIENTE — fuera de alcance acá.)*

### REQ-02 — Bandeja del prestador: ruta protegida y listado de solicitudes recibidas

La UI **MUST** ofrecer una ruta protegida (ej. `/cuenta/solicitudes`; ubicación exacta = diseño) accesible solo a un PRESTADOR autenticado, que consuma `GET /contrataciones?estado=solicitada` y liste las solicitudes pendientes. Cada ítem **MUST** mostrar de forma legible: cliente, ubicación, fecha y franja pedidas, y descripción del problema, además de un **badge de estado** (REQ-15). Un usuario no autenticado que acceda a la ruta **MUST** ser redirigido a `/login` preservando el destino; un usuario autenticado sin rol PRESTADOR **MUST NOT** ver la bandeja del prestador.

### REQ-03 — Estados de la bandeja: loading, vacío y error

La bandeja **MUST** representar explícitamente sus tres estados de carga: **loading** (skeleton/indicador mientras resuelve el `GET`, `aria-busy="true"`), **vacío** (sin solicitudes pendientes → mensaje claro de bandeja vacía, no error), y **error** (fallo de red/5xx al listar → banner `role="alert"` con opción de reintentar). El estado vacío **MUST NOT** presentarse como error.

### REQ-04 — Acción presupuestar: campos del formulario y origen del `id`

El form de presupuestar, abierto desde un ítem en estado `solicitada`, presenta los campos mapeados a `SendProposalDto`:

| Campo UI | Campo backend | Obligatorio | Origen / validación cliente |
|---|---|---|---|
| Precio estimado | `precioEstimado` | Sí | Número **> 0**; previene 422 |
| Fecha propuesta | `fecha` | Sí | Date picker; ISO date; **hoy o futuro** (≥ fecha actual); previene 422 |
| Franja propuesta | `franja` | Sí | Selección/texto no vacío |
| (Contratación) | `:id` | Sí (no editable) | Tomado del contexto del ítem de la bandeja; NO es campo editable |

El `id` de la contratación **MUST** provenir del ítem seleccionado en la bandeja, no de input libre del usuario. El form **MAY** prellenar fecha y franja con las pedidas por el cliente para que el prestador confirme o ajuste.

### REQ-05 — Mapeo de 200 (propuesta enviada) a UX (éxito)

Ante HTTP 200 de `POST /contrataciones/:id/proposal` con `ContratacionResponseDto` (`{ estado: 'presupuestada', precioEstimado, fechaPropuesta, franjaPropuesta, … }`): el sistema **MUST** confirmar que la propuesta fue enviada y que la solicitud quedó en estado **`presupuestada`**, e indicar el próximo paso (el cliente revisará y confirmará o no). El ítem en la bandeja **MUST** reflejar el nuevo estado (badge `Presupuestada`) sin requerir recarga manual, y el form **MUST** quedar bloqueado tras el éxito (no reenvío).

### REQ-06 — Acción rechazar y mapeo de 200 a UX

El sistema **MUST** permitir rechazar una solicitud en estado `solicitada` mediante una **confirmación explícita** (el rechazo no requiere campos: `POST /contrataciones/:id/reject` sin body). Ante HTTP 200, el sistema **MUST** confirmar que la solicitud fue rechazada y reflejar el ítem en estado **`cancelada`** (badge `Cancelada`). La confirmación **MUST** prevenir rechazos accidentales (paso de confirmación antes de ejecutar).

### REQ-07 — Validación cliente previa al envío de la propuesta

El sistema **MUST** bloquear el submit de la propuesta en cliente (sin solicitud HTTP) cuando el precio estimado no sea > 0, la fecha sea anterior a hoy, o la franja esté vacía. En ese caso **MUST** mostrar error inline en cada campo afectado (borde `error`, `aria-invalid="true"`, `aria-describedby` al id del error) y mover el foco al primer campo con error. Esto previene el 422 (precio ≤ 0 / fecha pasada) y el 400 del backend; **complementa, nunca reemplaza** la validación del servidor.

### REQ-08 — Llamada autenticada sin exponer el token (requisito de seguridad)

Tanto el listado como las acciones **MUST** realizarse de forma **autenticada**: el backend identifica al prestador a partir de su sesión (no se envía identidad en el body; se deriva del token). El requisito de seguridad observable:

- El token de sesión **MUST NOT** ser accesible ni legible por el JavaScript del cliente (se preserva la cookie httpOnly del precedente UC02/UC07).
- Solo un prestador con sesión válida puede listar y actuar. Si no hay sesión válida (ausente o expirada por `exp`, RN-AUTH-06), el sistema **MUST** redirigir a `/login` preservando el destino.
- El **mecanismo técnico** de reenvío del token al backend (capa server-side BFF / Route Handler de Next, patrón `backendFetch` de MI-07.2) se decide en **diseño**; esta spec fija el comportamiento observable y la garantía de seguridad.

### REQ-09 — Mapeo de 403 (rol no prestador)

Ante HTTP 403 ("Only prestadores can send proposals" / "Only prestadores can reject requests"), el sistema **MUST** mostrar un mensaje claro de que solo los prestadores pueden responder solicitudes, sin exponer detalles técnicos. Este caso debe estar **prevenido en cliente** por REQ-02 (la bandeja del prestador no se muestra a otros roles); el manejo del 403 es la defensa de último recurso.

### REQ-10 — Mapeo de 404 (contratación inexistente o ajena) — aislamiento

Ante HTTP 404 ("Contratación not found"), el sistema **MUST** informar que la solicitud ya no está disponible y **MUST** refrescar la bandeja. El backend devuelve 404 tanto si la contratación no existe como si **no pertenece al prestador logueado** (oculta su existencia): la UI **MUST NOT** distinguir ambos casos ni permitir actuar sobre solicitudes ajenas (REQ-13). MUST NOT presentarse como error técnico.

### REQ-11 — Mapeo de 409 (estado ya no es `solicitada`) — caso esperado por concurrencia

El HTTP 409 ("Contratación is not in a state that accepts proposals") es un **resultado esperado por concurrencia**: entre que la bandeja se cargó y el prestador respondió, el estado cambió (el cliente canceló, otra pestaña del prestador ya respondió, etc.). El sistema **MUST** mostrar un mensaje **accionable** (no error genérico) que explique que la solicitud ya no puede responderse porque su estado cambió, y **MUST refrescar** el ítem/bandeja para reflejar el estado actual. **MUST NOT** tratar este caso como fallo del sistema.

### REQ-12 — Mapeo de 422 / 400 (validación de la propuesta) y errores de red/5xx

Ante HTTP 422 ("The proposal date must be today or a future date" / "The estimated price must be greater than zero"), el sistema **MUST** mostrar el error inline bajo el campo afectado en es-AR; este caso debe estar prevenido por REQ-07. Ante HTTP 400 (validación: campo faltante/vacío), el sistema **MUST** mapear el error al campo afectado o, si no mapea, mostrarlo en un resumen `role="alert"`. Ante fallo de red o 5xx, el sistema **MUST** mostrar un mensaje no técnico, conservar los datos del form y permitir reintentar, sin exponer trazas. En todos los casos reintentables el form retiene los valores y el botón vuelve al estado default.

### REQ-13 — Aislamiento del prestador (UI)

La UI **MUST** garantizar que el prestador solo ve y actúa sobre SUS solicitudes: la bandeja se nutre exclusivamente de `GET /contrataciones` (que el backend filtra por el token), y la UI **MUST NOT** ofrecer ningún mecanismo para listar o accionar contrataciones por `prestadorId` ajeno. El 404 del backend sobre contrataciones ajenas (REQ-10) es la defensa de último recurso.

### REQ-14 — Estado de envío, prevención de doble submit y accesibilidad

Durante el `fetch` de presupuestar o rechazar, el botón entra en estado `loading` (spinner + texto, ancho estable, `aria-busy="true"`) y no puede dispararse una segunda solicitud hasta recibir respuesta (previene doble respuesta). El form de propuesta cumple DESIGN-SYSTEM §8: cada campo con `<label>` visible y `aria-required="true"`; date picker operable por teclado con alternativa accesible; campos con error con `aria-invalid` + `aria-describedby`; banner de error con `role="alert"`; éxito con `role="status"`; gestión de foco (al abrir, al primer error); foco visible; targets ≥44×44px; inputs `font-size ≥16px`; contraste ≥4.5:1 claro/oscuro; `lang="es-AR"`. La lista de la bandeja **MUST** ser navegable por teclado y sus ítems/acciones accesibles por lector de pantalla.

### REQ-15 — Badges de estado semánticos (texto + color, WCAG 1.4.1)

Cada ítem **MUST** mostrar un **badge de estado** con **texto** ("Solicitada", "Presupuestada", "Cancelada", …) además del color, para no depender solo del color (WCAG 1.4.1). Los colores **MUST** usar los tokens de estado de DESIGN-SYSTEM §estado: `solicitada` = info (`--color-state-solicitada`), `presupuestada` = warning (`--color-state-presupuestada`), `cancelada` = error (`--color-state-cancelada`), con contraste ≥4.5:1 en claro y oscuro (los pares verificados están en DESIGN-SYSTEM).

---

## Escenarios

### ESC-UI-01 — El prestador ve su bandeja de solicitudes recibidas (GET → lista)

**Satisface:** UC08 flujo básico, RF-6.2, REQ-01, REQ-02, REQ-13

```
Dado   un prestador autenticado (rol prestador, sesión válida) en /cuenta/solicitudes
Cuando la UI consume GET /contrataciones?estado=solicitada de forma autenticada
Entonces
  - durante la carga se muestra el estado loading (`aria-busy="true"`)
  - el backend devuelve SOLO las contrataciones cuyo prestadorId = usuario logueado,
    en estado solicitada, ordenadas por fecha de creación
  - cada ítem muestra cliente, ubicación, fecha/franja pedidas, descripción y badge "Solicitada"
  - el token NO es accesible al JS del cliente
```

### ESC-UI-02 — Presupuestar con éxito (200 → presupuestada)

**Satisface:** RF-6.3, RN-CON-09, REQ-04, REQ-05, REQ-07, REQ-08

```
Dado   un prestador autenticado con una solicitud en estado solicitada en su bandeja
Cuando abre presupuestar, ingresa precio > 0, fecha (hoy o futuro) y franja, y confirma
Entonces
  - el botón entra en loading (`aria-busy="true"`) y se previene el doble envío
  - POST /contrataciones/:id/proposal se realiza autenticado y responde 200
    con ContratacionResponseDto { estado: 'presupuestada', precioEstimado, … }
  - la UI confirma (`role="status"`) y el ítem pasa a badge "Presupuestada" sin recarga manual
  - el form queda bloqueado (no reenvío)
```

### ESC-UI-03 — Rechazar con éxito (confirmación → 200 → cancelada)

**Satisface:** RF-6.2, RN-CON-10, REQ-06

```
Dado   un prestador autenticado con una solicitud en estado solicitada
Cuando selecciona rechazar y confirma en el paso de confirmación
Entonces
  - POST /contrataciones/:id/reject (sin body) se realiza autenticado y responde 200
  - la UI confirma el rechazo y el ítem pasa a badge "Cancelada"
  - la acción exige confirmación previa (previene rechazo accidental)
```

### ESC-UI-04 — Estado cambió por concurrencia (409 → mensaje accionable + refresco)

**Satisface:** RN-CON-08, REQ-11

```
Dado   un prestador que abrió la bandeja y va a responder una solicitud
Cuando el backend responde HTTP 409 "Contratación is not in a state that accepts proposals"
       (el cliente canceló u otra pestaña ya respondió entre la carga y el envío)
Entonces
  - se muestra un mensaje accionable (NO error genérico): la solicitud ya no puede responderse
    porque su estado cambió
  - la bandeja/ítem se refresca para reflejar el estado actual
  - NO se trata como fallo del sistema
```

### ESC-UI-05 — Validación cliente: precio ≤ 0, fecha pasada o franja vacía bloquean el submit

**Satisface:** RN-CON-09, REQ-07, REQ-12

```
Dado   un prestador autenticado en el form de presupuestar
Cuando ingresa precio ≤ 0, una fecha anterior a hoy, o deja la franja vacía, y envía
Entonces
  - el submit se bloquea en cliente (NO se realiza ninguna solicitud HTTP)
  - cada campo afectado muestra borde `error`, ErrorText es-AR, `aria-invalid="true"`
    y `aria-describedby` al id del error
  - el date picker impide o marca fechas pasadas (mínimo = hoy), previniendo el 422
  - el foco se mueve al primer campo con error
```

### ESC-UI-06 — Aislamiento: el prestador no ve ni actúa sobre solicitudes ajenas (404)

**Satisface:** RN-CON-07, REQ-01, REQ-10, REQ-13

```
Dado   un prestador autenticado
Cuando la bandeja se nutre de GET /contrataciones (filtrado por su token)
Entonces solo aparecen sus propias contrataciones; NO hay forma en la UI de listar
         o accionar por prestadorId ajeno

Dado   un intento de responder una contratación que no es del prestador logueado
Cuando el backend responde HTTP 404 "Contratación not found" (oculta su existencia)
Entonces la UI informa que la solicitud ya no está disponible y refresca la bandeja,
         sin distinguir "inexistente" de "ajena" y sin error técnico
```

### ESC-UI-07 — Bandeja vacía y error de listado

**Satisface:** REQ-03

```
Dado   un prestador autenticado sin solicitudes pendientes
Cuando GET /contrataciones?estado=solicitada devuelve una lista vacía
Entonces se muestra un estado vacío claro ("No tenés solicitudes pendientes"), NO un error

Dado   un fallo de red o respuesta 5xx al listar la bandeja
Cuando la UI no puede obtener las solicitudes
Entonces se muestra un banner `role="alert"` con opción de reintentar, sin exponer trazas
```

### ESC-UI-08 — Sesión expirada (401) redirige a login preservando el destino

**Satisface:** RN-AUTH-06, REQ-08

```
Dado   un prestador cuya sesión expiró (claim exp vencido) sobre la bandeja o un form
Cuando lista o envía una respuesta y el backend responde HTTP 401
Entonces
  - el usuario es tratado como sin sesión y redirigido a /login preservando el destino
  - tras un login exitoso retoma la bandeja
  - el token nunca fue accesible al JS del cliente
```

---

## Catálogo de mensajes (es-AR)

| Situación | Mensaje |
|---|---|
| precio inválido (cliente/422) | "El precio estimado debe ser mayor a cero." |
| fecha pasada (cliente/422) | "La fecha de la propuesta debe ser hoy o una fecha futura." |
| franja faltante (cliente) | "Elegí una franja horaria para la propuesta." |
| éxito presupuestar (200) | "¡Propuesta enviada! El cliente la revisará y te confirmará." |
| éxito rechazar (200) | "Rechazaste la solicitud. El cliente fue notificado." |
| confirmación antes de rechazar | "¿Seguro que querés rechazar esta solicitud? No se puede deshacer." |
| estado cambió por concurrencia (409) | "Esta solicitud ya no se puede responder porque su estado cambió. Actualizamos tu bandeja." |
| contratación no disponible / ajena (404) | "Esta solicitud ya no está disponible." |
| rol no prestador (403) | "Solo los prestadores pueden responder solicitudes." |
| bandeja vacía | "No tenés solicitudes pendientes por ahora." |
| error al listar / red / 5xx | "No pudimos cargar tus solicitudes. Revisá tu conexión e intentá de nuevo." |
| error al responder / red / 5xx | "No pudimos enviar tu respuesta. Revisá tu conexión e intentá de nuevo." |
| sesión expirada (401) | (sin mensaje de error: redirige a /login y retoma la bandeja) |

---

## Trazabilidad al contrato backend

| Endpoint | Respuesta | Requisito/Escenario UI |
|---|---|---|
| `GET /contrataciones` (auth) — **NUEVO** | 200 lista de contrataciones del usuario (prestador → las suyas; filtro `?estado=`) | REQ-01, REQ-02, REQ-13 / ESC-UI-01, ESC-UI-06 |
| `GET /contrataciones` | 401 sin auth / token inválido o expirado | REQ-08 / ESC-UI-08 |
| `GET /contrataciones` | lista vacía / red / 5xx | REQ-03 / ESC-UI-07 |
| `POST /contrataciones/:id/proposal` (auth, rol prestador) | 200 `ContratacionResponseDto` `{ estado: 'presupuestada' }` | REQ-05 / ESC-UI-02 |
| `POST /contrataciones/:id/proposal` | 403 "Only prestadores can send proposals" | REQ-09 / (prevenido por REQ-02) |
| `POST /contrataciones/:id/proposal` | 404 "Contratación not found" (inexistente o ajena) | REQ-10, REQ-13 / ESC-UI-06 |
| `POST /contrataciones/:id/proposal` | 409 "Contratación is not in a state that accepts proposals" | REQ-11 / ESC-UI-04 |
| `POST /contrataciones/:id/proposal` | 422 "…date must be today or a future date" / "…price must be greater than zero" | REQ-07, REQ-12 / ESC-UI-05 (prevenido en cliente) |
| `POST /contrataciones/:id/proposal` | 400 validación de campos | REQ-12 / ESC-UI-05 |
| `POST /contrataciones/:id/reject` (auth, rol prestador) | 200 `{ estado: 'cancelada' }` | REQ-06 / ESC-UI-03 |
| `POST /contrataciones/:id/reject` | 403 "Only prestadores can reject requests" | REQ-09 / (prevenido por REQ-02) |
| `POST /contrataciones/:id/reject` | 404 / 409 | REQ-10, REQ-11 / ESC-UI-04, ESC-UI-06 |
| cualquiera (auth) | red / 5xx | REQ-12 / ESC-UI-07 |

---

## Reglas de negocio aplicables

- **RN-CON-07** — solo el **prestador destino** (`prestadorId`) puede responder; el listado y las acciones se filtran por el token; sobre contrataciones ajenas el backend responde 404 (REQ-01, REQ-10, REQ-13).
- **RN-CON-08** — la contratación **DEBE** estar en `solicitada` para responder; si cambió → 409 accionable (REQ-11).
- **RN-CON-09** — la propuesta requiere fecha ≥ hoy, franja y precio estimado > 0 (validación cliente REQ-07 + mapeo 422 REQ-12).
- **RN-CON-10** — el rechazo no requiere campos; se procesa con la sola intención confirmada (REQ-06).
- **RN-AUTH-06** — la sesión es válida hasta el vencimiento del claim `exp`; al expirar, el prestador es tratado como sin sesión (REQ-08).
- **RNF-S (confidencialidad/seguridad)** — el token de sesión nunca se expone al JS del cliente; la llamada autenticada se resuelve server-side vía el patrón `backendFetch`/BFF de MI-07.2 (mecanismo en diseño) (REQ-08).

---

## Fuera de alcance

- **Confirmación/aceptación del cliente y vista de seguimiento del cliente (MI-09.3):** otra WI; reusará `GET /contrataciones` desde la perspectiva del CLIENTE. Esta spec solo cubre la perspectiva del PRESTADOR.
- **Transiciones posteriores (`confirmada`/`en_curso`/`finalizada`):** UC09/MI-09.3; esta WI solo toca `solicitada → presupuestada | cancelada`.
- **Máquina de estados de la contratación (UC09):** lógica de transiciones del backend; UC08 solo invoca la transición.
- **Notificación al cliente (UC19):** disparada desde UC09; fuera de esta WI.
- **Modificación de una propuesta ya enviada:** no contemplada en esta WI.
- **Validación de agenda contra la fecha/franja propuesta (UC06):** fuera de alcance.
- **Decisión del shape exacto del response/paginación de `GET /contrataciones` y de la ruta de la bandeja:** se difiere a **diseño**; esta spec fija el comportamiento observable.
- **Decisión del mecanismo de reenvío del token** (BFF / Route Handler / Server Action): se difiere a **diseño** (REQ-08).
- **Emisión/firma/validación de JWT y derivación de la identidad del prestador:** responsabilidad del backend UC02.
