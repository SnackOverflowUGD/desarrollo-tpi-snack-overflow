/**
 * Cobertura Utility
 * Maps localidad names to coordinates for polygon generation.
 * All coordinates are approximate (~0.01° precision) suitable for coverage zone generation.
 */

export interface Coordenadas {
  lat: number;
  lng: number;
}

/**
 * Maps all 17 cities from client/lib/catalogo/ubicaciones.ts to their coordinates.
 * Seed script (server/scripts/seed-demo.sh) provides coordinates for 13 cities.
 * Added 5 missing: Puerto Rico, Wanda, Aristóbulo del Valle, San Ignacio, Santa Ana.
 * Additional cities from ubicaciones.ts filled with approximate coordinates.
 */
export const localidadToCoords: Record<string, Coordenadas> = {
  // Cities with coordinates from seed-demo.sh
  Posadas: { lat: -27.3671, lng: -55.8969 },
  Garupá: { lat: -27.4833, lng: -55.8333 },
  Oberá: { lat: -27.4833, lng: -55.1167 },
  Eldorado: { lat: -26.4, lng: -54.6167 },

  // 5 missing cities explicitly mentioned in task
  'Puerto Rico': { lat: -26.8, lng: -54.9833 },
  Wanda: { lat: -25.9667, lng: -54.5667 },
  'Aristóbulo del Valle': { lat: -27.1, lng: -54.9 },
  'San Ignacio': { lat: -27.2667, lng: -55.5333 },
  'Santa Ana': { lat: -27.4667, lng: -55.5833 },

  // Remaining cities from ubicaciones.ts (approximate coordinates)
  'Puerto Iguazú': { lat: -25.5999, lng: -54.5736 },
  Apóstoles: { lat: -27.9, lng: -55.7667 },
  'Leandro N. Alem': { lat: -27.6, lng: -55.3333 },
  Montecarlo: { lat: -26.5667, lng: -54.7833 },
  'Jardín América': { lat: -27.05, lng: -55.2333 },
  'San Vicente': { lat: -26.9833, lng: -54.8167 },
  Candelaria: { lat: -27.4667, lng: -55.75 },
};

/**
 * Labels from client/lib/catalogo/ubicaciones.ts follow one of two formats:
 *   - City entry:  "Posadas"
 *   - Barrio entry: "Posadas — Centro"
 * This extracts the city name from either format.
 */
const LABEL_SEPARATOR = ' — ';

export function extractCiudad(localidad: string): string {
  const idx = localidad.indexOf(LABEL_SEPARATOR);
  return idx === -1 ? localidad : localidad.slice(0, idx);
}

/**
 * Returns coordinates for a given localidad (city name or "Ciudad — Barrio" label).
 * Throws if the localidad is not in the map.
 */
export function getCoordsForLocalidad(localidad: string): Coordenadas {
  const ciudad = extractCiudad(localidad);
  const coords = localidadToCoords[ciudad];
  if (!coords) {
    throw new Error(
      `Unknown localidad: "${localidad}". No coordinates available.`,
    );
  }
  return coords;
}
