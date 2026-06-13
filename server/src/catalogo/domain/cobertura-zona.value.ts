/**
 * Coverage Zone Value Object
 * Represents a geospatial coverage area as GeoJSON Polygon/MultiPolygon.
 * Point-in-polygon checks are performed in application code (not PostGIS).
 */

export interface Coordenadas {
  lat: number;
  lng: number;
}

export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export type GeoJSONGeometry = GeoJSONPolygon | GeoJSONMultiPolygon;

export class CoberturaZona {
  private readonly _geometry: GeoJSONGeometry;
  private readonly _localidad?: string;
  private readonly _bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]

  constructor(geometry: GeoJSONGeometry, localidad?: string) {
    if (!geometry || !geometry.coordinates || geometry.coordinates.length === 0) {
      throw new Error('Invalid geometry: coordinates cannot be empty');
    }
    this._geometry = geometry;
    this._localidad = localidad;
    this._bbox = this.calculateBoundingBox(geometry);
  }

  get geometry(): GeoJSONGeometry {
    return this._geometry;
  }

  get localidad(): string | undefined {
    return this._localidad;
  }

  get bbox(): [number, number, number, number] {
    return this._bbox;
  }

  /**
   * Checks if a point (lat/lng) is contained within this coverage zone.
   * Uses ray-casting algorithm for point-in-polygon.
   */
  containsPoint(point: Coordenadas): boolean {
    // Quick bounding box check first
    if (
      point.lng < this._bbox[0] ||
      point.lng > this._bbox[2] ||
      point.lat < this._bbox[1] ||
      point.lat > this._bbox[3]
    ) {
      return false;
    }

    // Ray-casting algorithm for point-in-polygon
    if (this._geometry.type === 'Polygon') {
      return this.pointInPolygon(point, this._geometry.coordinates[0]);
    }

    // MultiPolygon: check each polygon
    for (const polygon of this._geometry.coordinates) {
      if (this.pointInPolygon(point, polygon[0])) {
        return true;
      }
    }
    return false;
  }

  /**
   * Calculates approximate center point of the coverage zone.
   * Used for distance-based sorting.
   */
  getCenter(): Coordenadas {
    if (this._geometry.type === 'Polygon') {
      const ring = this._geometry.coordinates[0];
      return this.calculateCentroid(ring);
    }
    // MultiPolygon: use first polygon's centroid
    const firstRing = this._geometry.coordinates[0][0];
    return this.calculateCentroid(firstRing);
  }

  /**
   * Creates a CoberturaZona from a simple circular area (lat, lng, radiusKm).
   * Useful for fallback when only localidad is known.
   */
  static fromCircle(center: Coordenadas, radiusKm: number, localidad?: string): CoberturaZona {
    const points = 32;
    const coordinates: number[][] = [];
    const earthRadiusKm = 6371;

    for (let i = 0; i <= points; i++) {
      const angle = (i * 2 * Math.PI) / points;
      const latOffset = (radiusKm / earthRadiusKm) * (180 / Math.PI);
      const lngOffset =
        (radiusKm / earthRadiusKm) * (180 / Math.PI) / Math.cos((center.lat * Math.PI) / 180);

      coordinates.push([center.lng + lngOffset * Math.cos(angle), center.lat + latOffset * Math.sin(angle)]);
    }

    const geometry: GeoJSONPolygon = {
      type: 'Polygon',
      coordinates: [coordinates],
    };

    return new CoberturaZona(geometry, localidad);
  }

  private calculateBoundingBox(geometry: GeoJSONGeometry): [number, number, number, number] {
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;

    const processRing = (ring: number[][]) => {
      for (const [lng, lat] of ring) {
        minLng = Math.min(minLng, lng);
        minLat = Math.min(minLat, lat);
        maxLng = Math.max(maxLng, lng);
        maxLat = Math.max(maxLat, lat);
      }
    };

    if (geometry.type === 'Polygon') {
      for (const ring of geometry.coordinates) {
        processRing(ring);
      }
    } else {
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          processRing(ring);
        }
      }
    }

    return [minLng, minLat, maxLng, maxLat];
  }

  private pointInPolygon(point: Coordenadas, ring: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];

      const intersect = yi > point.lat !== yj > point.lat && point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  private calculateCentroid(ring: number[][]): Coordenadas {
    let area = 0;
    let cx = 0;
    let cy = 0;

    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      const cross = xi * yj - xj * yi;
      area += cross;
      cx += (xi + xj) * cross;
      cy += (yi + yj) * cross;
    }

    area *= 0.5;
    if (area === 0) {
      // Fallback: average of vertices
      const avgLng = ring.reduce((sum, [lng]) => sum + lng, 0) / ring.length;
      const avgLat = ring.reduce((sum, [, lat]) => sum + lat, 0) / ring.length;
      return { lat: avgLat, lng: avgLng };
    }

    cx /= 6 * area;
    cy /= 6 * area;
    return { lat: cy, lng: cx };
  }

  toJSON(): { geometry: GeoJSONGeometry; localidad?: string } {
    return {
      geometry: this._geometry,
      localidad: this._localidad,
    };
  }
}