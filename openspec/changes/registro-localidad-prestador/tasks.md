# Tasks: registro-localidad-prestador

## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain
400-line budget risk: High

### Work Units

| Unit | Goal | Branch | Base |
|------|------|--------|------|
| 1 | Backend foundation (coords map, repo port, typeorm impl) | feat/registro-prestador/1-backend-base | feature/registro-localidad-prestador |
| 2 | Auth service (DTO, transaction, registration service, tests) | feat/registro-prestador/2-auth-service | feat/registro-prestador/1-backend-base |
| 3 | Frontend (form, validation, copy, E2E tests) | feat/registro-prestador/3-frontend | feat/registro-prestador/2-auth-service |

## Phase 1: Backend Foundation

- [x] 1.1 Create `server/src/catalogo/domain/cobertura-util.ts` with `localidadToCoords` map (17 cities) + `getCoordsForLocalidad()` helper
- [x] 1.2 Add `CreatePrestadorData` interface + `create(data, qr?)` to `IPrestadorRepository`
- [x] 1.3 Implement `create()` in `TypeOrmPrestadorRepository` using `qr?.manager.save() ?? this.repo.save()`
- [x] 1.4 Create `server/src/auth/ports/prestador-repository.port.ts` re-exporting IPrestadorRepository + PRESTADOR_REPOSITORY token

## Phase 2: Auth Service Transaction

- [ ] 2.1 Add `localidad?: string` to `RegisterDto` with class-validator decorators
- [ ] 2.2 Update `RegistrationService.register()`: validate localidad, build categoria, generate zona_cobertura
- [ ] 2.3 Inject `DataSource` + `IPrestadorRepository` into RegistrationService
- [ ] 2.4 Wrap user + prestador creation in `QueryRunner` transaction
- [ ] 2.5 Unit tests: localidad validation, categoria mapping, polygon generation
- [ ] 2.6 Integration tests: registration with localidad, rollback on prestador failure

## Phase 3: Frontend Integration

- [x] 3.1 Add `localidad` to zod schema in `registro.ts` (conditional required for prestador)
- [x] 3.2 Add `localidad?: string` to `RegisterPayload` in `auth.ts`
- [x] 3.3 Add conditional `<Select>` for localidad in `registro-form.tsx` (populated from UBICACIONES)
- [x] 3.4 Add localidad copy strings to `es-AR.ts`
- [ ] 3.5 E2E test: prestador registers with localidad → visible in search
- [ ] 3.6 E2E test: cliente registration unchanged (no localidad field)

## Phase 4: Verification

- [ ] 4.1 Repository integration test: prestador inserted with correct JSON geometry
- [ ] 4.2 Polygon generation test: verify CoberturaZona.fromCircle output shape
- [ ] 4.3 Regression: existing tests pass unchanged
- [ ] 4.4 CI check: UBICACIONES cities match localidadToCoords keys
