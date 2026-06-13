/**
 * Ranking by Distance Strategy
 * Sorts by Euclidean distance from client location to provider's coverage zone center.
 */

import { Injectable } from '@nestjs/common';
import { IRankingStrategy, RankingContext, RankingStrategyType } from '../ranking-strategy.interface.js';
import { PrestadorResumen } from '../../dto/prestador-resumen.dto.js';
import { Coordenadas } from '../cobertura-zona.value.js';

@Injectable()
export class RankingPorDistanciaStrategy implements IRankingStrategy {
  readonly type: RankingStrategyType = 'distancia';

  async rank(prestadores: PrestadorResumen[], context: RankingContext): Promise<PrestadorResumen[]> {
    if (!context.ubicacionCliente) {
      // No location provided — return as-is (or could throw, but spec says sort by distance when selected)
      return [...prestadores];
    }

    const { lat: clientLat, lng: clientLng } = context.ubicacionCliente;

    return [...prestadores].sort((a, b) => {
      const distA = this.calculateDistance(clientLat, clientLng, a.centroCobertura);
      const distB = this.calculateDistance(clientLat, clientLng, b.centroCobertura);
      return distA - distB;
    });
  }

  /**
   * Haversine formula for distance between two coordinates in kilometers.
   */
  private calculateDistance(lat1: number, lng1: number, target: Coordenadas | undefined): number {
    if (!target) {
      return Infinity; // Providers without location go to the end
    }

    const R = 6371; // Earth radius in km
    const dLat = this.toRad(target.lat - lat1);
    const dLng = this.toRad(target.lng - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(target.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }
}