# Design: UC09 — Gestionar estados de la contratación (State Machine)

## Technical Approach

Centralize all state transition validation and history in a new `state-machine` NestJS module that implements the existing `IContratacionStateMachine` port. Current state is derived from the append-only `StateChangeHistory` table (Option B from D4 analysis) — the first transition has no prior history, so current state defaults to `SOLICITADA`. The module validates against a transition matrix, records every valid change, and invokes a best-effort notification stub. No changes to the port interface (`transitionTo(id, estado)` stays as-is per spec out-of-scope). Enum renaming (`ACEPTADA`→`CONFIRMADA`, remove `RECHAZADA`) is done at the type level.

## Architecture Decisions

### D4: How to determine current state for validation?

| Option | Tradeoff | Resolution |
|--------|----------|------------|
| **A: Pass `fromState` to port** | Breaks port interface — out of scope per spec | ❌ Rejected |
| **B: Read last history record** | First transition (no history) needs special case for initial `SOLICITADA` | ✅ **Chosen** |
| **C: Trust caller (no validation)** | Risk of inconsistent states if caller bugs out | ❌ Rejected |

**Chosen: B** — history is the immutable source of truth. No port changes needed.

### D3: Initial SOLICITADA registration

| Option | Tradeoff | Resolution |
|--------|----------|------------|
| **A: Validate SOLICITADA→SOLICITADA as normal transition** | Matrix doesn't allow self-transitions → would reject creation | ❌ Rejected |
| **B: Skip validation when no history exists + target is SOLICITADA** | Simple, explicit special case | ✅ **Chosen** |

### Port location

| Option | Tradeoff | Resolution |
|--------|----------|------------|
| **A: Keep in `contratacion/ports/`** | Cross-module dependency stays; no import changes needed | ✅ **Chosen** |
| **B: Move to `state-machine/ports/`** | Cleaner ownership but breaks existing imports in `contratacion.service.ts` | ❌ Rejected |

### Notification stub (R4)

| Option | Tradeoff | Resolution |
|--------|----------|------------|
| **A: Define `INotifier` inside state-machine, provide no-op stub** | Self-contained; UC19 integrates later via DI override | ✅ **Chosen** |
| **B: Hard-code log call** | No integration point for UC19 | ❌ Rejected |

## Data Flow

```
Caller (contratacion.service)
  │  1. entity.estado = NUEVO_ESTADO
  │  2. repo.save(entity) → DB has new state
  │  3. stateMachine.transitionTo(id, NUEVO_ESTADO)
  ▼
StateMachineService
  │  4. Read last history record → currentState
  │  5. No history? → currentState = SOLICITADA
  │  6. First regist. + SOLICITADA? → skip validation
  │  7. Validate transition(currentState → NUEVO_ESTADO)
  │     └─ invalid → throw InvalidTransitionError (caller MUST rollback)
  │     └─ valid → continue
  │  8. Save StateChangeHistory { contratacionId, estadoAnterior, estadoNuevo, timestamp }
  │  9. Notify (best-effort, errors swallowed)
  ▼
Done — caller commits or propagates rollback
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `server/src/state-machine/domain/state-change-history.entity.ts` | Create | TypeORM entity: id, contratacionId, estadoAnterior, estadoNuevo, timestamp |
| `server/src/state-machine/domain/invalid-transition.error.ts` | Create | Custom error class extending Error |
| `server/src/state-machine/application/state-machine.service.ts` | Create | Implements `IContratacionStateMachine` — validates matrix, saves history, notifies |
| `server/src/state-machine/application/state-machine.service.spec.ts` | Create | Unit tests with in-memory fakes |
| `server/src/state-machine/state-machine.module.ts` | Create | NestJS module, provides `STATE_MACHINE`, imports `TypeOrmModule.forFeature([StateChangeHistory])` |
| `server/src/contratacion/domain/contratacion-estado.enum.ts` | Modify | `ACEPTADA`→`CONFIRMADA`, remove `RECHAZADA` |
| `server/src/contratacion/contratacion.module.ts` | Modify | Remove `StubStateMachine` class + `STATE_MACHINE` provider; import `StateMachineModule` |
| `server/src/app.module.ts` | Modify | Add `StateMachineModule` to `imports`, `StateChangeHistory` to TypeORM entities array |

## Interfaces / Contracts

### Port (unchanged — kept in `contratacion/ports/state-machine.port.ts`)
```ts
export interface IContratacionStateMachine {
  transitionTo(contratacionId: string, estado: ContratacionEstado): Promise<void>;
}
```

### Transition matrix (internal to `StateMachineService`)
```ts
private readonly TRANSITIONS: Record<ContratacionEstado, ContratacionEstado[]> = {
  [SOLICITADA]:    [PRESUPUESTADA, CANCELADA],
  [PRESUPUESTADA]: [CONFIRMADA, CANCELADA],
  [CONFIRMADA]:    [EN_CURSO, CANCELADA],
  [EN_CURSO]:      [FINALIZADA, CANCELADA],
  [FINALIZADA]:    [],  // terminal
  [CANCELADA]:     [],  // terminal
};
```

### Notification port stub (inside `state-machine/`)
```ts
export const NOTIFIER = 'NOTIFIER';
export interface INotifier {
  notify(params: { contratacionId: string; estadoAnterior: ContratacionEstado; estadoNuevo: ContratacionEstado; timestamp: Date }): Promise<void>;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | All 8 valid transitions | Instantiate service with fake `EntityManager`/repository; assert history saved with correct `estadoAnterior`/`estadoNuevo` |
| Unit | All invalid cross-edges (terminal states + impossible combos) | Assert `InvalidTransitionError` thrown, no history saved |
| Unit | Initial SOLICITADA→SOLICITADA (UC07) | No history → skip validation → record first entry |
| Unit | Notification best-effort (R4) | Stub notifier throws → transition still succeeds, history saved |
| Unit | History ordering | Multiple transitions → assert timestamps ascending |

## Migration / Rollout

**No data migration required.** The rename `ACEPTADA`→`CONFIRMADA` and removal of `RECHAZADA` are type-level changes applied at compile time. TypeORM `synchronize: true` (dev) handles column enum sync. Production requires a manual ALTER TYPE migration before deploy.

## Open Questions

- None — D1–D4 resolved in HITL gate, enum naming finalized, D4 solution selected.
