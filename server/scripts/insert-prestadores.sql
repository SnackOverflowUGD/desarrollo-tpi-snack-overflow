-- Insert prestadores with proper coverage zones (50km radius circles)
-- Coordinates: [lng, lat] format for GeoJSON

-- Electricista en Posadas
INSERT INTO prestadores (id, nombre_completo, oficios, categoria, calificacion_promedio, cantidad_resenas, zona_cobertura, localidad, cuenta_activa, tiene_servicios_publicados, visible, disponibilidad_resumen) VALUES 
('4653e6a5-28cb-47ec-8391-c0735f091ef7', 'Ramiro Gómez', ARRAY['Electricista'], 'Electricista', 4.8, 15, 
'{"geometry":{"type":"Polygon","coordinates":[[[-55.896,-27.367],[-55.443,-27.367],[-55.443,-26.914],[-55.896,-26.914],[-55.896,-27.367]]]},"localidad":"Posadas"}'::jsonb, 
'Posadas', true, true, true, '{"estado":"disponible_esta_semana","franjasDisponiblesProximos7Dias":8}'::jsonb);

-- Plomero en Posadas
INSERT INTO prestadores (id, nombre_completo, oficios, categoria, calificacion_promedio, cantidad_resenas, zona_cobertura, localidad, cuenta_activa, tiene_servicios_publicados, visible, disponibilidad_resumen) VALUES 
('0b876270-477c-4dd2-8410-6c0c8109ba64', 'Diego Fernández', ARRAY['Plomero'], 'Plomero', 4.6, 12, 
'{"geometry":{"type":"Polygon","coordinates":[[[-55.896,-27.367],[-55.443,-27.367],[-55.443,-26.914],[-55.896,-26.914],[-55.896,-27.367]]]},"localidad":"Posadas"}'::jsonb, 
'Posadas', true, true, true, '{"estado":"disponible_esta_semana","franjasDisponiblesProximos7Dias":8}'::jsonb);

-- Carpintero en Oberá
INSERT INTO prestadores (id, nombre_completo, oficios, categoria, calificacion_promedio, cantidad_resenas, zona_cobertura, localidad, cuenta_activa, tiene_servicios_publicados, visible, disponibilidad_resumen) VALUES 
('bded7cee-20f1-4f95-800c-a606ff6f00b5', 'Martín Sosa', ARRAY['Carpintero'], 'Carpintero', 4.9, 20, 
'{"geometry":{"type":"Polygon","coordinates":[[[-55.120,-27.487],[-54.667,-27.487],[-54.667,-27.034],[-55.120,-27.034],[-55.120,-27.487]]]},"localidad":"Oberá"}'::jsonb, 
'Oberá', true, true, true, '{"estado":"disponible_esta_semana","franjasDisponiblesProximos7Dias":8}'::jsonb);

-- Gasista en Eldorado
INSERT INTO prestadores (id, nombre_completo, oficios, categoria, calificacion_promedio, cantidad_resenas, zona_cobertura, localidad, cuenta_activa, tiene_servicios_publicados, visible, disponibilidad_resumen) VALUES 
('08b36e05-4dfb-4e7f-8510-b63ee49a2836', 'Lucía Benítez', ARRAY['Gasista matriculado'], 'Gasista matriculado', 4.7, 18, 
'{"geometry":{"type":"Polygon","coordinates":[[[-54.632,-26.408],[-54.179,-26.408],[-54.179,-25.955],[-54.632,-25.955],[-54.632,-26.408]]]},"localidad":"Eldorado"}'::jsonb, 
'Eldorado', true, true, true, '{"estado":"disponible_esta_semana","franjasDisponiblesProximos7Dias":8}'::jsonb);

-- Pintor en Garupá
INSERT INTO prestadores (id, nombre_completo, oficios, categoria, calificacion_promedio, cantidad_resenas, zona_cobertura, localidad, cuenta_activa, tiene_servicios_publicados, visible, disponibilidad_resumen) VALUES 
('e01205dc-a44e-4363-8e0b-f0d519365041', 'Andrés Rojas', ARRAY['Pintor'], 'Pintor', 4.5, 10, 
'{"geometry":{"type":"Polygon","coordinates":[[[-55.833,-27.483],[-55.380,-27.483],[-55.380,-27.030],[-55.833,-27.030],[-55.833,-27.483]]]},"localidad":"Garupá"}'::jsonb, 
'Garupá', true, true, true, '{"estado":"disponible_esta_semana","franjasDisponiblesProximos7Dias":8}'::jsonb);

-- Cerrajero en Posadas
INSERT INTO prestadores (id, nombre_completo, oficios, categoria, calificacion_promedio, cantidad_resenas, zona_cobertura, localidad, cuenta_activa, tiene_servicios_publicados, visible, disponibilidad_resumen) VALUES 
('e4f0e1f1-786b-4cf8-a42e-108d82761efa', 'Sofía Acuña', ARRAY['Cerrajero'], 'Cerrajero', 4.8, 25, 
'{"geometry":{"type":"Polygon","coordinates":[[[-55.896,-27.367],[-55.443,-27.367],[-55.443,-26.914],[-55.896,-26.914],[-55.896,-27.367]]]},"localidad":"Posadas"}'::jsonb, 
'Posadas', true, true, true, '{"estado":"disponible_esta_semana","franjasDisponiblesProximos7Dias":8}'::jsonb);