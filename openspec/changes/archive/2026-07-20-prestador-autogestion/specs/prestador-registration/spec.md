# Delta for Prestador Registration

## ADDED Requirements

### Requirement: ONBOARDING-REQ-01 — Post-registration profile completion

Registration **MUST NOT** force service data. After a prestador registers, the system **MUST** offer a separate "complete your profile" step (reusing the self-management endpoints) where they capture a first servicio (price range + `descripcion`) and availability so they become searchable. Completing this step is **NOT** required to finish registration.

#### Scenario: ESC-LOCALIDAD-07 — Newly registered prestador is valid but not searchable

- GIVEN a prestador completes registration with role "prestador", trade "electricista", and localidad "Posadas"
- WHEN registration succeeds and no servicio has been published yet
- THEN the Prestador row exists with `tieneServiciosPublicados=false`
- AND the prestador does NOT appear in `/catalogo/prestadores` search results
- AND the prestador can authenticate and open the profile-completion flow

#### Scenario: ESC-LOCALIDAD-08 — Completing the profile makes the prestador searchable

- GIVEN a registered prestador with `tieneServiciosPublicados=false`
- WHEN they complete the profile step by publishing a first visible servicio (valid price range) and setting availability
- THEN `tieneServiciosPublicados=true`
- AND the prestador appears in `/catalogo/prestadores?oficio=Electricista&ubicacion=Posadas` results

## MODIFIED Requirements

### Requirement: LOCALIDAD-REQ-01

The system **SHALL** present a required `localidad` Select field when the registering user selects role "prestador".
(Previously: registration created a Prestador that appeared in search immediately; now a freshly registered prestador is only searchable after publishing a service.)

#### Scenario: ESC-LOCALIDAD-01 — Prestador registers with localidad; searchable only after publishing

- GIVEN a prestador completes registration with role "prestador", trade "electricista", and localidad "Posadas"
- WHEN registration succeeds
- THEN the system creates a User row AND a Prestador row in the same transaction
- AND the Prestador row has `categoria` = "Electricista" (capitalized label)
- AND the Prestador row has `localidad` = "Posadas"
- AND the Prestador row has `zona_cobertura` as a GeoJSON polygon generated from Posadas coordinates
- AND the Prestador row has `tieneServiciosPublicados=false` and does NOT yet appear in search
- AND the prestador appears in `/catalogo/prestadores?oficio=Electricista&ubicacion=Posadas` only AFTER publishing at least one visible servicio

#### Scenario: ESC-LOCALIDAD-02 — Prestador selects city and correct polygon is generated

- GIVEN a prestador registers with localidad "Oberá"
- WHEN the Prestador row is created
- THEN `zona_cobertura` is a polygon centered on Oberá coordinates (~33km diameter circle, ~0.3° bounding box)
- AND the polygon is valid GeoJSON Polygon format

### Requirement: LOCALIDAD-REQ-03

The system **SHALL** restrict `localidad` options to the 17 known Misiones cities from `UBICACIONES`.
(Previously: the regulated-trade scenario asserted the prestador is visible in catalog search; visibility now also depends on having a published service.)

#### Scenario: ESC-LOCALIDAD-03 — Regulated trade with localidad gets pendiente_habilitacion

- GIVEN a prestador registers with trade "gasista" (regulated) and localidad "Posadas"
- WHEN registration completes
- THEN the Prestador row has `providerStatus` = "pendiente_habilitacion"
- AND `providerStatus` alone does NOT hide the prestador from catalog once they have published services (searchability is still gated by `tieneServiciosPublicados`)

## REMOVED Requirements

None.

## RENAMED Requirements

None.
