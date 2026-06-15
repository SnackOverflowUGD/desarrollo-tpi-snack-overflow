import { RankingPorDistanciaStrategy } from './ranking-por-distancia.strategy.js';
import { PrestadorResumen } from '../../dto/prestador-resumen.dto.js';
import { RankingContext } from '../ranking-strategy.interface.js';

describe('RankingPorDistanciaStrategy', () => {
  const strategy = new RankingPorDistanciaStrategy();

  function makeResumen(centro?: {
    lat: number;
    lng: number;
  }): PrestadorResumen {
    return {
      id: 'uuid',
      nombreCompleto: 'Test',
      oficios: ['plomero'],
      calificacionPromedio: 4.0,
      cantidadResenas: 10,
      disponibilidad: 'disponible_esta_semana',
      centroCobertura: centro ?? { lat: -27.37, lng: -55.89 },
    };
  }

  it('sorts by closest distance first (Haversine)', async () => {
    const clientLocation = { lat: -27.37, lng: -55.89 };
    const context: RankingContext = {
      ubicacionCliente: clientLocation,
      fechaConsulta: new Date(),
    };

    const prestadores = [
      makeResumen({ lat: -27.5, lng: -56.0 }), // ~15km away from client
      makeResumen({ lat: -27.37, lng: -55.89 }), // 0km (same location)
      makeResumen({ lat: -27.8, lng: -55.8 }), // ~48km away
    ];

    const result = await strategy.rank(prestadores, context);
    expect(result[0].id).toBe(prestadores[1].id); // closest = same location
    expect(result[2].id).toBe(prestadores[2].id); // farthest
  });

  it('places providers without coverage center at the end', async () => {
    const context: RankingContext = {
      ubicacionCliente: { lat: -27.37, lng: -55.89 },
      fechaConsulta: new Date(),
    };

    const prestadores = [
      makeResumen({ lat: -27.5, lng: -56.0 }),
      makeResumen(undefined), // no location
    ];
    // Override centroCobertura to undefined for the second one
    prestadores[1].centroCobertura = undefined;

    const result = await strategy.rank(prestadores, context);
    expect(result[result.length - 1].centroCobertura).toBeUndefined();
  });

  it('returns unchanged array when no client location is provided', async () => {
    const context: RankingContext = { fechaConsulta: new Date() };
    const prestadores = [
      makeResumen(),
      makeResumen({ lat: -27.5, lng: -56.0 }),
    ];

    const result = await strategy.rank(prestadores, context);
    expect(result).toHaveLength(2);
  });

  it('UAT-01 regression: Posadas prestador ranks before San Vicente prestador when client is in Posadas', async () => {
    const posadas = { lat: -27.375, lng: -55.9 }; // Posadas centroid
    const sanVicente = { lat: -26.0, lng: -56.6 }; // San Vicente centroid
    const clientPosadas = { lat: -27.37, lng: -55.89 }; // client in Posadas

    const prestadores = [
      { ...makeResumen(sanVicente), id: 'san-vicente' },
      { ...makeResumen(posadas), id: 'posadas' },
    ];
    const context: RankingContext = {
      ubicacionCliente: clientPosadas,
      fechaConsulta: new Date(),
    };

    const result = await strategy.rank(prestadores, context);
    // Posadas is ~1km from client, San Vicente is ~167km — closest must be first
    expect(result[0].id).toBe('posadas');
  });
});
