# Technical Design: fix-seed-cobertura-zona

## Overview
This design addresses the `fix-seed-cobertura-zona` change by introducing a Node.js helper script to generate accurate coverage zone polygons, replacing the inline bash/awk implementation that produced incorrect geometry.

## Files

### New File: `server/scripts/seed-cobertura.js`
Node.js script that generates a ~50km radius circle polygon (32 points) using Haversine math, matching `CoberturaZona.fromCircle()` exactly.

```javascript
#!/usr/bin/env node
// Generates CoberturaZona JSON matching domain's fromCircle()
// Usage: node seed-cobertura.js <lat> <lng> <radiusKm> [localidad]
// Output: JSON to stdout

const EARTH_RADIUS_KM = 6371;
const POINTS = 32;

function toRad(deg) { return deg * Math.PI / 180; }

function generateCircle(lat, lng, radiusKm) {
  const coords = [];
  for (let i = 0; i <= POINTS; i++) {
    const angle = (i * 2 * Math.PI) / POINTS;
    const latOffset = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI);
    const lngOffset = latOffset / Math.cos(toRad(lat));
    coords.push([
      lng + lngOffset * Math.cos(angle),
      lat + latOffset * Math.sin(angle)
    ]);
  }
  return {
    geometry: { type: 'Polygon', coordinates: [coords] },
    localidad: process.argv[5] || ''
  };
}

const [,, lat, lng, radiusKm, localidad] = process.argv;
if (!lat || !lng || !radiusKm) {
  console.error('Usage: node seed-cobertura.js <lat> <lng> <radiusKm> [localidad]');
  process.exit(1);
}
console.log(JSON.stringify(generateCircle(parseFloat(lat), parseFloat(lng), parseFloat(radiusKm))));
```

### Modified File: `server/scripts/seed-demo.sh`
Replace the `zona_cobertura()` function (lines 167-169) with a call to the Node helper. Add `LOCALIDAD_COORDS` associative array mapping localidad → "lat,lng".

Key changes:
1. **Add constant map** (after line ~30, near other constants):
```bash
declare -A LOCALIDAD_COORDS=(
  ["Posadas"]="-27.3671,-55.8961"
  ["Garupá"]="-27.4817,-55.8292"
  ["Candelaria"]="-27.4642,-55.7347"
  ["San Vicente"]="-26.9833,-54.8167"
  ["Oberá"]="-27.4878,-55.1197"
)
```

2. **Replace `zona_cobertura()` function** (lines 167-169) with:
```bash
zona_cobertura() {
  local localidad="$1"
  local coords="${LOCALIDAD_COORDS[$localidad]}"
  if [[ -z "$coords" ]]; then
    echo "Error: No coordinates for localidad: $localidad" >&2
    return 1
  fi
  local lat="${coords%,*}"
  local lng="${coords#*,}"
  node "$SCRIPT_DIR/seed-cobertura.js" "$lat" "$lng" 50 "$localidad"
}
```

3. **In prestador loop**, call the function and capture output:
```bash
cobertura_json=$(zona_cobertura "$localidad") || exit 1
```

## Architecture Decisions

### ADR-SEED-01: Node helper over inline bash
**Decision**: Use a small Node.js script (`seed-cobertura.js`) called from bash.
**Rationale**:
- Reuses exact same math as `CoberturaZona.fromCircle()` (32 points, Haversine, Earth radius 6371km)
- Avoids complex bash/awk math with floating point
- Single source of truth for circle generation
- Node is already available in the dev environment

### ADR-SEED-02: City coordinates as constants in seed script
**Decision**: Hardcode the lat/lng map in `seed-demo.sh` for the 5 known localidades.
**Rationale**: 
- No external geocoding dependency in seed
- Coordinates are stable approximations
- Easy to extend if new cities added

### ADR-SEED-03: 50km radius as default
**Decision**: Use 50km radius for all localidades (matches service area for local trades).
**Rationale**: 
- Consistent with domain's `fromCircle()` default usage
- Covers metropolitan areas without excessive overlap
- Can be parameterized per-city later if needed

## Integration Points
- **No backend changes** — domain already uses `fromCircle()` correctly
- **No frontend changes**
- **Seed remains idempotent** — existing delete logic unchanged

## Testing Strategy
1. Run `seed-demo.sh` → verify 6 providers created with distinct zones
2. API test: `GET /catalogo/prestadores?oficio=Electricista&ubicacion=Posadas...&orden=distancia` → Posadas first
3. API test: Verify San Vicente provider excluded from Posadas search

## Implementation Order
1. Create `server/scripts/seed-cobertura.js` with executable permissions
2. Modify `server/scripts/seed-demo.sh` with the changes above
3. Run seed script to verify
4. Execute API tests to confirm distance ordering works