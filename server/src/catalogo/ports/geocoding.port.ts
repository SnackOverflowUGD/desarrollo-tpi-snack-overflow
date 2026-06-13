/**
 * Geocoding Service Port (ADR-002)
 * Interface for converting location strings to coordinates and vice versa.
 * Implemented by OpenStreetMap Nominatim adapter.
 */

export interface Coordenadas {
  lat: number;
  lng: number;
}

export const GEOCODING_SERVICE = 'GEOCODING_SERVICE';

export interface IGeocodingService {
  /**
   * Converts a location string (city, address, etc.) to coordinates.
   * @param ubicacion Location string (e.g., "Posadas", "Av. Corrientes 123, CABA")
   * @returns Coordinates or null if not found
   */
  geocode(ubicacion: string): Promise<Coordenadas | null>;

  /**
   * Converts coordinates to a human-readable location string.
   * @param lat Latitude
   * @param lng Longitude
   * @returns Location string or null if not found
   */
  reverseGeocode(lat: number, lng: number): Promise<string | null>;
}