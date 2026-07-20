# fix-seed-cobertura-zona — Spec

## Propósito

Este cambio corrige el script de seed demo (`seed-demo.sh`) para que asigne a cada prestador una zona de cobertura realista: un círculo de **~50 km de radio** centrado en su `localidad` declarada, en lugar del polígono Argentina-wide actual. Esto permite que la búsqueda por distancia y el filtrado por zona de cobertura funcionen correctamente en el entorno de demo.

## Requisitos

### REQ-01 — Per-locality coverage circles in seed
El script `seed-demo.sh` **DEBE** asignar a cada prestador una zona de cobertura que sea un **círculo de ~50 km de radio** centrado en su `localidad` declarada, no un polígono que cubra toda Argentina.

### REQ-02 — Realistic city coordinates
Cada `localidad` en el seed **DEBE** mapearse a coordenadas reales aproximadas:
- **Posadas**: `-27.367, -55.896`
- **Oberá**: `-27.487, -55.120`
- **Eldorado**: `-26.408, -54.632`
- **Garupá**: `-27.483, -55.833`
- **San Vicente**: `-26.867, -54.667`

### REQ-03 — Node helper for circle generation
Un nuevo script **Node.js** `server/scripts/seed-cobertura.js` **DEBE** generar el JSON de la zona de cobertura usando el **mismo algoritmo** que `CoberturaZona.fromCircle()` (polígono de 32 puntos, matemática Haversine).

### REQ-04 — seed-demo.sh integration
El script `seed-demo.sh` **DEBE** invocar al helper Node.js para cada `localidad` del prestador e insertar el JSON retornado en `prestadores.zona_cobertura`.

### REQ-05 — Idempotency preserved
El script de seed **DEBE** mantener su idempotencia (borra filas `@demo.snackoverflow.test` primero, luego re-inserta).

### REQ-06 — Distance ordering works (verifiable)
Después del seed, una búsqueda de "Electricista" en "Posadas, Misiones, Argentina" con `orden=distancia` **DEBE** retornar el electricista de Posadas **antes** que el de San Vicente (si existiera).

### REQ-07 — Zone filtering works (verifiable)
Una búsqueda de "Electricista" en "Posadas" **NO DEBE** retornar prestadores cuyo círculo de cobertura no incluya Posadas (ej. un prestador hipotético en Buenos Aires con radio 50 km).

## Fuera de Alcance

- Cambios en el backend domain/repository (ya son correctos)
- Cambios en el frontend
- Seed/migración de datos de producción (solo demo)
- Cambiar el radio de 50 km (configurable después si se necesita)

## Escenarios de Prueba (Given-When-Then)

### ESC-01 — Seed runs and creates distinct zones

```
Dado  backend corriendo con DB Supabase
Cuando  ./scripts/seed-demo.sh se ejecuta
Entonces  6 prestadores creados, cada uno con zona_cobertura única centrada en su localidad
Y       la geometría de zona_cobertura es un polígono de ~32 puntos (aproximación de círculo)
```

### ESC-02 — Distance ordering returns nearest first

```
Dado  datos sembrados con electricista en Posadas y San Vicente
Cuando  GET /catalogo/prestadores?oficio=Electricista&ubicacion=Posadas, Misiones, Argentina&orden=distancia
Entonces  El electricista de Posadas aparece primero (distanciaKm ~ pocos km)
Y       El electricista de San Vicente aparece después o no aparece (~200 km de distancia)
```

### ESC-03 — Zone filtering excludes out-of-range

```
Dado  datos sembrados
Cuando  GET /catalogo/prestadores?oficio=Electricista&ubicacion=Posadas, Misiones, Argentina
Entonces  Solo se retornan prestadores cuya zona_cobertura contiene las coordenadas de Posadas
```

## Arquitectura de Referencia

### CoberturaZona.fromCircle() — Algoritmo actual (server/src/catalogo/domain/cobertura-zona.value.ts:101-129)

```typescript
static fromCircle(
  center: Coordenadas,
  radiusKm: number,
  localidad?: string,
): CoberturaZona {
  const points = 32;
  const coordinates: number[][] = [];
  const earthRadiusKm = 6371;

  for (let i = 0; i <= points; i++) {
    const angle = (i * 2 * Math.PI) / points;
    const latOffset = (radiusKm / earthRadiusKm) * (180 / Math.PI);
    const lngOffset =
      ((radiusKm / earthRadiusKm) * (180 / Math.PI)) /
      Math.cos((center.lat * Math.PI) / 180);

    coordinates.push([
      center.lng + lngOffset * Math.cos(angle),
      center.lat + latOffset * Math.sin(angle),
    ]);
  }

  const geometry: GeoJSONPolygon = {
    type: 'Polygon',
    coordinates: [coordinates],
  };

  return new CoberturaZona(geometry, localidad);
}
```

### zona_cobertura() actual en seed-demo.sh (líneas 166-169)

```bash
# Build the Argentina-wide coverage polygon JSON for a given localidad.
zona_cobertura() {
  printf '{"geometry":{"type":"Polygon","coordinates":[[[-74,-56],[-53,-56],[-53,-21],[-74,-21],[-74,-56]]]},"localidad":"%s"}' "$1"
}
```

## Cambios Requeridos

### 1. Nuevo archivo: `server/scripts/seed-cobertura.js`

Script Node.js que:
- Recibe como argumentos: `lat`, `lng`, `radiusKm` (default 50), `localidad`
- Genera el polígono de 32 puntos usando el mismo algoritmo Haversine que `CoberturaZona.fromCircle()`
- Imprime el JSON GeoJSON completo a stdout (para captura en bash)

**Interfaz CLI:**
```bash
node server/scripts/seed-cobertura.js --lat -27.367 --lng -55.896 --radius 50 --localidad Posadas
```

**Salida esperada:**
```json
{
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[lng1,lat1],[lng2,lat2],...,[lng33,lat33]]]
  },
  "localidad": "Posadas"
}
```

### 2. Modificación de `seed-demo.sh`

- **Eliminar** la función `zona_cobertura()` actual (líneas 166-169)
- **Agregar** mapa de coordenadas por localidad (array asociativo bash)
- **Invocar** `node server/scripts/seed-cobertura.js` para cada prestador
- **Capturar** el JSON de salida y usarlo en el INSERT de `prestadores.zona_cobertura`

**Ejemplo de mapa de coordenadas en bash:**
```bash
declare -A LOCALIDAD_COORDS=(
  ["Posadas"]="-27.367 -55.896"
  ["Oberá"]="-27.487 -55.120"
  ["Eldorado"]="-26.408 -54.632"
  ["Garupá"]="-27.483 -55.833"
  ["San Vicente"]="-26.867 -54.667"
)
```

**Nuevo flujo en el loop de prestadores:**
```bash
coords=${LOCALIDAD_COORDS[$localidad]}
read -r lat lng <<<"$coords"
zona=$(node "$SCRIPT_DIR/seed-cobertura.js" --lat "$lat" --lng "$lng" --radius 50 --localidad "$localidad")
```

### 3. Verificación post-seed (existente, se mantiene)

El script ya verifica en la línea 267-278 que la búsqueda de "Electricista" en "Posadas" retorna el electricista sembrado. Esta verificación **DEBE** seguir pasando.

## Criterios de Aceptación

| ID | Criterio | Verificación |
|----|----------|--------------|
| AC-01 | `seed-demo.sh` se ejecuta sin errores | Exit code 0 |
| AC-02 | 6 prestadores creados con `zona_cobertura` distinta | `SELECT id, localidad, zona_cobertura FROM prestadores WHERE email LIKE '%@demo.snackoverflow.test';` |
| AC-03 | Cada `zona_cobertura` es un polígono de 33 puntos (32 + cierre) | `jsonb_array_length(zona_cobertura->'geometry'->'coordinates'->0) = 33` |
| AC-04 | Centro de cada zona ≈ coordenadas de la localidad | `ST_Distance(ST_MakePoint(lng,lat)::geography, ST_Centroid(zona_cobertura->'geometry')::geography) < 1000` |
| AC-05 | Búsqueda Electricista/Posadas con `orden=distancia` retorna el electricista de Posadas primero | `curl "http://localhost:3000/catalogo/prestadores?oficio=Electricista&ubicacion=Posadas, Misiones, Argentina&orden=distancia"` |
| AC-06 | Búsqueda Electricista/Posadas NO retorna prestadores de localidades lejanas | Misma query sin `orden=distancia` filtra por zona |

## Notas de Implementación

### Radio de 50 km
El radio de 50 km se elige porque:
- Cubre el área metropolitana de cada localidad misionera
- Permite diferenciación clara: Posadas ↔ San Vicente ≈ 200 km (fuera de cobertura)
- Coherente con el algoritmo `fromCircle()` existente

### Precisión de coordenadas
Las coordenadas provienen de fuentes geográficas públicas (IGN, OpenStreetMap). Son aproximadas pero suficientes para demo.

### Idempotencia
El script ya es idempotente (borra por `@demo.snackoverflow.test`). El cambio no altera este patrón.

### Dependencias
El helper Node.js no debe tener dependencias externas (usa solo `Math` nativo). Debe poder ejecutarse con `node` sin `npm install`.

## Archivos Afectados

| Archivo | Tipo de Cambio |
|---------|----------------|
| `server/scripts/seed-cobertura.js` | **Nuevo** — Helper Node.js para generar círculos de cobertura |
| `server/scripts/seed-demo.sh` | **Modificado** — Integración del helper, mapa de coordenadas, eliminación de `zona_cobertura()` Argentina-wide |

## Trazabilidad

| Requisito | Escenario | Criterio de Aceptación |
|-----------|-----------|------------------------|
| REQ-01 | ESC-01 | AC-02, AC-03 |
| REQ-02 | ESC-01 | AC-04 |
| REQ-03 | ESC-01 | AC-03 |
| REQ-04 | ESC-01 | AC-02 |
| REQ-05 | ESC-01 | AC-01 |
| REQ-06 | ESC-02 | AC-05 |
| REQ-07 | ESC-03 | AC-06 |