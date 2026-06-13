import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

/**
 * API integration test (Supertest) — the per-Work-Item level of the ADR-006 pyramid.
 *
 * TEMPLATE: copy this shape for each Work Item's happy path. It boots the FULL
 * AppModule against real Postgres + Redis (CI `e2e` job / local `docker compose up`),
 * so it exercises the controllers, DTO validation, services, TypeORM repositories
 * and the JWT signer end-to-end — no fakes.
 *
 * Covers the integrated UC01 (register) → UC02 (login) flow.
 */
describe('Auth flow (e2e: register → login)', () => {
  let app: INestApplication;

  // Unique email per run so re-runs against a persistent DB never hit the 409 guard.
  const email = `auth-e2e-${Date.now()}@test.local`;
  const password = 'Sup3rSecret!';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Mirror main.ts so DTO validation behaves exactly as in production.
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers a cliente → 201 with status=activo, providerStatus=null (ESC-01)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, name: 'Ada', lastName: 'Lovelace', phone: '+5493764000000', role: 'cliente' })
      .expect(201);

    expect(res.body.status).toBe('activo');
    expect(res.body.providerStatus).toBeNull();
  });

  it('rejects a duplicate email → 409 (ESC-06)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password, name: 'Ada', lastName: 'Lovelace', phone: '+5493764000000', role: 'cliente' })
      .expect(409);
  });

  it('rejects invalid payload → 422 (ESC-04/05)', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(422);
  });

  it('logs in with valid credentials → 200 with a JWT', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200);

    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.accessToken.split('.')).toHaveLength(3); // header.payload.signature
  });

  it('rejects a wrong password → 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'WrongPassword!' })
      .expect(401);
  });
});
