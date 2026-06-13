import { Injectable, Logger } from '@nestjs/common';
import { IGeocodingService, Coordenadas } from '../ports/geocoding.port.js';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

@Injectable()
export class OpenStreetMapGeocodingAdapter implements IGeocodingService {
  private readonly logger = new Logger(OpenStreetMapGeocodingAdapter.name);
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';

  async geocode(ubicacion: string): Promise<Coordenadas | null> {
    try {
      const url = `${this.baseUrl}/search?q=${encodeURIComponent(ubicacion)}&format=json&limit=1`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SnackOverflow/1.0 (TPI)',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Nominatim geocoding failed: ${response.status}`);
        return null;
      }

      const results: NominatimResult[] = await response.json();
      if (!results || results.length === 0) {
        return null;
      }

      return {
        lat: parseFloat(results[0].lat),
        lng: parseFloat(results[0].lon),
      };
    } catch (error) {
      this.logger.error('Geocoding request failed', error);
      return null;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const url = `${this.baseUrl}/reverse?lat=${lat}&lon=${lng}&format=json`;
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SnackOverflow/1.0 (TPI)',
        },
      });

      if (!response.ok) {
        this.logger.warn(`Nominatim reverse geocoding failed: ${response.status}`);
        return null;
      }

      const result: { display_name?: string } = await response.json();
      return result.display_name ?? null;
    } catch (error) {
      this.logger.error('Reverse geocoding request failed', error);
      return null;
    }
  }
}
