# Delta for Contratacion

## ADDED Requirements

### Requirement: Prestador Reachable Lifecycle Actions

The system MUST surface `iniciar`, `finalizar`, and `cancelar` actions for the prestador from a UI surface reachable within the prestador's existing hiring workflow (e.g., bandeja "Activas"), for contrataciones where the prestador is authorized per the existing backend state machine.

#### Scenario: ESC-15 — Prestador inicia (confirmada → en_curso)

- GIVEN a prestador viewing an assigned contratación in estado `confirmada`
- WHEN they select the reachable "Iniciar" action
- THEN the UI invokes the existing `iniciar` API method
- AND on success the contratación reflects estado `en_curso`

#### Scenario: ESC-16 — Prestador finaliza (en_curso → finalizada)

- GIVEN a prestador viewing an assigned contratación in estado `en_curso`
- WHEN they select the reachable "Finalizar" action
- THEN the UI invokes the existing `finalizar` API method
- AND on success the contratación reflects estado `finalizada`

#### Scenario: ESC-17 — Prestador cancela desde confirmada (parity con cliente)

- GIVEN a prestador viewing a non-terminal contratación (e.g., `confirmada`) as a participant
- WHEN they select "Cancelar"
- THEN the UI invokes the existing `cancelar` API method
- AND on success the contratación reflects estado `cancelada`

#### Scenario: ESC-18 — Prestador cancela desde en_curso

- GIVEN a prestador viewing an assigned contratación in estado `en_curso`
- WHEN they select "Cancelar"
- THEN the UI invokes the existing `cancelar` API method and reflects `cancelada` on success

### Requirement: Action Visibility Strictly Gated by Role and Estado

The system MUST render each lifecycle action only for the (role, estado) pair the backend authorizes, and MUST NOT render any lifecycle action for a terminal estado (`finalizada`, `cancelada`) or for an unauthorized role/estado combination.

#### Scenario: ESC-19 — Sin acciones en finalizada

- GIVEN a prestador viewing a contratación in estado `finalizada`
- WHEN the action area renders
- THEN no lifecycle action button is displayed

#### Scenario: ESC-20 — Sin acciones en cancelada

- GIVEN a prestador viewing a contratación in estado `cancelada`
- WHEN the action area renders
- THEN no lifecycle action button is displayed

#### Scenario: ESC-21 — Intento no autorizado manejado con gracia

- GIVEN the backend rejects an action with 403 or 404 (prestador not the assigned participant, or role mismatch)
- WHEN the response is received
- THEN the UI shows an intelligible error and does not apply the transition optimistically

### Requirement: No Backend Change — Existing Endpoints Consumed As-Is

The system MUST consume the existing `iniciar`, `finalizar`, and `cancelar` methods in `client/lib/api/contrataciones.ts` without modifying server routes, request/response contracts, or authorization rules.

#### Scenario: ESC-22 — La acción de UI usa el contrato de endpoint existente

- GIVEN a prestador triggers iniciar/finalizar/cancelar from the new reachable surface
- WHEN the request is sent
- THEN it matches the existing endpoint, method, and payload already used by the seguimiento component
- AND no new server route or authorization rule is introduced

### Requirement: Double-Submit Guard

The system MUST prevent a second submission of the same lifecycle action while a prior request for that action is in flight.

#### Scenario: ESC-23 — Doble click emite una sola request

- GIVEN a prestador triggers "Iniciar" on a contratación
- WHEN they click the same action again before the first request resolves
- THEN only one request is sent and the control shows a disabled/pending state until resolution

### Requirement: Stale Estado Handling

IF the backend rejects a transition because the contratación's estado changed since the UI last fetched it (HTTP 409), THEN the UI MUST refetch the contratación, re-render only the actions valid for the corrected estado, and inform the prestador the action could not be applied.

#### Scenario: ESC-24 — Estado obsoleto corregido tras 409

- GIVEN a prestador's UI shows a contratación as `confirmada` (stale) while the backend estado already changed (e.g., cancelled by the cliente)
- WHEN the prestador triggers "Iniciar" and the backend returns 409
- THEN the UI refetches and re-renders actions matching the current estado

### Requirement: Cliente Flow Unchanged

The existing cliente-facing seguimiento actions (`acciones-contratacion.tsx`) MUST continue to render and behave identically for the cliente after this change.

#### Scenario: ESC-25 — Cliente seguimiento sin cambios (regresión)

- GIVEN a cliente viewing their contratación in seguimiento
- WHEN the prestador-side changes above are deployed
- THEN the cliente sees the same available actions and behavior as before the change

## MODIFIED Requirements

None.

## REMOVED Requirements

None.

## RENAMED Requirements

None.
