#!/usr/bin/env node
/**
 * seed-cobertura.js — Generate GeoJSON circle polygon matching CoberturaZona.fromCircle()
 * 
 * Usage: node seed-cobertura.js <lat> <lng> <radiusKm> [localidad]
 * Output: JSON matching CoberturaZona.toJSON() shape:
 *   { geometry: {type: 'Polygon', coordinates: [...]}, localidad: "..." }
 */

const EARTH_RADIUS_KM = 6371;
const POINTS = 32;

function fromCircle(lat, lng, radiusKm) {
  const coordinates = [];
  
  for (let i = 0; i <= POINTS; i++) {
    const angle = (i * 2 * Math.PI) / POINTS;
    const latOffset = (radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI);
    const lngOffset =
      ((radiusKm / EARTH_RADIUS_KM) * (180 / Math.PI)) /
      Math.cos((lat * Math.PI) / 180);

    coordinates.push([
      lng + lngOffset * Math.cos(angle),
      lat + latOffset * Math.sin(angle),
    ]);
  }

  return {
    type: 'Polygon',
    coordinates: [coordinates],
  };
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node seed-cobertura.js <lat> <lng> <radiusKm> [localidad]');
    process.exit(1);
  }

  const lat = parseFloat(args[0]);
  const lng = parseFloat(args[1]);
  const radiusKm = parseFloat(args[2]);
  const localidad = args[3] || undefined;

  if (isNaN(lat) || isNaN(lng) || isNaN(radiusKm)) {
    console.error('Error: lat, lng, and radiusKm must be valid numbers');
    process.exit(1);
  }

  const geometry = fromCircle(lat, lng, radiusKm);
  
  const result = {
    geometry,
    localidad,
  };

  console.log(JSON.stringify(result));
}

main();