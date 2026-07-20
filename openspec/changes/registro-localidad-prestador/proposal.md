# Proposal: registro-localidad-prestador

## Intent

When a prestador registers via the UI, they get a `users` row but NO `prestadores` catalog row, making them invisible in catalog search. The `localidad` (city/coverage zone) is never collected. This change adds a `localidad` field to the registration flow for prestadores, automatically creating the `prestadores` catalog row with a generated `zona_cobertura` polygon so the prestador appears in search immediately.

## Scope

### In Scope
- Add `localidad` to client validation schema (conditional required for prestador)
- Add `localidad` to `RegisterPayload` and backend `RegisterDto`
- Add conditional `<Select>` of 17 Misiones cities (from `UBICACIONES`) to registration form
- Add `localidad` copy strings to `es-AR.ts`
- Extend `IPrestadorRepository` with `create()` method and implement in TypeORM adapter
- Create `localidadToCoords` map in backend (port from seed script's `zona_cobertura()`)
- In `RegistrationService.register()`: after user creation, create `Prestador` row with `localidad`, `categoria` (capitalized trade label), and `zona_cobertura` via `CoberturaZona.fromCircle()`
- Wrap user + prestador creation in a transaction (compensate on failure)

### Out of Scope
- Free-text geocoding at registration (Approach 2 from exploration)
- "Otra ciudad" hybrid fallback (Approach 3)
- UC06 (prestador managing their own coverage zone post-registration)
- Email verification / account activation flow
- Migration of existing users without `prestadores` rows

## Capabilities

### New Capabilities
- `prestador-registration`: Creates the `prestadores` catalog row during user registration, including `localidad`, `categoria`, and generated `zona_cobertura`

### Modified Capabilities
- `catalogo`: The `IPrestadorRepository` gains a `create()` method; the `Prestador` entity is now created at registration time, not only via seeds
- `user-auth` (implied): Registration flow now produces a complete prestador catalog entry

## Approach

Use **Approach 1 (Select from predefined cities)** from exploration. Frontend shows a `<Select>` populated from `UBICACIONES` unique cities (17 Misiones cities). Backend has a matching `localidadToCoords` map (ported from `seed-demo.sh:229-259`). On prestador registration:
1. Validate `localidad` is one of the known cities
2. Look up `{lat, lng}` from map
3. Generate `zona_cobertura` via `CoberturaZona.fromCircle(center, 16.5, localidad)` (16.5km radius ≈ 0.3° box matching seed)
4. Create `Prestador` row with `categoria = TRADES.find(t => t.value === trade).label` (capitalized, e.g., "Electricista")
5. Use DB transaction: if `Prestador` insert fails, roll back `User` creation

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `client/lib/validation/registro.ts` | Modified | Add `localidad` to zod schema, conditional required for prestador |
| `client/lib/api/auth.ts` | Modified | Add `localidad?: string` to `RegisterPayload` |
| `client/components/cuentas/registro-form.tsx` | Modified | Add conditional `<Select>` for localidad when role=prestador |
| `client/lib/copy/es-AR.ts` | Modified | Add `localidadLabel`, `localidadHelp`, `localidadPlaceholder`, `fieldErrors.localidad` |
| `server/src/auth/dto/register.dto.ts` | Modified | Add `localidad?: string` with class-validator decorators |
| `server/src/auth/application/registration.service.ts` | Modified | Create `Prestador` row after user; use transaction |
| `server/src/catalogo/ports/prestador-repository.port.ts` | Modified | Add `create(data: CreatePrestadorData): Promise<Prestador>` to `IPrestadorRepository` |
| `server/src/catalogo/adapters/typeorm-prestador.repository.ts` | Modified | Implement `create()` using `repo.save()` |
| `server/src/catalogo/domain/cobertura-util.ts` | New | `localidadToCoords` map + `getCoordsForLocalidad()` helper |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Dual write: User created but Prestador fails → orphan user | Medium | Wrap in TypeORM transaction; if not feasible, delete user on prestador failure |
| City list drift: Frontend `UBICACIONES` vs backend `localidadToCoords` | Medium | Add CI check that both lists have same cities; consider shared JSON source later |
| Regulated trade status lost | Low | Preserve existing `providerStatus` logic (PENDIENTE_HABILITACION for regulated trades) |
| `categoria` mismatch with search (lowercase vs capitalized) | High | Map trade value → display label via `TRADES.find(t => t.value === trade).label` |

## Rollback Plan

1. Revert all file changes via git
2. Drop any `prestadores` rows created during the change window (identifiable by `created_at` range)
3. No DB schema migration — only data and code changes

## Dependencies

- Existing `CoberturaZona.fromCircle()` utility (already in `cobertura-zona.value.ts`)
- Existing `UBICACIONES` constant (17 Misiones cities)
- Existing `TRADES` constant (trade value → label mapping)

## Success Criteria

- [ ] Prestador registers via UI → appears in `/catalogo/prestadores?oficio=<Oficio>&ubicacion=<Localidad>` search
- [ ] `prestadores` row has correct `localidad`, `categoria` (capitalized), `zona_cobertura` (GeoJSON polygon)
- [ ] Cliente registration unchanged (no `localidad` field shown)
- [ ] Regulated trades still get `providerStatus: pendiente_habilitacion`
- [ ] Transaction safety: simulated DB failure on prestador insert rolls back user creation
- [ ] All existing tests pass; new unit tests for `localidadToCoords` and registration integration