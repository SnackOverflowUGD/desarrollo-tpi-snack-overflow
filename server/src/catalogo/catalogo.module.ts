import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogoController } from './catalogo.controller.js';
import { BuscadorService } from './application/buscador.service.js';
import { Prestador } from './domain/prestador.entity.js';
import { Servicio } from './domain/servicio.entity.js';
import { PRESTADOR_REPOSITORY } from './ports/prestador-repository.port.js';
import { SERVICIO_REPOSITORY } from './ports/servicio-repository.port.js';
import { GEOCODING_SERVICE } from './ports/geocoding.port.js';
import { TypeOrmPrestadorRepository } from './adapters/typeorm-prestador.repository.js';
import { TypeOrmServicioRepository } from './adapters/typeorm-servicio.repository.js';
import { OpenStreetMapGeocodingAdapter } from './adapters/openstreetmap-geocoding.adapter.js';
import { RankingPorCalificacionStrategy } from './domain/ranking/ranking-por-calificacion.strategy.js';
import { RankingPorDistanciaStrategy } from './domain/ranking/ranking-por-distancia.strategy.js';
import { RankingPorDisponibilidadStrategy } from './domain/ranking/ranking-por-disponibilidad.strategy.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Prestador, Servicio]),
  ],
  controllers: [CatalogoController],
  providers: [
    BuscadorService,
    RankingPorCalificacionStrategy,
    RankingPorDistanciaStrategy,
    RankingPorDisponibilidadStrategy,
    {
      provide: PRESTADOR_REPOSITORY,
      useClass: TypeOrmPrestadorRepository,
    },
    {
      provide: SERVICIO_REPOSITORY,
      useClass: TypeOrmServicioRepository,
    },
    {
      provide: GEOCODING_SERVICE,
      useClass: OpenStreetMapGeocodingAdapter,
    },
  ],
  exports: [
    PRESTADOR_REPOSITORY,
    SERVICIO_REPOSITORY,
  ],
})
export class CatalogoModule {}
