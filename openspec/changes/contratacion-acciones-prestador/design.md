# Design: contratacion-acciones-prestador

## Technical Approach

Frontend-only. The action engine already exists: `AccionesContratacion`
renders exactly the transitions `accionesPara(rol, estado)` allows and wires
`iniciar/finalizar/cancelar`, the confirm step, the double-submit guard, error
mapping, and a soft `router.refresh()`. It just never reaches the prestador,
who only navigates to the bandeja (`/cuenta/solicitudes`), where cards show
buttons for `solicitada` only. We surface the same engine in the bandeja
**Activas** tab as a single shared source, so bandeja and seguimiento cannot
drift.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|---|---|---|---|
| Surface | **(a)** render actions in bandeja Activas | (b) add prestador nav route to seguimiento | (a) keeps the prestador in ONE workflow, no new route/nav entry, no dual-surface confusion; (b) duplicates a surface and inflates nav |
| Anti-drift | Extract ONE shared hook + presentational component under neutral `components/cuentas/acciones/` | Import the `seguimiento/` component into `bandeja/` as-is | A cross-domain import is a smell and leaves the 401 redirect hardcoded to `/cuenta/contrataciones`; extraction gives a single testable source + a `nextPath` prop |
| Refresh | Server refetch via `router.refresh()` (existing) | Optimistic in-place estado mutation | Backend is the authority; a soft refetch re-runs the server fetch and re-buckets the card across tabs for free. No optimistic drift between two surfaces |

## Shared Extraction Plan

- `client/lib/hooks/use-acciones-contratacion.ts` (**new**) —
  `useAccionesContratacion(contratacionId, rol, estado, { nextPath })` owns
  `acciones` (from `accionesPara`), `busy`, `pendingConfirm`, `globalError`,
  `alertRef`, and `onAccionClick / ejecutar / cancelPending`. Pure-ish logic
  (only `useState`/`useRouter`) → unit-testable via `renderHook`.
- `client/components/cuentas/acciones/acciones-contratacion.tsx` (**moved**
  from `seguimiento/`) — `"use client"` leaf; renders Alert + Buttons +
  `ConfirmAccion` from hook state. Props: `{ contratacionId, rol, estado,
  nextPath? }` (`nextPath` default `/cuenta/contrataciones`).
- `client/components/cuentas/acciones/confirm-accion.tsx` (**moved** from
  `seguimiento/`) — colocated so neither `bandeja/` nor `seguimiento/` imports
  across siblings.

## Action Mapping (reuses `accionesPara`, unchanged)

`prestador+confirmada → [iniciar, cancelar]`, `prestador+en_curso →
[finalizar, cancelar]`, `prestador+presupuestada → []` (renders null — waiting
on cliente), `solicitada` lives in the **Pendientes** tab and keeps its
UC08 presupuestar/rechazar (NOT `accionesPara`). So the bandeja can render the
shared component for every Activas card and let `accionesPara` gate.

## API Wiring

No API change. Hook calls existing `iniciar/finalizar/cancelar` from
`lib/api/contrataciones.ts` (`POST /api/contrataciones/:id/{start|finish|cancel}`,
no body, token-derived actor). Errors go through existing
`mapSeguimientoError`: `401→router.push(nextPath)`, `409 estado_cambiado→banner
+refresh`, `404→banner+refresh`, `403→banner`, transport/5xx→banner.

## Data Flow — finalizar

    Prestador ──click Finalizar──▶ SolicitudCard(en_curso)
      └─ hook.onAccionClick("finalizar") ─ requiereConfirm ─▶ ConfirmAccion
            └─ confirm ─▶ hook.ejecutar (busy guard) ─▶ finalizar(id)
                  └─ POST /api/contrataciones/:id/finish ─▶ 200 {finalizada}
      hook: toast · setBusy(null) · router.refresh()
      Server refetch /contrataciones ─▶ card re-buckets: Activas ▶ Terminadas

## File Changes

| File | Action | Description |
|---|---|---|
| `lib/hooks/use-acciones-contratacion.ts` | Create | Shared state+handlers, `nextPath` param |
| `components/cuentas/acciones/acciones-contratacion.tsx` | Create (move) | Presentational leaf consuming hook |
| `components/cuentas/acciones/confirm-accion.tsx` | Create (move) | Colocated confirm dialog |
| `components/cuentas/seguimiento/acciones-contratacion.tsx` | Delete | Moved to `acciones/` |
| `components/cuentas/seguimiento/confirm-accion.tsx` | Delete | Moved to `acciones/` |
| `components/cuentas/seguimiento/contratacion-card.tsx` | Modify | Update import; pass `nextPath="/cuenta/contrataciones"` |
| `components/cuentas/bandeja/solicitud-card.tsx` | Modify | Render shared actions for non-`solicitada` (rol `prestador`, `nextPath="/cuenta/solicitudes"`); keep presupuestar/rechazar for `solicitada` |
| `lib/copy/es-AR.ts` | Verify-only | Action/confirm/success copy already under `copy.seguimiento.*`; likely NO change |

## Next.js 16 Caveats (client/AGENTS.md: "not the Next.js you know")

Read `node_modules/next/dist/docs/` before coding. Load-bearing:
`router.refresh()` is a **soft** refresh — it re-runs the Server Component
fetch WITHOUT remounting the `"use client"` leaf, so the hook MUST clear
`busy` on success (preserve the documented MI-11 fix). Bandeja/seguimiento
pages are `force-dynamic` Server Components; the shared component is a client
leaf. No new routes.

## Testing Strategy (ADR-006 pyramid, alongside, not strict TDD)

| Layer | What | Approach |
|---|---|---|
| Unit | `useAccionesContratacion` | `renderHook` + mocked `next/navigation` + mocked api: double-submit no-op while busy, success→refresh+busy cleared, 401→push(nextPath), 409→banner+refresh, confirm-required defers via pendingConfirm. (`accionesPara` already covered) |
| Component | `SolicitudCard` | RTL: actions render for confirmada/en_curso; null for presupuestada; solicitada keeps presupuestar/rechazar |
| E2E | prestador flow | Playwright: login → Solicitudes → Activas → confirmada → Iniciar → en_curso → Finalizar(confirm) → moves to Terminadas; + cancelar path |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file
classification, or process-integration boundary. The only redirect target
(`nextPath`) is an internal literal passed through `encodeURIComponent`.

## ADR Impact

None. `accionesPara` already encodes the ADR-09-05 actor matrix; no new
state/transition; reuses ADR-07-03 result pattern and ADR-08/09 error mapping.
The component/confirm relocation is a structural refactor, not an ADR decision.

## Migration / Rollout

No migration. Frontend-only; rollback = git revert the client/ commits.

## Open Questions

None blocking.
