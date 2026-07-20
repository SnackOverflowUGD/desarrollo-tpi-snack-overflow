# Delta for Catalogo

## ADDED Requirements

### Requirement: REPO-CREATE-01

The `IPrestadorRepository` interface **SHALL** expose a `create(data: CreatePrestadorData): Promise<Prestador>` method to persist a new prestador catalog entry.

#### Scenario: Repository create persists prestador with all fields

- GIVEN a `CreatePrestadorData` with `userId`, `categoria`, `localidad`, `zona_cobertura`, and `providerStatus`
- WHEN `repository.create(data)` is called
- THEN a new `Prestador` row is persisted with all provided fields
- AND the returned `Prestador` entity has a generated `id`
- AND the `zona_cobertura` is stored as valid GeoJSON Polygon

## MODIFIED Requirements

### Requirement: RN-CAT-01 — Active prestador visibility

Only prestadores with **active account** and at least one **published service** are shown in search results. Prestadores created at registration are visible once they have published services.
(Previously: Only prestadores with active account and published services appear; registration-time creation was not a source of prestador rows)

#### Scenario: ESC-01 — Búsqueda básica con resultados (unchanged, still valid)

- GIVEN prestadores exist with active accounts, published services, and zones covering the search location
- WHEN client searches by oficio and location
- THEN system returns matching prestadores ordered by rating desc

#### Scenario: ESC-05 — Búsqueda sin resultados (unchanged, still valid)

- GIVEN no prestadores cover the location for the requested oficio
- WHEN client searches
- THEN system informs no results and suggests broadening criteria

#### Scenario: NEW — Prestador registered via registration flow appears in search

- GIVEN a prestador registered via the registration flow with localidad "Posadas" and trade "electricista"
- AND the prestador has published at least one service
- WHEN a client searches `oficio=Electricista&ubicacion=Posadas`
- THEN the prestador appears in results (created at registration, not seed)

## REMOVED Requirements

None.

## RENAMED Requirements

None.