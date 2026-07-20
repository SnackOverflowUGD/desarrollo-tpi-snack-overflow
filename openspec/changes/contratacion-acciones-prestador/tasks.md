# Tasks: contratacion-acciones-prestador

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~450-550 (hook extraction + 2 file moves + bandeja wiring + test infra + unit/component/e2e tests) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (extraction, zero behavior change) → PR 2 (bandeja wiring + e2e) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Extract `useAccionesContratacion` hook + move `acciones-contratacion.tsx`/`confirm-accion.tsx` to `components/cuentas/acciones/`, add `nextPath` prop; zero behavior change | PR 1 | `npm run test:unit` (hook renderHook suite) | `npm run test:e2e -- sistema.spec.ts` steps 1-6 (cliente path unaffected) | `git revert` PR 1 — seguimiento keeps working, nothing else depends on it yet |
| 2 | Wire shared actions into bandeja Activas tab (`solicitud-card.tsx`) + e2e finalizar/cancelar via bandeja | PR 2 | `npm run test:unit` (solicitud-card RTL suite) | `npm run test:e2e -- sistema.spec.ts` full (steps 1-7 + cancelar) | `git revert` PR 2 alone — bandeja falls back to solicitada-only actions; PR 1 unaffected |

## Phase 1: Test Infra Prerequisite [client]

- [x] 1.1 [client] Add `@testing-library/react`, `@testing-library/jest-dom`, `jsdom` devDependencies to `client/package.json`. Current `vitest.config.ts` runs `environment: 'node'` (no DOM) — `renderHook`/RTL crash without this.
- [x] 1.2 [client] Update `client/vitest.config.ts`: set `environment: 'jsdom'` (or `environmentMatchGlobs` scoped to new hook/component test files) so existing pure-function unit tests keep passing.

## Phase 2: Shared Extraction — zero behavior change (PR 1) [client]

- [x] 2.1 [client] Create `client/lib/hooks/use-acciones-contratacion.ts`: `useAccionesContratacion(contratacionId, rol, estado, { nextPath })` owning `acciones`, `busy`, `pendingConfirm`, `globalError`, `alertRef`, `ejecutar`, `onAccionClick`. Preserve `setBusy(null)` BEFORE `router.refresh()` on success (Next 16 soft-refresh gotcha, MI-11 fix — refresh does not remount the client leaf).
- [x] 2.2 [client] `git mv client/components/cuentas/seguimiento/acciones-contratacion.tsx client/components/cuentas/acciones/acciones-contratacion.tsx`; rewrite as a thin leaf consuming the hook; replace hardcoded `NEXT = "/cuenta/contrataciones"` with `nextPath?: string` prop (default `/cuenta/contrataciones`), fixing the 401-redirect coupling.
- [x] 2.3 [client] `git mv client/components/cuentas/seguimiento/confirm-accion.tsx client/components/cuentas/acciones/confirm-accion.tsx`; update its single import site.
- [x] 2.4 [client] Update `client/components/cuentas/seguimiento/contratacion-card.tsx`: import from `components/cuentas/acciones/`, pass `nextPath="/cuenta/contrataciones"` explicitly.
- [x] 2.5 [client] Unit test `client/test/unit/use-acciones-contratacion.test.ts` (`npm run test:unit`): `renderHook` + mocked `next/navigation` + mocked api-client — double-submit no-op while busy (ESC-23), success clears `busy` + calls `router.refresh()`, 401→`push(nextPath)`, 409→banner+refresh (ESC-24), irreversible action defers via `pendingConfirm`.
- [x] 2.6 [client] Regression: run `npm run test:unit`; confirm existing `client/test/unit/acciones-contratacion.test.ts` (`accionesPara` matrix) is untouched and cliente seguimiento renders identically (ESC-25) — same component tree, only relocated.

## Phase 3: Bandeja Wiring — feature (PR 2) [client]

- [x] 3.1 [client] Modify `client/components/cuentas/bandeja/solicitud-card.tsx`: for non-`solicitada` items render `<AccionesContratacion contratacionId={item.id} rol="prestador" estado={item.estado} nextPath="/cuenta/solicitudes" />` from `components/cuentas/acciones/`; `accionesPara` gates confirmada/en_curso, renders null for presupuestada (ESC-15..18, ESC-19, ESC-20); keep existing presupuestar/rechazar block for `solicitada` unchanged.
- [x] 3.2 [client] Verify-only: check `client/lib/copy/es-AR.ts` `copy.seguimiento.*` already covers iniciar/finalizar/cancelar + confirm copy consumed by the moved component; add a key only if missing.
- [x] 3.3 [client] Component test `client/test/unit/solicitud-card.test.tsx` (RTL, `npm run test:unit`): actions render for `confirmada`/`en_curso`, null for `presupuestada`, `solicitada` keeps presupuestar/rechazar (ESC-19/20).

## Phase 4: E2E & Regression [client]

- [x] 4.1 [client] Update `client/e2e/sistema.spec.ts` test 7: drive Iniciar→Finalizar through `/cuenta/solicitudes` → Activas tab (bandeja) instead of `/cuenta/contrataciones`, proving the previously-unreachable path (ESC-15/16); keep steps 1-6 (cliente) untouched as the live ESC-25 regression check.
- [x] 4.2 [client] Add a cancelar case (new test or `describe`) to `sistema.spec.ts`: prestador cancels from `confirmada` and from `en_curso` via the bandeja (ESC-17/18).
- [x] 4.3 [client] Run `npm run test:e2e` (needs `server/scripts/seed-e2e.sh`) + `npm run test:unit`; confirm cliente flow and full prestador matrix are green, `--workers=1` (stateful flow).

## Phase 5: Cleanup [client]

- [x] 5.1 [client] Grep for any remaining import of `components/cuentas/seguimiento/acciones-contratacion` or `.../confirm-accion`; none should remain outside `components/cuentas/acciones/`.
- [x] 5.2 [client] Update docblock comments in the moved files referencing their old `seguimiento/`-only scope to reflect the shared `acciones/` home used by both bandeja and seguimiento.
