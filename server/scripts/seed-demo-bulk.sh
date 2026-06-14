#!/usr/bin/env bash
#
# seed-demo-bulk.sh — Bulk synthetic SUPPLY so the demo marketplace feels busy/popular.
#
# WHY this exists (and how it differs from seed-demo.sh):
#   - seed-demo.sh seeds 6 REAL providers (registered via API → they have a `users` row,
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
#   providers — including seed-demo.sh's 6 — always have a user row created at register
#   time with id = user.id). So the reset deletes prestadores/servicios whose id /
#   prestador_id is NOT IN (SELECT id FROM users). This cleans a prior bulk run WITHOUT
#   touching any real/demo-API provider.
#
# LOCAL/DEMO use only — never wire into production startup.
#
# Usage:
#   server/scripts/seed-demo-bulk.sh           # seed BULK_COUNT (default 300) providers
#   BULK_COUNT=500 server/scripts/seed-demo-bulk.sh
#   server/scripts/seed-demo-bulk.sh --print   # report how many synthetic providers exist
#
# Requirements: Postgres container `snack_overflow_db` up with the schema present.
#   (No backend needed — this is pure SQL.)
set -euo pipefail

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

# ── Generate BULK_COUNT providers in ONE statement ──────────────────────────────────
# Strategy: generate_series(1, N) → for each row, index PostgreSQL arrays by modulo to
# pick a name/oficio/localidad, and use random() for ratings/reviews/availability. The
# zona_cobertura / disponibilidad_resumen jsonb are built inline with jsonb_build_object.
#
#  - oficios[]      : the 12 EXACT UI labels from client/lib/trades.ts (categoria = primary).
#  - ~20% of rows get a SECOND, different oficio appended (still single categoria).
#  - ratings        : ~10% brand-new at 0.0; the rest spread 3.5–5.0 (one decimal).
#  - reviews        : 0 for the new ones; otherwise skewed so most are 0–50 but some 100+.
#  - availability   : ~50% disponible_esta_semana, ~30% proxima_disponible (+proximaFecha),
#                     ~20% sin_disponibilidad — so all card badge tiers appear.
#  - coverage ring  : Argentina-wide, identical to seed-demo.sh, so every search matches.
# Also inserts 2 servicios per provider so a clicked profile isn't empty.
# Quoted heredoc delimiter ('SQL'): NO shell expansion, so backticks in SQL comments
# (e.g. `categoria`) are passed through literally. BULK_COUNT is injected as a psql
# variable (:bulk_count) instead of shell interpolation.
psql -v ON_ERROR_STOP=1 -v bulk_count="$BULK_COUNT" <<'SQL' >/dev/null
WITH cfg AS (
  SELECT
    ARRAY['Sofía','Mateo','Valentina','Santiago','Camila','Benjamín','Martina','Lucas',
          'Julieta','Tomás','Catalina','Joaquín','Emilia','Bautista','Isabella','Thiago',
          'Lucía','Agustín','Mía','Facundo','Renata','Ignacio','Delfina','Gael','Pilar']::text[]   AS nombres,
    ARRAY['Gómez','Fernández','Rodríguez','López','Martínez','Sosa','Pereyra','Benítez',
          'Acuña','Rojas','Romero','Silva','Ramírez','Torres','Flores','Vera','Cabrera',
          'Ferreyra','Aguirre','Núñez','Domínguez','Giménez','Coronel','Ojeda','Maidana']::text[]  AS apellidos,
    -- EXACT labels from client/lib/trades.ts — these are the search `categoria` keys.
    ARRAY['Electricista','Gasista','Plomero','Técnico en refrigeración','Albañil',
          'Carpintero','Pintor','Herrero','Jardinero','Techista','Cerrajero','Fletero']::text[]     AS oficios,
    -- Misiones cities from client/lib/catalogo/ubicaciones.ts.
    ARRAY['Posadas','Oberá','Eldorado','Garupá','Puerto Iguazú','Apóstoles',
          'Leandro N. Alem','Montecarlo','Puerto Rico','Jardín América','San Vicente',
          'Aristóbulo del Valle','Wanda','Candelaria']::text[]                                       AS localidades
),
gen AS (
  SELECT
    g.i,
    (SELECT nombres[(g.i % array_length(nombres,1)) + 1] FROM cfg)                                   AS nombre,
    (SELECT apellidos[((g.i / 3) % array_length(apellidos,1)) + 1] FROM cfg)                          AS apellido,
    (SELECT oficios[(g.i % array_length(oficios,1)) + 1] FROM cfg)                                    AS oficio_primario,
    (SELECT oficios[((g.i + 5) % array_length(oficios,1)) + 1] FROM cfg)                              AS oficio_secundario,
    (SELECT localidades[(g.i % array_length(localidades,1)) + 1] FROM cfg)                            AS localidad,
    random() AS r_new, random() AS r_rating, random() AS r_rev,
    random() AS r_avail, random() AS r_second
  FROM generate_series(1, :bulk_count) AS g(i)
),
rows AS (
  SELECT
    gen_random_uuid()                                                                                AS pid,
    nombre || ' ' || apellido                                                                        AS nombre_completo,
    -- ~20% get a second (distinct) trade appended to the simple-array TEXT column.
    CASE WHEN r_second < 0.20 AND oficio_secundario <> oficio_primario
         THEN oficio_primario || ',' || oficio_secundario
         ELSE oficio_primario END                                                                    AS oficios_csv,
    oficio_primario                                                                                  AS categoria,
    localidad,
    -- ~10% brand-new (0.0). Rest: 3.5–5.0 rounded to one decimal.
    CASE WHEN r_new < 0.10 THEN 0.0
         ELSE round((3.5 + r_rating * 1.5)::numeric, 1) END                                          AS calificacion,
    -- New ones get 0 reviews. Rest: most 0–50, a popular tail up to ~400.
    CASE WHEN r_new < 0.10 THEN 0
         WHEN r_rev < 0.70 THEN floor(r_rev * 50)::int
         ELSE floor(50 + r_rev * 350)::int END                                                       AS resenas,
    r_avail
  FROM gen
),
ins_prestadores AS (
  INSERT INTO prestadores (
    id, nombre_completo, oficios, categoria,
    calificacion_promedio, cantidad_resenas,
    zona_cobertura, localidad,
    cuenta_activa, tiene_servicios_publicados, visible,
    disponibilidad_resumen
  )
  SELECT
    pid,
    nombre_completo,
    oficios_csv,
    categoria,
    calificacion,
    resenas,
    jsonb_build_object(
      'geometry', jsonb_build_object(
        'type', 'Polygon',
        'coordinates', jsonb_build_array(jsonb_build_array(
          jsonb_build_array(-74,-56), jsonb_build_array(-53,-56),
          jsonb_build_array(-53,-21), jsonb_build_array(-74,-21),
          jsonb_build_array(-74,-56)))),
      'localidad', localidad
    ),
    localidad,
    true, true, true,
    CASE
      WHEN r_avail < 0.50 THEN
        jsonb_build_object('estado','disponible_esta_semana',
                           'franjasDisponiblesProximos7Dias', (1 + floor(r_avail * 20))::int)
      WHEN r_avail < 0.80 THEN
        jsonb_build_object('estado','proxima_disponible',
                           'proximaFecha', to_char((CURRENT_DATE + ((1 + floor(r_avail * 10))::int)), 'YYYY-MM-DD'))
      ELSE
        jsonb_build_object('estado','sin_disponibilidad')
    END
  FROM rows
  RETURNING id, categoria, localidad
)
-- Two representative servicios per provider so a clicked profile isn't empty.
INSERT INTO servicios (id, prestador_id, categoria, descripcion, rango_precio_min, rango_precio_max, visible)
SELECT
  gen_random_uuid(),
  p.id,
  p.categoria,
  s.descripcion,
  (5000 + floor(random() * 5000))::numeric,
  (20000 + floor(random() * 15000))::numeric,
  true
FROM ins_prestadores p
CROSS JOIN LATERAL (
  VALUES
    ('Servicio de ' || p.categoria || ' a domicilio en ' || p.localidad || ' y zona.'),
    (p.categoria || ': presupuestos sin cargo, materiales y mano de obra.')
) AS s(descripcion);
SQL

# ── Report ──────────────────────────────────────────────────────────────────────────
TOTAL_SYNTH=$(count_synthetic)
echo "==> Bulk seed complete."
echo "    synthetic providers now in catalog: $TOTAL_SYNTH"
echo "    (re-run is idempotent; --print reports the current count)"
