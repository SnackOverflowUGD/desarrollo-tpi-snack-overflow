import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { GEOCODING_SERVICE } from '../src/catalogo/ports/geocoding.port.js';
import { getCoordsForLocalidad } from '../src/catalogo/domain/cobertura-util.js';

/**
 * API integration test (Supertest) for the prestador self-management surface
 * (PSM-REQ-01/02/05/06/09/10, ONBOARDING-REQ-01, RN-CAT-01). Boots the FULL
 * AppModule against real Postgres + Redis, so it exercises the controller,
 * DTO validation, application service, TypeORM repositories and the JWT signer
 * end-to-end.
 *
 * The geocoding port is overridden with a deterministic stub (fixed Posadas
 * coordinates) so the public catalog search is offline and reproducible — no
 * dependency on the live Nominatim service.
 *
 * Covers:
 *  - happy CRUD on /prestadores/me*
 *  - ownership negatives (acting on another prestador's servicio → 404)
 *  - auth-required (401 without a token)
 *  - role negatives (cliente hitting the prestador /me surface → 403)
 *  - the app-owned publish flag: a freshly registered prestador is NOT
 *    searchable until they publish a visible servicio, and disappears again
 *    when the last visible servicio is soft-deleted (ESC-12/18, RN-CAT-01).
 */
describe('Prestador autogestión (e2e: /prestadores/me*)', () => {
  let app: INestApplication;

  const stamp = Date.now();
  const password = 'Sup3rSecret!';
  const localidad = 'Posadas';
  const trade = 'plomero'; // non-regulated → habilitado → visible=true
  const categoria = 'Plomero'; // trade label the catalog search matches on

  const prestadorA = {
    email: `psm-a-${stamp}@test.local`,
    id: '' as string,
    token: '' as string,
  };
  const prestadorB = {
    email: `psm-b-${stamp}@test.local`,
    id: '' as string,
    token: '' as string,
  };
  const cliente = {
    email: `psm-c-${stamp}@test.local`,
    token: '' as string,
  };

  let servicioAId = '';

  const posadasCoords = getCoordsForLocalidad(localidad);

  async function register(
    email: string,
    role: 'cliente' | 'prestador',
  ): Promise<string> {
    const body: Record<string, unknown> = {
      email,
      password,
      name: 'Test',
      lastName: 'User',
      phone: '+5493764000000',
      role,
    };
    if (role === 'prestador') {
      body.trade = trade;
      body.localidad = localidad;
    }
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send(body)
      .expect(201);
    return res.body.id as string;
  }

  async function login(email: string): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);
    return res.body.accessToken as string;
  }

  async function searchTotal(): Promise<number> {
    const res = await request(app.getHttpServer())
      .get('/catalogo/prestadores')
      .query({ oficio: categoria, ubicacion: localidad, pageSize: 100 })
      .expect(200);
    return res.body.total as number;
  }

  async function searchIds(): Promise<string[]> {
    const res = await request(app.getHttpServer())
      .get('/catalogo/prestadores')
      .query({ oficio: categoria, ubicacion: localidad, pageSize: 100 })
      .expect(200);
    return (res.body.data as Array<{ id: string }>).map((p) => p.id);
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Deterministic, offline geocoding: any location resolves to Posadas.
      .overrideProvider(GEOCODING_SERVICE)
      .useValue({
        geocode: async () => ({
          lat: posadasCoords.lat,
          lng: posadasCoords.lng,
        }),
        reverseGeocode: async () => null,
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );
    await app.init();

    prestadorA.id = await register(prestadorA.email, 'prestador');
    prestadorB.id = await register(prestadorB.email, 'prestador');
    await register(cliente.email, 'cliente');

    prestadorA.token = await login(prestadorA.email);
    prestadorB.token = await login(prestadorB.email);
    cliente.token = await login(cliente.email);
  });

  afterAll(async () => {
    await app.close();
  });

  // ── Auth / role gates ────────────────────────────────────────────────────

  it('rejects GET /prestadores/me without a token → 401 (ESC-PSM-02/17)', async () => {
    await request(app.getHttpServer()).get('/prestadores/me').expect(401);
  });

  it('rejects a cliente on the prestador /me surface → 403', async () => {
    await request(app.getHttpServer())
      .get('/prestadores/me')
      .set('Authorization', `Bearer ${cliente.token}`)
      .expect(403);
  });

  it('rejects POST /prestadores/me/servicios without a token → 401', async () => {
    await request(app.getHttpServer())
      .post('/prestadores/me/servicios')
      .send({ categoria, descripcion: 'x' })
      .expect(401);
  });

  // ── Freshly registered prestador is NOT searchable yet (RN-CAT-01) ─────────

  it('GET /prestadores/me returns the own profile with tieneServiciosPublicados=false and no servicios (PSM-REQ-01)', async () => {
    const res = await request(app.getHttpServer())
      .get('/prestadores/me')
      .set('Authorization', `Bearer ${prestadorA.token}`)
      .expect(200);

    expect(res.body.id).toBe(prestadorA.id);
    expect(res.body.tieneServiciosPublicados).toBe(false);
    expect(res.body.servicios).toEqual([]);
  });

  it('a freshly registered prestador is absent from the public catalog search (ESC-12, RN-CAT-01)', async () => {
    const ids = await searchIds();
    expect(ids).not.toContain(prestadorA.id);
  });

  // ── Publish first servicio → becomes searchable ───────────────────────────

  it('POST /prestadores/me/servicios creates a visible servicio and publishes the prestador (PSM-REQ-05, ESC-PSM-11)', async () => {
    const totalBefore = await searchTotal();

    const res = await request(app.getHttpServer())
      .post('/prestadores/me/servicios')
      .set('Authorization', `Bearer ${prestadorA.token}`)
      .send({
        categoria,
        descripcion: 'Instalaciones y reparaciones',
        rangoPrecioMin: 1000,
        rangoPrecioMax: 5000,
      })
      .expect(201);

    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.visible).toBe(true);
    servicioAId = res.body.id as string;

    const perfil = await request(app.getHttpServer())
      .get('/prestadores/me')
      .set('Authorization', `Bearer ${prestadorA.token}`)
      .expect(200);
    expect(perfil.body.tieneServiciosPublicados).toBe(true);
    expect(perfil.body.servicios).toHaveLength(1);

    // Now searchable: the full count grew by exactly one (this prestador).
    expect(await searchTotal()).toBe(totalBefore + 1);
    expect(await searchIds()).toContain(prestadorA.id);
  });

  it('PATCH /prestadores/me/servicios/:id updates the own servicio (PSM-REQ-07)', async () => {
    const res = await request(app.getHttpServer())
      .patch(`/prestadores/me/servicios/${servicioAId}`)
      .set('Authorization', `Bearer ${prestadorA.token}`)
      .send({ descripcion: 'Descripción actualizada' })
      .expect(200);

    expect(res.body.descripcion).toBe('Descripción actualizada');
  });

  it('PATCH /prestadores/me updates the profile (PSM-REQ-02/03)', async () => {
    const res = await request(app.getHttpServer())
      .patch('/prestadores/me')
      .set('Authorization', `Bearer ${prestadorA.token}`)
      .send({
        disponibilidadResumen: { estado: 'disponible_esta_semana' },
      })
      .expect(200);

    expect(res.body.disponibilidadResumen.estado).toBe(
      'disponible_esta_semana',
    );
  });

  // ── Ownership negatives: B cannot touch A's servicio → 404 (existence-hiding) ─

  it('PATCH another prestador servicio → 404 (ESC-PSM-14, ownership)', async () => {
    await request(app.getHttpServer())
      .patch(`/prestadores/me/servicios/${servicioAId}`)
      .set('Authorization', `Bearer ${prestadorB.token}`)
      .send({ descripcion: 'hijack' })
      .expect(404);
  });

  it('DELETE another prestador servicio → 404 (ESC-PSM-16, ownership)', async () => {
    await request(app.getHttpServer())
      .delete(`/prestadores/me/servicios/${servicioAId}`)
      .set('Authorization', `Bearer ${prestadorB.token}`)
      .expect(404);
  });

  // ── Soft-delete last visible servicio → hidden again ──────────────────────

  it('DELETE own last servicio soft-deletes it and unpublishes the prestador (PSM-REQ-08, ESC-PSM-12/18)', async () => {
    const totalBefore = await searchTotal();

    await request(app.getHttpServer())
      .delete(`/prestadores/me/servicios/${servicioAId}`)
      .set('Authorization', `Bearer ${prestadorA.token}`)
      .expect(204);

    const perfil = await request(app.getHttpServer())
      .get('/prestadores/me')
      .set('Authorization', `Bearer ${prestadorA.token}`)
      .expect(200);
    expect(perfil.body.tieneServiciosPublicados).toBe(false);
    // Soft delete preserves the row (visible=false), re-publishable.
    expect(perfil.body.servicios).toHaveLength(1);
    expect(perfil.body.servicios[0].visible).toBe(false);

    // No longer searchable: count dropped back by one.
    expect(await searchTotal()).toBe(totalBefore - 1);
    expect(await searchIds()).not.toContain(prestadorA.id);
  });
});
