-- seed-demo-bulk.sql — Bulk synthetic SUPPLY SQL (UTF-8 safe, no shell pipe).
-- Separated from the .sh wrapper so accented characters survive regardless of
-- terminal encoding (the .sh copies this file to the container and runs psql -f).
--
-- Usage (from seed-demo-bulk.sh):
--   docker cp seed-demo-bulk.sql snack_overflow_db:/tmp/seed-bulk.sql
--   docker exec snack_overflow_db psql -U snack_user -d snack_overflow -f /tmp/seed-bulk.sql

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
    r_avail,
    -- Real coordinates per Misiones city → distinct coverage centroid per locality.
    CASE localidad
      WHEN 'Posadas' THEN -27.3671 WHEN 'Oberá' THEN -27.4878 WHEN 'Eldorado' THEN -26.4000
      WHEN 'Garupá' THEN -27.4833 WHEN 'Puerto Iguazú' THEN -25.5972 WHEN 'Apóstoles' THEN -27.9119
      WHEN 'Leandro N. Alem' THEN -27.6019 WHEN 'Montecarlo' THEN -26.5667 WHEN 'Puerto Rico' THEN -26.8000
      WHEN 'Jardín América' THEN -27.0333 WHEN 'San Vicente' THEN -26.9939 WHEN 'Aristóbulo del Valle' THEN -27.0950
      WHEN 'Wanda' THEN -25.9667 WHEN 'Candelaria' THEN -27.4667 ELSE -27.3671 END                   AS lat,
    CASE localidad
      WHEN 'Posadas' THEN -55.8969 WHEN 'Oberá' THEN -55.1199 WHEN 'Eldorado' THEN -54.6167
      WHEN 'Garupá' THEN -55.8333 WHEN 'Puerto Iguazú' THEN -54.5786 WHEN 'Apóstoles' THEN -55.7561
      WHEN 'Leandro N. Alem' THEN -55.3253 WHEN 'Montecarlo' THEN -54.7667 WHEN 'Puerto Rico' THEN -55.0333
      WHEN 'Jardín América' THEN -55.2333 WHEN 'San Vicente' THEN -54.4878 WHEN 'Aristóbulo del Valle' THEN -54.8978
      WHEN 'Wanda' THEN -54.5667 WHEN 'Candelaria' THEN -55.7500 ELSE -55.8969 END                   AS lng
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
          jsonb_build_array(lng-0.1, lat-0.1), jsonb_build_array(lng+0.1, lat-0.1),
          jsonb_build_array(lng+0.1, lat+0.1), jsonb_build_array(lng-0.1, lat+0.1),
          jsonb_build_array(lng-2.5, lat-2.5)))),
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
