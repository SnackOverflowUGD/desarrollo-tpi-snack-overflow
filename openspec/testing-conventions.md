# Testing Conventions — Snack Overflow

> Operationalizes **ADR-006** (pirámide automatizada sin TDD estricto) into concrete rules
> so every developer writes tests consistently. Read this before adding tests to any Work Item.

## The pyramid (ADR-006)

| Level | Tool | Lives in | Real infra? | Command | Owner / cadence |
|-------|------|----------|-------------|---------|-----------------|
| **Unit** | Jest | `server/src/**/*.spec.ts` | ❌ in-memory fakes | `npm test` / `npm run test:cov` | Verificador, per micro-increment |
| **Integration / API** | Supertest | `server/test/*.e2e-spec.ts` | ✅ Postgres + Redis | `npm run test:e2e` | CI, per Work Item |
| **E2E / system** | Playwright | `client/e2e/*.spec.ts` | ✅ full stack + browser | `cd client && npm run test:e2e` | **Human tester, sprint close** |

Playwright is **not** in per-commit CI (per ADR-006 it is the human tester's sprint-close gate).
The other two levels run on every push/PR via `.github/workflows/ci.yml`.

## Golden rules

1. **Tests mirror production config — never diverge.** If you configure framework behavior in a
   test (pipes, guards, interceptors), the SAME config must exist in `main.ts`. A unit spec once
   set `errorHttpStatusCode: 422` on its own `ValidationPipe` while `main.ts` used the default 400 —
   the unit tests went green but the deployed API violated the spec. Integration tests boot the real
   `AppModule`; mirror `main.ts` there exactly so they catch this class of drift.
2. **Scenario traceability.** Every `ESC-xx` in the spec maps to ≥1 test; name the test with its ESC
   id (e.g. `'ESC-01: cliente → 201 ...'`). The `verify.md` compliance matrix must be fillable.
3. **OCL → assertions.** Each pre/postcondition in `design.md` becomes an explicit assertion.
4. **Coverage DoD.** ≥90% on core modules (RNF-O.2). `npm run test:cov` reports it; it is part of
   Definition of Done together with code review + an updated spec.
5. **Naming = routing.** `*.spec.ts` → unit (jest, `rootDir: src`). `*.e2e-spec.ts` → integration/e2e
   (jest-e2e config, `rootDir: test`). The filename is what puts a test in the right job.
6. **Unique data per run.** Integration tests hit a persistent DB. Key on `Date.now()`/`process.pid`
   (e.g. unique emails) so re-runs never collide with the duplicate/uniqueness guards.
7. **Unit = zero infra.** A `*.spec.ts` that needs a live Postgres/Redis is misclassified — move it to
   `*.e2e-spec.ts`. If a behavior truly needs real infra (e.g. lockout TTL expiry, ESC-09),
   `it.skip` it in the unit spec and cover it in an integration spec (see
   `test/redis-attempt-store.e2e-spec.ts`).

## Templates to copy

- **API happy-path + error codes:** `server/test/auth.e2e-spec.ts` (register → login, 201/409/422/200/401).
- **Adapter against real infra:** `server/test/redis-attempt-store.e2e-spec.ts` (Redis TTL, ESC-09).

## Running locally

```bash
docker compose up -d                 # Postgres 15 + Redis 7 (creds in server/.env.example)
cd server && npm test                # unit (fast, no infra)
cd server && npm run test:cov        # unit + coverage
cd server && npm run test:e2e        # integration (needs the containers up)
docker compose down                  # stop (keeps volumes)
```

`NODE_ENV` must be ≠ `production` for integration runs so TypeORM `synchronize` auto-creates the
schema (no migrations yet).

## CI gates (`.github/workflows/ci.yml`)

| Job | Blocking | Notes |
|-----|----------|-------|
| Backend (server) — unit + coverage | ✅ | |
| Backend e2e — Postgres + Redis service containers | ✅ | runs `test:e2e` |
| Frontend (client) — lint + build | ✅ | |
| Server eslint | ⚠️ non-blocking | temporary — pending a coordinated `prettier --write` sweep after iteration-1 branches merge, then flip to blocking |
