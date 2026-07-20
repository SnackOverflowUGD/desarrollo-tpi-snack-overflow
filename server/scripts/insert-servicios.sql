-- Insert servicios for each prestador
INSERT INTO servicios (id, prestador_id, categoria, descripcion, rango_precio_min, rango_precio_max, visible) VALUES 
(uuid_generate_v4(), '4653e6a5-28cb-47ec-8391-c0735f091ef7', 'Electricista', 'Instalaciones eléctricas, tableros y reparaciones a domicilio.', 5000, 25000, true),
(uuid_generate_v4(), '0b876270-477c-4dd2-8410-6c0c8109ba64', 'Plomero', 'Destapaciones, instalación de cañerías y reparación de pérdidas.', 6000, 22000, true),
(uuid_generate_v4(), 'bded7cee-20f1-4f95-800c-a606ff6f00b5', 'Carpintero', 'Muebles a medida, reparaciones y colocación de aberturas.', 8000, 30000, true),
(uuid_generate_v4(), '08b36e05-4dfb-4e7f-8510-b63ee49a2836', 'Gasista matriculado', 'Instalaciones de gas, conexión de artefactos y certificaciones.', 7000, 28000, true),
(uuid_generate_v4(), 'e01205dc-a44e-4363-8e0b-f0d519365041', 'Pintor', 'Pintura interior y exterior, revoques y trabajos en altura.', 4000, 18000, true),
(uuid_generate_v4(), 'e4f0e1f1-786b-4cf8-a42e-108d82761efa', 'Cerrajero', 'Aperturas, cambio de cerraduras y duplicado de llaves 24hs.', 3000, 15000, true);