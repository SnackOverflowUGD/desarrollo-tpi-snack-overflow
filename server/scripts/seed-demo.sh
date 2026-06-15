#!/usr/bin/env bash
#
# seed-demo.sh — Demo data seed so a human can log in and SEE/RUN the basic flow:
# search -> profile -> solicitar -> presupuestar -> confirmar -> iniciar -> finalizar.
#
# WHY this exists (and how it differs from seed-e2e.sh):
#   - seed-e2e.sh seeds the single MI-11 E2E identity. DO NOT run this against those
#     rows — this script is scoped to its OWN marker domain '@demo.snackoverflow.test'
#     so it never touches E2E rows.
#   - A searchable provider needs a CATALOG `prestadores` row (POST /auth/register only
#     creates the `users` row). So: register the user via API (valid argon2 hash for real
#     login) + INSERT the catalog `prestadores` row + `servicios` + tiene_servicios_publicados.
#   - The current estado of a contratacion is derived from the state machine
#     (`state_change_history`), so we NEVER fabricate advanced states via raw SQL — we
#     drive the REAL API (login -> POST /contrataciones -> transition endpoints), keeping
#     `contrataciones.estado` and `state_change_history` consistent.
#
# Geocoding is REAL (Nominatim). We can't predict exact lat/lng, so each provider gets an
# Argentina-wide coverage polygon ([lng,lat], ring closed) — any Argentine geocode falls
# inside it, so the point-in-polygon coverage filter always matches.
#
# Search filter (from typeorm-prestador.repository.ts): a provider appears iff
#   cuenta_activa=true AND tiene_servicios_publicados=true AND visible=true
#   AND categoria = :oficio (EXACT string match)
#   AND geocoded(ubicacion) inside zona_cobertura.geometry
# So `categoria` must equal the `?oficio=` query string EXACTLY (capitalized display form).
#
# LOCAL/DEMO use only — never wire into production startup.
#
# Usage:
#   server/scripts/seed-demo.sh           # seed (idempotent: resets its own rows first)
#   server/scripts/seed-demo.sh --print   # print the seeded credentials and exit
#
# Requirements: backend up on :3000, Postgres container `snack_overflow_db` up.
set -euo pipefail

# ── Config (connection style copied verbatim from seed-e2e.sh) ──────────────────
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"
DB_CONTAINER="${DB_CONTAINER:-snack_overflow_db}"
DB_USER="${DB_USER:-snack_user}"
DB_NAME="${DB_NAME:-snack_overflow}"

# Marker domain — lets us reset ONLY our own rows without touching E2E or other data.
DEMO_DOMAIN="demo.snackoverflow.test"
DEMO_PASSWORD="demo1234"

CLIENTE_EMAIL="demo.cliente@${DEMO_DOMAIN}"

# Providers: KEY|EMAIL_LOCALPART|NOMBRE|APELLIDO|TRADE(lowercase for register)|OFICIO(categoria,exact match for search)|LOCALIDAD|CALIFICACION|DESC
# TRADE is the lowercase register value; OFICIO is the catalog categoria the search matches.
PRESTADORES=(
  "electricista|prestador.electricista|Ramiro|Gómez|electricista|Electricista|Posadas|4.8|Instalaciones eléctricas, tableros y reparaciones a domicilio."
  "plomero|prestador.plomero|Diego|Fernández|plomero|Plomero|Posadas|4.6|Destapaciones, instalación de cañerías y reparación de pérdidas."
  "carpintero|prestador.carpintero|Martín|Sosa|carpintero|Carpintero|Oberá|4.9|Muebles a medida, reparaciones y colocación de aberturas."
  "gasista|prestador.gasista|Lucía|Benítez|gasista|Gasista matriculado|Eldorado|4.7|Instalaciones de gas, conexión de artefactos y certificaciones."
  "pintor|prestador.pintor|Andrés|Rojas|pintor|Pintor|Garupá|4.5|Pintura interior y exterior, revoques y trabajos en altura."
  "cerrajero|prestador.cerrajero|Sofía|Acuña|cerrajero|Cerrajero|Posadas|4.8|Aperturas, cambio de cerraduras y duplicado de llaves 24hs."
)

psql() {
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A "$@"
}

# ── --print short-circuit ───────────────────────────────────────────────────────
if [[ "${1:-}" == "--print" ]]; then
  echo "CLIENTE: $CLIENTE_EMAIL / $DEMO_PASSWORD"
  for p in "${PRESTADORES[@]}"; do
    IFS='|' read -r key local nombre apellido trade oficio localidad calif desc <<<"$p"
    echo "PRESTADOR ($oficio @ $localidad): ${local}@${DEMO_DOMAIN} / $DEMO_PASSWORD"
  done
  exit 0
fi

# ── Reset previous demo rows (idempotent, FK-safe order) ─────────────────────────
# Everything is scoped by the demo email domain. contrataciones reference user ids by
# value (varchar, no FK); state_change_history references contratacion id by value.
echo "==> Reset previous demo rows (scoped to @${DEMO_DOMAIN})"
psql -c "
WITH demo_users AS (
  SELECT id FROM users WHERE email LIKE '%@${DEMO_DOMAIN}'
), demo_contrat AS (
  SELECT id FROM contrataciones
   WHERE cliente_id IN (SELECT id::text FROM demo_users)
      OR prestador_id IN (SELECT id::text FROM demo_users)
)
DELETE FROM state_change_history
 WHERE contratacion_id IN (SELECT id::text FROM demo_contrat);

DELETE FROM contrataciones
 WHERE cliente_id IN (SELECT id::text FROM users WHERE email LIKE '%@${DEMO_DOMAIN}')
    OR prestador_id IN (SELECT id::text FROM users WHERE email LIKE '%@${DEMO_DOMAIN}');

DELETE FROM servicios
 WHERE prestador_id IN (SELECT id FROM users WHERE email LIKE '%@${DEMO_DOMAIN}');

DELETE FROM prestadores
 WHERE id IN (SELECT id FROM users WHERE email LIKE '%@${DEMO_DOMAIN}');

DELETE FROM users WHERE email LIKE '%@${DEMO_DOMAIN}';
" >/dev/null

# ── Helpers ──────────────────────────────────────────────────────────────────────
register() {
  # $1 name, $2 lastName, $3 email, $4 password, $5 role, [$6 trade]
  local payload resp status
  if [[ -n "${6:-}" ]]; then
    payload=$(printf '{"name":"%s","lastName":"%s","email":"%s","phone":"+5493764000000","password":"%s","role":"%s","trade":"%s"}' "$1" "$2" "$3" "$4" "$5" "$6")
  else
    payload=$(printf '{"name":"%s","lastName":"%s","email":"%s","phone":"+5493764000000","password":"%s","role":"%s"}' "$1" "$2" "$3" "$4" "$5")
  fi
  resp=$(curl -s -w '\n%{http_code}' -X POST "$BACKEND_URL/auth/register" \
    -H 'Content-Type: application/json' -d "$payload")
  status=$(printf '%s' "$resp" | tail -n1)
  if [[ "$status" != "201" ]]; then
    echo "!! register failed for $3 (HTTP $status): $(printf '%s' "$resp" | head -n1)" >&2
    exit 1
  fi
}

login() {
  # $1 email, $2 password -> echoes accessToken
  local resp token
  resp=$(curl -s -X POST "$BACKEND_URL/auth/login" \
    -H 'Content-Type: application/json' \
    -d "$(printf '{"email":"%s","password":"%s"}' "$1" "$2")")
  token=$(printf '%s' "$resp" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
  if [[ -z "$token" ]]; then
    echo "!! login failed for $1: $resp" >&2
    exit 1
  fi
  printf '%s' "$token"
}

# POST a contratacion -> echoes the new contratacion id. $1 token, $2 prestadorId, $3 desc, $4 ubicacion
crear_contratacion() {
  local resp id
  resp=$(curl -s -X POST "$BACKEND_URL/contrataciones" \
    -H "Authorization: Bearer $1" -H 'Content-Type: application/json' \
    -d "$(printf '{"ubicacion":"%s","prestadorId":"%s","fecha":"%s","franja":"%s","descripcion":"%s"}' \
          "$4" "$2" "$FECHA_SOLICITUD" "09:00-11:00" "$3")")
  id=$(printf '%s' "$resp" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')
  if [[ -z "$id" ]]; then
    echo "!! crear_contratacion failed: $resp" >&2
    exit 1
  fi
  printf '%s' "$id"
}

# POST a transition. $1 token, $2 contratacion id, $3 path segment, [$4 json body]
transition() {
  local resp status body="${4:-}"
  if [[ -n "$body" ]]; then
    resp=$(curl -s -w '\n%{http_code}' -X POST "$BACKEND_URL/contrataciones/$2/$3" \
      -H "Authorization: Bearer $1" -H 'Content-Type: application/json' -d "$body")
  else
    resp=$(curl -s -w '\n%{http_code}' -X POST "$BACKEND_URL/contrataciones/$2/$3" \
      -H "Authorization: Bearer $1" -H 'Content-Type: application/json')
  fi
  status=$(printf '%s' "$resp" | tail -n1)
  if [[ "$status" != "200" && "$status" != "201" ]]; then
    echo "!! transition '$3' on $2 failed (HTTP $status): $(printf '%s' "$resp" | head -n1)" >&2
    exit 1
  fi
}

# Build a per-locality coverage polygon (~33 km box) centred on the provider's city.
# Using a city-specific polygon ensures each provider gets a distinct centroid so that
# distance ranking works correctly in UAT (UAT-01: Posadas must rank before San Vicente).
# Coordinate order: [lng, lat] — GeoJSON standard (ring closed with 5th = 1st point).
# LC_ALL=C ensures awk uses '.' as decimal separator regardless of system locale.
zona_cobertura() {
  local loc="$1"
  local lat lng
  case "$loc" in
    Posadas)   lat=-27.3671; lng=-55.8969 ;;
    Garupá)    lat=-27.4833; lng=-55.8333 ;;
    Oberá)     lat=-27.4833; lng=-55.1167 ;;
    Eldorado)  lat=-26.4000; lng=-54.6167 ;;
    *)         lat=-27.3671; lng=-55.8969 ;;  # default: Posadas
  esac
  # 0.3° ≈ 33 km — enough to be city-specific but not overlap neighbouring cities
  LC_ALL=C awk -v lat="$lat" -v lng="$lng" -v loc="$loc" 'BEGIN {
    d = 0.3
    printf "{\"geometry\":{\"type\":\"Polygon\",\"coordinates\":[[[%.4f,%.4f],[%.4f,%.4f],[%.4f,%.4f],[%.4f,%.4f],[%.4f,%.4f]]]},\"localidad\":\"%s\"}\n",
      lng-d, lat-d,
      lng+d, lat-d,
      lng+d, lat+d,
      lng-d, lat+d,
      lng-d, lat-d,
      loc
  }'
}

# fecha for solicitudes: a few days out (create validates fecha >= today).
FECHA_SOLICITUD=$(date -d "+5 days" +%Y-%m-%d)

# ── Register the demo cliente ────────────────────────────────────────────────────
echo "==> Register demo cliente"
register "Camila" "Duarte" "$CLIENTE_EMAIL" "$DEMO_PASSWORD" "cliente"
CLIENTE_ID=$(psql -c "SELECT id FROM users WHERE email = '$CLIENTE_EMAIL';" | tr -d '[:space:]')
CLIENTE_TOKEN=$(login "$CLIENTE_EMAIL" "$DEMO_PASSWORD")
echo "    cliente id: $CLIENTE_ID"

# ── Register prestadores + insert catalog rows ───────────────────────────────────
declare -A PREST_ID PREST_EMAIL PREST_OFICIO PREST_LOCALIDAD
echo "==> Register prestadores + insert catalog/servicios rows"
for p in "${PRESTADORES[@]}"; do
  IFS='|' read -r key local nombre apellido trade oficio localidad calif desc <<<"$p"
  email="${local}@${DEMO_DOMAIN}"
  register "$nombre" "$apellido" "$email" "$DEMO_PASSWORD" "prestador" "$trade"
  pid=$(psql -c "SELECT id FROM users WHERE email = '$email';" | tr -d '[:space:]')
  if [[ -z "$pid" ]]; then echo "!! could not resolve id for $email" >&2; exit 1; fi
  PREST_ID[$key]="$pid"
  PREST_EMAIL[$key]="$email"
  PREST_OFICIO[$key]="$oficio"
  PREST_LOCALIDAD[$key]="$localidad"

  zona=$(zona_cobertura "$localidad")
  # categoria = OFICIO (exact, capitalized) so GET ?oficio=<OFICIO> matches.
  psql -c "
INSERT INTO prestadores (
  id, nombre_completo, oficios, categoria,
  calificacion_promedio, cantidad_resenas,
  zona_cobertura, localidad,
  cuenta_activa, tiene_servicios_publicados, visible,
  disponibilidad_resumen
) VALUES (
  '$pid',
  '$nombre $apellido',
  '$oficio',
  '$oficio',
  $calif, $((RANDOM % 40 + 5)),
  '$zona'::jsonb,
  '$localidad',
  true, true, true,
  '{\"estado\":\"disponible_esta_semana\",\"franjasDisponiblesProximos7Dias\":8}'::jsonb
);
INSERT INTO servicios (
  id, prestador_id, categoria, descripcion,
  rango_precio_min, rango_precio_max, visible
) VALUES (
  uuid_generate_v4(),
  '$pid',
  '$oficio',
  '$desc',
  $((RANDOM % 5000 + 5000)), $((RANDOM % 15000 + 20000)), true
);
" >/dev/null
  echo "    + $oficio ($localidad) -> $email (id $pid)"
done

# ── Create demo contrataciones via the REAL API (state-machine consistent) ───────
echo "==> Create demo contrataciones in mixed states (API-driven)"

# 1) SOLICITADA — cliente requests electricista, left untouched.
C_SOLICITADA=$(crear_contratacion "$CLIENTE_TOKEN" "${PREST_ID[electricista]}" \
  "Necesito revisar el tablero eléctrico de mi casa, salta la térmica." "Av. Mitre 1500, Posadas, Misiones, Argentina")
echo "    solicitada  : $C_SOLICITADA (electricista)"

# 2) PRESUPUESTADA — cliente requests plomero, prestador sends a proposal.
C_PRESUPUESTADA=$(crear_contratacion "$CLIENTE_TOKEN" "${PREST_ID[plomero]}" \
  "Pérdida de agua bajo la pileta de la cocina." "Calle San Lorenzo 845, Posadas, Misiones, Argentina")
PLOMERO_TOKEN=$(login "${PREST_EMAIL[plomero]}" "$DEMO_PASSWORD")
transition "$PLOMERO_TOKEN" "$C_PRESUPUESTADA" "proposal" \
  "$(printf '{"fecha":"%s","franja":"14:00-16:00","precioEstimado":18500}' "$FECHA_SOLICITUD")"
echo "    presupuestada: $C_PRESUPUESTADA (plomero)"

# 3) FINALIZADA — full walk with carpintero: proposal -> confirm -> start -> finish.
C_FINALIZADA=$(crear_contratacion "$CLIENTE_TOKEN" "${PREST_ID[carpintero]}" \
  "Reparar y ajustar las puertas del placard del dormitorio." "Calle 9 de Julio 320, Oberá, Misiones, Argentina")
CARPINTERO_TOKEN=$(login "${PREST_EMAIL[carpintero]}" "$DEMO_PASSWORD")
transition "$CARPINTERO_TOKEN" "$C_FINALIZADA" "proposal" \
  "$(printf '{"fecha":"%s","franja":"10:00-12:00","precioEstimado":24000}' "$FECHA_SOLICITUD")"
transition "$CLIENTE_TOKEN"    "$C_FINALIZADA" "confirm"
transition "$CARPINTERO_TOKEN" "$C_FINALIZADA" "start"
transition "$CARPINTERO_TOKEN" "$C_FINALIZADA" "finish"
echo "    finalizada  : $C_FINALIZADA (carpintero)"

# 4) EN_CURSO — full walk with cerrajero up to start (in-progress job).
C_ENCURSO=$(crear_contratacion "$CLIENTE_TOKEN" "${PREST_ID[cerrajero]}" \
  "Cambiar la cerradura de la puerta principal por una de seguridad." "Av. Uruguay 2100, Posadas, Misiones, Argentina")
CERRAJERO_TOKEN=$(login "${PREST_EMAIL[cerrajero]}" "$DEMO_PASSWORD")
transition "$CERRAJERO_TOKEN" "$C_ENCURSO" "proposal" \
  "$(printf '{"fecha":"%s","franja":"16:00-18:00","precioEstimado":15000}' "$FECHA_SOLICITUD")"
transition "$CLIENTE_TOKEN"   "$C_ENCURSO" "confirm"
transition "$CERRAJERO_TOKEN" "$C_ENCURSO" "start"
echo "    en_curso    : $C_ENCURSO (cerrajero)"

# ── Verify: search returns a seeded provider ─────────────────────────────────────
echo "==> Verify search GET /catalogo/prestadores?oficio=Electricista&ubicacion=Posadas..."
SEARCH_JSON=$(curl -s -G "$BACKEND_URL/catalogo/prestadores" \
  --data-urlencode "oficio=Electricista" \
  --data-urlencode "ubicacion=Posadas, Misiones, Argentina")
if printf '%s' "$SEARCH_JSON" | grep -q "${PREST_ID[electricista]}"; then
  SEARCH_HITS=$(printf '%s' "$SEARCH_JSON" | grep -o '"id"' | wc -l | tr -d '[:space:]')
  echo "    OK — electricista found in search (results containing an id: $SEARCH_HITS)."
else
  echo "!! seeded electricista NOT found in search results:" >&2
  printf '%s\n' "$SEARCH_JSON" >&2
  exit 1
fi

# ── Verify: cliente sees the seeded contrataciones ───────────────────────────────
echo "==> Verify GET /contrataciones as the demo cliente"
CONTRAT_JSON=$(curl -s "$BACKEND_URL/contrataciones" -H "Authorization: Bearer $CLIENTE_TOKEN")
CONTRAT_COUNT=$(printf '%s' "$CONTRAT_JSON" | grep -o '"estado"' | wc -l | tr -d '[:space:]')
echo "    cliente sees $CONTRAT_COUNT contrataciones."
if [[ "$CONTRAT_COUNT" -lt 4 ]]; then
  echo "!! expected >= 4 contrataciones, got $CONTRAT_COUNT:" >&2
  printf '%s\n' "$CONTRAT_JSON" >&2
  exit 1
fi

# Read back the final estados straight from the DB (source of truth) for the summary.
estado_de() { psql -c "SELECT estado FROM contrataciones WHERE id = '$1';" | tr -d '[:space:]'; }

# ── Summary ──────────────────────────────────────────────────────────────────────
cat <<EOF

================================================================================
  SNACK OVERFLOW — DEMO SEED COMPLETE
================================================================================

  CREDENCIALES (password para todos: $DEMO_PASSWORD)

  Cliente:
    $CLIENTE_EMAIL  /  $DEMO_PASSWORD   (id $CLIENTE_ID)

  Prestadores:
EOF
for p in "${PRESTADORES[@]}"; do
  IFS='|' read -r key local nombre apellido trade oficio localidad calif desc <<<"$p"
  printf '    %-22s %s  /  %s   [%s @ %s]\n' "$oficio" "${local}@${DEMO_DOMAIN}" "$DEMO_PASSWORD" "$oficio" "$localidad"
done
cat <<EOF

  CONTRATACIONES sembradas (cliente: $CLIENTE_EMAIL)
    solicitada    -> $(estado_de "$C_SOLICITADA")    (electricista)  id $C_SOLICITADA
    presupuestada -> $(estado_de "$C_PRESUPUESTADA")  (plomero)       id $C_PRESUPUESTADA
    finalizada    -> $(estado_de "$C_FINALIZADA")    (carpintero)    id $C_FINALIZADA
    en_curso      -> $(estado_de "$C_ENCURSO")      (cerrajero)     id $C_ENCURSO

  VERIFICACION
    Búsqueda Electricista/Posadas: encontrado (resultados: $SEARCH_HITS)
    GET /contrataciones (cliente): $CONTRAT_COUNT contrataciones visibles

  PROBÁ EL FLUJO
    1. Login como $CLIENTE_EMAIL / $DEMO_PASSWORD
    2. Buscá "Electricista" en "Posadas, Misiones, Argentina" -> ver prestadores
    3. Entrá a un perfil -> Solicitar -> (login como el prestador para Presupuestar)
       -> Confirmar (cliente) -> Iniciar (prestador) -> Finalizar (prestador)

  RE-EJECUTAR (idempotente):  server/scripts/seed-demo.sh
================================================================================
EOF
