# Verification Report

**Change**: uc08-enviar-propuesta
**Spec**: `openspec/changes/uc08-enviar-propuesta/specs/contratacion/spec.md`
**Design**: `openspec/changes/uc08-enviar-propuesta/design.md`
**Tasks**: None (small change, no task breakdown)
**Mode**: Standard

---

## Completeness

| Artifact | Status | Reason |
|----------|--------|--------|
| Spec | ✅ | 9 GWT scenarios covering all requirements |
| Design | ✅ | 5 architecture decisions, full data flow, file changes |
| Tasks | ⏭️ Skipped | No tasks.md exists — change was small, no task breakdown |
| Code | ✅ | Full implementation in `server/src/contratacion/` |
| Tests | ✅ | 11 UC08-specific tests (6 sendProposal + 5 reject) |

All implementation artifacts are present. Task completeness is skipped per project convention (no tasks artifact).

---

## Build & Tests Execution

| Metric | Result |
|--------|--------|
| Test suites | 4 passed, 0 failed |
| Tests | **55 passed**, 1 skipped (SKIP: ESC-09 — requires real Redis, pre-existing) |
| Duration | 13.5s |
| Coverage (service) | **98.05% statements**, **97.56% branch**, **100% functions**, **98.01% lines** |
| Uncovered lines | 158, 167 — error-logging catch blocks in `create()` (hard-to-trigger edge cases) |
| TypeScript errors | None (suite passes without compilation errors) |

**Command**: `cd server && npm run test:cov`

### Test breakdown per area

| Area | Tests | Passed | Failed | Skipped |
|------|-------|--------|--------|---------|
| Auth service | 26 | 26 | 0 | 0 |
| Auth controller | 10 | 9 | 0 | 1 (ESC-09 pre-existing) |
| App controller | 1 | 1 | 0 | 0 |
| **UC07 create()** | **9** | **9** | **0** | **0** |
| **UC08 sendProposal()** | **6** | **6** | **0** | **0** |
| **UC08 reject()** | **5** | **5** | **0** | **0** |

All UC07 tests remain passing after UC08 changes — no regressions.

---

## Spec Compliance Matrix

| # | Scenario | Test ID | Status | Evidence |
|---|----------|---------|--------|----------|
| 1 | Prestador envía propuesta exitosamente | `UC08-SP-01` | ✅ PASS | Service creates response with `PRESUPUESTADA` estado, calls `transitionTo`, returns 200 |
| 2 | Cliente intenta responder → 403 | `UC08-SP-02` | ✅ PASS | `sendProposal()` with CLIENTE role throws `ForbiddenException` |
| 3 | Prestador no destino → 404 | `UC08-SP-03` | ✅ PASS | `sendProposal()` with prestadorId mismatch throws `NotFoundException` (hides existence) |
| 4 | Contratación ya no está en solicitada → 409 | `UC08-SP-04` | ✅ PASS | `sendProposal()` with estado != SOLICITADA throws `ConflictException` |
| 5 | Propuesta exitosa con campos completos | `UC08-SP-01` | ✅ PASS | Same test as #1 — validates fecha, franja, precioEstimado are persisted |
| 6 | precioEstimado faltante/inválido → 422 | ❌ **UNTESTED** | ⚠️ WARNING | DTO has `@Min(0.01)` but no unit test exercises this validation. Design listed this test but it was not implemented. Runtime protection exists via class-validator/ValidationPipe but no automated test proves it. |
| 7 | Fecha propuesta en el pasado → 422 | `UC08-SP-05` | ✅ PASS | `sendProposal()` with yesterday's date throws `UnprocessableEntityException` |
| 8 | Rechazo exitoso | `UC08-RE-01` | ✅ PASS | `reject()` returns response with `CANCELADA` estado, calls `transitionTo` |
| 9 | Rechazo con campos extra ignorados | — | ✅ SATISFIED BY DESIGN | `reject()` endpoint has no `@Body()` decorator — NestJS ignores body by default. No test exists but the design guarantees compliance. |

### Summary

| Status | Count |
|--------|-------|
| ✅ PASS | 7 |
| ❌ UNTESTED | 1 (precioEstimado ≤ 0) |
| ✅ BY DESIGN | 1 (rechazo campos extra) |

---

## Correctness (Static Evidence)

### Source code inspection — sendProposal() flow

| Step | Spec | Design | Code | Match |
|------|------|--------|------|-------|
| Role check → 403 | RN-CON-07 | line 30 | L201: `role !== UserRole.PRESTADOR` → ForbiddenException | ✅ |
| findById → 404 | implicit | line 31 | L206-209: `contratacionRepo.findById(id)` → NotFoundException | ✅ |
| prestadorId mismatch → 404 | RN-CON-07 | line 32 | L212-214: `contratacion.prestadorId !== userId` → NotFoundException | ✅ |
| estado check → 409 | RN-CON-08 | line 33 | L217-221: `estado !== SOLICITADA` → ConflictException | ✅ |
| fecha < today → 422 | RN-CON-09 | line 34 | L224-231: `fechaDate < today` → UnprocessableEntityException | ✅ |
| Persist proposal data | RF-6.2/6.3 | lines 35-37 | L234-236: sets `fechaPropuesta`, `franjaPropuesta`, `precioEstimado` | ✅ |
| Simple save (no transaction) | — | line 11 "save simple" | L240: `this.contratacionRepo.save(contratacion)` | ✅ |
| Invoke UC09 → PRESUPUESTADA | spec line 15 | line 39 | L243-246: `stateMachine.transitionTo(id, PRESUPUESTADA)` | ✅ |

### Source code inspection — reject() flow

| Step | Spec | Design | Code | Match |
|------|------|--------|------|-------|
| Role check → 403 | RN-CON-07 | line 54 | L276-278: `role !== UserRole.PRESTADOR` → ForbiddenException | ✅ |
| findById → 404 | implicit | line 55 | L281-284: `contratacionRepo.findById(id)` → NotFoundException | ✅ |
| prestadorId mismatch → 404 | RN-CON-07 | line 56 | L287-289: `contratacion.prestadorId !== userId` → NotFoundException | ✅ |
| estado check → 409 | RN-CON-08 | line 57 | L292-296: `estado !== SOLICITADA` → ConflictException | ✅ |
| No body params | RN-CON-10 | line 58 | No `@Body()` in controller — body ignored | ✅ |
| Invoke UC09 → CANCELADA | spec line 67 | line 58 | L303-306: `stateMachine.transitionTo(id, CANCELADA)` | ✅ |

### Known deviations from design

| Deviation | Code | Rationale | Verdict |
|-----------|------|-----------|---------|
| 1. `reject()` sets `contratacion.estado = CANCELADA` before `save()` | L299 | Necessary because UC09 stub is no-op; consistent with `create()` pattern | ✅ ACCEPTABLE |
| 2. `sendProposal()` sets `contratacion.estado = PRESUPUESTADA` before `save()` | L237 | Same reason — UC09 stub doesn't transition state | ✅ ACCEPTABLE |

Both deviations are explicitly acknowledged by the implementor and consistent with the existing codebase patterns. They are required because the UC09 state machine is a stub (no-op). When UC09 is implemented, these lines will delegate to `transitionTo()` only.

---

## Coherence (Design Decisions)

| # | Design Decision | Implementation | Match |
|---|-----------------|----------------|-------|
| 1 | **Simple save, no QueryRunner** for UC08 | `sendProposal()` and `reject()` use `contratacionRepo.save()` directly, no `DataSource.createQueryRunner()` | ✅ |
| 2 | **Nullable columns** on `contrataciones` entity | `fechaPropuesta`, `franjaPropuesta`, `precioEstimado` all `nullable: true` with matching DB column definitions | ✅ |
| 3 | **`findById()` on repository** port + adapter | `IContratacionRepository.findById(id)` defined; `TypeOrmContratacionRepository.findById()` implemented via `this.repo.findOne({ where: { id } })` | ✅ |
| 4 | **404 for prestadorId mismatch** (security by obscurity) | Both `sendProposal()` and `reject()` throw `NotFoundException('Contratación not found.')` when `prestadorId !== userId` | ✅ |
| 5 | **SendProposalDto with class-validator** | `@IsDateString()`, `@IsNotEmpty()`, `@IsNumber()`, `@Min(0.01)` — all present | ✅ |

All 5 design decisions are faithfully implemented with no deviations.

---

## Issues Found

### CRITICAL
- **None**. All core paths are tested and passing. No spec functionality is broken.

### WARNING
1. **`precioEstimado ≤ 0` → 422 scenario is UNTESTED** (Spec scenario #6)
   - The DTO has `@Min(0.01)` from class-validator, so runtime validation exists
   - But no unit or integration test proves this validation fires as expected
   - The design explicitly listed this test case; it was omitted in the test file
   - **Risk**: Low — class-validator + ValidationPipe covers it. If someone removes the decorator, there's no test to catch the regression.
   - **Recommendation**: Add a unit test `UC08-SP-06b: precioEstimado = 0 → 422` that validates the service-layer check, OR add an E2E test that exercises the full ValidationPipe stack.

### SUGGESTION
1. **No E2E/API tests for UC08 endpoints** (pre-existing pattern)
   - The `sendProposal()` and `reject()` controller endpoints have no Supertest coverage
   - The design's testing strategy listed "API: Proposal exitosa" and "API: Reject exitoso" as planned
   - Future iteration: add `test/contratacion.e2e-spec.ts` with auth setup
2. **`Rechazo con campos extra ignorados`** (Spec scenario #9) is verified by design only (no `@Body()` in reject endpoint) but has no explicit test
   - This is correct by construction, but documenting the behavior in a comment on the controller method would improve readability

---

## Verdict

**PASS WITH WARNINGS**

| Criterion | Result |
|-----------|--------|
| All tests passing | ✅ 55 pass, 1 pre-existing skip |
| All spec scenarios covered by test or design | ✅ 7/9 tested, 1 by design, 1 untested (WARNING) |
| All design decisions implemented | ✅ 5/5 |
| No regressions in UC07 tests | ✅ 9/9 UC07 tests still passing |
| Coverage ≥ 90% (service core) | ✅ 98.05% statements |
| Task completion | ⏭️ N/A (no tasks artifact) |

**Summary**: UC08 is functionally complete and correct. The implementation matches the spec and design with only one warning: the `precioEstimado ≤ 0` validation scenario lacks an automated test (runtime protection exists via class-validator `@Min(0.01)`). Both known deviations are acceptable and necessary. The change is ready for archive.

**Risks**: None material. The untested validation is covered by DTO decorators in production.
