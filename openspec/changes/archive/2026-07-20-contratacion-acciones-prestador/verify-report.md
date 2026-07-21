# Verification Report — contratacion-acciones-prestador

**Mode**: Standard (OpenSpec, ADR-006 test pyramid — NOT strict TDD). Client-only change.
**Branch**: feat/contratacion-acciones-prestador-wiring (working tree clean).
**Verdict**: PASS WITH WARNINGS

## Completeness (tasks)

All 19 tasks across 5 phases marked `[x]` in tasks.md and confirmed against code state.

| Phase | Tasks | State |
|-------|-------|-------|
| 1 Test infra (jsdom/RTL) | 1.1, 1.2 | complete — vitest jsdom env, RTL deps present |
| 2 Shared extraction (PR1) | 2.1-2.6 | complete — hook + git-mv to acciones/ + nextPath prop |
| 3 Bandeja wiring (PR2) | 3.1-3.3 | complete — AccionesContratacion wired into solicitud-card |
| 4 E2E & regression | 4.1-4.3 | code complete; e2e runtime NOT green (see WARNING-1) |
| 5 Cleanup | 5.1, 5.2 | complete — no stale seguimiento/ imports (verified) |

## Build / Tests / Coverage

| Evidence | Result |
|----------|--------|
| `cd client && npm run test:unit` | 30 files, 359 tests PASSED (~7.2s), exit 0 |
| `bash server/scripts/seed-e2e.sh` | PASSED — cliente+prestador registered, catalog row seeded (localidad fix works) |
| `cd client && npx playwright test e2e/sistema.spec.ts --project=chromium --workers=1` | 3 passed, 1 FAILED (test 4), 5 did not run |
| `npm run build` | NOT RUN (per instruction) |

## Implementation vs Spec (source inspection, file:line)

- Prestador iniciar/finalizar/cancelar reachable in bandeja Activas:
  `client/components/cuentas/bandeja/solicitud-card.tsx:84-91` renders
  `<AccionesContratacion rol="prestador" estado={item.estado} nextPath="/cuenta/solicitudes" />`
  for every non-`solicitada` item. Confirmed matches spec Requirement "Prestador Reachable Lifecycle Actions".
- Role/estado gating: `client/lib/api/acciones-contratacion.ts:26-57` `accionesPara` — prestador+confirmada→[iniciar,cancelar], prestador+en_curso→[finalizar,cancelar], terminal→[]. Component returns null when `acciones.length === 0` (`acciones-contratacion.tsx:59`).
- Shared hook: `client/lib/hooks/use-acciones-contratacion.ts:77-153` `useAccionesContratacion`, consumed by both `solicitud-card.tsx` and `seguimiento/contratacion-card.tsx:130-134`.
- nextPath 401-redirect fix: `use-acciones-contratacion.ts:122-124` `router.push('/login?next=' + encodeURIComponent(nextPath))`; per-caller nextPath (bandeja `/cuenta/solicitudes`, seguimiento `/cuenta/contrataciones`). Hardcoded NEXT removed.
- busy cleared on success: `use-acciones-contratacion.ts:112` `setBusy(null)` BEFORE `router.refresh()` (MI-11 soft-refresh gotcha) — documented and unit-tested.
- Double-submit guard: `use-acciones-contratacion.ts:98` `if (busy) return`.
- No backend change: hook imports existing `iniciar/finalizar/cancelar` from `lib/api/contrataciones`; no server route touched.

## Spec Compliance Matrix (ESC-15..25)

| Scenario | Covering test(s) | Runtime result |
|----------|------------------|----------------|
| ESC-15 iniciar confirmada→en_curso | accionesPara(prestador,confirmada) `acciones-contratacion.test.ts:54`; solicitud-card RTL `:59`; hook success `use-acciones-contratacion.test.ts:89` | PASS (unit/RTL); e2e test 7 DID NOT RUN |
| ESC-16 finalizar en_curso→finalizada | accionesPara `:61`; solicitud-card RTL `:67`; hook | PASS (unit/RTL); e2e test 7 DID NOT RUN |
| ESC-17 cancelar from confirmada | accionesPara `:54` (incl cancelar); RTL `:63`; hook defer `:164` | PASS (unit/RTL); e2e test 8 DID NOT RUN |
| ESC-18 cancelar from en_curso | accionesPara `:61`; RTL `:73` | PASS (unit/RTL); e2e test 9 DID NOT RUN |
| ESC-19 no actions finalizada | accionesPara terminal `:75/:96`; component returns null | PASS (unit) |
| ESC-20 no actions cancelada | accionesPara terminal `:75/:96` | PASS (unit) |
| ESC-21 403/404 graceful | seguimiento-errors.test.ts: forbidden→banner, no_disponible(404)→banner+refresh | PASS (unit) |
| ESC-22 uses existing endpoint contract | hook imports existing api methods; hook tests mock those exact methods; no new route (inspection) | PASS (inspection + unit) |
| ESC-23 double-submit | hook `use-acciones-contratacion.test.ts:64` | PASS (unit) |
| ESC-24 409 stale refetch | hook `:146` (409→banner+refresh) | PASS (unit) |
| ESC-25 cliente unchanged | accionesPara cliente matrix `:30`; contratacion-card still imports from acciones/ with nextPath; e2e steps 1-3 green | PASS (unit + partial e2e 1-3) |

Every scenario has at least one covering test that PASSED at runtime (unit/RTL layer).

## Issues

### WARNING-1 — E2E prestador-lifecycle round-trip not runtime-proven
`sistema.spec.ts` runs serial; test **4 "solicita la contratación"** (an UNMODIFIED cliente step) fails: the `#fecha` field is now a `dd/mm/aaaa` masked date picker (renders a "Seleccionar fecha" button + "Elegí una fecha." validation error), so the test's `fill("2030-03-15")` (ISO) no longer registers and form validation blocks submit — no "¡Solicitud enviada!" heading. Serial mode aborts, so tests **7/8/9** (the ESC-15/16/17/18 bandeja-Activas path this change adds) never execute.

This is NOT the seed bug (seed now passes) and NOT this change's code — it is a pre-existing/upstream breakage in the cliente solicitar form's date input, out of scope for this client-only prestador change. Reported honestly; no e2e pass fabricated. The prestador tests 7/8/9 were neither proven passing nor failing at runtime — their logic is fully covered by the passing hook + solicitud-card RTL + accionesPara unit suites (ADR-006 pyramid: e2e is the thin top layer).

### SUGGESTION-1 — Add direct hook tests for 403/404 result mapping
ESC-21 is covered via `seguimiento-errors.test.ts` (mapSeguimientoError forbidden/no_disponible) but the hook's own 403/404 branches are only asserted for 401/409. Optional: add 403→banner-no-transition and 404→banner+refresh cases to `use-acciones-contratacion.test.ts` for end-to-end hook coverage.

### SUGGESTION-2 — Fix or de-serialize the sistema.spec.ts date input
To restore e2e runtime proof of the prestador path, fix test 4's date entry (use the picker / dd-mm-yyyy format) OR decouple tests 7/8/9 from the cliente-form precondition (seed the contratación to `confirmada` directly, as tests 8/9 already do via API for their own reset).

## Verdict

**PASS WITH WARNINGS.** Implementation matches the spec on every requirement (verified by source inspection); all 19 tasks complete; 359 unit/RTL tests green covering all 11 scenarios. The full-stack e2e proof of the new bandeja-Activas prestador path is blocked by a pre-existing, out-of-scope cliente-form date-input breakage — a WARNING, not a CRITICAL, because each affected scenario retains a passing lower-pyramid test.
