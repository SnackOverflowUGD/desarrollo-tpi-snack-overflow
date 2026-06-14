# Spec — MI-09.3 UI gestión y seguimiento de contrataciones (UC09) — full-stack

**Trazabilidad:** UC09 Gestionar estados de la contratación · UC21 (el cliente acepta/rechaza la propuesta → `confirmada`/`cancelada`) · UC20 (el prestador registra el inicio efectivo del trabajo → `en_curso`) · UC13 (el prestador confirma la finalización del servicio → `finalizada`) · UC10 (cancelación por cliente o prestador conforme a política → `cancelada`) · RF-6.6 (cancelación de la contratación), RF-6.7 (historial de cambios de estado), RF-6.8 (registro de inicio del trabajo), RF-6.9 (confirmación/rechazo de la propuesta por el cliente), RF-7.2 (confirmación de finalización del servicio) · RU-C (el cliente podrá hacer seguimiento del estado de sus contrataciones), RU-P (el prestador podrá gestionar el avance de sus trabajos) · RN-SM-01..05 (máquina de estados: matriz, terminales, historial inmutable, notificación best-effort, estado inicial) · RN-CON-07 (aislamiento por participante) · RN-AUTH-06 (sesión válida por `exp`) · RNF-A.1 (>85% completitud al 1er intento), RNF-A.2 (Chrome/Firefox/Safari últimas 2 versiones desktop+móvil) · RNF-S.1/S.4 (el token de sesión nunca se expone al cliente). Contrato backend existente que esta WI reusa: `GET /contrataciones` (auth, role-aware, ya construido en MI-08.2). Contrato backend **NUEVO** que esta WI agrega: las transiciones de estado `POST /contrataciones/:id/{confirm,start,finish,cancel}` (verbos/rutas exactas = decisión de diseño).

---

## Propósito

Esta WI **full-stack** cierra el ciclo de vida de la contratación de UC09. Tiene dos partes: (a) los **endpoints backend NUEVOS de transición de estado** que faltan —confirmar, iniciar, finalizar y cancelar— que delegan en la máquina de estados ya construida (UC09) para validar la transición y registrar historial; y (b) la **UI de seguimiento y gestión** en el cliente Next.js (`client/`), donde tanto el **CLIENTE** como el **PRESTADOR** ven el estado de TODAS sus contrataciones y ejecutan las transiciones disponibles según su rol y el estado actual.

La vista de seguimiento reusa el endpoint role-aware `GET /contrataciones` ya existente (MI-08.2): para el cliente devuelve sus solicitudes y su progreso; para el prestador, sus trabajos confirmados / en curso / finalizados (complementa la bandeja de pendientes de UC08). Sobre cada contratación, la UI ofrece **acciones contextuales** que dependen del estado actual + el rol: el cliente confirma o rechaza una propuesta `presupuestada`; el prestador inicia un trabajo `confirmada` y finaliza uno `en_curso`; ambos pueden cancelar donde la política lo permita. La spec fija: el requisito observable de cada endpoint de transición (quién, desde qué estado, qué pasa), la UI de seguimiento con estados loading/empty/error, las acciones contextuales y sus confirmaciones, la línea de tiempo del historial, el mapeo de respuestas (200, 401, 403, 404, 409, red/5xx) a UX en es-AR, los badges de estado semánticos, y la garantía de **llamada autenticada sin exponer el token**. La calificación post-finalización, los pagos y las notificaciones quedan **fuera de alcance**.

---

## Alcance

**En alcance:**
- **Endpoints NUEVOS de transición de estado** (auth), uno por transición disparable desde la UI, que invocan la máquina de estados de UC09 (valida + registra historial):
  - **Confirmar** propuesta (cliente, `presupuestada → confirmada`) (REQ-01).
  - **Iniciar** trabajo (prestador, `confirmada → en_curso`) (REQ-02).
  - **Finalizar** servicio (prestador, `en_curso → finalizada`) (REQ-03).
  - **Cancelar** contratación (cliente o prestador participante, estado activo `→ cancelada`) (REQ-04).
- **Vista de seguimiento** (ruta protegida, ej. `/cuenta/contrataciones`; ubicación exacta = diseño) que consume `GET /contrataciones` role-aware: lista todas las contrataciones del usuario con su estado actual, agrupable/filtrable por estado, con badge de estado y "próximo paso" (REQ-05, REQ-06, REQ-13).
- **Acciones contextuales por estado y rol**: la UI calcula y muestra solo las acciones permitidas para el (rol, estado actual) de cada contratación (REQ-07).
- **Detalle / seguimiento de una contratación**: estado actual + **línea de tiempo del historial de estados** (RF-6.7, RN-SM-03), reusando el historial que ya registra la máquina de estados (REQ-08).
- **Confirmación de acciones destructivas/irreversibles** (cancelar, finalizar) antes de ejecutar (REQ-09).
- **Llamada autenticada** sin exponer el token; sesión expirada → `/login` (REQ-10).
- **Mapeo completo de respuestas** de las transiciones: 200, 401, 403, 404 (aislamiento), 409 (transición inválida / estado cambió), red/5xx (REQ-11, REQ-12).
- **Aislamiento por participante** en UI y backend: solo el cliente y el prestador de la contratación la ven y accionan; terceros reciben 404 (REQ-13).
- **a11y y badges de estado semánticos** para los 6 estados (REQ-14, REQ-15).

**Fuera de alcance:** ver sección final. **Explícito:** la **calificación/reseña post-finalización** (UC de calificación), los **pagos** (RF-7 / UC07), y las **notificaciones** (UC19, disparadas por la máquina de estados como best-effort) NO se implementan acá. Las transiciones de entrada `solicitada → presupuestada | cancelada` (presupuestar/rechazar del prestador) ya están en **UC08/MI-08.2** y NO se re-especifican. La **lógica interna** de la máquina de estados (matriz, validación, historial) es **UC09** ya construido; esta WI solo expone los endpoints que la invocan y los consume desde la UI. El **shape exacto de los endpoints (verbo HTTP, ruta, body), la política concreta de cancelación por estado, las rutas de la UI y si el historial vive en una vista de detalle dedicada o inline** son decisiones de **diseño**.

---

## Requisitos

### REQ-01 — Endpoint NUEVO Confirmar propuesta (cliente, `presupuestada → confirmada`)

El sistema **MUST** exponer un endpoint autenticado que permita al **cliente dueño** de una contratación en estado `presupuestada` confirmar la propuesta, transicionándola a `confirmada` (RF-6.9, UC21). Sugerencia: `POST /contrataciones/:id/confirm` (verbo/ruta exactos = diseño). El endpoint:

- **MUST** requerir sesión válida; sin ella → 401.
- **MUST** permitir la acción **solo al cliente participante** (`clienteId` derivado del token); si la contratación no existe o pertenece a otro usuario → **404** (oculta su existencia, RN-CON-07).
- **MUST** exigir que el estado actual sea `presupuestada`; si no lo es (ya confirmada, cancelada, etc.) la máquina de estados rechaza la transición → **409** (RN-SM-01).
- En éxito **MUST** delegar en la máquina de estados de UC09, que persiste `confirmada` y registra el cambio en el historial (RN-SM-03), y **MUST** devolver la contratación con `estado: 'confirmada'`.

### REQ-02 — Endpoint NUEVO Iniciar trabajo (prestador, `confirmada → en_curso`)

El sistema **MUST** exponer un endpoint autenticado que permita al **prestador dueño** de una contratación en estado `confirmada` registrar el inicio efectivo del trabajo, transicionándola a `en_curso` (RF-6.8, UC20). Sugerencia: `POST /contrataciones/:id/start`. Reglas equivalentes a REQ-01: 401 sin sesión; **solo el prestador participante** (`prestadorId` del token), si no es suya → **404**; el estado actual **MUST** ser `confirmada`, si no → **409**; en éxito persiste `en_curso` vía la máquina de estados, registra historial y devuelve `estado: 'en_curso'`.

### REQ-03 — Endpoint NUEVO Finalizar servicio (prestador, `en_curso → finalizada`)

El sistema **MUST** exponer un endpoint autenticado que permita al **prestador dueño** de una contratación en estado `en_curso` confirmar la finalización del servicio, transicionándola a `finalizada` (RF-7.2, UC13). Sugerencia: `POST /contrataciones/:id/finish`. Reglas: 401 sin sesión; **solo el prestador participante**, si no es suya → **404**; el estado actual **MUST** ser `en_curso`, si no → **409**; en éxito persiste `finalizada` (estado terminal, RN-SM-02) vía la máquina de estados, registra historial y devuelve `estado: 'finalizada'`. Por ser irreversible, la UI **MUST** confirmar antes de invocarlo (REQ-09).

### REQ-04 — Endpoint NUEVO Cancelar contratación (cliente o prestador participante, estado activo `→ cancelada`)

El sistema **MUST** exponer un endpoint autenticado que permita **tanto al cliente como al prestador participantes** cancelar una contratación que esté en un **estado activo** (no terminal), transicionándola a `cancelada` (RF-6.6, UC10). Sugerencia: `POST /contrataciones/:id/cancel`. El endpoint:

- **MUST** requerir sesión válida; sin ella → 401.
- **MUST** permitir la acción a **cualquiera de los dos participantes** (cliente o prestador, derivados del token); a un tercero → **404** (RN-CON-07).
- **MUST** respetar los estados **terminales**: una contratación ya `finalizada` o `cancelada` no puede cancelarse; la máquina de estados rechaza la transición → **409** (RN-SM-01, RN-SM-02).
- En éxito persiste `cancelada` (terminal) vía la máquina de estados, registra historial y devuelve `estado: 'cancelada'`. Por ser irreversible, la UI **MUST** confirmar antes de invocarlo (REQ-09).
- La **política concreta** sobre desde qué estados y con qué condiciones cada actor puede cancelar (UC10) se difiere a **diseño**, dentro del marco de la matriz de la máquina de estados.

### REQ-05 — Vista de seguimiento: ruta protegida y listado role-aware

La UI **MUST** ofrecer una ruta protegida (ej. `/cuenta/contrataciones`; ubicación exacta = diseño) accesible solo a un usuario autenticado, que consuma `GET /contrataciones` (role-aware) y liste **todas** las contrataciones donde el usuario participa, con su estado actual. La vista **MUST** adaptarse al rol:

- Para el **CLIENTE**: sus solicitudes y su progreso (solicitada → presupuestada → confirmada → en curso → finalizada / cancelada).
- Para el **PRESTADOR**: sus trabajos en sus distintos estados (confirmados, en curso, finalizados, cancelados), **complementando** la bandeja de pendientes (`solicitada`) de UC08.

El listado **MUST** ser **agrupable o filtrable por estado** (ej. activas vs. terminadas, o por estado puntual vía `?estado=`). Un usuario no autenticado que acceda **MUST** ser redirigido a `/login` preservando el destino. La UI **MUST NOT** exponer ningún mecanismo para listar contrataciones por `clienteId`/`prestadorId` ajeno (REQ-13).

### REQ-06 — Cada ítem muestra estado, datos y "próximo paso"

Cada ítem de la lista **MUST** mostrar de forma legible: la contraparte (para el cliente, el prestador/oficio; para el prestador, el cliente), ubicación, fecha y franja, precio estimado si ya está `presupuestada` o posterior, un **badge de estado** (REQ-15) y un texto de **"próximo paso"** que explica qué significa el estado y qué acción se espera (DESIGN-SYSTEM §7.7/§13: el estado explica, no solo etiqueta). Ej.: para `presupuestada` del lado del cliente → "El prestador te envió una propuesta. Revisala y confirmá o rechazá."; para `confirmada` del lado del prestador → "Acordado. Cuando arranques el trabajo, registrá el inicio."

### REQ-07 — Acciones contextuales por estado y rol

La UI **MUST** calcular y mostrar, para cada contratación, **solo** las acciones permitidas según el par (rol del usuario, estado actual), espejando la matriz de la máquina de estados:

| Rol | Estado actual | Acciones que la UI MUST ofrecer |
|---|---|---|
| Cliente | `presupuestada` | **Confirmar** (→ confirmada, REQ-01), **Rechazar** (→ cancelada, vía cancelar REQ-04 / UC21), **Cancelar** según política |
| Cliente | `solicitada` / `confirmada` / `en_curso` | **Cancelar** según política (REQ-04) |
| Prestador | `confirmada` | **Iniciar** (→ en_curso, REQ-02), **Cancelar** según política |
| Prestador | `en_curso` | **Finalizar** (→ finalizada, REQ-03), **Cancelar** según política |
| Ambos | `finalizada` / `cancelada` | **ninguna acción de transición** (estados terminales, RN-SM-02) — solo lectura/historial |

La UI **MUST NOT** ofrecer acciones que el (rol, estado) no permita (defensa en profundidad: aunque el backend devuelva 403/409, la UI las previene). La disponibilidad exacta de "Cancelar" por estado y rol depende de la política de UC10 (diseño), dentro de la matriz.

### REQ-08 — Detalle de seguimiento y línea de tiempo del historial

La UI **MUST** permitir ver, para una contratación, su **estado actual** y la **línea de tiempo de su historial de estados** (RF-6.7): la secuencia de cambios `estadoAnterior → estadoNuevo` con su `timestamp`, en orden cronológico, reusando el historial inmutable que la máquina de estados ya registra (RN-SM-03). El historial **MUST** ser legible para el participante (cliente o prestador). Si el detalle vive en una **vista dedicada** (ej. `/cuenta/contrataciones/[id]`) o **inline/expandible** en la lista es decisión de **diseño**; la spec exige que el historial sea consultable y comprensible para el usuario.

### REQ-09 — Confirmación de acciones destructivas o irreversibles

Las acciones **irreversibles** —**Finalizar** (REQ-03), **Cancelar** y **Rechazar** (REQ-04)— **MUST** exigir un **paso de confirmación explícito** antes de ejecutarse, que comunique que la acción no se puede deshacer (estados terminales). Las acciones no destructivas (**Confirmar**, **Iniciar**) **MAY** ejecutarse sin confirmación adicional. El diálogo de confirmación **MUST** ser accesible (foco atrapado, cierre por teclado, `role="dialog"`/`aria-modal`).

### REQ-10 — Llamada autenticada sin exponer el token (requisito de seguridad)

Tanto el listado como las acciones de transición **MUST** realizarse de forma **autenticada**: el backend identifica al participante a partir de su sesión (no se envía identidad en el body; se deriva del token). El requisito observable:

- El token de sesión **MUST NOT** ser accesible ni legible por el JavaScript del cliente (se preserva la cookie httpOnly del precedente UC02/UC07).
- Solo un participante con sesión válida puede listar y accionar. Si no hay sesión válida (ausente o expirada por `exp`, RN-AUTH-06), el sistema **MUST** redirigir a `/login` preservando el destino.
- El **mecanismo técnico** de reenvío del token al backend (capa server-side BFF / Route Handler de Next, patrón `backendFetch` de MI-07.2/MI-08.2) se decide en **diseño**; esta spec fija el comportamiento observable y la garantía de seguridad.

### REQ-11 — Mapeo de éxito (200) y refresco optimista del estado

Ante HTTP 200 de cualquier endpoint de transición, con la contratación en su nuevo estado, el sistema **MUST**: confirmar la acción con feedback (`role="status"`) en es-AR indicando el nuevo estado y el próximo paso; actualizar el badge y las acciones contextuales del ítem **sin requerir recarga manual** (recalcula las acciones según el nuevo estado); y deshabilitar/retirar la acción ya ejecutada. Durante el `fetch` el botón entra en `loading` (`aria-busy="true"`) y **MUST** prevenir el doble disparo.

### REQ-12 — Mapeo de 409 (transición inválida / estado cambió por concurrencia)

El HTTP 409 es un **resultado esperado**: la máquina de estados rechazó la transición porque el estado actual no la admite (RN-SM-01) — típicamente porque el estado **cambió desde otra pestaña o por el otro actor** entre que la vista cargó y se accionó (ej. el cliente confirma una propuesta que el prestador ya canceló). El sistema **MUST** mostrar un mensaje **accionable** (no error genérico) explicando que la acción ya no es posible porque el estado cambió, y **MUST refrescar** el ítem/lista para reflejar el estado actual. **MUST NOT** tratarse como fallo del sistema.

### REQ-13 — Aislamiento por participante (UI + backend)

El sistema **MUST** garantizar que **solo el cliente y el prestador** de una contratación la ven y accionan. El listado se nutre exclusivamente de `GET /contrataciones` (filtrado por el token); la UI **MUST NOT** ofrecer mecanismo para listar o accionar contrataciones ajenas. Ante un intento (directo) de transicionar una contratación que no es del usuario, el backend **MUST** responder **404** (oculta su existencia, sin distinguir "inexistente" de "ajena"); la UI **MUST** tratarlo informando que ya no está disponible y refrescando, sin error técnico (RN-CON-07).

### REQ-14 — Accesibilidad WCAG 2.1 AA (lista, detalle, confirmaciones)

La lista, el detalle/historial y los diálogos de confirmación cumplen DESIGN-SYSTEM §8: lista navegable por teclado con ítems y acciones accesibles por lector de pantalla; botones de acción con texto (no solo ícono) y target ≥44×44px; estado `loading` con `aria-busy="true"`; banner de error con `role="alert"`; éxito con `role="status"`; diálogo de confirmación con `role="dialog"`, `aria-modal="true"`, foco atrapado y restaurado al cerrar, cierre por teclado; línea de tiempo del historial perceptible por lector de pantalla (no depender solo de orden visual); foco visible; contraste ≥4.5:1 en claro/oscuro; `lang="es-AR"`.

### REQ-15 — Badges de estado semánticos (texto + color, WCAG 1.4.1)

Cada ítem y el detalle **MUST** mostrar un **badge de estado** con **texto** además del color, para no depender solo del color (WCAG 1.4.1). Los 6 estados **MUST** usar los tokens de DESIGN-SYSTEM §estado, con contraste verificado ≥4.5:1 en claro y oscuro:

| Estado | Label es-AR | Token | Semántica |
|---|---|---|---|
| `solicitada` | "Solicitada" | `--color-state-solicitada` (info) | Esperando respuesta del prestador |
| `presupuestada` | "Presupuestada" | `--color-state-presupuestada` (warning) | Hay propuesta; requiere acción del cliente |
| `confirmada` | "Confirmada" | `--color-state-confirmada` (success) | Acordada, agendada |
| `en_curso` | "En curso" | `--color-state-encurso` (primary) | Trabajo en ejecución |
| `finalizada` | "Finalizada" | `--color-state-finalizada` (muted) | Terminal exitoso |
| `cancelada` | "Cancelada" | `--color-state-cancelada` (error) | Terminal negativo |

---

## Escenarios

### ESC-UI-01 — Seguimiento role-aware: el cliente ve el estado de todas sus contrataciones

**Satisface:** UC09, RU-C, REQ-05, REQ-06, REQ-13, REQ-15

```
Dado   un cliente autenticado (sesión válida) en /cuenta/contrataciones
Cuando la UI consume GET /contrataciones (role-aware) de forma autenticada
Entonces
  - durante la carga se muestra el estado loading (`aria-busy="true"`)
  - se listan SOLO las contrataciones donde el usuario es el cliente (aislamiento por token)
  - cada ítem muestra prestador/oficio, ubicación, fecha/franja, precio si aplica,
    el badge de estado correcto (Solicitada/Presupuestada/Confirmada/En curso/Finalizada/Cancelada)
    y el texto de "próximo paso"
  - la lista es agrupable/filtrable por estado
  - el token NO es accesible al JS del cliente
```

### ESC-UI-02 — El prestador ve sus trabajos confirmados / en curso / finalizados

**Satisface:** UC09, RU-P, REQ-05, REQ-07

```
Dado   un prestador autenticado en /cuenta/contrataciones
Cuando la UI consume GET /contrataciones (role-aware)
Entonces
  - se listan SOLO las contrataciones donde el usuario es el prestador
  - los estados confirmada/en_curso/finalizada/cancelada se muestran con su badge,
    complementando la bandeja de pendientes (solicitada) de UC08
  - cada ítem ofrece solo las acciones permitidas por su (rol prestador, estado actual)
```

### ESC-UI-03 — El cliente confirma una propuesta (200 → confirmada)

**Satisface:** RF-6.9, UC21, REQ-01, REQ-07, REQ-11

```
Dado   un cliente autenticado con una contratación en estado presupuestada
Cuando acciona "Confirmar" sobre esa contratación
Entonces
  - el botón entra en loading (`aria-busy="true"`) y se previene el doble disparo
  - POST /contrataciones/:id/confirm se realiza autenticado y responde 200
    con la contratación en estado 'confirmada'
  - la máquina de estados registró el cambio en el historial
  - la UI confirma (`role="status"`), el badge pasa a "Confirmada" y se recalculan
    las acciones (ya no aparece "Confirmar") sin recarga manual
```

### ESC-UI-04 — El prestador inicia el trabajo (200 → en_curso)

**Satisface:** RF-6.8, UC20, REQ-02, REQ-07, REQ-11

```
Dado   un prestador autenticado con una contratación en estado confirmada
Cuando acciona "Iniciar"
Entonces
  - POST /contrataciones/:id/start se realiza autenticado y responde 200 con estado 'en_curso'
  - el historial registra confirmada → en_curso
  - el badge pasa a "En curso" y la acción disponible pasa a "Finalizar"
```

### ESC-UI-05 — El prestador finaliza el servicio con confirmación (200 → finalizada)

**Satisface:** RF-7.2, UC13, REQ-03, REQ-09, REQ-11

```
Dado   un prestador autenticado con una contratación en estado en_curso
Cuando acciona "Finalizar" y confirma en el paso de confirmación (acción irreversible)
Entonces
  - sin la confirmación NO se invoca el endpoint
  - POST /contrataciones/:id/finish se realiza autenticado y responde 200 con estado 'finalizada'
  - el historial registra en_curso → finalizada (estado terminal)
  - el badge pasa a "Finalizada" y NO se ofrecen más acciones de transición
```

### ESC-UI-06 — Cancelar con confirmación, por cliente o prestador (200 → cancelada)

**Satisface:** RF-6.6, UC10, REQ-04, REQ-09, REQ-11

```
Dado   un participante autenticado (cliente o prestador) con una contratación en estado activo
       (no terminal) que la política permite cancelar
Cuando acciona "Cancelar" y confirma en el paso de confirmación (acción irreversible)
Entonces
  - sin la confirmación NO se invoca el endpoint
  - POST /contrataciones/:id/cancel se realiza autenticado y responde 200 con estado 'cancelada'
  - el historial registra <estado anterior> → cancelada (estado terminal)
  - el badge pasa a "Cancelada" y NO se ofrecen más acciones de transición
```

### ESC-UI-07 — Transición inválida / estado cambió por concurrencia (409 → mensaje accionable + refresco)

**Satisface:** RN-SM-01, REQ-12

```
Dado   un participante que abrió el seguimiento y va a accionar una transición
Cuando el backend responde HTTP 409 (la máquina de estados rechazó la transición:
       el estado actual no la admite porque cambió desde otra pestaña o por el otro actor)
Entonces
  - se muestra un mensaje accionable (NO error genérico): la acción ya no es posible
    porque el estado de la contratación cambió
  - el ítem/lista se refresca para reflejar el estado actual
  - NO se trata como fallo del sistema
```

### ESC-UI-08 — Aislamiento: un tercero no ve ni acciona contrataciones ajenas (404)

**Satisface:** RN-CON-07, REQ-13

```
Dado   un usuario autenticado que NO es participante de cierta contratación
Cuando la UI lista (solo aparecen las suyas) o un intento directo de transición ocurre
Entonces
  - la lista NUNCA muestra contrataciones ajenas (filtrado por token)
  - ante un intento directo, el backend responde 404 (oculta su existencia)
  - la UI informa que ya no está disponible y refresca, sin distinguir
    "inexistente" de "ajena" y sin error técnico
```

### ESC-UI-09 — Línea de tiempo del historial de estados

**Satisface:** RF-6.7, RN-SM-03, REQ-08

```
Dado   un participante autenticado viendo el detalle/seguimiento de una contratación
       que atravesó solicitada → presupuestada → confirmada → en_curso → finalizada
Cuando consulta su historial
Entonces
  - se muestra la línea de tiempo de cambios estadoAnterior → estadoNuevo con su timestamp,
    en orden cronológico
  - el historial es legible y perceptible por lector de pantalla
  - el historial es de solo lectura (append-only, inmutable)
```

### ESC-UI-10 — Estados de carga: vacío y error del seguimiento

**Satisface:** REQ-05, REQ-12

```
Dado   un usuario autenticado sin contrataciones
Cuando GET /contrataciones devuelve una lista vacía
Entonces se muestra un estado vacío claro (NO un error)

Dado   un fallo de red o respuesta 5xx al listar
Cuando la UI no puede obtener las contrataciones
Entonces se muestra un banner `role="alert"` con opción de reintentar, sin exponer trazas
```

### ESC-UI-11 — Sesión expirada (401) redirige a login preservando el destino

**Satisface:** RN-AUTH-06, REQ-10

```
Dado   un participante cuya sesión expiró (claim exp vencido) sobre el seguimiento o una acción
Cuando lista o acciona una transición y el backend responde HTTP 401
Entonces
  - el usuario es tratado como sin sesión y redirigido a /login preservando el destino
  - tras un login exitoso retoma el seguimiento
  - el token nunca fue accesible al JS del cliente
```

---

## Catálogo de mensajes (es-AR)

| Situación | Mensaje |
|---|---|
| próximo paso: cliente, presupuestada | "El prestador te envió una propuesta. Revisala y confirmá o rechazá." |
| próximo paso: cliente, confirmada | "Confirmaste la contratación. El prestador registrará el inicio del trabajo." |
| próximo paso: prestador, confirmada | "Acordado. Cuando arranques el trabajo, registrá el inicio." |
| próximo paso: prestador, en_curso | "Trabajo en curso. Cuando termines, confirmá la finalización." |
| próximo paso: finalizada | "Servicio finalizado." |
| próximo paso: cancelada | "Esta contratación fue cancelada." |
| éxito confirmar (200) | "¡Listo! Confirmaste la propuesta. El prestador va a iniciar el trabajo." |
| éxito iniciar (200) | "Registraste el inicio del trabajo. La contratación está en curso." |
| éxito finalizar (200) | "Confirmaste la finalización del servicio. ¡Gracias!" |
| éxito cancelar (200) | "Cancelaste la contratación." |
| confirmación antes de finalizar | "¿Confirmás que el servicio finalizó? No se puede deshacer." |
| confirmación antes de cancelar | "¿Seguro que querés cancelar esta contratación? No se puede deshacer." |
| transición inválida / estado cambió (409) | "Esta acción ya no es posible porque el estado de la contratación cambió. Actualizamos tu vista." |
| contratación no disponible / ajena (404) | "Esta contratación ya no está disponible." |
| rol/acción no permitida (403) | "No tenés permiso para realizar esta acción sobre la contratación." |
| seguimiento vacío | "Todavía no tenés contrataciones." |
| error al listar / red / 5xx | "No pudimos cargar tus contrataciones. Revisá tu conexión e intentá de nuevo." |
| error al accionar / red / 5xx | "No pudimos completar la acción. Revisá tu conexión e intentá de nuevo." |
| sesión expirada (401) | (sin mensaje de error: redirige a /login y retoma el seguimiento) |

---

## Trazabilidad: transición → endpoint → requisito → escenario

| Transición | Actor | Endpoint (sugerido, ruta/verbo = diseño) | Respuesta | Requisito / Escenario |
|---|---|---|---|---|
| `presupuestada → confirmada` | Cliente | `POST /contrataciones/:id/confirm` | 200 estado `confirmada` | REQ-01, REQ-07, REQ-11 / ESC-UI-03 |
| `confirmada → en_curso` | Prestador | `POST /contrataciones/:id/start` | 200 estado `en_curso` | REQ-02, REQ-07, REQ-11 / ESC-UI-04 |
| `en_curso → finalizada` | Prestador | `POST /contrataciones/:id/finish` | 200 estado `finalizada` | REQ-03, REQ-09, REQ-11 / ESC-UI-05 |
| activo `→ cancelada` | Cliente o Prestador | `POST /contrataciones/:id/cancel` | 200 estado `cancelada` | REQ-04, REQ-09, REQ-11 / ESC-UI-06 |
| (cualquiera) | — | endpoint de transición | 401 sin auth / token inválido o expirado | REQ-10 / ESC-UI-11 |
| (cualquiera) | tercero no participante | endpoint de transición | 404 (inexistente o ajena, oculta existencia) | REQ-13 / ESC-UI-08 |
| (transición no admitida por el estado actual) | participante | endpoint de transición | 409 (máquina de estados rechaza, RN-SM-01) | REQ-12 / ESC-UI-07 |
| (cualquiera) | participante | endpoint de transición | red / 5xx | REQ-12, REQ-14 / ESC-UI-10 |
| listado | participante | `GET /contrataciones` (auth, role-aware, **existente** MI-08.2) | 200 lista del usuario / vacío / 5xx | REQ-05, REQ-06, REQ-13 / ESC-UI-01, ESC-UI-02, ESC-UI-10 |
| historial | participante | consulta de historial por `contratacionId` (RF-6.7) | 200 secuencia de cambios | REQ-08 / ESC-UI-09 |

---

## Reglas de negocio aplicables

- **RN-SM-01** — toda transición **DEBE** ser válida según la matriz de la máquina de estados; una transición no admitida por el estado actual → 409 accionable en UI (REQ-12, ESC-UI-07).
- **RN-SM-02** — `finalizada` y `cancelada` son **terminales**: no admiten transiciones; la UI no ofrece acciones sobre ellas y el backend rechaza con 409 (REQ-03, REQ-04, REQ-07).
- **RN-SM-03** — el historial es **append-only e inmutable** y consultable por `contratacionId`; sostiene la línea de tiempo (REQ-08, ESC-UI-09).
- **RN-SM-04** — la notificación (UC19) post-transición es **best-effort**: no bloquea la transición ni el éxito de la acción; su implementación está fuera de alcance (ver Fuera de alcance).
- **RN-SM-05** — el estado inicial siempre es `solicitada` (fijado por UC07); esta WI parte de transiciones desde estados posteriores.
- **RN-CON-07** — solo el **cliente y el prestador participantes** ven y accionan la contratación; el listado se filtra por el token y las acciones sobre contrataciones ajenas devuelven 404 (REQ-13, ESC-UI-08).
- **RN-AUTH-06** — la sesión es válida hasta el vencimiento del claim `exp`; al expirar, el usuario es tratado como sin sesión (REQ-10, ESC-UI-11).
- **RNF-S (confidencialidad/seguridad)** — el token de sesión nunca se expone al JS del cliente; la llamada autenticada se resuelve server-side vía el patrón `backendFetch`/BFF de MI-07.2/MI-08.2 (mecanismo en diseño) (REQ-10).

---

## Fuera de alcance

- **Calificación / reseña post-finalización:** otro caso de uso; esta WI cierra el ciclo hasta `finalizada`/`cancelada` pero NO captura calificaciones.
- **Pagos (RF-7 / UC07):** la confirmación de finalización (REQ-03) NO procesa pagos ni libera fondos; fuera de alcance.
- **Notificaciones (UC19):** la máquina de estados invoca la notificación como best-effort (RN-SM-04), pero su implementación/UI no es parte de esta WI.
- **Transiciones de entrada `solicitada → presupuestada | cancelada`** (presupuestar/rechazar del prestador): ya cubiertas por **UC08/MI-08.2**; no se re-especifican.
- **Lógica interna de la máquina de estados** (matriz, validación, registro de historial, renombrado de enum): **UC09** ya construido; esta WI solo expone los endpoints que la invocan.
- **Política concreta de cancelación por estado y rol (UC10):** desde qué estados y con qué condiciones cada actor cancela se difiere a **diseño**, dentro del marco de la matriz.
- **Decisión del shape exacto de los endpoints de transición** (verbo HTTP, ruta, body), de las rutas de la UI, y de si el historial vive en una vista de detalle dedicada o inline: se difiere a **diseño**; esta spec fija el comportamiento observable.
- **Decisión del mecanismo de reenvío del token** (BFF / Route Handler / Server Action): se difiere a **diseño** (REQ-10).
- **Emisión/firma/validación de JWT y derivación de la identidad del participante:** responsabilidad del backend UC02.
