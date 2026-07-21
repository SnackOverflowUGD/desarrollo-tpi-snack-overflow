# Prestador Self-Management Specification

## Purpose

An authenticated prestador reads and edits their own profile (`oficios`/`categoria`, `localidad`, `disponibilidadResumen`, `visible`) and performs full CRUD over their own `servicios` (`rangoPrecioMin`, `rangoPrecioMax`, `descripcion`, `visible`). Publishing rules keep `tieneServiciosPublicados` in sync so the prestador becomes (and stays) searchable only while at least one visible service exists. All mutations are authenticated (`JwtAuthGuard`) and ownership-scoped: a prestador acts ONLY on their own data. Deletion is a SOFT delete (row preserved, reversible).

## Requirements

### Requirement: PSM-REQ-01 — Read own profile

The system **MUST** let an authenticated prestador read their own profile derived from the JWT `sub`, without exposing another prestador's data.

#### Scenario: ESC-PSM-01 — Prestador reads own profile

- GIVEN an authenticated prestador with a valid JWT
- WHEN they request `GET /prestadores/me`
- THEN the system returns their profile: `categoria`/`oficios`, `localidad`, `zonaCobertura`, `disponibilidadResumen`, `visible`, `tieneServiciosPublicados`, and their `servicios`
- AND no other prestador's data is returned

#### Scenario: ESC-PSM-02 — Unauthenticated read is rejected

- GIVEN a request with no valid JWT
- WHEN it calls `GET /prestadores/me`
- THEN the system responds `401 Unauthorized`

### Requirement: PSM-REQ-02 — Edit own profile

The system **MUST** let an authenticated prestador update their own `oficios`/`categoria`, `localidad`, `disponibilidadResumen`, and `visible`. The system **MUST NOT** allow editing another prestador's profile.

#### Scenario: ESC-PSM-03 — Prestador edits profile fields

- GIVEN an authenticated prestador
- WHEN they `PATCH /prestadores/me` with new `categoria` and `visible=false`
- THEN the profile persists the new values and `visible=false`
- AND while `visible=false` the prestador is excluded from public search results

#### Scenario: ESC-PSM-04 — Editing another prestador's profile is rejected

- GIVEN authenticated prestador A
- WHEN A attempts to mutate prestador B's profile
- THEN the system responds `403 Forbidden` (or `404` to avoid disclosure) and B's data is unchanged

### Requirement: PSM-REQ-03 — Localidad change regenerates zonaCobertura transactionally

When `localidad` changes, the system **MUST** regenerate `zonaCobertura` via `CoberturaZona.fromCircle()` using `getCoordsForLocalidad(localidad)`, and persist both the new `localidad` and the new `zonaCobertura` in the SAME transaction. An unknown `localidad` **MUST** be rejected.

#### Scenario: ESC-PSM-05 — Valid localidad change regenerates zona in one transaction

- GIVEN an authenticated prestador whose `localidad` is "Posadas"
- WHEN they `PATCH /prestadores/me` with `localidad="Oberá"`
- THEN `localidad="Oberá"` AND `zonaCobertura` is a polygon centered on Oberá coordinates
- AND both fields are committed atomically (neither persists if the other fails)

#### Scenario: ESC-PSM-06 — Unknown localidad is rejected

- GIVEN an authenticated prestador
- WHEN they `PATCH /prestadores/me` with `localidad="Springfield"` (not in `UBICACIONES`)
- THEN the system responds `400 Bad Request` (reusing `getCoordsForLocalidad` validation)
- AND neither `localidad` nor `zonaCobertura` is changed

### Requirement: PSM-REQ-04 — Structured disponibilidad enum

The system **MUST** accept `disponibilidadResumen.estado` only as one of the existing enum values `disponible_esta_semana | proxima_disponible | sin_disponibilidad`, optionally with `proximaFecha` and `franjasDisponiblesProximos7Dias`, consistent with the stored jsonb shape.

#### Scenario: ESC-PSM-07 — Valid disponibilidad enum is accepted

- GIVEN an authenticated prestador
- WHEN they `PATCH /prestadores/me` with `disponibilidadResumen.estado="disponible_esta_semana"` and `franjasDisponiblesProximos7Dias=3`
- THEN the value persists and is reflected in search availability ordering

#### Scenario: ESC-PSM-08 — Invalid disponibilidad enum is rejected

- GIVEN an authenticated prestador
- WHEN they submit `disponibilidadResumen.estado="quizas"`
- THEN the system responds `400 Bad Request` and the stored value is unchanged

### Requirement: PSM-REQ-05 — Create own servicio

The system **MUST** let an authenticated prestador create a servicio on their own profile with `rangoPrecioMin`, `rangoPrecioMax`, `descripcion`, and `visible`. The price range **MUST** be valid (`rangoPrecioMin <= rangoPrecioMax`).

#### Scenario: ESC-PSM-09 — Prestador creates a valid servicio

- GIVEN an authenticated prestador with no servicios
- WHEN they `POST /prestadores/me/servicios` with `rangoPrecioMin=1000`, `rangoPrecioMax=5000`, `descripcion`, `visible=true`
- THEN the servicio is persisted linked to their prestador
- AND `201 Created` is returned with the new servicio id

#### Scenario: ESC-PSM-10 — Invalid price range is rejected

- GIVEN an authenticated prestador
- WHEN they create a servicio with `rangoPrecioMin=5000` and `rangoPrecioMax=1000`
- THEN the system responds `400 Bad Request` and no servicio is persisted

### Requirement: PSM-REQ-06 — Publishing maintains searchability transactionally

Publishing the FIRST visible servicio (create/update to `visible=true` when none was visible) **MUST** set `tieneServiciosPublicados=true`. Hiding or soft-deleting the LAST visible servicio **MUST** set it back to `false`. The servicio mutation and the `tieneServiciosPublicados` recompute **MUST** occur in the SAME transaction.

#### Scenario: ESC-PSM-11 — First visible servicio makes prestador searchable

- GIVEN an authenticated prestador with `tieneServiciosPublicados=false` and no visible servicios
- WHEN they publish a servicio with `visible=true`
- THEN `tieneServiciosPublicados=true` is committed in the same transaction
- AND the prestador appears in public search (assuming active + visible profile)

#### Scenario: ESC-PSM-12 — Hiding the last visible servicio clears searchability

- GIVEN an authenticated prestador with exactly one visible servicio and `tieneServiciosPublicados=true`
- WHEN they update that servicio to `visible=false`
- THEN `tieneServiciosPublicados=false` is committed in the same transaction
- AND the prestador no longer appears in public search

### Requirement: PSM-REQ-07 — Update own servicio (ownership enforced)

The system **MUST** let an authenticated prestador update their own servicio and **MUST NOT** allow updating another prestador's servicio.

#### Scenario: ESC-PSM-13 — Prestador updates own servicio

- GIVEN an authenticated prestador who owns servicio S
- WHEN they `PATCH /prestadores/me/servicios/{S}` with a new `descripcion` and valid price range
- THEN the changes persist on S

#### Scenario: ESC-PSM-14 — Updating another prestador's servicio is rejected

- GIVEN authenticated prestador A and servicio S owned by prestador B
- WHEN A attempts to update S
- THEN the system responds `403 Forbidden` (or `404`) and S is unchanged

### Requirement: PSM-REQ-08 — Soft-delete own servicio

Servicio deletion **MUST** be a soft delete: the row is preserved and `visible` is set to `false` (reversible), never physically removed. Ownership **MUST** be enforced.

#### Scenario: ESC-PSM-15 — Soft delete preserves the row

- GIVEN an authenticated prestador who owns visible servicio S
- WHEN they `DELETE /prestadores/me/servicios/{S}`
- THEN S still exists in the database with `visible=false`
- AND if S was the last visible servicio, `tieneServiciosPublicados=false` in the same transaction

#### Scenario: ESC-PSM-16 — Deleting another prestador's servicio is rejected

- GIVEN authenticated prestador A and servicio S owned by prestador B
- WHEN A attempts `DELETE /prestadores/me/servicios/{S}`
- THEN the system responds `403 Forbidden` (or `404`) and S remains `visible` and unchanged

### Requirement: PSM-REQ-09 — All mutations require authentication

Every self-management mutation (`PATCH /prestadores/me`, servicio create/update/delete) **MUST** be protected by `JwtAuthGuard`.

#### Scenario: ESC-PSM-17 — Unauthenticated mutation is rejected

- GIVEN a request with no valid JWT
- WHEN it calls any `/prestadores/me` mutation endpoint
- THEN the system responds `401 Unauthorized` and no state changes

### Requirement: PSM-REQ-10 — Profile without published services is valid but not searchable

A prestador with zero visible servicios **MUST** remain a valid account (readable/editable) but **MUST NOT** appear in public search (`tieneServiciosPublicados=false`).

#### Scenario: ESC-PSM-18 — Prestador with no published services is hidden from search

- GIVEN an authenticated prestador with no visible servicios
- WHEN a client searches the public catalogo
- THEN this prestador does not appear in results
- AND the prestador can still read and edit their own profile via `/prestadores/me`
