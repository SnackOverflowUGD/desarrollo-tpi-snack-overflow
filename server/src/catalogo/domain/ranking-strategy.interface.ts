/**
 * Ranking Strategy Interface
 * Strategy pattern for sorting search results (calificación, distancia, disponibilidad).
 */

import { Coordenadas } from './cobertura-zona.value.js';
import { PrestadorResumen } from '../dto/prestador-resumen.dto.js';

export interface RankingContext {
  ubicacionCliente?: Coordenadas;
  fechaConsulta: Date;
  calificacionMinima?: number;
}

export type RankingStrategyType = 'calificacion' | 'distancia' | 'disponibilidad';

export interface IRankingStrategy {
  readonly type: RankingStrategyType;

  /**
   * Ranks a list of provider summaries according to the strategy.
   * @param prestadores List of providers to rank
   * @param context Ranking context (client location, query date, etc.)
   * @returns Ranked list (new array, original not mutated)
   */
  rank(prestadores: PrestadorResumen[], context: RankingContext): Promise<PrestadorResumen[]>;
}