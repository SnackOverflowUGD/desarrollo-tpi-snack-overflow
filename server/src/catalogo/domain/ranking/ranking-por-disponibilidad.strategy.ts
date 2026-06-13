/**
 * Ranking by Availability Strategy
 * Sorts by count of available (non-reserved) slots in next 7 days DESC (RN-CAT-04).
 * Availability is a summary indicator per PA-02.
 */

import { Injectable } from '@nestjs/common';
import { IRankingStrategy, RankingContext, RankingStrategyType } from '../ranking-strategy.interface.js';
import { PrestadorResumen } from '../../dto/prestador-resumen.dto.js';

@Injectable()
export class RankingPorDisponibilidadStrategy implements IRankingStrategy {
  readonly type: RankingStrategyType = 'disponibilidad';

  async rank(prestadores: PrestadorResumen[], context: RankingContext): Promise<PrestadorResumen[]> {
    // Sort by available slots in next 7 days DESC
    // Providers with more availability come first
    return [...prestadores].sort((a, b) => {
      const slotsA = a.franjasDisponiblesProximos7Dias ?? 0;
      const slotsB = b.franjasDisponiblesProximos7Dias ?? 0;
      return slotsB - slotsA;
    });
  }
}