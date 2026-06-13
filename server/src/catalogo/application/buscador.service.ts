import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { PRESTADOR_REPOSITORY, type IPrestadorRepository, type BusquedaCriteria, type PaginatedResult } from '../ports/prestador-repository.port.js';
import { GEOCODING_SERVICE, type IGeocodingService, type Coordenadas } from '../ports/geocoding.port.js';
import { IRankingStrategy, RankingContext, RankingStrategyType } from '../domain/ranking-strategy.interface.js';
import { RankingPorCalificacionStrategy } from '../domain/ranking/ranking-por-calificacion.strategy.js';
import { RankingPorDistanciaStrategy } from '../domain/ranking/ranking-por-distancia.strategy.js';
import { RankingPorDisponibilidadStrategy } from '../domain/ranking/ranking-por-disponibilidad.strategy.js';
import { PrestadorResumen } from '../dto/prestador-resumen.dto.js';
import { PrestadorPerfil } from '../dto/prestador-perfil.dto.js';
import { BuscarPrestadoresDto } from '../dto/buscar-prestadores.dto.js';

@Injectable()
export class BuscadorService {
  private readonly strategies: Map<RankingStrategyType, IRankingStrategy>;

  constructor(
    @Inject(PRESTADOR_REPOSITORY)
    private readonly prestadorRepo: IPrestadorRepository,
    @Inject(GEOCODING_SERVICE)
    private readonly geocodingService: IGeocodingService,
    private readonly rankingCalificacion: RankingPorCalificacionStrategy,
    private readonly rankingDistancia: RankingPorDistanciaStrategy,
    private readonly rankingDisponibilidad: RankingPorDisponibilidadStrategy,
  ) {
    this.strategies = new Map<RankingStrategyType, IRankingStrategy>([
      ['calificacion', this.rankingCalificacion],
      ['distancia', this.rankingDistancia],
      ['disponibilidad', this.rankingDisponibilidad],
    ]);
  }

  async buscar(dto: BuscarPrestadoresDto): Promise<PaginatedResult<PrestadorResumen>> {
    // Validate required fields (ESC-07)
    if (!dto.oficio || !dto.oficio.trim()) {
      throw new BadRequestException('El oficio es obligatorio');
    }
    if (!dto.ubicacion || !dto.ubicacion.trim()) {
      throw new BadRequestException('La ubicación es obligatoria');
    }

    // Resolve location string to coordinates via geocoding port (ADR-002)
    const coordenadas = await this.geocodingService.geocode(dto.ubicacion);

    if (!coordenadas) {
      // Geocoding failed — return empty results rather than error
      return { data: [], total: 0, page: dto.page ?? 1, pageSize: dto.pageSize ?? 20 };
    }

    // Build search criteria
    const criteria: BusquedaCriteria = {
      oficio: dto.oficio.trim(),
      ubicacion: coordenadas,
      page: dto.page ?? 1,
      pageSize: dto.pageSize ?? 20,
      calificacionMinima: dto.calificacionMin,
      fechaDisponibilidad: dto.fecha ? new Date(dto.fecha) : undefined,
    };

    // Query providers by coverage zone
    let result = await this.prestadorRepo.findByCobertura(criteria);

    // Apply ranking strategy if specified
    const orden = dto.orden ?? 'calificacion';
    const strategy = this.strategies.get(orden);

    if (strategy && result.data.length > 0) {
      const context: RankingContext = {
        ubicacionCliente: coordenadas,
        fechaConsulta: new Date(),
        calificacionMinima: dto.calificacionMin,
      };

      const ranked = await strategy.rank(result.data, context);
      result = { ...result, data: ranked };
    }

    return result;
  }

  async obtenerPerfil(prestadorId: string): Promise<PrestadorPerfil> {
    if (!prestadorId || !prestadorId.trim()) {
      throw new BadRequestException('El ID del prestador es obligatorio');
    }

    const perfil = await this.prestadorRepo.findByIdWithProfile(prestadorId);
    if (!perfil) {
      throw new NotFoundException('Prestador no encontrado');
    }

    return perfil;
  }
}
