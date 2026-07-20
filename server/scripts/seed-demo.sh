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

# Extra clientes (PoC): more cliente accounts so demos aren't limited to one.
# These are plain clientes (no catalog rows). Format: LOCALPART|NOMBRE|APELLIDO
CLIENTES_EXTRA=(
  "demo.cliente.ana|Ana|Torres"
  "demo.cliente.pablo|Pablo|Giménez"
)

# Providers: KEY|EMAIL_LOCALPART|NOMBRE|APELLIDO|TRADE(lowercase for register)|OFICIO(categoria,exact match for search)|LOCALIDAD|CALIFICACION|DESC
# TRADE is the lowercase register value; OFICIO is the catalog categoria the search matches.
PRESTADORES=(
  #╌╌╌╌ Electricistas (calificaciones 2.8 a 5.0) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "electricista|prestador.electricista|Ramiro|Gómez|electricista|Electricista|Posadas|4.8|Instalaciones eléctricas, tableros y reparaciones a domicilio."
  "electricista2|prestador.electricista2|Juan|Martínez|electricista|Electricista|Posadas|4.2|Reparaciones eléctricas menores y mantenimiento."
  "electricista3|prestador.electricista3|Pedro|López|electricista|Electricista|Oberá|3.5|Instalaciones básicas y cambio de componentes."
  "electricista4|prestador.electricista4|Ana|Giménez|electricista|Electricista|Eldorado|5.0|Especialista en instalaciones industriales y trifásica."
  "electricista5|prestador.electricista5|Luis|Pereyra|electricista|Electricista|Puerto Iguazú|2.8|Trabajos eléctricos sencillos a domicilio."
  "electricista6|prestador.electricista6|María|Rivas|electricista|Electricista|Garupá|4.9|Domótica e instalaciones inteligentes."
  "electricista7|prestador.electricista7|Jorge|Acosta|electricista|Electricista|San Vicente|3.2|Electricidad rural y mantenimiento de bombas."

  #╌╌╌╌ Plomeros (calificaciones 2.5 a 4.9) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "plomero|prestador.plomero|Diego|Fernández|plomero|Plomero|Posadas|4.6|Destapaciones, instalación de cañerías y reparación de pérdidas."
  "plomero2|prestador.plomero2|Laura|Ramírez|plomero|Plomero|Posadas|4.9|Termofusión y sistemas de agua caliente."
  "plomero3|prestador.plomero3|Héctor|Morales|plomero|Plomero|Oberá|3.8|Reparaciones de pérdidas y cambio de grifería."
  "plomero4|prestador.plomero4|Silvia|Medina|plomero|Plomero|Apóstoles|4.4|Instalación de tanques y sistemas de bombeo."
  "plomero5|prestador.plomero5|Carlos|Duarte|plomero|Plomero|Leandro N. Alem|2.5|Arreglos básicos de plomería."

  #╌╌╌╌ Carpinteros (calificaciones 3.0 a 4.9) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "carpintero|prestador.carpintero|Martín|Sosa|carpintero|Carpintero|Oberá|4.9|Muebles a medida, reparaciones y colocación de aberturas."
  "carpintero2|prestador.carpintero2|Valentina|Gutiérrez|carpintero|Carpintero|Posadas|4.5|Cocinas integradas y placares empotrados."
  "carpintero3|prestador.carpintero3|Roberto|Vera|carpintero|Carpintero|Garupá|3.0|Reparaciones de muebles y cambio de bisagras."

  #╌╌╌╌ Gasistas (calificaciones 3.5 a 4.7) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "gasista|prestador.gasista|Lucía|Benítez|gasista|Gasista matriculado|Eldorado|4.7|Instalaciones de gas, conexión de artefactos y certificaciones."
  "gasista2|prestador.gasista2|Marcelo|Farias|gasista|Gasista matriculado|Posadas|4.1|Reparación de calefones y termotanques."
  "gasista3|prestador.gasista3|Gabriela|Sosa|gasista|Gasista matriculado|Montecarlo|3.5|Certificaciones y colocación de artefactos."

  #╌╌╌╌ Pintores (calificaciones 1.5 a 4.8) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "pintor|prestador.pintor|Andrés|Rojas|pintor|Pintor|Garupá|4.5|Pintura interior y exterior, revoques y trabajos en altura."
  "pintor2|prestador.pintor2|Camila|Torres|pintor|Pintor|Posadas|4.8|Pintura decorativa, estucado y texturas."
  "pintor3|prestador.pintor3|Fernando|Álvarez|pintor|Pintor|Oberá|3.2|Pintura básica y blanqueo."
  "pintor4|prestador.pintor4|Florencia|Mendoza|pintor|Pintor|Apóstoles|1.5|Trabajos de pintura sencillos (precios accesibles)."

  #╌╌╌╌ Cerrajeros (calificaciones 3.0 a 4.8) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "cerrajero|prestador.cerrajero|Sofía|Acuña|cerrajero|Cerrajero|Posadas|4.8|Aperturas, cambio de cerraduras y duplicado de llaves 24hs."
  "cerrajero2|prestador.cerrajero2|Ricardo|Luna|cerrajero|Cerrajero|Eldorado|4.3|Cerraduras digitales y sistemas de seguridad."
  "cerrajero3|prestador.cerrajero3|Mónica|Paz|cerrajero|Cerrajero|San Vicente|3.0|Apertura de puertas y cambio de cilindros."

  #╌╌╌╌ Herreros (calificaciones 3.8 a 4.6) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "herrero|prestador.herrero|Patricio|Silvero|herrero|Herrero|Posadas|4.6|Portones, rejas y estructuras metálicas a medida."
  "herrero2|prestador.herrero2|Natalia|Coronel|herrero|Herrero|Oberá|4.0|Barandas, escaleras y muebles de hierro."
  "herrero3|prestador.herrero3|Gustavo|Romero|herrero|Herrero|Puerto Iguazú|3.8|Soldadura en general y reparaciones metálicas."

  #╌╌╌╌ Techistas (calificaciones 2.0 a 4.7) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "techista|prestador.techista|Alejandro|Domínguez|techista|Techista|Posadas|4.7|Reparación de techos, filtraciones y recambio de chapas."
  "techista2|prestador.techista2|Daniela|Flores|techista|Techista|Garupá|4.2|Impermeabilizaciones y terrazas."
  "techista3|prestador.techista3|Sergio|Godoy|techista|Techista|San Ignacio|2.0|Arreglos menores de goteras."

  #╌╌╌╌ Jardineros (calificaciones 3.0 a 4.5) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "jardinero|prestador.jardinero|Elena|Ayala|jardinero|Jardinero|Posadas|4.5|Diseño de jardines, poda y mantenimiento integral."
  "jardinero2|prestador.jardinero2|Pablo|Báez|jardinero|Jardinero|Candelaria|3.8|Corte de césped y limpieza de terrenos."
  "jardinero3|prestador.jardinero3|Romina|Cabral|jardinero|Jardinero|Santa Ana|3.0|Mantenimiento de jardines domiciliarios."

  #╌╌╌╌ Albañiles (calificaciones 1.0 a 4.6) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "albanil|prestador.albanil|Oscar|Vázquez|albañil|Albañil|Posadas|4.6|Construcción en seco y refacciones generales."
  "albanil2|prestador.albanil2|Graciela|Moreno|albañil|Albañil|Leandro N. Alem|3.5|Revogues, contrapisos y colocación de cerámicos."
  "albanil3|prestador.albanil3|Alberto|Ibáñez|albañil|Albañil|Jardín América|1.0|Trabajos básicos de albañilería (consultar disponibilidad)."

  #╌╌╌╌ Vidrieros (calificaciones 3.5 a 4.3) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "vidriero|prestador.vidriero|Andrea|Méndez|vidriero|Vidriero|Posadas|4.3|Colocación de vidrios, mamparas y espejos a medida."
  "vidriero2|prestador.vidriero2|Fabián|Roldán|vidriero|Vidriero|Oberá|3.5|Reparación de ventanas y cambio de vidrios rotos."

  #╌╌╌╌ Lavanderos (calificaciones 4.0 a 4.4) ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌
  "lavandero|prestador.lavandero|Rita|Aguirre|lavandero|Lavandero|Posadas|4.4|Lavado y planchado de ropa con recogida a domicilio."
  "lavandero2|prestador.lavandero2|Mario|Cáceres|lavandero|Lavandero|Garupá|4.0|Lavado de prendas delicadas y uniformes."
)

psql() {
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -A "$@"
}

# ── --print short-circuit ───────────────────────────────────────────────────────
if [[ "${1:-}" == "--print" ]]; then
  echo "CLIENTE: $CLIENTE_EMAIL / $DEMO_PASSWORD"
  for c in "${CLIENTES_EXTRA[@]}"; do
    IFS='|' read -r local nombre apellido <<<"$c"
    echo "CLIENTE: ${local}@${DEMO_DOMAIN} / $DEMO_PASSWORD"
  done
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
    Posadas)          lat=-27.3671; lng=-55.8969 ;;
    Garupá)           lat=-27.4833; lng=-55.8333 ;;
    Oberá)            lat=-27.4833; lng=-55.1167 ;;
    Eldorado)         lat=-26.4000; lng=-54.6167 ;;
    "Puerto Iguazú")  lat=-25.6000; lng=-54.5667 ;;
    "San Vicente")    lat=-26.6167; lng=-54.1333 ;;
    "Leandro N. Alem") lat=-27.6500; lng=-55.3333 ;;
    Apóstoles)        lat=-27.9167; lng=-55.7500 ;;
    Montecarlo)       lat=-26.5667; lng=-54.7500 ;;
    "San Ignacio")    lat=-27.2667; lng=-55.5333 ;;
    "Santa Ana")      lat=-27.4667; lng=-55.5833 ;;
    Candelaria)       lat=-27.4667; lng=-55.7333 ;;
    "Jardín América") lat=-27.0500; lng=-55.2333 ;;
    *)                lat=-27.3671; lng=-55.8969 ;;  # default: Posadas
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

# Extra clientes (PoC): registered via API so they get a valid argon2 hash and
# can log in. No catalog rows — they are consumers only.
echo "==> Register extra clientes"
for c in "${CLIENTES_EXTRA[@]}"; do
  IFS='|' read -r local nombre apellido <<<"$c"
  email="${local}@${DEMO_DOMAIN}"
  register "$nombre" "$apellido" "$email" "$DEMO_PASSWORD" "cliente"
  echo "    + cliente -> $email"
done

# ── Register prestadores + insert catalog rows ───────────────────────────────────
declare -A PREST_ID PREST_EMAIL PREST_OFICIO PREST_LOCALIDAD
echo "==> Register prestadores + insert catalog/servicios rows"
for p in "${PRESTADORES[@]}"; do
  IFS='|' read -r key local nombre apellido trade oficio localidad calif desc <<<"$p"
  email="${local}@${DEMO_DOMAIN}"
  # register auto-creates the catalog `prestadores` row (16.5km coverage circle,
  # categoria from the trade map, calificacion=0, tiene_servicios_publicados=false).
  register "$nombre" "$apellido" "$email" "$DEMO_PASSWORD" "prestador" "$trade" "$localidad"
  pid=$(psql -c "SELECT id FROM users WHERE email = '$email';" | tr -d '[:space:]')
  if [[ -z "$pid" ]]; then echo "!! could not resolve id for $email" >&2; exit 1; fi
  PREST_ID[$key]="$pid"
  PREST_EMAIL[$key]="$email"
  PREST_OFICIO[$key]="$oficio"
  PREST_LOCALIDAD[$key]="$localidad"

  # UPDATE the auto-created row: varied demo rating, publish services, and force
  # visible=true (regulated trades like "Gasista matriculado" start PENDIENTE →
  # visible=false). Then add a servicios row for the profile. PoC only.
  psql -c "
UPDATE prestadores SET
  calificacion_promedio = $calif,
  cantidad_resenas = $((RANDOM % 40 + 5)),
  tiene_servicios_publicados = true,
  visible = true,
  disponibilidad_resumen = '{\"estado\":\"disponible_esta_semana\",\"franjasDisponiblesProximos7Dias\":8}'::jsonb
WHERE id = '$pid';
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

  Clientes:
    $CLIENTE_EMAIL  /  $DEMO_PASSWORD   (id $CLIENTE_ID)
EOF
for c in "${CLIENTES_EXTRA[@]}"; do
  IFS='|' read -r local nombre apellido <<<"$c"
  printf '    %s  /  %s\n' "${local}@${DEMO_DOMAIN}" "$DEMO_PASSWORD"
done
cat <<EOF

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
