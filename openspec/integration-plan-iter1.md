# Integration Plan — Iteration 1

> How to land the in-flight feature branches onto `main` in order. The team does the
> conflict resolution, PRs and reviews — this is the sequencing + per-branch playbook.
> Snapshot taken when all branches forked from `31b3b41` (before UC01-merge, CI, Docker, the
> 422 + TS1272 fixes), so every branch is ~13 commits behind `main`.

## Branch landscape

| Branch | Author | Work Item | Stack | TS1272 build risk | main.ts conflict |
|--------|--------|-----------|-------|-------------------|------------------|
| `uc07-solicitar-contratacion` | antopirovani | UC07 | base of contratación stack | clean (`import type`) | trivial (identical 422) |
| `uc08-enviar-propuesta` | antopirovani | UC08 | ⊃ uc07 | clean | trivial |
| `uc09-gestionar-estados` | antopirovani | UC09 | ⊃ uc08 ⊃ uc07 (+ `state-machine/`) | clean | trivial |
| `UC-4` | Tomas | UC04 buscar prestadores | independent | **HAS TS1272** | none |

**Key fact:** `uc07 ⊂ uc08 ⊂ uc09` — linear stack, each contains the previous. `uc09` is the tip
(adds the real `state-machine/` module replacing the stub). `UC-4` is independent (new `catalogo/`
module) but carries a stale copy of UC01 that is already in `main`.

## Master rule — serialize

Branch protection on `main` is `strict=true` (require up-to-date). After **every** merge the other
branches go out-of-date and must re-sync. So integrate **one at a time, in order**. There is no
parallel shortcut for the final merge (prep can be parallel).

## Per-merge Definition of Done (= the 3 required checks + review)
- Branch up-to-date with `main`
- `npm test` green · `npm run build` green · `npm run test:e2e` green (docker compose up)
- eslint reviewed · `verify.md` present · 1 approving review

## Common conflict
- `server/src/app.module.ts` — every UC registers its module + entity. Resolution: **keep them all**
  (different lines, mechanical).

---

## Order: UC07 → UC08 → UC09 → UC04

The antopirovani stack lands first (cheap, clean), then the heavy independent UC04.

> **Stacked-PR choice (antopirovani's call):** because `uc07 ⊂ uc08 ⊂ uc09`, you can either
> (A) land 3 sequential PRs (uc07 → uc08 → uc09) — preserves per-Work-Item SDD traceability/gate, or
> (B) open a single PR from `uc09` that brings UC07+UC08+UC09 at once — fewer reviews but collapses
> three Work Items into one integration. **Recommended: A** (per-UC gate). Steps below assume A.

### Wave 1 — `uc07-solicitar-contratacion`
- `git merge origin/main`
- Conflicts: `app.module.ts` (mechanical) · `main.ts` → **identical to main's 422 change, keep either**
- No TS1272. Build should pass.
- Verify → PR → CI green → review → **merge**

### Wave 2 — `uc08-enviar-propuesta` (after UC07 is in main)
- `git merge origin/main` → contratación files from uc07 already in main; `main.ts` already resolved
  (no re-conflict). Real delta = the *send-proposal* commit.
- Minor possible conflict in `contratacion.service.ts` / `controller` (uc08 evolved them) — direct
  resolution, uc08 is a superset.
- Verify → PR → CI → review → **merge**

### Wave 3 — `uc09-gestionar-estados` (after UC08 is in main)
- `git merge origin/main` → only delta left = the `state-machine/` module + the StubStateMachine
  replacement wiring. main.ts/contratación already in main.
- `app.module.ts`: register `StateMachineModule` + `StateChangeHistory` entity (keep all).
- Clean TS1272. Verify → PR → CI → review → **merge**

### Wave 4 — `UC-4` (UC04, the heavy one — independent, can be prepped in parallel)
Two mandatory jobs before its PR can go green:

**a) Drop the stale UC01 it carries.** `registration.service.ts`, `auth/*`, `register.dto`,
`user.entity`, `package*.json` are **already in main** (UC01 merge + the TS1272 fix). On resolve:
> Take **main's** version for ALL of `server/src/auth/**` and `package*.json`. Keep ONLY the new
> `catalogo/**` files + the catalogo registration in `app.module.ts`.
> Practical, after the merge: `git checkout origin/main -- server/src/auth server/package.json server/package-lock.json`
> ⚠️ Taking "its own" `registration.service.ts` **reverts the TS1272 fix and breaks the build.**

**b) Fix TS1272 in `catalogo/`.** In `buscador.service.ts` (any service with `@Inject`), move the
interfaces to type-only imports:
```ts
import { PRESTADOR_REPOSITORY, type IPrestadorRepository, type BusquedaCriteria, type PaginatedResult } from '../ports/prestador-repository.port.js';
import { GEOCODING_SERVICE, type IGeocodingService, type Coordenadas } from '../ports/geocoding.port.js';
```
Without this, `npm run build` (CI) is **RED**.

- Verify (build especially) → PR → CI → review → **merge**

---

## Effort summary

| Branch | Effort | Main blocker |
|--------|--------|--------------|
| UC07 | 🟢 low | mechanical wiring |
| UC08 | 🟡 med | wait for UC07 + merge contratación |
| UC09 | 🟡 med | wait for UC08 + register state-machine module |
| UC04 | 🔴 high | drop stale UC01 + fix TS1272 |

---

## Wave 5 — Post-integration cleanup (only AFTER all 4 branches are merged)

Deliberately deferred until UC07/UC08/UC09/UC04 are all in `main`: doing it earlier reformats
shared files and adds conflict churn to the still-open branches.

1. **Prettier sweep.** `cd server && npx eslint src test --fix` (clears the ~64 `prettier/prettier`
   formatting errors), then fix the remaining `@typescript-eslint` errors by hand — at last
   measurement ~305 problems total, only ~70 auto-fixable. The manual residue is mostly
   `no-unsafe-*` (untyped values), `unbound-method` (in specs), `require-await`, `no-unused-vars`.
2. **Make lint blocking.** Once `npx eslint src test` exits 0, flip `continue-on-error: true` →
   `false` on the server **Lint** step in `.github/workflows/ci.yml`, so the static-analysis gate
   is enforced on every PR (closes the one deviation from the doc's §3764 CI gate).
3. Verify `npm test` + `npm run build` still green, commit (sweep separate from the CI flip), push.

> Document the `import type` / TS1272 rule in the root `AGENTS.md` gotchas section while here — it
> was discovered after AGENTS.md was written and bit UC04. Adding it prevents the next branch from
> repeating it.
