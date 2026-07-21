# Delta for Catalogo

## ADDED Requirements

### Requirement: REPO-PRESTADOR-UPDATE-01 — Prestador repository update port

The `IPrestadorRepository` interface **SHALL** expose an `update(id, data)` method that persists profile edits (`oficios`/`categoria`, `localidad`, `zonaCobertura`, `disponibilidadResumen`, `visible`, `tieneServiciosPublicados`). When `localidad` changes, the regenerated `zonaCobertura` and the new `tieneServiciosPublicados` value **MUST** be persisted in the SAME transaction as the rest of the update.

#### Scenario: ESC-09 — Repository update persists profile + regenerated zona atomically

- GIVEN a persisted prestador and an update changing `localidad` and `disponibilidadResumen`
- WHEN `repository.update(id, data)` is called within a transaction
- THEN all changed fields, including the regenerated `zonaCobertura`, are committed together
- AND a failure on any field rolls back the whole update (no partial state)

### Requirement: REPO-SERVICIO-CRUD-01 — Servicio repository create/update/delete ports

The `IServicioRepository` interface **SHALL** expose `create`, `update`, and `delete` methods. `delete` **MUST** be a soft delete (set `visible=false`, row preserved), never a physical removal.

#### Scenario: ESC-10 — Repository creates and updates a servicio

- GIVEN a `CreateServicioData` with `prestadorId`, `rangoPrecioMin`, `rangoPrecioMax`, `descripcion`, `visible`
- WHEN `repository.create(data)` then `repository.update(id, changes)` are called
- THEN the servicio is persisted and subsequently reflects the updated fields
- AND the returned entity has a generated `id`

#### Scenario: ESC-11 — Repository soft-deletes a servicio

- GIVEN a persisted visible servicio
- WHEN `repository.delete(id)` is called
- THEN the row still exists with `visible=false`
- AND no row is physically removed from the `servicios` table

## MODIFIED Requirements

### Requirement: RN-CAT-01 — Active prestador visibility (app-maintained publishing flag)

Only prestadores with an **active account**, a **visible** profile, and at least one **published (visible) service** appear in search. `tieneServiciosPublicados` is **app-maintained**: it is recomputed within the same transaction whenever a servicio is published, hidden, or soft-deleted — it is NO longer a seed-only field.
(Previously: `tieneServiciosPublicados` was effectively set only by seed data; the app never created or toggled it.)

#### Scenario: ESC-01 — Búsqueda básica con resultados (unchanged, still valid)

- GIVEN prestadores exist with active accounts, published services, and zones covering the search location
- WHEN a client searches by oficio and location
- THEN the system returns matching prestadores ordered by rating desc

#### Scenario: ESC-05 — Búsqueda sin resultados (unchanged, still valid)

- GIVEN no prestadores cover the location for the requested oficio
- WHEN a client searches
- THEN the system informs no results and suggests broadening criteria

#### Scenario: ESC-12 — Publishing flag toggles searchability

- GIVEN a prestador created by the app with `tieneServiciosPublicados=false`
- WHEN they publish their first visible servicio, then later soft-delete/hide their last visible servicio
- THEN `tieneServiciosPublicados` becomes `true` on first publish and `false` after the last is hidden
- AND search inclusion follows the flag accordingly (each recompute committed in the mutation's transaction)

## REMOVED Requirements

None.

## RENAMED Requirements

None.
