#!/usr/bin/env bash
#
# seed-e2e.sh — Reproducible seed for the MI-11 system end-to-end flow.
#
# WHY: the search flow (UC04) only returns a provider that exists as a row in the
# `prestadores` catalog table with `tiene_servicios_publicados = true`, a
# `categoria` matching the searched oficio, and a `zona_cobertura` GeoJSON polygon
# that contains the geocoded client location. Registering a user with
# role=prestador (POST /auth/register) creates ONLY the `users` row — it does NOT
# create the catalog `prestadores` row. So we register users via the API (so the
# argon2 password hash is valid for login) and INSERT the catalog/service rows via
# SQL.
#
# Geocoding is REAL (OpenStreetMap Nominatim), so we cannot predict the exact
# lat/lng for a location string. We sidestep that by giving the seeded provider a
# coverage polygon that spans the whole of Argentina — whatever coordinates
# Nominatim returns for an Argentine location fall inside it, so the point-in-
# polygon coverage filter always matches.
#
# This script is for LOCAL/E2E use only — never wire it into production startup.
#
# Usage:
#   server/scripts/seed-e2e.sh           # seed (idempotent: resets the E2E rows first)
#   server/scripts/seed-e2e.sh --print   # print the seeded credentials/ids and exit
#
# Requirements: backend up on :3000, Postgres container `snack_overflow_db` up.
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
DB_CONTAINER="${DB_CONTAINER:-snack_overflow_db}"
DB_USER="${DB_USER:-snack_user}"
DB_NAME="${DB_NAME:-snack_overflow}"

# Stable, well-known E2E identities. The marker substring 'e2e-mi11' lets us reset
# only our own rows without touching anything else in the DB.
CLIENTE_EMAIL="cliente.e2e-mi11@snackoverflow.test"
CLIENTE_PASSWORD="cliente1234"
PRESTADOR_EMAIL="prestador.e2e-mi11@snackoverflow.test"
PRESTADOR_PASSWORD="prestador1234"

# The oficio/categoria the search uses. Must match EXACTLY between the seeded
# `prestadores.categoria` and the `?oficio=` query (the repo does `categoria = :oficio`).
OFICIO="Electricista"
# Any Argentine location string — Nominatim resolves it; the Argentina-wide polygon
# guarantees the coverage filter matches regardless of the exact coordinates.
UBICACION="Posadas, Misiones, Argentina"

psql() {
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A "$@"
}

# ── --print short-circuit ───────────────────────────────────────────────────────
if [[ "${1:-}" == "--print" ]]; then
  cat <<EOF
CLIENTE_EMAIL=$CLIENTE_EMAIL
CLIENTE_PASSWORD=$CLIENTE_PASSWORD
PRESTADOR_EMAIL=$PRESTADOR_EMAIL
PRESTADOR_PASSWORD=$PRESTADOR_PASSWORD
OFICIO=$OFICIO
UBICACION=$UBICACION
EOF
  exit 0
fi

echo "==> Reset previous E2E rows (idempotent)"
# Delete in FK-safe order. Provider catalog rows + services key off the prestador
# user id; contrataciones reference both user ids by value (varchar, no FK).
psql -c "
DELETE FROM contrataciones
 WHERE cliente_id IN (SELECT id::text FROM users WHERE email IN ('$CLIENTE_EMAIL','$PRESTADOR_EMAIL'))
    OR prestador_id IN (SELECT id::text FROM users WHERE email IN ('$CLIENTE_EMAIL','$PRESTADOR_EMAIL'));
DELETE FROM servicios
 WHERE prestador_id IN (SELECT id FROM users WHERE email = '$PRESTADOR_EMAIL');
DELETE FROM prestadores
 WHERE id IN (SELECT id FROM users WHERE email = '$PRESTADOR_EMAIL');
DELETE FROM users WHERE email IN ('$CLIENTE_EMAIL','$PRESTADOR_EMAIL');
" >/dev/null

# ── Register users via the API (valid argon2 hash for real login) ────────────────
register() {
  # $1 name, $2 lastName, $3 email, $4 password, $5 role, [$6 trade], [$7 localidad]
  # Since the registro-localidad feature, POST /auth/register auto-creates the
  # catalog `prestadores` row and REQUIRES localidad for the prestador role.
  local payload resp status
  payload=$(printf '{"name":"%s","lastName":"%s","email":"%s","phone":"+5493764000000","password":"%s","role":"%s"' \
    "$1" "$2" "$3" "$4" "$5")
  if [[ -n "${6:-}" ]]; then payload+=$(printf ',"trade":"%s"' "$6"); fi
  if [[ -n "${7:-}" ]]; then payload+=$(printf ',"localidad":"%s"' "$7"); fi
  payload+='}'
  resp=$(curl -s -w '\n%{http_code}' -X POST "$BACKEND_URL/auth/register" \
    -H 'Content-Type: application/json' -d "$payload")
  status=$(printf '%s' "$resp" | tail -n1)
  if [[ "$status" != "201" ]]; then
    echo "!! register failed for $3 (HTTP $status): $(printf '%s' "$resp" | head -n1)" >&2
    exit 1
  fi
}

echo "==> Register cliente via API"
register "Carla" "Cliente" "$CLIENTE_EMAIL" "$CLIENTE_PASSWORD" "cliente"

echo "==> Register prestador via API"
# Plain (non-regulated) trade keeps providerStatus = HABILITADO so it can operate.
# localidad is REQUIRED for the prestador role; register auto-creates the catalog row.
register "Pedro" "Prestador" "$PRESTADOR_EMAIL" "$PRESTADOR_PASSWORD" "prestador" "$OFICIO" "Posadas"

# ── Resolve the prestador user id ────────────────────────────────────────────────
PRESTADOR_ID=$(psql -c "SELECT id FROM users WHERE email = '$PRESTADOR_EMAIL';" | tr -d '[:space:]')
CLIENTE_ID=$(psql -c "SELECT id FROM users WHERE email = '$CLIENTE_EMAIL';" | tr -d '[:space:]')
if [[ -z "$PRESTADOR_ID" ]]; then
  echo "!! could not resolve prestador id" >&2
  exit 1
fi
echo "    prestador user id: $PRESTADOR_ID"
echo "    cliente   user id: $CLIENTE_ID"

# ── Update the auto-created catalog provider row + insert a published service ─────
# register (registro-localidad feature) already created the `prestadores` row
# (16.5km coverage circle for Posadas). We OVERWRITE zona_cobertura with an
# Argentina-wide GeoJSON Polygon ([lng,lat] order, ring closed) so any Argentine
# geocode result is "covered", and force tiene_servicios_publicados=true / visible=true
# (both REQUIRED for the provider to appear in search).
echo "==> Update prestadores catalog row (Argentina-wide coverage) + service"
psql -c "
UPDATE prestadores SET
  calificacion_promedio = 4.8,
  cantidad_resenas = 12,
  zona_cobertura = '{\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[-74,-56],[-53,-56],[-53,-21],[-74,-21],[-74,-56]]]},\"localidad\":\"Posadas\"}'::jsonb,
  tiene_servicios_publicados = true,
  visible = true,
  disponibilidad_resumen = '{\"estado\":\"disponible_esta_semana\",\"franjasDisponiblesProximos7Dias\":8}'::jsonb
WHERE id = '$PRESTADOR_ID';

INSERT INTO servicios (
  id, prestador_id, categoria, descripcion,
  rango_precio_min, rango_precio_max, visible
) VALUES (
  uuid_generate_v4(),
  '$PRESTADOR_ID',
  '$OFICIO',
  'Instalaciones eléctricas, tableros y reparaciones a domicilio.',
  8000, 25000, true
);
" >/dev/null

# ── Verify the provider is now searchable ────────────────────────────────────────
echo "==> Verify GET /catalogo/prestadores?oficio=$OFICIO&ubicacion=..."
SEARCH_JSON=$(curl -s -G "$BACKEND_URL/catalogo/prestadores" \
  --data-urlencode "oficio=$OFICIO" \
  --data-urlencode "ubicacion=$UBICACION")
if printf '%s' "$SEARCH_JSON" | grep -q "$PRESTADOR_ID"; then
  echo "    OK — seeded provider appears in search results."
else
  echo "!! seeded provider NOT found in search results:" >&2
  printf '%s\n' "$SEARCH_JSON" >&2
  exit 1
fi

cat <<EOF

==> Seed complete.
    Cliente   : $CLIENTE_EMAIL / $CLIENTE_PASSWORD  (id $CLIENTE_ID)
    Prestador : $PRESTADOR_EMAIL / $PRESTADOR_PASSWORD  (id $PRESTADOR_ID)
    Oficio    : $OFICIO
    Ubicacion : $UBICACION

    Run the system E2E:  cd client && npx playwright test e2e/sistema.spec.ts --project=chromium
EOF
