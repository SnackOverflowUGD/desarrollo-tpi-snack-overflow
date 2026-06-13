# Tasks: UC01 — Registrarse

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~500 (225 prod + 270 tests) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Foundation — Entities, Ports, DTOs

- [x] 1.1 Add `name`, `lastName`, `phone` columns to `server/src/auth/domain/user.entity.ts` (varchar, NOT NULL)
- [x] 1.2 Create `server/src/auth/domain/regulated-trade.entity.ts` with `tradeName` unique varchar + uuid PK
- [x] 1.3 Add `create()` method + `CreateUserData` interface to `server/src/auth/ports/user.repository.port.ts`
- [x] 1.4 Create `server/src/auth/ports/regulated-trade.repository.port.ts` with `findByTradeName()`
- [x] 1.5 Create `server/src/auth/dto/register.dto.ts` — validates name, lastName, email, phone, password, role, trade (optional)
- [x] 1.6 Create `server/src/auth/dto/register-response.dto.ts` — id, email, role, status, providerStatus, message
- [x] 1.7 Add `RegulatedTrade` entity to `server/src/app.module.ts` TypeORM entities list
- [x] 1.8 Add `RegulatedTrade` to `server/src/auth/auth.module.ts` TypeOrmModule.forFeature()

## Phase 2: Core Implementation — RegistrationService

- [x] 2.1 Create `server/src/auth/application/registration.service.ts` — `register(dto)` with full flow: normalize email, check duplicate (409), determine providerStatus via trade lookup, hash password with argon2, persist via userRepo.create(), return RegisterResponseDto

## Phase 3: Integration — Controller and Wiring

- [x] 3.1 Add `RegistrationService` + `IRegulatedTradeRepository` bindings to `server/src/auth/auth.module.ts` providers
- [x] 3.2 Create `server/src/auth/adapters/typeorm-regulated-trade.repository.ts` implementing `findByTradeName()` via TypeORM
- [x] 3.3 Add `create()` implementation to `server/src/auth/adapters/typeorm-user.repository.ts` using `this.repo.save()`
- [x] 3.4 Add `POST /auth/register` endpoint (unauthenticated) to `server/src/auth/auth.controller.ts` calling `registrationService.register()`

## Phase 4: Testing

- [x] 4.1 Create `server/src/auth/application/registration.service.spec.ts` — unit tests covering: ESC-01 (cliente → 201, providerStatus=null), ESC-02 (prestador non-regulated → habilitado), ESC-03 (prestador regulated → pendiente_habilitacion), ESC-06 (duplicate email → 409), OCL post-conditions (Argon2id hash, email lowercased, no data leak on 409)
- [x] 4.2 Extend `server/src/auth/auth.controller.spec.ts` — API tests via Supertest covering: ESC-01/02/03 (201 responses), ESC-04/05 (422 on missing/invalid fields), ESC-06 (409 on duplicate email), verify RegisterResponseDto shape
