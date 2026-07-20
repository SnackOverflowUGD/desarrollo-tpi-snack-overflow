# Tasks: Prestador Autogestión

## Review Workload Forecast (per slice)

| Slice | Scope | ~LOC (add+del) | <400? | Risk |
|-------|-------|----------------|-------|------|
| 1 [server] | Ports + TypeORM adapters + repo unit tests | ~250 | Yes | Low |
| 2 [server] | Application service + DTOs + service unit tests | ~300 | Yes | Medium |
| 3 [server] | Controller + module + registration flag + e2e (incl. existing-test updates) | ~340 | Yes (tight) | Medium |
| 4 [client] | cuenta/perfil page + route handlers + client + RTL | ~350 | Yes (tight) | Medium |
| 5 [client] | cuenta/servicios CRUD + onboarding step + playwright | ~380 | Yes (tight) | High |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

All 5 slices fit the 400-line budget. Slices 3-5 are tight; if e2e/playwright fixtures push slice 5 over, split onboarding step into a 6th stacked PR. Delivery strategy: auto-chain (stacked-to-main, PR per slice merging to main in order).

## Slice 1 [server] — Ports + Adapters (REPO-PRESTADOR-UPDATE-01, REPO-SERVICIO-CRUD-01)

- [x] 1.1 [server] Add `update(id, patch, qr?)`, `findById(id)`, `UpdatePrestadorData` to `catalogo/ports/prestador-repository.port.ts`
- [x] 1.2 [server] Add `create/update/softDelete/findById/countVisibleByPrestadorId/findByPrestadorIdIncludingHidden` + data types to `catalogo/ports/servicio-repository.port.ts`
- [x] 1.3 [server] Implement new methods (QueryRunner-aware) in `catalogo/adapters/typeorm-prestador.repository.ts`
- [x] 1.4 [server] Implement new methods (QueryRunner-aware, `softDelete`=set `visible=false`) in `catalogo/adapters/typeorm-servicio.repository.ts`
- [x] 1.5 [server] Unit tests (jest, beside code): prestador update atomic (ESC-09); servicio create/update (ESC-10); soft-delete preserves row (ESC-11); `countVisibleByPrestadorId`

## Slice 2 [server] — Application Service + DTOs (PSM-REQ-03..08, RN-CAT-01)

- [x] 2.1 [server] Create DTOs `catalogo/dto/{actualizar-perfil,crear-servicio,actualizar-servicio,mi-perfil}.dto.ts`; `@IsEnum` disponibilidad = `disponible_esta_semana|proxima_disponible|sin_disponibilidad`; price-range validator `min<=max`
- [x] 2.2 [server] Create `catalogo/application/prestador-autogestion.service.ts`: read profile (by sub); update profile with in-tx zona regen via `getCoordsForLocalidad`+`CoberturaZona.fromCircle(coords,16.5,localidad)` (reject unknown localidad)
- [x] 2.3 [server] Servicio CRUD in service: ownership guard `if(!s||s.prestadorId!==sub) throw NotFoundException`; one QueryRunner tx per mutation → mutate → `recompute()` → `prestadorRepo.update(sub,{tieneServiciosPublicados},qr)` → commit
- [x] 2.4 [server] Unit tests (jest, mocked repos+QueryRunner): first publish→true (ESC-PSM-11), unpublish last→false (ESC-PSM-12/15), ownership→404 (ESC-PSM-14/16), unknown localidad→400 (ESC-PSM-06), invalid enum→400 (ESC-PSM-08), invalid price→400 (ESC-PSM-10)

## Slice 3 [server] — Controller + Wiring + Registration (PSM-REQ-01/02/09/10, ONBOARDING-REQ-01, RN-CAT-01)

- [x] 3.1 [server] Create `catalogo/prestador.controller.ts`: `GET/PATCH /prestadores/me`, `GET/POST /prestadores/me/servicios`, `PATCH|DELETE /prestadores/me/servicios/:id`; `@UseGuards(AuthGuard('jwt'))`; role guard (prestador only → else 403); addressed by `req.user.sub` only
- [x] 3.2 [server] Register controller + service in `catalogo/catalogo.module.ts`
- [x] 3.3 [server] Change registration to app-owned flag: set `tieneServiciosPublicados=false` in `auth/application/registration.service.ts` + adapter `create` (`typeorm-prestador.repository.ts`, `data.tieneServiciosPublicados ?? false`, removed hardcoded `true`; added optional field to `CreatePrestadorData`)
- [x] 3.4 [server] Verified no existing test asserted immediate searchability (auth.e2e-spec.ts only registers a cliente; no unit spec asserts the create flag). Correct not-searchable-until-publish behavior is asserted in the new e2e (ESC-12) instead
- [x] 3.5 [server] E2E supertest `server/test/prestador-autogestion.e2e-spec.ts` (Postgres+Redis): CRUD happy path; ownership negatives→404 (ESC-PSM-14/16); cliente token→403; no token→401 (ESC-PSM-02/17); publish→searchable / hide last→hidden (ESC-PSM-11/12/18, ESC-12)

## Slice 4 [client] — Profile Edit (PSM-REQ-01/02/03/04)

- [x] 4.1 [client] Create `client/lib/api/prestador-me.ts`: discriminated `*-Result` client (getProfile, updateProfile) mirroring `auth.ts`/`catalogo.ts`
- [x] 4.2 [client] Create route handlers `client/app/api/prestadores/me/route.ts` (GET/PATCH) over `backendFetch` (Bearer forward); extended `next.config.ts` rewrite exclusion to `prestadores/me` (dynamic servicio route needs the cookie→Bearer BFF)
- [x] 4.3 [client] Create `client/app/(protegido)/cuenta/perfil/page.tsx`: Server Component + client form `components/cuentas/perfil/perfil-form.tsx` (oficios multi-checkbox from TRADES, localidad Select from UBICACIONES, disponibilidad enum Select, visible toggle); added prestador `Mi perfil` nav link
- [x] 4.4 [client] Add copy keys to `client/lib/copy/es-AR.ts` (`cuenta.perfil` + `nav.miPerfil`)
- [x] 4.5 [client] vitest (pure-logic, matching the project's node-env pyramid — no RTL harness exists): `prestador-me-api.test.ts` (getProfile/updateProfile status→result mapping) + `perfil-schema.test.ts` (valid submit, invalid-localidad/enum rejected, defaults + payload builder)

## Slice 5 [client] — Servicios CRUD + Onboarding (PSM-REQ-05..08, ONBOARDING-REQ-01)

- [x] 5.1 [client] Extend `client/lib/api/prestador-me.ts` with servicio create/update/softDelete result mappers (crearServicio 201, actualizarServicio 200/404, eliminarServicio 204; ownership 404, never throws 4xx)
- [x] 5.2 [client] Create route handlers `client/app/api/prestadores/me/servicios/route.ts` (POST) + `servicios/[id]/route.ts` (PATCH/DELETE, 204 no-body) over `backendFetch`
- [x] 5.3 [client] Create `client/app/(protegido)/cuenta/servicios/page.tsx` (Server Component) + `components/cuentas/servicios/{servicios-manager,servicio-form}.tsx`: list (incl. hidden, publish/hide toggle) + create/edit forms + soft-delete (archivar) confirm UX (re-publishable)
- [x] 5.4 [client] Create `client/components/cuentas/onboarding/onboarding-perfil.tsx` + `lib/cuenta/onboarding.ts` (postRegistroRedirect) + registro-form redirect (active prestador → `/login?next=/cuenta/perfil?onboarding=1`, non-mandatory/skippable); added `Mis servicios` nav link
- [x] 5.5 [client] vitest (pure-logic, project's node-env pyramid — no RTL harness): `servicio-schema.test.ts` (price range min<=max, ESC-PSM-10) + `servicio-api.test.ts` (CRUD + soft-delete result mapping) + `onboarding.test.ts` (redirect logic; optional/skippable)
- [x] 5.6 [client] Playwright `e2e/servicios.spec.ts`: proxy guards (anon→login), BFF cookie→Bearer probes, token-never-leaks, + full register→login→complete profile→publish→appears in `/catalogo/prestadores?oficio=Carpintero&ubicacion=Posadas` (ESC-LOCALIDAD-08), skips gracefully when backend:3000 unreachable
