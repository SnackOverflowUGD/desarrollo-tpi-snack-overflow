import { CoberturaZona, GeoJSONPolygon } from './cobertura-zona.value.js';

describe('CoberturaZona', () => {
  // A simple square polygon around Posadas center
  const posadasPolygon: GeoJSONPolygon = {
    type: 'Polygon',
    coordinates: [[
      [-55.95, -27.40],
      [-55.95, -27.35],
      [-55.85, -27.35],
      [-55.85, -27.40],
      [-55.95, -27.40],
    ]],
  };

  describe('constructor', () => {
    it('throws on empty geometry', () => {
      expect(() => new CoberturaZona({ type: 'Polygon', coordinates: [] })).toThrow();
    });
  });

  describe('containsPoint', () => {
    it('returns true for a point inside the polygon', () => {
      const zona = new CoberturaZona(posadasPolygon);
      expect(zona.containsPoint({ lat: -27.37, lng: -55.90 })).toBe(true);
    });

    it('returns false for a point outside the polygon', () => {
      const zona = new CoberturaZona(posadasPolygon);
      expect(zona.containsPoint({ lat: -27.50, lng: -55.60 })).toBe(false);
    });

    it('quick bounding-box check rejects far-away points', () => {
      const zona = new CoberturaZona(posadasPolygon);
      // Point in Buenos Aires, far from Posadas
      expect(zona.containsPoint({ lat: -34.60, lng: -58.38 })).toBe(false);
    });
  });

  describe('getCenter', () => {
    it('returns the centroid of the polygon', () => {
      const zona = new CoberturaZona(posadasPolygon);
      const center = zona.getCenter();
      expect(center.lat).toBeCloseTo(-27.375, 2);
      expect(center.lng).toBeCloseTo(-55.90, 2);
    });
  });

  describe('fromCircle', () => {
    it('creates a circular polygon with the given center and radius', () => {
      const zona = CoberturaZona.fromCircle({ lat: -27.37, lng: -55.89 }, 10, 'Posadas');
      expect(zona).toBeInstanceOf(CoberturaZona);
      expect(zona.localidad).toBe('Posadas');
      // Center should contain the center point
      expect(zona.containsPoint({ lat: -27.37, lng: -55.89 })).toBe(true);
      // Far point should not be contained
      expect(zona.containsPoint({ lat: -27.50, lng: -56.10 })).toBe(false);
    });
  });
});
