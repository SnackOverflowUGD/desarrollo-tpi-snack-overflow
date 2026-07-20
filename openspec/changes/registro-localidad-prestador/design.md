# Design: registro-localidad-prestador

## Technical Approach

When a prestador registers, the system creates both a `User` row and a `Prestador` catalog row atomically. The `localidad` (city) selected from the 17 Misiones cities is mapped to coordinates via a backend `localidadToCoords` map (ported from `seed-demo.sh:229-259`), then `CoberturaZona.fromCircle(center, 16.5, localidad)` generates a ~33km polygon. The `categoria` is the capitalized trade label from `TRADES` (e.g., "electricista" → "Electricista"). All writes happen in a single TypeORM transaction.

## Architecture Decisions

### Decision: Transaction Strategy

**Choice**: TypeORM `QueryRunner` in `RegistrationService.register()`, injecting `DataSource` and manually managing `startTransaction()` / `commitTransaction()` / `rollbackTransaction()`.

**Alternatives considered**:
- `@Transactional()` decorator — requires separate transactional provider setup; adds indirection.
- Domain event + saga — overkill for two-table atomicity.

**Rationale**: `QueryRunner` gives explicit control, works with existing repository ports (which use `Repository.save()`), and keeps the transaction boundary visible in the service. The `IUserRepository` and new `IPrestadorRepository.create()` both accept an optional `QueryRunner` parameter for transactional writes.

### Decision: Polygon Generation

**Choice**: `CoberturaZona.fromCircle({lat, lng}, 16.5, localidad)` — 16.5km radius produces a ~33km diameter polygon matching the seed script's 0.3° bounding box.

**Alternatives considered**:
- Use seed script's exact 0.3° box coordinates — requires duplicating the polygon math.
- PostGIS `ST_Buffer` — adds DB dependency; current architecture does point-in-polygon in app code.

**Rationale**: `fromCircle()` already exists, is tested, and produces valid GeoJSON Polygon. 16.5km radius ≈ 0.15° lat/lng offset, close to seed's 0.3° total span. The `localidad` string is stored in the geometry object for debugging.

### Decision: Repository Interface

**Choice**: Add `create(data: CreatePrestadorData, qr?: QueryRunner): Promise<Prestador>` to `IPrestadorRepository`. `CreatePrestadorData` mirrors the `Prestador` entity fields needed at creation time.

**Alternatives considered**:
- Reuse `Prestador` entity directly — leaks ORM entity into port.
- Separate DTO — adds mapping boilerplate.

**Rationale**: Minimal interface change; `QueryRunner` optional param keeps backward compatibility with read-only callers. Implementation uses `qr?.manager.save() ?? this.repo.save()`.

### Decision: Frontend Localidad Select

**Choice**: Conditional `<Select>` rendered after the trade select when `role === 'prestador'`. Options sourced from `UBICACIONES` unique cities (17 cities: Posadas, Garupá, Oberá, Eldorado, Puerto Iguazú, San Vicente, Leandro N. Alem, Apóstoles, Montecarlo, San Ignacio, Santa Ana, Candelaria, Jardín América, Puerto Rico, Wanda, Aristóbulo del Valle, Candelaria).

**Rationale**: Matches existing pattern for conditional `trade` select. Uses same `Select` component from `components/ui/select`. City list derived from `UBICACIONES` via `Array.from(new Set(UBICACIONES.map(u => u.ciudad))).sort()`.

### Decision: Categoria Mapping

**Choice**: `const categoria = TRADES.find(t => t.value === trade)?.label ?? trade` — maps lowercase trade value to capitalized display label.

**Rationale**: Search queries use `categoria` exact match (see `typeorm-prestador.repository.ts:41`). Seed data uses capitalized labels (e.g., "Electricista"). This mapping ensures registration-created prestadores are searchable.

## Data Flow

```
Client (registro-form.tsx)
    │
    ├─ User selects role="prestador" → shows Trade Select + Localidad Select
    │
    ├─ Submit → registerUser(payload) with { ..., role: "prestador", trade, localidad }
    │
    ▼
POST /api/auth/register → RegistrationService.register(dto)
    │
    ├─ Validate dto.localidad ∈ localidadToCoords keys
    ├─ Lookup coords = localidadToCoords[dto.localidad]
    ├─ zonaCobertura = CoberturaZona.fromCircle(coords, 16.5, dto.localidad)
    ├─ categoria = TRADES.find(t => t.value === dto.trade)?.label
    ├─ providerStatus = regulated ? PENDIENTE_HABILITACION : HABILITADO
    │
    ├─ QueryRunner.startTransaction()
    │   ├─ user = userRepo.create(userData, qr)
    │   └─ prestador = prestadorRepo.create({
    │         id: user.id,
    │         nombreCompleto: `${user.name} ${user.lastName}`,
    │         oficios: [categoria],
    │         categoria,
    │         localidad: dto.localidad,
    │         zonaCobertura: zonaCobertura.toJSON(),
    │         cuentaActiva: true,
    │         visible: true,
    │         providerStatus,
    │       }, qr)
    │
    ├─ QueryRunner.commitTransaction()
    │
    └─ Return RegisterResponseDto
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `client/lib/validation/registro.ts` | Modify | Add `localidad` field to zod schema; conditional required when role=prestador; add `localidad` to `RegistroFormValues` and `registroDefaults` |
| `client/lib/api/auth.ts` | Modify | Add `localidad?: string` to `RegisterPayload` (present only when role=prestador) |
| `client/components/cuentas/registro-form.tsx` | Modify | Add conditional `localidad` Select after trade select; populate from unique `UBICACIONES` cities; wire to react-hook-form |
| `client/lib/copy/es-AR.ts` | Modify | Add `registro.localidadLabel`, `localidadHelp`, `localidadPlaceholder`, `fieldErrors.localidad`, `globalErrors.badRequest` update |
| `server/src/auth/dto/register.dto.ts` | Modify | Add `localidad?: string` with `@IsOptional()`, `@IsString()`, `@MaxLength(100)`; validate against known cities in service |
| `server/src/auth/application/registration.service.ts` | Modify | Inject `DataSource`, `IPrestadorRepository`; in `register()`: validate localidad, get coords, build zonaCobertura, map categoria, wrap user+prestador create in QueryRunner transaction |
| `server/src/catalogo/ports/prestador-repository.port.ts` | Modify | Add `CreatePrestadorData` interface and `create(data, qr?)` to `IPrestadorRepository` |
| `server/src/catalogo/adapters/typeorm-prestador.repository.ts` | Modify | Implement `create()` using `qr?.manager.save(Prestador, data) ?? this.repo.save(data)` |
| `server/src/catalogo/domain/cobertura-util.ts` | Create | Export `localidadToCoords: Record<string, {lat: number, lng: number}>` (13 cities from seed) + `getCoordsForLocalidad(localidad)` helper |
| `server/src/auth/ports/prestador-repository.port.ts` | Create (re-export) | Re-export `IPrestadorRepository` and `PRESTADOR_REPOSITORY` token from catalogo for auth module injection |

## Interfaces / Contracts

### CreatePrestadorData (port)

```typescript
export interface CreatePrestadorData {
  id: string; // same as user.id
  nombreCompleto: string;
  oficios: string[]; // single-element array with categoria
  categoria: string; // capitalized label, e.g., "Electricista"
  localidad: string;
  zonaCobertura: ReturnType<CoberturaZona['toJSON']>;
  cuentaActiva: boolean;
  visible: boolean;
  providerStatus: ProviderStatus;
}
```

### IPrestadorRepository addition

```typescript
create(data: CreatePrestadorData, qr?: QueryRunner): Promise<Prestador>;
```

### RegisterPayload (client)

```typescript
export interface RegisterPayload {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  trade?: string;        // only when role === 'prestador'
  localidad?: string;    // only when role === 'prestador'
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `localidadToCoords` map completeness | Verify all 17 UBICACIONES cities have entries; test `getCoordsForLocalidad` returns coords for known, throws for unknown |
| Unit | `CoberturaZona.fromCircle` output | Verify geometry type=Polygon, 33 points, closed ring, bbox ~0.3° span |
| Unit | categoria mapping | `electricista` → `Electricista`, `tecnico-refrigeracion` → `Técnico en refrigeración` |
| Integration | RegistrationService.register() | Mock repositories + QueryRunner; verify userRepo.create and prestadorRepo.create called in order; verify rollback on prestador failure |
| Integration | TypeOrmPrestadorRepository.create() | Test with real DB (testcontainers); verify row inserted with correct JSON geometry |
| E2E | Full prestador registration flow | Playwright: fill form as prestador with localidad, submit, verify 201, then search `/catalogo/prestadores?oficio=Electricista&ubicacion=Posadas` returns the new prestador |
| E2E | Cliente registration unchanged | Playwright: fill form as cliente, verify no localidad field, submit succeeds |

## Migration / Rollout

No migration required. No schema changes — only code and data. Existing users without `prestadores` rows are out of scope (per proposal).

Rollout: Deploy backend first (new endpoint fields are optional), then frontend. Feature flag not needed.

## Open Questions

- [ ] Should `localidadToCoords` be a shared JSON file consumed by both frontend (for validation hints) and backend? Currently duplicated in `seed-demo.sh` and new `cobertura-util.ts`.
- [ ] The seed script has 13 cities; `UBICACIONES` has 17. Need to add coordinates for the 4 missing: Puerto Rico, Wanda, Aristóbulo del Valle, Candelaria (already in seed), San Ignacio, Santa Ana. Wait — seed has all 13, UBICACIONES has 17. Missing from seed: Puerto Rico, Wanda, Aristóbulo del Valle, San Ignacio, Santa Ana. Need to source coordinates for these 5.

**Risks**: City list drift (frontend 17 vs backend 13) — mitigated by CI check. Orphan user on prestador failure — mitigated by QueryRunner transaction.