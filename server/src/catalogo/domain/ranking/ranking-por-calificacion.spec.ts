import { RankingPorCalificacionStrategy } from './ranking-por-calificacion.strategy.js';
import { PrestadorResumen } from '../../dto/prestador-resumen.dto.js';
import { RankingContext } from '../ranking-strategy.interface.js';

describe('RankingPorCalificacionStrategy', () => {
  const strategy = new RankingPorCalificacionStrategy();
  const context: RankingContext = { fechaConsulta: new Date() };

  function makeResumen(overrides: Partial<PrestadorResumen> = {}): PrestadorResumen {
    return {
      id: 'uuid',
      nombreCompleto: 'Test',
      oficios: ['plomero'],
      calificacionPromedio: 4.0,
      cantidadResenas: 10,
      disponibilidad: 'disponible_esta_semana',
      ...overrides,
    };
  }

  it('sorts by calificacionPromedio DESC', async () => {
    const prestadores = [
      makeResumen({ id: 'a', calificacionPromedio: 3.0 }),
      makeResumen({ id: 'b', calificacionPromedio: 5.0 }),
      makeResumen({ id: 'c', calificacionPromedio: 4.0 }),
    ];

    const result = await strategy.rank(prestadores, context);
    expect(result[0].calificacionPromedio).toBe(5.0);
    expect(result[1].calificacionPromedio).toBe(4.0);
    expect(result[2].calificacionPromedio).toBe(3.0);
  });

  it('sorts by cantidadResenas DESC when ratings are equal (RN-CAT-03)', async () => {
    const prestadores = [
      makeResumen({ id: 'a', calificacionPromedio: 4.0, cantidadResenas: 5 }),
      makeResumen({ id: 'b', calificacionPromedio: 4.0, cantidadResenas: 20 }),
    ];

    const result = await strategy.rank(prestadores, context);
    expect(result[0].id).toBe('b');
    expect(result[1].id).toBe('a');
  });

  it('does not mutate the original array', async () => {
    const prestadores = [
      makeResumen({ id: 'a', calificacionPromedio: 3.0 }),
      makeResumen({ id: 'b', calificacionPromedio: 5.0 }),
    ];
    const original = [...prestadores];

    await strategy.rank(prestadores, context);
    expect(prestadores[0].id).toBe(original[0].id);
    expect(prestadores[1].id).toBe(original[1].id);
  });
});
