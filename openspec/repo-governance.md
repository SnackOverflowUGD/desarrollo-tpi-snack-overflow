# Repo Governance — Post-Transfer Setup Runbook

> Run this **after** the repo is transferred from the personal account (`cukijas`) to a
> GitHub **Organization**. Personal-account repos cannot grant collaborators the Admin role;
> the org is what unlocks shared admin + branch rulesets + merge queue.

## 1. Grant admin to the team

Org → repo → **Settings → Collaborators and teams**:
- Add `giuliano` (and the rest of the team) as members.
- Set role **Admin** for whoever manages CI/branch rules (or create a `maintainers` team with Admin).

Everyone else who only ships code needs **Write** (enough to push branches + open PRs).

## 2. Apply branch protection on `main`

Once you have Admin, run (contexts already match the CI job names):

```bash
gh api --method PUT repos/<ORG>/desarrollo-tpi-snack-overflow/branches/main/protection \
  --input - <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Backend (server)",
      "Backend e2e (real Postgres + Redis)",
      "Frontend (client)"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
```

What it enforces:
- `strict: true` → **require branches up to date**: re-runs CI against the real `main` before each
  merge → catches the N-branch semantic-merge problem (branch green in isolation, broken combined).
- 3 required green checks before merge.
- PR + 1 approving review; stale reviews dismissed on new pushes.
- `enforce_admins: false` → admins can bypass in emergencies (set `true` for a hard gate).
- Blocks force-push and deletion of `main`.

> **If you rename a CI job** in `.github/workflows/ci.yml`, update the `contexts` array to match —
> the check name = the job's `name:` value. A stale context name silently never passes.

## 3. (Optional) Merge queue — serialize N merges

Not available via the protection API above; enable it as a **ruleset**:
Org/repo → **Settings → Rules → Rulesets → New branch ruleset** → target `main` →
enable **Require merge queue** (on top of the status-check + up-to-date rules).
This batches and re-tests queued PRs against the resulting `main`, so concurrent merges can't
break each other.

## 4. Verify

```bash
gh api repos/<ORG>/desarrollo-tpi-snack-overflow/branches/main/protection \
  -q '{strict: .required_status_checks.strict, checks: .required_status_checks.contexts, reviews: .required_pull_request_reviews.required_approving_review_count}'
```

## Notes after transfer

- **Redirects:** GitHub auto-redirects the old `cukijas/...` URLs + git remotes, but everyone should
  update their `origin` to the new org URL: `git remote set-url origin <new-url>`.
- **Actions/CI:** workflows + the CI runs carry over; no secrets are configured today, so nothing to
  re-add. If secrets get added later (e.g. deploy tokens), they live per-repo/per-org and must be
  re-created after transfer.
- **Branches:** open feature branches (`UC-4`, etc.) and PRs transfer with the repo.
