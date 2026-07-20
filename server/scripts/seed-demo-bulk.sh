#!/usr/bin/env bash
#
# seed-demo-bulk.sh — Bulk synthetic SUPPLY so the demo marketplace feels busy/popular.
#
# WHY this exists (and how it differs from seed-demo.sh):
#   - seed-demo.sh seeds ~45 REAL providers (registered via API → they have a `users` row,
#     a valid argon2 hash, and can log in). It also drives contrataciones through the
#     real state machine. That is the INTERACTIVE flow a human walks through.
#   - This script seeds HUNDREDS of synthetic providers that are PURE SEARCHABLE SUPPLY:
#     they never log in, never own a contratacion. The `prestadores` table has a uuid PK
#     and NO foreign key to `users` (see prestador.entity.ts — no relation declared), so
#     we INSERT catalog rows directly with gen_random_uuid(): no registration, no API,
#     no login. That is what makes "hundreds" cheap.
#
# Search filter (from typeorm-prestador.repository.ts): a provider appears iff
#   cuenta_activa=true AND tiene_servicios_publicados=true AND visible=true
#   AND categoria = :oficio (EXACT string match)
#   AND geocoded(ubicacion) inside zona_cobertura.geometry (point-in-polygon).
# So every synthetic row sets the three booleans true, `categoria` = an exact UI oficio
# label (client/lib/trades.ts), and an Argentina-wide coverage polygon (same ring as
# seed-demo.sh) so ANY Misiones location the user picks falls inside.
#
# IDEMPOTENT, SELF-SCOPING reset:
#   The ONLY prestadores WITHOUT a matching `users` row are these synthetic ones (real
#   providers — including seed-demo.sh's ~45 — always have a user row created at register
#   time with id = user.id). So the reset deletes prestadores/servicios whose id /
#   prestador_id is NOT IN (SELECT id FROM users). This cleans a prior bulk run WITHOUT
#   touching any real/demo-API provider.
#
# LOCAL/DEMO use only — never wire into production startup.
#
# The SQL lives in seed-demo-bulk.sql (copied to the container via docker cp) so that
# accented characters are NOT passed through the shell pipe — the SQL file is written
# with the correct UTF-8 bytes and read directly by psql -f inside the container.
#
# Usage:
#   server/scripts/seed-demo-bulk.sh           # seed BULK_COUNT (default 300) providers
#   BULK_COUNT=500 server/scripts/seed-demo-bulk.sh
#   server/scripts/seed-demo-bulk.sh --print   # report how many synthetic providers exist
#
# Requirements: Postgres container `snack_overflow_db` up with the schema present.
#   (No backend needed — this is pure SQL.)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# ── Config (connection style copied verbatim from seed-demo.sh) ──────────────────
DB_CONTAINER="${DB_CONTAINER:-snack_overflow_db}"
DB_USER="${DB_USER:-snack_user}"
DB_NAME="${DB_NAME:-snack_overflow}"

# How many synthetic providers to generate.
BULK_COUNT="${BULK_COUNT:-300}"

psql() {
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A "$@"
}

# A synthetic provider == a prestadores row whose id is NOT a users id.
count_synthetic() {
  psql -c "SELECT count(*) FROM prestadores WHERE id NOT IN (SELECT id FROM users);" | tr -d '[:space:]'
}

# ── --print short-circuit ─────────────────────────────────────────────────────────
if [[ "${1:-}" == "--print" ]]; then
  echo "Synthetic (bulk) providers currently in catalog: $(count_synthetic)"
  exit 0
fi

echo "==> Bulk seed: generating $BULK_COUNT synthetic providers (pure supply)"

# ── Reset previous BULK rows (idempotent, self-scoping, FK-safe order) ──────────────
# Delete servicios first (FK prestador_id → prestadores), then prestadores. Scope to
# rows whose id is NOT a users id, so real/demo-API providers (always users-backed) survive.
echo "==> Reset previous synthetic rows (id NOT IN users) — preserves real providers"
psql -c "
DELETE FROM servicios   WHERE prestador_id NOT IN (SELECT id FROM users);
DELETE FROM prestadores WHERE id          NOT IN (SELECT id FROM users);
" >/dev/null

# ── Copy the SQL file to the container (bypasses pipe encoding for accented chars) ─
# The heredoc pipe (PowerShell → docker) corrupts UTF-8 accented characters. By copying
# the file to the container and running psql -f, we use the file's raw UTF-8 bytes.
echo "==> Copy SQL file to container"
docker cp "$SCRIPT_DIR/seed-demo-bulk.sql" "$DB_CONTAINER:/tmp/seed-bulk.sql"

echo "==> Execute bulk seed SQL (psql -f)"
docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" \
  -v ON_ERROR_STOP=1 -v bulk_count="$BULK_COUNT" \
  -f /tmp/seed-bulk.sql >/dev/null
# ── Report ──────────────────────────────────────────────────────────────────────────
TOTAL_SYNTH=$(count_synthetic)
echo "==> Bulk seed complete."
echo "    synthetic providers now in catalog: $TOTAL_SYNTH"
echo "    (re-run is idempotent; --print reports the current count)"
