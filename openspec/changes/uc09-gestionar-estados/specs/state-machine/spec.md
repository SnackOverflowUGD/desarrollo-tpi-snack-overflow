# State Machine Specification

> Nuevo dominio. Fuente de verdad para la máquina de estados de `Contratacion`.

## Propósito

Centraliza y valida todas las transiciones de estado de `Contratacion` aplicando el patrón State.
Recibe solicitudes desde otros casos de uso, admite únicamente transiciones válidas definidas en
la matriz y registra cada cambio en un historial inmutable.

## Resolución de naming

Se resuelven dos discrepancias identificadas en el código existente:

- **`ACEPTADA` → `CONFIRMADA`**: el enum actual usa `ACEPTADA` pero la especificación de negocio
  denomina este estado *confirmada*. Se renombra a `CONFIRMADA` para alinear con el negocio.
- **`RECHAZADA` → eliminado**: `RECHAZADA` existe en el enum pero ninguna transición válida lo
  utiliza (el rechazo de UC08 usa `CANCELADA`). Se elimina por código muerto.

## Transiciones válidas

| Desde \ Hacia  | CONFIRMADA | EN_CURSO | FINALIZADA | CANCELADA   | PRESUPUESTADA |
|----------------|------------|----------|------------|-------------|---------------|
| **SOLICITADA**   | —          | —        | —          | UC08 / UC10 | UC08          |
| **PRESUPUESTADA**| UC21       | —        | —          | UC21 / UC10 | —             |
| **CONFIRMADA**   | —          | UC20     | —          | UC10        | —             |
| **EN_CURSO**     | —          | —        | UC13       | UC10        | —             |
| **FINALIZADA**   | —          | —        | —          | —           | —             |
| **CANCELADA**    | —          | —        | —          | —           | —             |

> `SOLICITADA` es estado inicial fijado por UC07 al crear la contratación. Las transiciones parten
> del estado actual hacia un destino. `FINALIZADA` y `CANCELADA` son terminales: desde ellas no hay
> transiciones válidas.

## Requisitos

### R1: Validar transición y persistir nuevo estado

El sistema **DEBE** validar que la transición (estado actual → estado destino) esté en la
matriz. Si es válida, **DEBE** persistir el nuevo estado en la contratación y registrar el cambio
en `StateChangeHistory`.

#### Escenario: Transición SOLICITADA → PRESUPUESTADA

- GIVEN una contratación en estado *solicitada*
- WHEN se recibe `transitionTo(id, PRESUPUESTADA)`
- THEN la contratación pasa a *presupuestada*
- AND se crea un registro en `StateChangeHistory` con `estadoAnterior`, `estadoNuevo` y `timestamp`

### R2: Rechazar transición inválida

El sistema **DEBE** rechazar toda transición no listada en la matriz lanzando
`InvalidTransitionError`, sin modificar el estado actual ni crear registros en el historial.

#### Escenario: Transición desde estado terminal

- GIVEN una contratación en estado *finalizada*
- WHEN se recibe `transitionTo(id, EN_CURSO)`
- THEN el sistema lanza `InvalidTransitionError`
- AND la contratación permanece en *finalizada*
- AND no se crean registros en `StateChangeHistory`

#### Escenario: Transición desde CANCELADA

- GIVEN una contratación en estado *cancelada*
- WHEN se recibe `transitionTo(id, SOLICITADA)`
- THEN el sistema lanza `InvalidTransitionError`
- AND la contratación permanece en *cancelada*

### R3: Registrar historial inmutable (RF-6.7)

Cada transición válida **DEBE** crear un registro en `StateChangeHistory` con `contratacionId`,
`estadoAnterior`, `estadoNuevo` y `timestamp`. El historial es append-only e inmutable.
**DEBE** ser consultable por `contratacionId` para que cliente y prestador accedan a su
historial completo de cambios.

#### Escenario: Cadena completa de transiciones

- GIVEN una contratación que atraviesa SOLICITADA → PRESUPUESTADA → CONFIRMADA → EN_CURSO → FINALIZADA
- WHEN se consulta el historial por `contratacionId`
- THEN se retornan 4 registros ordenados por `timestamp` ascendente
- AND cada registro contiene `estadoAnterior`, `estadoNuevo` y `timestamp` correctos

### R4: Invocar notificación (stub UC19) post-transición

Tras cada transición válida, el sistema **DEBE** invocar el puerto de notificaciones (UC19).
Si UC19 falla, la transición **NO** debe revertirse — la notificación es best-effort.

#### Escenario: Notificación posterior a transición

- GIVEN una transición válida SOLICITADA → PRESUPUESTADA
- WHEN se aplica la transición exitosamente
- THEN se invoca `INotificationService` con `contratacionId`, `estadoAnterior`, `estadoNuevo` y `timestamp`
- AND la contratación conserva el nuevo estado aunque la notificación falle

## Reglas de negocio

| ID         | Regla                                                                 |
|------------|-----------------------------------------------------------------------|
| RN-SM-01   | Toda transición **DEBE** ser válida según la matriz.                 |
| RN-SM-02   | `FINALIZADA` y `CANCELADA` son estados terminales.                    |
| RN-SM-03   | El historial es append-only e inmutable.                              |
| RN-SM-04   | La notificación (UC19) es best-effort: no bloquea la transición.      |
| RN-SM-05   | El estado inicial **SIEMPRE** es `SOLICITADA`.                        |

## Decisiones abiertas (HITL gate)

| # | Decisión | Propuesta | Alternativa |
|---|----------|-----------|-------------|
| D1 | Renombrar `ACEPTADA` → `CONFIRMADA` | ✅ Renombrar — alinea con negocio. Afecta enum, TypeORM columna, migración. | Mantener `ACEPTADA` y documentar mapping. |
| D2 | Eliminar `RECHAZADA` del enum | ✅ Eliminar — código muerto. Sin impacto. | Mantener por si se necesita en futuro. |
| D3 | La transición `SOLICITADA` → `SOLICITADA` en creación | La state machine registra el estado inicial en historial sin validar transición. | Crear transición "inicial" especial en la matriz. |
| D4 | El caller setea estado ANTES de llamar a UC09 | Esquema actual: caller persiste + llama. UC09 valida post-persistencia. | Mover ownership del estado a UC09: caller no setea, UC09 persiste. |

## Fuera de alcance

- Implementación de UC19 (notificaciones) — permanece como stub.
- Endpoints REST.
- Modificación del puerto `IContratacionStateMachine`.
- Lógica de negocio de UC07, UC08, UC10, UC13, UC20, UC21.
