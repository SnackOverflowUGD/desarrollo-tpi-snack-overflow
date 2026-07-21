# Design: prestador-autogestion

## Technical Approach

Extend the `catalogo` hexagon with an authenticated self-service surface without touching the public read-only `CatalogoController`. A new `PrestadorController` exposes `/prestadores/me*` routes guarded by `AuthGuard('jwt')`. The authed prestador row is addressed **only** by `req.user.sub` (never a path id), so profile access is ownership-safe by construction; servicio subresources add an explicit owner check. Ports `IPrestadorRepository`/`IServicioRepository` gain mutation methods (implemented by the existing TypeORM adapters); a new application service owns publishing rules and transaction boundaries. Client adds two protected pages (`cuenta/perfil`, `cuenta/servicios`) plus an optional post-registration completion step, reusing the `backendFetch` server-forwarder pattern.

## Architecture Decisions

| Decision | Choice | Rejected | Rationale |
|---|---|---|---|
| (a) Endpoint shape | New `PrestadorController` at `/prestadores/me`, `/prestadores/me/servicios[/:id]` | Extend public `CatalogoController` | Keeps unauthenticated catalogo untouched; isolates authed mutation surface; mirrors `ContratacionController` (`@UseGuards(AuthGuard('jwt'))` + `req.user`). |
| (b) Authed id → row | `prestadores.id === user.sub` (set at registration `prestadorData.id = user.id`) | Extra lookup/join | 1:1 identity already established; `/me` routes read `sub` directly — no cross-tenant id ever enters the path. |
| (c) localidad → zona | Reuse `getCoordsForLocalidad()` + `CoberturaZona.fromCircle(coords, 16.5, localidad)` | Bespoke regen | Single source of truth; identical to `registration.service` (16.5 km circle). |
| (d) `tieneServiciosPublicados` recompute | Application service method, in-transaction, `= countVisibleServicios(sub) > 0` | Recompute in adapter / DB trigger | Business rule belongs in application layer; must be atomic with the servicio mutation that triggered it. |
| Registration publish flag | Registration now writes `tieneServiciosPublicados = false` (app-owned) | Keep hardcoded `true` | Aligns resolved product decision: an unpublished prestador (zero visible servicios) is NOT searchable; the non-mandatory completion step publishes them. |
| Servicio delete | Soft delete (`visible = false`) via `softDelete()` | Hard delete | Resolved decision (2); preserves history, re-publishable. |
| disponibilidad | Structured enum reusing existing `disponibilidadResumen.estado` (`disponible_esta_semana`/`proxima_disponible`/`sin_disponibilidad`) | Free text | Resolved decision (3); matches search projection already consuming it. |
| Ownership failure code | `404` on servicio not owned (existence-hiding) | `403` | Mirrors `ContratacionController` participant guard; success-criterion accepts 403/ownership — any non-2xx passes negatives. |

## Data Flow

    Client (protected page / route handler)
        └─ backendFetch  ─Bearer─▶  PrestadorController(/me*)  [AuthGuard jwt]
                                        │ sub = req.user.sub; role guard (prestador only → else 403)
                                        ▼
                              PrestadorAutogestionService
                                        │ (QueryRunner tx)
                        ┌───────────────┼─────────────────────────┐
                        ▼               ▼                         ▼
             IPrestadorRepository  IServicioRepository   recompute tieneServiciosPublicados
             .update/.findById     .create/.update/.softDelete/.countVisible
                        └───────── PostgreSQL (prestadores, servicios) ──────────┘

## File Changes

| File | Action | Description |
|---|---|---|
| `catalogo/ports/prestador-repository.port.ts` | Modify | Add `update(id, patch, qr?)`, `findById(id)`, `UpdatePrestadorData` |
| `catalogo/ports/servicio-repository.port.ts` | Modify | Add `create/update/softDelete/findById/countVisibleByPrestadorId/findByPrestadorIdIncludingHidden` |
| `catalogo/adapters/typeorm-prestador.repository.ts` | Modify | Implement new methods (QueryRunner-aware) |
| `catalogo/adapters/typeorm-servicio.repository.ts` | Modify | Implement new methods (QueryRunner-aware) |
| `catalogo/application/prestador-autogestion.service.ts` | Create | Profile read/update (zona regen), servicio CRUD, publish recompute in tx |
| `catalogo/prestador.controller.ts` | Create | `/prestadores/me*` routes, jwt guard, role guard |
| `catalogo/dto/{actualizar-perfil,crear-servicio,actualizar-servicio,mi-perfil}.dto.ts` | Create | class-validator DTOs incl. `@IsEnum` disponibilidad |
| `catalogo/catalogo.module.ts` | Modify | Register controller + service (DataSource already available; JwtStrategy app-global) |
| `auth/application/registration.service.ts` + adapter `create` | Modify | Set `tieneServiciosPublicados = false` (app-owned flag) |
| `client/app/(protegido)/cuenta/perfil/page.tsx` | Create | Profile edit (Server Component + client form) |
| `client/app/(protegido)/cuenta/servicios/page.tsx` | Create | Servicios manager (list + CRUD) |
| `client/app/api/prestadores/me/**/route.ts` | Create | Thin route handlers over `backendFetch` (PATCH/POST/DELETE) |
| `client/lib/api/prestador-me.ts` | Create | Discriminated `*-Result` client (mirror `auth.ts`/`catalogo.ts`) |
| `client/components/cuentas/onboarding/*` + registro-form redirect | Create/Modify | Optional post-registration completion step (redirect to `cuenta/perfil?onboarding=1`) |
| `client/lib/copy/es-AR.ts` | Modify | New copy keys |

## Interfaces / Contracts

```ts
// prestador-repository.port.ts
interface UpdatePrestadorData {
  oficios?: string[]; localidad?: string;
  zonaCobertura?: ReturnType<CoberturaZona['toJSON']>;
  disponibilidadResumen?: Prestador['disponibilidadResumen'];
  visible?: boolean; tieneServiciosPublicados?: boolean;
}
update(id: string, patch: UpdatePrestadorData, qr?: QueryRunner): Promise<Prestador>;
findById(id: string): Promise<Prestador | null>;

// servicio-repository.port.ts
create(data: CreateServicioData, qr?: QueryRunner): Promise<Servicio>;
update(id: string, patch: UpdateServicioData, qr?: QueryRunner): Promise<Servicio>;
softDelete(id: string, qr?: QueryRunner): Promise<void>;        // visible=false
findById(id: string): Promise<Servicio | null>;
countVisibleByPrestadorId(prestadorId: string, qr?: QueryRunner): Promise<number>;
findByPrestadorIdIncludingHidden(prestadorId: string): Promise<Servicio[]>;
```

Ownership guard (service, EVERY servicio mutation): load by `id`; `if (!s || s.prestadorId !== sub) throw NotFoundException`.

Transaction boundary (create/update/softDelete servicio): one `QueryRunner` tx (pattern from `registration.service`) → mutate servicio → `recompute()` → `prestadorRepo.update(sub, { tieneServiciosPublicados }, qr)` → commit. localidad PATCH regenerates zona in-service then single atomic `update`.

## Testing Strategy

| Layer | What | Approach | Slice |
|---|---|---|---|
| Unit (jest) | Adapter methods, zona regen, recompute logic, ownership guard | `*.spec.ts` beside code | 1,2 |
| Unit (jest) | Service publish rules (first publish → true; unpublish last → false) | Mock repos + QueryRunner | 2,3 |
| E2E (supertest/jest) | `/me` CRUD happy path + **ownership negatives** (other prestador's servicio → 404; cliente token → 403; no token → 401) | `server/test/*.e2e-spec.ts` (Postgres+Redis up) | 3 |
| Unit (vitest/RTL) | Profile form, servicios manager, `prestador-me` client result mapping | `client/` vitest | 4,5 |
| E2E (playwright) | Register → complete profile → publish first servicio → appears in `/catalogo/prestadores` | `client/` playwright | 5 |

## Threat Matrix

N/A — no shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. HTTP routing is guarded by `AuthGuard('jwt')` + in-service ownership/role checks (covered by e2e negatives).

## Sequence: prestador publishes first service → becomes searchable

    Prestador        Client              PrestadorController      AutogestionSvc         Repos/DB
        │  fill form    │                        │                      │                    │
        │──────────────▶│ POST /api/prestadores/me/servicios            │                    │
        │               │──backendFetch(Bearer)─▶│                      │                    │
        │               │                        │ sub=req.user.sub     │                    │
        │               │                        │─crearServicio(sub,dto)▶ BEGIN tx           │
        │               │                        │                      │─servicio.create()─▶│
        │               │                        │                      │─countVisible(sub)─▶│ (=1)
        │               │                        │                      │─prestador.update(  │
        │               │                        │                      │  tieneServicios=1)─▶│
        │               │                        │                      │  COMMIT            │
        │               │◀───────201 servicio────│◀─────────────────────│                    │
        │               │  (prestador now matches catalogo filter: visible ∧ tieneServiciosPublicados) │

## Migration / Rollout

No schema migration (columns already exist). Behavioral change: registration stops auto-setting `tieneServiciosPublicados=true` → newly registered prestadores are searchable only after publishing. Existing seed data unaffected. Rollback: revert per PR slice; no destructive DDL.

## Stacked-PR Slicing Plan (stacked-to-main)

| # | Slice | Scope | Tests | ~LOC |
|---|---|---|---|---|
| 1 | Ports + adapters | Port method signatures + TypeORM impls (QueryRunner-aware) | jest unit (repos) | ~250 |
| 2 | Application service + DTOs | `PrestadorAutogestionService`, DTOs, zona regen, recompute rule | jest unit (service, mocked repos) | ~300 |
| 3 | Controller + module + registration flag | `PrestadorController`, module wiring, `tieneServiciosPublicados=false` at registration | supertest e2e incl. ownership/role/auth negatives | ~300 |
| 4 | Client profile edit | `cuenta/perfil` page + form + route handlers + `prestador-me` client (profile) | vitest/RTL | ~350 |
| 5 | Client servicios CRUD + onboarding | `cuenta/servicios` manager + servicio route handlers + post-registration step | vitest/RTL + playwright flow | ~380 |

Each slice: autonomous scope, tests alongside code (ADR-006, no strict TDD), own rollback; PR #1 → tracker branch, each child → previous branch.

## ADR Impact

- **ADR-001/002 (hexagonal, ports/adapters)**: reinforced — new capabilities via ports + DI tokens + TypeORM adapters; no vendor SDK, no logic in adapters.
- **Repository over ORM**: extended with mutation methods; app layer never touches TypeORM directly.
- **ACID**: servicio mutation + publish-flag recompute are one transaction (QueryRunner), matching the pay/registration ACID precedent.
- **ADR-006 (test pyramid, no strict TDD)**: honored per slice table.
- No new ADR required; this is an in-boundary extension.

## Open Questions

- [ ] Ownership failure code: recommend 404 (existence-hiding, contratacion precedent) vs success-criterion's 403 — confirm in sdd-spec scenarios.
- [ ] Should `visible=false` on the profile (`PATCH /me`) also force `tieneServiciosPublicados` irrelevant (prestador hidden regardless)? Search already ANDs `visible=true`, so hiding works; confirm no recompute coupling needed.
