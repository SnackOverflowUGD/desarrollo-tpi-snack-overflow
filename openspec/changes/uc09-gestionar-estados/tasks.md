# UC09: Gestionar estados de la contratación — Tasks

> Implementation tasks for the state machine module.

## New files (5)

- [x] 1. Create `server/src/state-machine/domain/state-change-history.entity.ts` — TypeORM entity
- [x] 2. Create `server/src/state-machine/domain/invalid-transition.error.ts` — Custom error
- [x] 3. Create `server/src/state-machine/application/state-machine.service.ts` — Core UC09 service
- [x] 4. Create `server/src/state-machine/application/state-machine.service.spec.ts` — Unit tests
- [x] 5. Create `server/src/state-machine/state-machine.module.ts` — NestJS module

## Modified files (3)

- [x] 6. Modify `server/src/contratacion/domain/contratacion-estado.enum.ts` — Rename `ACEPTADA` → `CONFIRMADA`, remove `RECHAZADA`
- [x] 7. Modify `server/src/contratacion/contratacion.module.ts` — Remove `StubStateMachine`, import `StateMachineModule`
- [x] 8. Modify `server/src/app.module.ts` — Add `StateMachineModule` + `StateChangeHistory` entity

## Support files

- [x] Create `server/src/state-machine/ports/notifier.port.ts` — `NOTIFIER` token + `INotifier` interface
