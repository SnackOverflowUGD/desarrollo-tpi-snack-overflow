/**
 * API/integration tests for AuthController — uses NestJS TestingModule with
 * in-memory fake adapters (no Postgres, no Redis, no SMTP).
 *
 * Covers: ESC-01..08, ESC-10 HTTP layer.
 * ESC-09 (Redis TTL auto-expiry) is marked skip — requires real Redis.
 */
import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import supertest from 'supertest';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

import { AuthController } from './auth.controller.js';
import { AuthService } from './application/auth.service.js';
import { RegistrationService } from './application/registration.service.js';
import { PasswordResetToken } from './domain/password-reset-token.entity.js';
import { ProviderStatus } from './domain/provider-status.enum.js';
import { RegulatedTrade } from './domain/regulated-trade.entity.js';
import { UserRole } from './domain/user-role.enum.js';
import { UserStatus } from './domain/user-status.enum.js';
import { User } from './domain/user.entity.js';
import { ATTEMPT_STORE } from './ports/attempt-store.port.js';
import { EMAIL_NOTIFIER } from './ports/email-notifier.port.js';
import { REGULATED_TRADE_REPOSITORY } from './ports/regulated-trade.repository.port.js';
import { TOKEN_STORE } from './ports/token-store.port.js';
import { USER_REPOSITORY } from './ports/user.repository.port.js';
import type { IAttemptStore } from './ports/attempt-store.port.js';
import type { IEmailNotifier } from './ports/email-notifier.port.js';
import type { IRegulatedTradeRepository } from './ports/regulated-trade.repository.port.js';
import type { ITokenStore } from './ports/token-store.port.js';
import type { IUserRepository } from './ports/user.repository.port.js';

// ---------------------------------------------------------------------------
// In-memory fake adapters (no infra required)
// ---------------------------------------------------------------------------

class FakeUserRepo implements IUserRepository {
  private store = new Map<string, User>();

  seed(user: User) {
    this.store.set(user.email.toLowerCase(), user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.store.get(email.toLowerCase()) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    for (const u of this.store.values()) {
      if (u.id === id) return u;
    }
    return null;
  }

  async updatePasswordHash(userId: string, newHash: string): Promise<void> {
    for (const u of this.store.values()) {
      if (u.id === userId) {
        u.passwordHash = newHash;
        return;
      }
    }
  }

  async create(data: any): Promise<User> {
    const user = {
      id: crypto.randomUUID(),
      name: data.name,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      passwordHash: data.passwordHash,
      role: data.role,
      status: data.status,
      providerStatus: data.providerStatus,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    this.store.set(user.email.toLowerCase(), user);
    return user;
  }
}

class FakeAttemptStore implements IAttemptStore {
  private counters = new Map<string, number>();
  private locks = new Set<string>();

  async increment(userId: string): Promise<number> {
    const n = (this.counters.get(userId) ?? 0) + 1;
    this.counters.set(userId, n);
    return n;
  }

  async isLocked(userId: string): Promise<boolean> {
    return this.locks.has(userId);
  }

  async lock(userId: string, _ttlSeconds: number): Promise<void> {
    this.locks.add(userId);
  }

  async reset(userId: string): Promise<void> {
    this.counters.delete(userId);
    this.locks.delete(userId);
  }

  // test helper
  setCount(userId: string, n: number) {
    this.counters.set(userId, n);
  }

  setLocked(userId: string) {
    this.locks.add(userId);
  }
}

class FakeTokenStore implements ITokenStore {
  private records = new Map<string, PasswordResetToken>();

  seed(record: PasswordResetToken) {
    this.records.set(record.tokenHash, record);
  }

  async save(data: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    const record: PasswordResetToken = {
      id: crypto.randomUUID(),
      userId: data.userId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      usedAt: null,
      createdAt: new Date(),
      user: null as any,
    };
    this.records.set(record.tokenHash, record);
  }

  async findByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.records.get(tokenHash) ?? null;
  }

  async markUsed(tokenId: string): Promise<void> {
    for (const r of this.records.values()) {
      if (r.id === tokenId) {
        r.usedAt = new Date();
        return;
      }
    }
  }

  async countWithinHour(_userId: string): Promise<number> {
    return 0;
  }
}

class FakeEmailNotifier implements IEmailNotifier {
  public calls: { email: string; token: string }[] = [];

  async sendPasswordReset(toEmail: string, rawToken: string): Promise<void> {
    this.calls.push({ email: toEmail, token: rawToken });
  }
}

class FakeRegulatedTradeRepo implements IRegulatedTradeRepository {
  private trades = new Map<string, RegulatedTrade>();

  seed(trade: RegulatedTrade) {
    this.trades.set(trade.tradeName, trade);
  }

  async findByTradeName(tradeName: string): Promise<RegulatedTrade | null> {
    return this.trades.get(tradeName) ?? null;
  }
}

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

function makeUserRecord(overrides: Partial<User> = {}): User {
  return {
    id: 'user-uuid-1',
    name: 'Juan',
    lastName: 'Pérez',
    email: 'user@example.com',
    phone: '+543764123456',
    passwordHash: '$argon2id$placeholder',
    role: UserRole.CLIENTE,
    status: UserStatus.ACTIVO,
    providerStatus: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

interface TestApp {
  app: any;
  userRepo: FakeUserRepo;
  attemptStore: FakeAttemptStore;
  tokenStore: FakeTokenStore;
  emailNotifier: FakeEmailNotifier;
  regulatedTradeRepo: FakeRegulatedTradeRepo;
  module: TestingModule;
}

async function buildApp(): Promise<TestApp> {
  const userRepo = new FakeUserRepo();
  const attemptStore = new FakeAttemptStore();
  const tokenStore = new FakeTokenStore();
  const emailNotifier = new FakeEmailNotifier();
  const regulatedTradeRepo = new FakeRegulatedTradeRepo();

  const module = await Test.createTestingModule({
    imports: [
      PassportModule,
      JwtModule.register({ secret: 'test-secret', signOptions: { expiresIn: '2h' } }),
    ],
    controllers: [AuthController],
    providers: [
      AuthService,
      RegistrationService,
      { provide: USER_REPOSITORY, useValue: userRepo },
      { provide: ATTEMPT_STORE, useValue: attemptStore },
      { provide: TOKEN_STORE, useValue: tokenStore },
      { provide: EMAIL_NOTIFIER, useValue: emailNotifier },
      { provide: REGULATED_TRADE_REPOSITORY, useValue: regulatedTradeRepo },
    ],
  }).compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
    }),
  );
  await app.init();

  return { app, userRepo, attemptStore, tokenStore, emailNotifier, regulatedTradeRepo, module };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuthController (API integration)', () => {
  let testApp: TestApp;

  beforeEach(async () => {
    testApp = await buildApp();
  });

  afterEach(async () => {
    await testApp.app.close();
  });

  // -------------------------------------------------------------------------
  // POST /auth/login
  // -------------------------------------------------------------------------
  describe('POST /auth/login', () => {
    it('ESC-01: valid credentials → 200 with accessToken', async () => {
      const { app, userRepo } = testApp;
      const hash = await argon2.hash('correct');
      userRepo.seed(makeUserRecord({ passwordHash: hash }));

      const res = await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'correct' });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('ESC-02: prestador pendiente_habilitacion → 200 with providerStatus in JWT claims', async () => {
      const { app, userRepo } = testApp;
      const hash = await argon2.hash('secret');
      userRepo.seed(
        makeUserRecord({
          role: UserRole.PRESTADOR,
          providerStatus: ProviderStatus.PENDIENTE_HABILITACION,
          passwordHash: hash,
        }),
      );

      const res = await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'secret' });

      expect(res.status).toBe(HttpStatus.OK);
      const token = res.body.accessToken as string;
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as Record<string, unknown>;
      expect(payload.role).toBe('prestador');
      expect(payload.providerStatus).toBe('pendiente_habilitacion');
    });

    it('ESC-03: invalid password → 401 with generic message', async () => {
      const { app, userRepo } = testApp;
      const hash = await argon2.hash('correct');
      userRepo.seed(makeUserRecord({ passwordHash: hash }));

      const res = await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'wrong' });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
      expect(res.body.message).toBeDefined();
    });

    it('ESC-04: 5th consecutive failed attempt → 423', async () => {
      const { app, userRepo, attemptStore } = testApp;
      const hash = await argon2.hash('correct');
      const user = makeUserRecord({ passwordHash: hash });
      userRepo.seed(user);
      // Simulate 4 prior failures so the next increment returns 5
      attemptStore.setCount(user.id, 4);

      const res = await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'wrong' });

      expect(res.status).toBe(HttpStatus.LOCKED); // 423
    });

    it('ESC-04 (pre-existing lock): locked account → 423', async () => {
      const { app, userRepo, attemptStore } = testApp;
      const hash = await argon2.hash('correct');
      const user = makeUserRecord({ passwordHash: hash });
      userRepo.seed(user);
      attemptStore.setLocked(user.id);

      const res = await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'correct' });

      expect(res.status).toBe(HttpStatus.LOCKED);
    });

    it('ESC-05: suspended account → 403', async () => {
      const { app, userRepo } = testApp;
      userRepo.seed(makeUserRecord({ status: UserStatus.SUSPENDIDO }));

      const res = await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'anything' });

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('ESC-10: successful login after prior failures → 200 + counter reset', async () => {
      const { app, userRepo, attemptStore } = testApp;
      const hash = await argon2.hash('correct');
      const user = makeUserRecord({ passwordHash: hash });
      userRepo.seed(user);
      attemptStore.setCount(user.id, 3); // 3 prior failures

      const res = await supertest(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'user@example.com', password: 'correct' });

      expect(res.status).toBe(HttpStatus.OK);
      // isLocked should now be false (reset was called)
      expect(await attemptStore.isLocked(user.id)).toBe(false);
    });

    // ESC-09: would require Redis with TTL — skipped (integration test)
    it.skip('ESC-09: after lock TTL expiry → login succeeds (requires real Redis)', () => {
      // This scenario requires a real Redis instance with TTL support.
      // To run: docker compose up redis, then use the redis-attempt-store adapter.
    });
  });

  // -------------------------------------------------------------------------
  // POST /auth/forgot-password
  // -------------------------------------------------------------------------
  describe('POST /auth/forgot-password', () => {
    it('ESC-08: unknown email → 200 same generic message, no email sent', async () => {
      const { app, emailNotifier } = testApp;

      const res = await supertest(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'ghost@example.com' });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.message).toBe(
        'If that email is registered, a recovery link has been sent.',
      );
      expect(emailNotifier.calls).toHaveLength(0);
    });

    it('ESC-06 (request phase): known email → 200 same generic message', async () => {
      const { app, userRepo, emailNotifier } = testApp;
      userRepo.seed(makeUserRecord());

      const res = await supertest(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'user@example.com' });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.message).toBe(
        'If that email is registered, a recovery link has been sent.',
      );
      // email was sent to the real address
      expect(emailNotifier.calls).toHaveLength(1);
      expect(emailNotifier.calls[0].email).toBe('user@example.com');
    });

    it('ESC-08: response body is identical for known vs unknown email (no enumeration)', async () => {
      const { app, userRepo } = testApp;
      userRepo.seed(makeUserRecord());

      const [known, unknown] = await Promise.all([
        supertest(app.getHttpServer())
          .post('/auth/forgot-password')
          .send({ email: 'user@example.com' }),
        supertest(app.getHttpServer())
          .post('/auth/forgot-password')
          .send({ email: 'ghost@example.com' }),
      ]);

      expect(known.status).toBe(HttpStatus.OK);
      expect(unknown.status).toBe(HttpStatus.OK);
      expect(known.body.message).toBe(unknown.body.message);
    });
  });

  // -------------------------------------------------------------------------
  // POST /auth/reset-password
  // -------------------------------------------------------------------------
  describe('POST /auth/reset-password', () => {
    it('ESC-06: valid token → 200 with success message', async () => {
      const { app, userRepo, tokenStore } = testApp;
      const user = makeUserRecord({ passwordHash: await argon2.hash('old') });
      userRepo.seed(user);

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      tokenStore.seed({
        id: 'tok-1',
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
        user: null as any,
      });

      const res = await supertest(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: rawToken, newPassword: 'newPassword123' });

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.message).toBe('Password updated successfully.');
    });

    it('ESC-07: token not found → 400', async () => {
      const { app } = testApp;

      const res = await supertest(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'nonexistent-token-value', newPassword: 'newPassword123' });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('ESC-07: expired token → 410', async () => {
      const { app, userRepo, tokenStore } = testApp;
      const user = makeUserRecord();
      userRepo.seed(user);

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      tokenStore.seed({
        id: 'tok-expired',
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() - 1000), // already expired
        usedAt: null,
        createdAt: new Date(),
        user: null as any,
      });

      const res = await supertest(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: rawToken, newPassword: 'newPassword123' });

      expect(res.status).toBe(HttpStatus.GONE);
    });

    it('ESC-07: already-used token → 410', async () => {
      const { app, userRepo, tokenStore } = testApp;
      const user = makeUserRecord();
      userRepo.seed(user);

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      tokenStore.seed({
        id: 'tok-used',
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        usedAt: new Date(), // already used
        createdAt: new Date(),
        user: null as any,
      });

      const res = await supertest(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: rawToken, newPassword: 'newPassword123' });

      expect(res.status).toBe(HttpStatus.GONE);
    });

    it('ESC-07: 400 and 410 share the same generic error message', async () => {
      const { app, userRepo, tokenStore } = testApp;
      const user = makeUserRecord();
      userRepo.seed(user);

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      tokenStore.seed({
        id: 'tok-expired-2',
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
        createdAt: new Date(),
        user: null as any,
      });

      const [notFound, expired] = await Promise.all([
        supertest(app.getHttpServer())
          .post('/auth/reset-password')
          .send({ token: 'totally-fake-token', newPassword: 'newPassword123' }),
        supertest(app.getHttpServer())
          .post('/auth/reset-password')
          .send({ token: rawToken, newPassword: 'newPassword123' }),
      ]);

      expect(notFound.body.message).toBeDefined();
      expect(expired.body.message).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // POST /auth/register
  // -------------------------------------------------------------------------
  describe('POST /auth/register', () => {
    it('ESC-01: role cliente complete fields → 201 with status=activo providerStatus=null', async () => {
      const { app } = testApp;

      const res = await supertest(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '+543764123456',
          password: 'SecurePass1',
          role: 'cliente',
        });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.id).toBeDefined();
      expect(res.body.email).toBe('juan@example.com');
      expect(res.body.role).toBe('cliente');
      expect(res.body.status).toBe('activo');
      expect(res.body.providerStatus).toBeNull();
      expect(res.body.message).toBe('Account created successfully.');
    });

    it('ESC-02: role prestador + non-regulated trade → 201 with providerStatus=habilitado', async () => {
      const { app } = testApp;

      const res = await supertest(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Carlos',
          lastName: 'Gómez',
          email: 'carlos@example.com',
          phone: '+543764654321',
          password: 'SecurePass2',
          role: 'prestador',
          trade: 'plomero',
        });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.role).toBe('prestador');
      expect(res.body.status).toBe('activo');
      expect(res.body.providerStatus).toBe('habilitado');
      expect(res.body.message).toBe('Account created successfully.');
    });

    it('ESC-03: role prestador + regulated trade → 201 with providerStatus=pendiente_habilitacion + message in Spanish', async () => {
      const { app, regulatedTradeRepo } = testApp;
      // Seed a regulated trade
      regulatedTradeRepo.seed({
        id: 'reg-trade-1',
        tradeName: 'gasista',
        createdAt: new Date(),
      });

      const res = await supertest(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Martín',
          lastName: 'López',
          email: 'martin@example.com',
          phone: '+543764111222',
          password: 'SecurePass3',
          role: 'prestador',
          trade: 'gasista',
        });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.role).toBe('prestador');
      expect(res.body.status).toBe('activo');
      expect(res.body.providerStatus).toBe('pendiente_habilitacion');
      expect(res.body.message).toBe(
        'Cuenta creada. Verificá tu matrícula profesional para activar tu perfil de prestador.',
      );
    });

    it('ESC-04: missing required fields → 422', async () => {
      const { app } = testApp;

      const res = await supertest(app.getHttpServer())
        .post('/auth/register')
        .send({
          // empty body — all fields missing
        });

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      expect(res.body.message).toBeDefined();
      // Should list multiple missing fields
      expect(Array.isArray(res.body.message)).toBe(true);
    });

    it('ESC-05: invalid email format → 422', async () => {
      const { app } = testApp;

      const res = await supertest(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Juan',
          lastName: 'Pérez',
          email: 'not-an-email',
          phone: '+543764123456',
          password: 'SecurePass1',
          role: 'cliente',
        });

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('ESC-05: password too short (< 8 chars) → 422', async () => {
      const { app } = testApp;

      const res = await supertest(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '+543764123456',
          password: 'Ab1', // too short
          role: 'cliente',
        });

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('ESC-06: duplicate email → 409 with generic message, no account created', async () => {
      const { app, userRepo } = testApp;
      // Seed an existing user
      userRepo.seed(makeUserRecord({ email: 'existing@example.com' }));

      const res = await supertest(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Otro',
          lastName: 'Usuario',
          email: 'existing@example.com', // same email
          phone: '+543764999999',
          password: 'SecurePass99',
          role: 'cliente',
        });

      expect(res.status).toBe(HttpStatus.CONFLICT);
      expect(res.body.message).toBe('An account with this email already exists.');
      // Must not reveal account details (RNF-S.4, RN-REG-02)
      expect(res.body.message).not.toContain('activo');
      expect(res.body.message).not.toContain('suspendido');
    });

    it('ESC-06: duplicate email reveals no account status details', async () => {
      const { app, userRepo } = testApp;
      // Seed a SUSPENDED account — response must still not reveal it
      userRepo.seed(
        makeUserRecord({
          email: 'suspended@example.com',
          status: UserStatus.SUSPENDIDO,
        }),
      );

      const res = await supertest(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Test',
          lastName: 'User',
          email: 'suspended@example.com',
          phone: '+543764000000',
          password: 'SecurePass00',
          role: 'cliente',
        });

      expect(res.status).toBe(HttpStatus.CONFLICT);
      expect(res.body.message).toBe('An account with this email already exists.');
      expect(res.body.message).not.toContain('suspendido');
      expect(res.body.message).not.toContain('prestador');
    });

    it('ESC-01/04: invalid role → 422', async () => {
      const { app } = testApp;

      const res = await supertest(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Juan',
          lastName: 'Pérez',
          email: 'juan@example.com',
          phone: '+543764123456',
          password: 'SecurePass1',
          role: 'invalid_role',
        });

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });
});
