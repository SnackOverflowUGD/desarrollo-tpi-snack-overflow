# Proposal: contratacion-acciones-prestador

## Intent

In the two-sided hiring flow the prestador cannot advance or cancel a contratación from the UI once it leaves `solicitada`. The flow dead-ends at `confirmada`: the prestador has no reachable button to `iniciar` (confirmada→en_curso), `finalizar` (en_curso→finalizada), or `cancelar`. Root cause is frontend-only: the lifecycle actions exist in the API client and in the seguimiento component, but that component renders only on `/cuenta/contrataciones`, a surface the prestador nav never links to. The bandeja (`/cuenta/solicitudes`) shows action buttons only for `solicitada`. P1 of an approved improvement set.

## Scope

**Workspace: client/ only.** Backend already supports every transition and authorization — no server change.

### In Scope
- Surface prestador post-`solicitada` lifecycle actions (iniciar/finalizar/cancelar) in a reachable UI
- Reuse existing API client methods (`iniciar`/`finalizar`/`cancelar` in `client/lib/api/contrataciones.ts`)
- Reuse/extend existing copy strings in `client/lib/copy/es-AR.ts`
- Tests alongside code per ADR-006 (unit + e2e for the reachable action path)

### Out of Scope
- Any backend change (verify-only: confirm controller/service transitions and authz already work)
- New states or transitions (no `rechazada`; reject stays mapped to `cancelada`)
- Cliente-side flow (already functional via seguimiento)
- Notifications / messaging changes

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `contratacion`: UX requirement — the prestador MUST be able to reach and trigger iniciar/finalizar/cancelar from the UI for post-`solicitada` active states. Backend behavior unchanged.

## Approach

Decision deferred to design; two options framed:

**(a) Render lifecycle actions in the bandeja "Activas" tab** — add iniciar/finalizar/cancelar buttons to `solicitud-card.tsx` for `confirmada`/`en_curso`.
- Pros: single surface the prestador already uses; smallest nav change; least clicks.
- Cons: bandeja card grows a second responsibility; duplicates action logic already in `acciones-contratacion.tsx`.

**(b) Give the prestador a nav route to the seguimiento surface** — add `/cuenta/contrataciones` (or equivalent) to prestador nav.
- Pros: reuses `acciones-contratacion.tsx` as-is; clean separation; parity with cliente.
- Cons: new route/nav entry; prestador now has two hiring surfaces (bandeja + seguimiento) — possible confusion.

**Recommendation: (a)** — keeps the prestador in one bandeja workflow, fewer surfaces, less nav churn; extract shared action logic so the seguimiento component and bandeja card render from one source.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `client/components/cuentas/bandeja/solicitud-card.tsx` | Modified | Render lifecycle actions for confirmada/en_curso |
| `client/components/cuentas/seguimiento/acciones-contratacion.tsx` | Modified | Extract/share action logic (approach a) |
| `client/lib/api/contrataciones.ts` | Reused | Existing iniciar/finalizar/cancelar methods |
| `client/lib/copy/es-AR.ts` | Modified | Add any missing action copy |
| `client/lib/nav/nav-links.ts`, `navbar.tsx` | Modified | Only if approach (b) chosen |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Duplicated action logic drifts from seguimiento | Medium | Extract one shared action component/hook |
| Wrong buttons shown per estado/role | Medium | Gate strictly by estado + prestador role; e2e per state |
| Assumed backend parity is incomplete | Low | Verify controller/service transitions before UI work |

## Rollback Plan

Frontend-only: revert the client/ commits via git. No DB, schema, or backend change to unwind; existing behavior restored immediately.

## Dependencies

- Existing backend transitions (verified, not modified)
- Existing API client + copy strings

## Success Criteria

- [ ] Prestador can trigger iniciar/finalizar/cancelar from a reachable UI for post-`solicitada` states
- [ ] Correct buttons per estado and role; no button for terminal states
- [ ] No backend change; backend parity verified
- [ ] Cliente flow unchanged
- [ ] Unit + e2e tests cover the reachable action path
