# Delta for Contratación — UC08: Enviar propuesta o rechazar solicitud

> Base: UC07 spec (`openspec/changes/uc07-solicitar-contratacion/specs/contratacion/spec.md`). Agrega comportamiento sin modificar ni eliminar requisitos.

## ADDED Requirements

### Requirement: Solo prestador destino autenticado puede responder

El sistema **DEBE** verificar rol `prestador` en JWT y que el `prestadorId` de la contratación coincida con el usuario autenticado. Si el rol es incorrecto → 403; si el prestadorId no coincide → 404.

#### Scenario: Prestador envía propuesta exitosamente

- GIVEN un prestador autenticado (rol `prestador`) y una contratación en *solicitada* con su prestadorId
- WHEN envía propuesta con fecha, franja y precioEstimado
- THEN el sistema persiste la propuesta, invoca UC09 → *presupuestada*, retorna 200

#### Scenario: Cliente intenta responder

- GIVEN un cliente autenticado
- WHEN intenta responder una contratación
- THEN el sistema rechaza con 403

#### Scenario: Prestador no destino intenta responder

- GIVEN un prestador autenticado cuyo ID no es el prestadorId de la contratación
- WHEN envía propuesta o rechazo
- THEN el sistema rechaza con 404

### Requirement: Contratación debe estar en *solicitada* para responder

El sistema **DEBE** validar que `estado === SOLICITADA`. Si cambió (otro prestador respondió, cliente canceló), UC09 rechaza la transición y el sistema retorna 409.

#### Scenario: Contratación ya no está en solicitada

- GIVEN un prestador autenticado
- WHEN la contratación ya no está en *solicitada* (estado *presupuestada*, *cancelada*, etc.)
- THEN el sistema retorna 409 indicando que la solicitud ya no puede responderse

### Requirement: Propuesta requiere fecha, franja y precioEstimado (RF-6.2, RF-6.3)

#### Scenario: Propuesta exitosa con campos completos

- GIVEN un prestador autenticado y contratación en *solicitada*
- WHEN envía propuesta con fecha ≥ hoy, franja válida, precioEstimado > 0
- THEN el sistema persiste campos, invoca UC09 → *presupuestada*, retorna 200

#### Scenario: precioEstimado faltante o inválido

- GIVEN un prestador autenticado
- WHEN envía propuesta sin precioEstimado, o con valor ≤ 0
- THEN el sistema rechaza con 422; precioEstimado debe ser > 0

#### Scenario: Fecha propuesta en el pasado

- GIVEN un prestador autenticado
- WHEN envía propuesta con fecha anterior a hoy
- THEN el sistema rechaza con 422

### Requirement: Rechazo sin campos adicionales (RF-6.2)

El sistema **DEBE** permitir rechazar una solicitud sin datos extra, invocando UC09 → *cancelada*.

#### Scenario: Rechazo exitoso

- GIVEN un prestador autenticado y contratación en *solicitada*
- WHEN selecciona rechazar sin enviar datos adicionales
- THEN el sistema invoca UC09 → *cancelada*, retorna 200

#### Scenario: Rechazo con campos extra ignorados

- GIVEN un prestador autenticado
- WHEN envía rechazo con campos adicionales (fecha, precio)
- THEN el sistema ignora los campos extra y procesa el rechazo → *cancelada*

## Reglas de negocio (adicionales a UC07)

| ID | Regla |
|----|-------|
| RN-CON-07 | Solo el **prestador destino** (prestadorId) puede responder. |
| RN-CON-08 | Contratación **DEBE** estar en `SOLICITADA` para responder. |
| RN-CON-09 | Propuesta requiere: fecha ≥ hoy, franja, precioEstimado > 0. |
| RN-CON-10 | Rechazo no requiere campos; se procesa con la sola intención. |

## Fuera de alcance

- Notificación al cliente — UC19 (disparada desde UC09).
- Máquina de estados — UC09. UC08 solo invoca `transitionTo`.
- Aceptación por el cliente — UC10.
- Modificación de propuesta enviada.
- Validación de agenda contra fecha/franja propuesta — UC06.
