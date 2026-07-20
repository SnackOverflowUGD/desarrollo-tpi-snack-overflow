# Exploration: Add localidad field to prestador registration

## Current State

The registration flow currently creates only a `users` table row via `RegistrationService.register()`. The `prestadores` catalog row (which contains `localidad`, `zona_cobertura`, `categoria`, etc.) is created **separately** — currently only via seed scripts (`seed-demo.sh`, `seed-e2e.sh`) that do raw SQL INSERTs after user registration.

**Key files in current flow:**

| File | Role |
|------|------|
| `client/components/cuentas/registro-form.tsx` | Form UI — conditionally shows `trade` `<Select>` when role=prestador |
| `client/lib/validation/registro.ts` | Zod schema — conditional `trade` validation via `.superRefine` |
| `client/lib/api/auth.ts` | `RegisterPayload` type — `trade?: string` only for prestador |
| `server/src/auth/dto/register.dto.ts` | `RegisterDto` — mirrors payload, `trade?: string` |
| `server/src/auth/application/registration.service.ts` | Creates `User` via `userRepo.create()`; sets `providerStatus` based on regulated trade; **does NOT create prestador row** |
| `server/src/catalogo/domain/prestador.entity.ts` | `Prestador` entity — has `localidad` (varchar) and `zona_cobertura` (jsonb, GeoJSON) |
| `server/scripts/seed-demo.sh` | `zona_cobertura()` function (lines 229–259) maps 13 city names → hardcoded lat/lng → generates ~33km box polygon |
| `client/lib/catalogo/ubicaciones.ts` | `UBICACIONES` array — 17 Misiones cities + barrios, used by search combobox |

**The gap:** A prestador registering via the UI gets a `users` row but **no `prestadores` row**, so they never appear in catalog search.

## Affected Areas

### Frontend
- `client/lib/validation/registro.ts` — Add `localidad` to schema, conditionally required for prestador
- `client/lib/api/auth.ts` — Add `localidad?: string` to `RegisterPayload`
- `client/components/cuentas/registro-form.tsx` — Add conditional `localidad` field (Select from cities) for prestador
- `client/lib/copy/es-AR.ts` — Add copy strings: `localidadLabel`, `localidadHelp`, `localidadPlaceholder`, `fieldErrors.localidad`

### Backend
- `server/src/auth/dto/register.dto.ts` — Add `localidad?: string` with validation (max 100, required when role=prestador)
- `server/src/auth/application/registration.service.ts` — After creating `User`, also create `Prestador` row with `localidad` + generated `zona_cobertura`
- `server/src/catalogo/ports/prestador-repository.port.ts` — Add `create(data: CreatePrestadorData): Promise<Prestador>` to `IPrestadorRepository`
- `server/src/catalogo/adapters/typeorm-prestador.repository.ts` — Implement `create()` using `repo.save()`
- `server/src/catalogo/domain/cobertura-zona.value.ts` — Already has `CoberturaZona.fromCircle(center, radiusKm, localidad)` — reusable
- **New utility needed** — Map localidad name → `{lat, lng}` (port `zona_cobertura()` logic from seed script to TS)

### Seed/Scripts (for consistency)
- `server/scripts/seed-cobertura.js` / `CoberturaZona.fromCircle()` — Already generate correct JSON shape; registration service should use same logic

## Approaches

### 1. Select from predefined Misiones cities (Recommended)
Use the existing `UBICACIONES` list (`client/lib/catalogo/ubicaciones.ts`) as the source of truth for the `localidad` `<Select>`. Extract unique city names (17 cities). Backend has a matching hardcoded lat/lng map (port from seed script).

- **Pros:** Consistent with search combobox; validates against known cities; enables accurate `zona_cobertura` generation; no free-text geocoding ambiguity
- **Cons:** Limited to Misiones cities; adding new cities requires updating both frontend list and backend lat/lng map
- **Effort:** Medium — new frontend Select, backend lat/lng map, prestador creation logic

### 2. Free-text input with backend geocoding
User types city name; backend geocodes via Nominatim (like search does) to get lat/lng, then generates `zona_cobertura`.

- **Pros:** Flexible — any city works; single source of truth (Nominatim)
- **Cons:** Geocoding can fail/be ambiguous; adds latency + external dependency to registration; inconsistent with search combobox (which uses curated list); `zona_cobertura` center may not match user's mental model of their city
- **Effort:** Medium-High — error handling, fallback, async geocoding in registration flow

### 3. Hybrid: Select with "Otra ciudad" → free text
Predefined Select + "Otra" option that reveals a text input. Backend geocodes free-text entries.

- **Pros:** Best UX for known cities; extensible
- **Cons:** Most complex; two code paths for `zona_cobertura` generation
- **Effort:** High

## Recommendation

**Approach 1 (Select from predefined cities)** — Aligns with existing `UBICACIONES` used by search, keeps registration fast and deterministic, avoids external geocoding at signup. The 17 cities in `UBICACIONES` cover all seed cities plus representative Misiones coverage. Backend lat/lng map can be a shared constant (or ported from seed script's `case` statement).

**Implementation outline:**
1. Add `localidad` to frontend schema/form/payload (conditional on role=prestador)
2. Add `localidad` to backend DTO + validation
3. Create `localidadToCoords` map in backend (port from seed script)
4. Add `create()` to `IPrestadorRepository` + TypeORM impl
5. In `RegistrationService.register()`: after `userRepo.create()`, if role=prestador, call `prestadorRepo.create()` with `localidad`, `categoria=trade`, `zona_cobertura=CoberturaZona.fromCircle(coords, 16.5, localidad).toJSON()` (16.5km radius ≈ 0.3° box from seed)
6. Return `providerStatus` as before

## Risks

- **Dual write risk:** `User` created but `Prestador` creation fails → orphan user. Mitigation: wrap in transaction or compensate (delete user on failure).
- **City list drift:** Frontend `UBICACIONES` and backend lat/lng map must stay in sync. Mitigation: single source of truth (e.g., shared JSON) or CI check.
- **Regulated trades:** Existing logic sets `providerStatus=PENDIENTE_HABILITACION` for regulated trades — must preserve this behavior.
- **Search compatibility:** `categoria` must exactly match the trade's display label (e.g., "Electricista" not "electricista") — seed script uses `OFICIO` (capitalized) for `categoria`. Registration service must map trade value → display label.

## Ready for Proposal

**Yes** — The exploration is complete. The orchestrator should present the user with the recommended approach (Select from predefined cities) and confirm before proceeding to `sdd-propose`.