/**
 * API/integration tests for CatalogoController — uses NestJS TestingModule with
 * in-memory fake adapters (no Postgres, no external APIs).
 *
 * Covers: ESC-01..08 HTTP layer.
 */
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';

import { CatalogoController } from './catalogo.controller.js';
import { BuscadorService } from './application/buscador.service.js';
import { PRESTADOR_REPOSITORY, IPrestadorRepository, PaginatedResult } from './ports/prestador-repository.port.js';
import { GEOCODING_SERVICE, IGeocodingService, Coordenadas } from './ports/geocoding.port.js';
import { IRankingStrategy, RankingContext, RankingStrategyType } from './domain/ranking-strategy.interface.js';
import { PrestadorResumen } from './dto/prestador-resumen.dto.js';
import { PrestadorPerfil } from './dto/prestador-perfil.dto.js';
import { RankingPorCalificacionStrategy } from './domain/ranking/ranking-por-calificacion.strategy.js';
import { RankingPorDistanciaStrategy } from './domain/ranking/ranking-por-distancia.strategy.js';
import { RankingPorDisponibilidadStrategy } from './domain/ranking/ranking-por-disponibilidad.strategy.js';

// ---------------------------------------------------------------------------
// In-memory fake adapters
// ---------------------------------------------------------------------------

class FakePrestadorRepo implements IPrestadorRepository {
  private store = new Map<string, PrestadorResumen>();

  seed(data: PrestadorResumen) {
    this.store.set(data.id, data);
  }

  clear() {
    this.store.clear();
  }

  async findByCobertura(): Promise<PaginatedResult<PrestadorResumen>> {
    const data = Array.from(this.store.values());
    return { data, total: data.length, page: 1, pageSize: 20 };
  }

  async findByIdWithProfile(id: string): Promise<PrestadorPerfil | null> {
    const entry = this.store.get(id);
    if (!entry) return null;
    return {
      id: entry.id,
      nombreCompleto: entry.nombreCompleto,
      oficios: entry.oficios,
      calificacionPromedio: entry.calificacionPromedio,
      cantidadResenas: entry.cantidadResenas,
      zonaCobertura: ['Posadas Centro'],
      servicios: [],
      resenas: [],
    };
  }
}

class FakeGeocodingService implements IGeocodingService {
  async geocode(ubicacion: string): Promise<Coordenadas | null> {
    if (ubicacion.toLowerCase() === 'posadas') {
      return { lat: -27.37, lng: -55.89 };
    }
    return null;
  }

  async reverseGeocode(): Promise<string | null> {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

describe('CatalogoController (API)', () => {
  let app: INestApplication;
  let fakeRepo: FakePrestadorRepo;

  beforeAll(async () => {
    fakeRepo = new FakePrestadorRepo();

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CatalogoController],
      providers: [
        BuscadorService,
        { provide: PRESTADOR_REPOSITORY, useValue: fakeRepo },
        { provide: GEOCODING_SERVICE, useClass: FakeGeocodingService },
        // Real ranking strategies (no external dependencies)
        RankingPorCalificacionStrategy,
        RankingPorDistanciaStrategy,
        RankingPorDisponibilidadStrategy,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    fakeRepo.clear();
  });

  // -----------------------------------------------------------------------
  // ESC-01: Happy path
  // -----------------------------------------------------------------------
  it('ESC-01: GET /catalogo/prestadores?oficio=plomero&ubicacion=Posadas → 200 with results', async () => {
    fakeRepo.seed({
      id: 'uuid-1',
      nombreCompleto: 'Juan Pérez',
      oficios: ['plomero'],
      calificacionPromedio: 4.5,
      cantidadResenas: 12,
      disponibilidad: 'disponible_esta_semana',
    });

    const res = await supertest(app.getHttpServer())
      .get('/catalogo/prestadores')
      .query({ oficio: 'plomero', ubicacion: 'Posadas' })
      .expect(HttpStatus.OK);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].nombreCompleto).toBe('Juan Pérez');
    expect(res.body.total).toBe(1);
  });

  // -----------------------------------------------------------------------
  // ESC-05: No results
  // -----------------------------------------------------------------------
  it('ESC-05: GET /catalogo/prestadores with no results → 200 empty data array', async () => {
    const res = await supertest(app.getHttpServer())
      .get('/catalogo/prestadores')
      .query({ oficio: 'plomero', ubicacion: 'Oberá' })
      .expect(HttpStatus.OK);

    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  // -----------------------------------------------------------------------
  // ESC-07: Missing params
  // -----------------------------------------------------------------------
  it('ESC-07: GET /catalogo/prestadores without oficio → 400', async () => {
    await supertest(app.getHttpServer())
      .get('/catalogo/prestadores')
      .query({ ubicacion: 'Posadas' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('ESC-07: GET /catalogo/prestadores without ubicacion → 400', async () => {
    await supertest(app.getHttpServer())
      .get('/catalogo/prestadores')
      .query({ oficio: 'plomero' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  // -----------------------------------------------------------------------
  // ESC-06: Public profile
  // -----------------------------------------------------------------------
  it('ESC-06: GET /catalogo/prestadores/:id → 200 with profile (no contact info)', async () => {
    const profileId = '550e8400-e29b-41d4-a716-446655440001';
    fakeRepo.seed({
      id: profileId,
      nombreCompleto: 'María García',
      oficios: ['electricista'],
      calificacionPromedio: 4.8,
      cantidadResenas: 25,
      disponibilidad: 'disponible_esta_semana',
    });

    const res = await supertest(app.getHttpServer())
      .get(`/catalogo/prestadores/${profileId}`)
      .expect(HttpStatus.OK);

    expect(res.body.nombreCompleto).toBe('María García');
    expect(res.body.calificacionPromedio).toBe(4.8);
    expect(res.body.telefono).toBeUndefined();
  });

  it('GET /catalogo/prestadores/:id with invalid UUID → 400', async () => {
    await supertest(app.getHttpServer())
      .get('/catalogo/prestadores/not-a-uuid')
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('GET /catalogo/prestadores/:id with non-existent UUID → 404', async () => {
    await supertest(app.getHttpServer())
      .get('/catalogo/prestadores/550e8400-e29b-41d4-a716-446655449999')
      .expect(HttpStatus.NOT_FOUND);
  });

  // -----------------------------------------------------------------------
  // ESC-02/03/04: Sorting params accepted
  // -----------------------------------------------------------------------
  it('accepts orden=calificacion query param', async () => {
    await supertest(app.getHttpServer())
      .get('/catalogo/prestadores')
      .query({ oficio: 'plomero', ubicacion: 'Posadas', orden: 'calificacion' })
      .expect(HttpStatus.OK);
  });

  it('accepts orden=distancia query param', async () => {
    await supertest(app.getHttpServer())
      .get('/catalogo/prestadores')
      .query({ oficio: 'plomero', ubicacion: 'Posadas', orden: 'distancia' })
      .expect(HttpStatus.OK);
  });

  it('accepts orden=disponibilidad query param', async () => {
    await supertest(app.getHttpServer())
      .get('/catalogo/prestadores')
      .query({ oficio: 'plomero', ubicacion: 'Posadas', orden: 'disponibilidad' })
      .expect(HttpStatus.OK);
  });

  it('rejects invalid orden value → 400', async () => {
    await supertest(app.getHttpServer())
      .get('/catalogo/prestadores')
      .query({ oficio: 'plomero', ubicacion: 'Posadas', orden: 'invalido' })
      .expect(HttpStatus.BAD_REQUEST);
  });
});
