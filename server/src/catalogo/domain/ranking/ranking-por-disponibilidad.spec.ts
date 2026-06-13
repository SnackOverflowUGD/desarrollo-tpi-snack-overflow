import { RankingPorDisponibilidadStrategy } from './ranking-por-disponibilidad.strategy.js';
import { PrestadorResumen } from '../../dto/prestador-resumen.dto.js';
import { RankingContext } from '../ranking-strategy.interface.js';

describe('RankingPorDisponibilidadStrategy', () => {
  const strategy = new RankingPorDisponibilidadStrategy();
  const context: RankingContext = { fechaConsulta: new Date() };

  function makeResumen(franjas: number | undefined): PrestadorResumen {
    return {
      id: 'uuid',
      nombreCompleto: 'Test',
      oficios: ['plomero'],
      calificacionPromedio: 4.0,
      cantidadResenas: 10,
      disponibilidad: 'disponible_esta_semana',
      franjasDisponiblesProximos7Dias: franjas,
    };
  }

  it('sorts by available slots DESC', async () => {
    const prestadores = [
      makeResumen(3),
      makeResumen(10),
      makeResumen(1),
    ];

    const result = await strategy.rank(prestadores, context);
    expect(result[0].franjasDisponiblesProximos7Dias).toBe(10);
    expect(result[1].franjasDisponiblesProximos7Dias).toBe(3);
    expect(result[2].franjasDisponiblesProximos7Dias).toBe(1);
  });

  it('places providers with undefined availability at the end (treated as 0)', async () => {
    const prestadores = [
      makeResumen(5),
      makeResumen(undefined),
      makeResumen(2),
    ];

    const result = await strategy.rank(prestadores, context);
    expect(result[0].franjasDisponiblesProximos7Dias).toBe(5);
    expect(result[2].franjasDisponiblesProximos7Dias).toBeUndefined();
  });

  it('does not mutate the original array', async () => {
    const prestadores = [makeResumen(5), makeResumen(1)];
    const original = [...prestadores];

    await strategy.rank(prestadores, context);
    expect(prestadores[0].franjasDisponiblesProximos7Dias).toBe(original[0].franjasDisponiblesProximos7Dias);
  });
});
