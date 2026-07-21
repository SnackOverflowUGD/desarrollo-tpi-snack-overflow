# Proposal: prestador-autogestion

> Workspaces: **server + client**. Size: **LARGE** — delivery `ask-on-risk`, chained/stacked-to-main PRs (see Delivery).

## Intent

A prestador currently CANNOT set or edit any part of their offering — not at onboarding, not after. Registration (`registration.service.ts:94-151`) auto-derives everything and creates ONLY the `prestadores` row; NO `servicio` row is ever written by the app. Result: a newly registered prestador has zero published services, no prices, no editable profile — `tieneServiciosPublicados` stays false, so they never surface in search (RN-CAT-01). The provider side of the marketplace only works via seed data. This closes that core-journey gap so a prestador can self-manage their profile and services and be searchable immediately after signup.

## Scope

### In Scope (server + client)
- **(P2) Profile self-management** — prestador views own profile; edits `oficios`, `localidad` (→ `zonaCobertura` regeneration), `disponibilidadResumen`, `visible`. `JwtAuthGuard` + ownership (acts only on own prestador).
- **(P2) Servicio CRUD** — create / read / update / delete own `servicios` (`rangoPrecioMin/Max`, `descripcion`, `visible`). Publishing a visible service sets `tieneServiciosPublicados = true`; unpublishing the last one clears it.
- **(P3) Onboarding** — capture at least a first service (price range + descripcion) and availability during/after registration so a new prestador is immediately searchable + useful.

### Out of Scope / Non-goals
- Reputación / reseñas, pagos, admin actor, verificación de matrículas.
- Real agenda/calendar — `disponibilidadResumen` stays a summary field only (UC06 agenda deferred).
- Client viewing/editing OTHER prestadores; changing account role.

## Capabilities

### New Capabilities
- `prestador-self-management`: authenticated prestador reads/edits own profile and performs full CRUD of own servicios; publishing rules maintain `tieneServiciosPublicados`.

### Modified Capabilities
- `prestador-registration`: onboarding now captures a first servicio + availability (P3) so the prestador starts searchable.
- `catalogo`: `IPrestadorRepository` gains `update`; `IServicioRepository` gains `create/update/delete`; `tieneServiciosPublicados` becomes app-maintained, not seed-only.

## Approach

Hexagonal ports/adapters (ADR-001/002); Repository over ORM; ACID transactions. Two design forks — **final choice deferred to sdd-design**:

| Fork | Options | Recommendation |
|------|---------|----------------|
| Endpoint shape | (A) new `PrestadorController` with `/prestadores/me` + `/prestadores/me/servicios` sub-routes; (B) extend GET-only `catalogo.controller` | **(A)** — keeps public read-only catalogo untouched, isolates authed self-service surface |
| Onboarding | (A) inline in registration DTO; (B) post-registration "complete your profile" step | **(B)** — smaller registration blast radius, reuses P2 endpoints, avoids fat DTO |
| localidad change | reuse `cobertura-util` / `CoberturaZona.fromCircle` (same as registration) | Reuse — single source of truth for zona regeneration |

Ownership enforced server-side (JWT `sub` → prestador). Client adds `cuenta/perfil` page (profile edit + servicios manager), joining existing `cuenta/{solicitudes,contrataciones}`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `server/src/catalogo/ports/prestador-repository.port.ts` | Modified | Add `update()` |
| `server/src/catalogo/ports/servicio-repository.port.ts` | Modified | Add `create/update/delete` |
| `server/src/catalogo/adapters/*` (prestador + servicio TypeORM repos) | Modified | Implement new port methods |
| `server/src/catalogo/` controller/application | New/Modified | `PrestadorController` `/me` + servicio CRUD; publishing use-case maintains `tieneServiciosPublicados` |
| `server/src/catalogo/domain/cobertura-util.ts` | Reused | zona regeneration on localidad change |
| `server/src/auth/` registration + DTO | Modified | P3 onboarding hook / post-reg step |
| `client/app/cuenta/perfil/` | New | Profile edit + servicios manager UI |
| `client/lib/api/*`, `client/lib/copy/es-AR.ts` | Modified | New authed endpoints + copy |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Ownership bypass (edit another prestador) | High | Server-side ownership check on every mutation; e2e negative tests |
| `tieneServiciosPublicados` drift vs visible servicios | Med | Recompute in publish/unpublish use-case within a transaction |
| localidad edit desyncs `zonaCobertura` | Med | Always regenerate via `CoberturaZona.fromCircle` in same tx |
| Large surface → oversized PRs | High | Chained/stacked slices (see Delivery) |
| Next.js 16 client gotchas | Med | Read `client/AGENTS.md` + `node_modules/next/dist/docs` before UI code |

## Rollback Plan

1. Revert file changes via git (feature-branch chain → revert slice or whole chain).
2. No destructive schema migration — only new endpoints, code, and rows written through them; existing GET catalogo behavior unchanged.
3. If needed, drop `servicios`/profile edits created in the change window (identifiable by `updated_at`/`created_at` range).

## Dependencies

- Existing `CoberturaZona.fromCircle()` + `cobertura-util` (from `registro-localidad-prestador`).
- Existing `JwtAuthGuard` / JWT payload (`sub`).
- `TRADES` mapping (trade value → capitalized label).

## Delivery (LARGE — chained PRs)

Exceeds the 400-line budget. Proposed stacked slices (sdd-tasks to forecast/confirm): (1) ports + adapters (repo methods); (2) server profile read/edit + ownership; (3) server servicio CRUD + publishing rule; (4) client `cuenta/perfil` UI; (5) P3 onboarding. Each slice: clear start/finish, tests alongside code (ADR-006), autonomous scope, own rollback.

## Success Criteria

- [ ] Authenticated prestador loads own profile via `/me`.
- [ ] Prestador edits profile fields; localidad change regenerates `zonaCobertura`.
- [ ] Prestador creates/updates/deletes own servicios; publishing sets `tieneServiciosPublicados = true`.
- [ ] A prestador acting on another prestador's data is rejected (403/ownership).
- [ ] New prestador captures a first servicio + availability at onboarding and appears in `/catalogo/prestadores` search.
- [ ] Public read-only catalogo behavior unchanged; existing tests pass; new tests ≥90% core coverage (RNF-O.2).

## Proposal question round (open product decisions for user/design)

- Onboarding enforcement: is a first servicio **mandatory** to finish registration, or can the prestador be created "incompleto" and complete later? (affects searchability + drop-off)
- Delete semantics: hard-delete servicio vs soft (`visible=false`) — any audit/history need?
- Availability shape: free-text summary vs a small structured enum for `disponibilidadResumen`?
