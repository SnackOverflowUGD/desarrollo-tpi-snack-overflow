/**
 * Unit tests for AuthService — derived from spec.md (ESC-01..10) and
 * OCL contracts (design.md §6.1/6.2).
 *
 * All ports are mocked in-memory; no DB or Redis required.
 */
import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service.js';
import { ProviderStatus } from '../domain/provider-status.enum.js';
import { UserRole } from '../domain/user-role.enum.js';
import { UserStatus } from '../domain/user-status.enum.js';
import type { User } from '../domain/user.entity.js';
import type { PasswordResetToken } from '../domain/password-reset-token.entity.js';
import type { IAttemptStore } from '../ports/attempt-store.port.js';
import type { IEmailNotifier } from '../ports/email-notifier.port.js';
import type { ITokenStore } from '../ports/token-store.port.js';
import type { IUserRepository } from '../ports/user.repository.port.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-uuid-1',
    name: 'Demo',
    lastName: 'User',
    email: 'user@example.com',
    passwordHash: 'PLACEHOLDER', // replaced by real hash in tests that need it
    role: UserRole.CLIENTE,
    status: UserStatus.ACTIVO,
    providerStatus: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

function makeToken(
  overrides: Partial<PasswordResetToken> = {},
): PasswordResetToken {
  return {
    id: 'token-uuid-1',
    userId: 'user-uuid-1',
    tokenHash: 'hash',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    usedAt: null,
    createdAt: new Date(),
    user: null as any,
    ...overrides,
  };
}

function makeMocks() {
  const userRepo: jest.Mocked<IUserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePasswordHash: jest.fn().mockResolvedValue(undefined),
  };

  const attemptStore: jest.Mocked<IAttemptStore> = {
    increment: jest.fn().mockResolvedValue(1),
    isLocked: jest.fn().mockResolvedValue(false),
    lock: jest.fn().mockResolvedValue(undefined),
    reset: jest.fn().mockResolvedValue(undefined),
  };

  const tokenStore: jest.Mocked<ITokenStore> = {
    save: jest.fn().mockResolvedValue(undefined),
    findByHash: jest.fn().mockResolvedValue(null),
    markUsed: jest.fn().mockResolvedValue(undefined),
    countWithinHour: jest.fn().mockResolvedValue(0),
  };

  const emailNotifier: jest.Mocked<IEmailNotifier> = {
    sendPasswordReset: jest.fn().mockResolvedValue(undefined),
  };

  const jwtService = {
    sign: jest.fn().mockReturnValue('signed-token'),
  } as unknown as jest.Mocked<JwtService>;

  const service = new AuthService(
    userRepo,
    attemptStore,
    tokenStore,
    emailNotifier,
    jwtService,
  );

  return {
    service,
    userRepo,
    attemptStore,
    tokenStore,
    emailNotifier,
    jwtService,
  };
}

// ---------------------------------------------------------------------------
// ESC-01: Login exitoso — flujo básico
// ---------------------------------------------------------------------------
describe('AuthService.login()', () => {
  it('ESC-01: valid credentials → 200, returns accessToken with sub+role claims', async () => {
    const { service, userRepo, attemptStore, jwtService } = makeMocks();
    const hash = await argon2.hash('secret');
    const user = makeUser({ passwordHash: hash });
    userRepo.findByEmail.mockResolvedValue(user);
    attemptStore.isLocked.mockResolvedValue(false);
    jwtService.sign.mockReturnValue('jwt-token');

    const result = await service.login('user@example.com', 'secret');

    expect(result.accessToken).toBe('jwt-token');
    // OCL §6.1 post-condition: sign called with sub and role
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({ sub: user.id, role: user.role }),
    );
    // OCL §6.1: increment was NOT called on success
    expect(attemptStore.increment).not.toHaveBeenCalledWith(user.id);
  });

  // ESC-10: counter reset on successful login
  it('ESC-10: login success after N<5 failures → attemptStore.reset called', async () => {
    const { service, userRepo, attemptStore } = makeMocks();
    const hash = await argon2.hash('correct');
    const user = makeUser({ passwordHash: hash });
    userRepo.findByEmail.mockResolvedValue(user);
    attemptStore.isLocked.mockResolvedValue(false);

    await service.login('user@example.com', 'correct');

    // RN-AUTH-03: counter reset on success
    expect(attemptStore.reset).toHaveBeenCalledWith(user.id);
  });

  // ESC-02: Prestador pendiente_habilitacion → providerStatus in claims
  it('ESC-02: prestador pendiente_habilitacion → JWT includes providerStatus claim', async () => {
    const { service, userRepo, attemptStore, jwtService } = makeMocks();
    const hash = await argon2.hash('secret');
    const user = makeUser({
      role: UserRole.PRESTADOR,
      providerStatus: ProviderStatus.PENDIENTE_HABILITACION,
      passwordHash: hash,
    });
    userRepo.findByEmail.mockResolvedValue(user);
    attemptStore.isLocked.mockResolvedValue(false);

    await service.login('prestador@example.com', 'secret');

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: user.id,
        role: UserRole.PRESTADOR,
        providerStatus: ProviderStatus.PENDIENTE_HABILITACION,
      }),
    );
  });

  // ESC-02: cliente/admin must NOT have providerStatus in claims
  it('ESC-02: cliente → JWT does NOT include providerStatus claim', async () => {
    const { service, userRepo, attemptStore, jwtService } = makeMocks();
    const hash = await argon2.hash('secret');
    const user = makeUser({
      role: UserRole.CLIENTE,
      providerStatus: null,
      passwordHash: hash,
    });
    userRepo.findByEmail.mockResolvedValue(user);
    attemptStore.isLocked.mockResolvedValue(false);

    await service.login('cliente@example.com', 'secret');

    const signArg = (jwtService.sign as jest.Mock).mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(signArg).not.toHaveProperty('providerStatus');
  });

  // UAT-06: JWT payload includes name and email claims
  it('UAT-06: login success → JWT payload includes name and email claims', async () => {
    const { service, userRepo, attemptStore, jwtService } = makeMocks();
    const hash = await argon2.hash('secret');
    const user = makeUser({
      name: 'Camila',
      email: 'camila@example.com',
      passwordHash: hash,
    });
    userRepo.findByEmail.mockResolvedValue(user);
    attemptStore.isLocked.mockResolvedValue(false);

    await service.login('camila@example.com', 'secret');

    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: user.id,
        role: user.role,
        name: 'Camila',
        email: 'camila@example.com',
      }),
    );
  });

  // ESC-03: credenciales inválidas N<4
  it('ESC-03: invalid password (N<4 failures) → UnauthorizedException, counter incremented by 1', async () => {
    const { service, userRepo, attemptStore } = makeMocks();
    const hash = await argon2.hash('correct');
    const user = makeUser({ passwordHash: hash });
    userRepo.findByEmail.mockResolvedValue(user);
    attemptStore.isLocked.mockResolvedValue(false);
    attemptStore.increment.mockResolvedValue(2); // simulating 2nd failure

    await expect(service.login('user@example.com', 'wrong')).rejects.toThrow(
      UnauthorizedException,
    );

    // OCL §6.1: counter incremented
    expect(attemptStore.increment).toHaveBeenCalledWith(user.id);
    // lock must NOT be set yet
    expect(attemptStore.lock).not.toHaveBeenCalled();
  });

  // ESC-04: bloqueo en 5to intento
  it('ESC-04: invalid password on 5th attempt → 423 + lock set', async () => {
    const { service, userRepo, attemptStore } = makeMocks();
    const hash = await argon2.hash('correct');
    const user = makeUser({ passwordHash: hash });
    userRepo.findByEmail.mockResolvedValue(user);
    attemptStore.isLocked.mockResolvedValue(false);
    attemptStore.increment.mockResolvedValue(5); // 5th failure

    const err = await service
      .login('user@example.com', 'wrong')
      .catch((e) => e);

    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(HttpStatus.LOCKED); // 423
    // OCL §6.1: lock called
    expect(attemptStore.lock).toHaveBeenCalledWith(user.id, expect.any(Number));
    // isLocked returns true after this (checked via OCL post-condition)
    // Verify no token was returned (no accessToken property on thrown error)
  });

  // ESC-05: cuenta suspendida — attemptStore NOT touched, checked BEFORE credentials
  it('ESC-05: suspended account → ForbiddenException 403, attemptStore never touched', async () => {
    const { service, userRepo, attemptStore } = makeMocks();
    const user = makeUser({ status: UserStatus.SUSPENDIDO });
    userRepo.findByEmail.mockResolvedValue(user);

    await expect(service.login('user@example.com', 'anything')).rejects.toThrow(
      ForbiddenException,
    );

    // OCL §6.1: attemptStore was NOT touched for the user
    expect(attemptStore.increment).not.toHaveBeenCalledWith(user.id);
    expect(attemptStore.isLocked).not.toHaveBeenCalled();
    expect(attemptStore.lock).not.toHaveBeenCalled();
    expect(attemptStore.reset).not.toHaveBeenCalled();
  });

  // ESC-05: suspension verified BEFORE credential validation (order check)
  it('ESC-05: suspension check happens before password verification (order)', async () => {
    const { service, userRepo, attemptStore } = makeMocks();
    // User has suspended status — even with a WRONG password the error is 403 not 401
    const user = makeUser({
      status: UserStatus.SUSPENDIDO,
      passwordHash: 'any-hash',
    });
    userRepo.findByEmail.mockResolvedValue(user);

    const err = await service
      .login('user@example.com', 'wrong-password')
      .catch((e) => e);

    expect(err).toBeInstanceOf(ForbiddenException);
    // isLocked should NOT even be consulted because suspension is step 2, before step 3
    expect(attemptStore.isLocked).not.toHaveBeenCalled();
  });

  // Already-locked account (ESC-04 pre-existing lock)
  it('ESC-04 (pre-existing lock): isLocked=true → 423 without touching increment', async () => {
    const { service, userRepo, attemptStore } = makeMocks();
    const user = makeUser({ passwordHash: await argon2.hash('correct') });
    userRepo.findByEmail.mockResolvedValue(user);
    attemptStore.isLocked.mockResolvedValue(true);

    const err = await service
      .login('user@example.com', 'anything')
      .catch((e) => e);

    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(HttpStatus.LOCKED);
    expect(attemptStore.increment).not.toHaveBeenCalledWith(user.id);
  });

  // Unknown email → same 401 (RN-AUTH-02, no email enumeration)
  it('unknown email → UnauthorizedException 401 (no enumeration)', async () => {
    const { service, userRepo } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(
      service.login('ghost@example.com', 'password'),
    ).rejects.toThrow(UnauthorizedException);
  });
});

// ---------------------------------------------------------------------------
// ESC-06/07/08: Password reset flows
// ---------------------------------------------------------------------------
describe('AuthService.requestPasswordReset()', () => {
  // ESC-08: unknown email → returns void, email NOT sent
  it('ESC-08: unknown email → returns void without sending email', async () => {
    const { service, userRepo, emailNotifier, tokenStore } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(null);

    await expect(
      service.requestPasswordReset('ghost@example.com'),
    ).resolves.toBeUndefined();

    expect(emailNotifier.sendPasswordReset).not.toHaveBeenCalled();
    expect(tokenStore.save).not.toHaveBeenCalled();
  });

  // ESC-08: response shape is the same (void) regardless — prevents enumeration
  it('ESC-08: known email vs unknown email — same void return (no throw)', async () => {
    const {
      service,
      userRepo,
      tokenStore,
      emailNotifier: _emailNotifier,
    } = makeMocks();
    // known email
    const user = makeUser();
    userRepo.findByEmail.mockResolvedValueOnce(user);
    tokenStore.countWithinHour.mockResolvedValue(0);

    await expect(
      service.requestPasswordReset('user@example.com'),
    ).resolves.toBeUndefined();

    // unknown email
    userRepo.findByEmail.mockResolvedValueOnce(null);
    await expect(
      service.requestPasswordReset('ghost@example.com'),
    ).resolves.toBeUndefined();
  });

  // ESC-06: valid email → token saved + email sent
  it('ESC-06 (request phase): known email + under rate limit → saves token and sends email', async () => {
    const { service, userRepo, tokenStore, emailNotifier } = makeMocks();
    const user = makeUser();
    userRepo.findByEmail.mockResolvedValue(user);
    tokenStore.countWithinHour.mockResolvedValue(0);

    await service.requestPasswordReset(user.email);

    expect(tokenStore.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        tokenHash: expect.any(String),
        expiresAt: expect.any(Date),
      }),
    );
    expect(emailNotifier.sendPasswordReset).toHaveBeenCalledWith(
      user.email,
      expect.any(String),
    );
  });

  // RN-AUTH-05: rate limit silent drop
  it('rate limit hit (3 requests) → returns void, email NOT sent', async () => {
    const { service, userRepo, tokenStore, emailNotifier } = makeMocks();
    const user = makeUser();
    userRepo.findByEmail.mockResolvedValue(user);
    tokenStore.countWithinHour.mockResolvedValue(3); // already at limit

    await expect(
      service.requestPasswordReset(user.email),
    ).resolves.toBeUndefined();
    expect(emailNotifier.sendPasswordReset).not.toHaveBeenCalled();
  });
});

describe('AuthService.resetPassword()', () => {
  // ESC-06: valid token → password updated + token marked used
  it('ESC-06: valid token → updatePasswordHash called + markUsed called', async () => {
    const { service, tokenStore, userRepo } = makeMocks();
    const rawToken = 'a'.repeat(64); // 32 bytes hex
    const token = makeToken({
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      usedAt: null,
    });
    tokenStore.findByHash.mockResolvedValue(token);

    await service.resetPassword(rawToken, 'newPassword123');

    // OCL §6.2 post-conditions
    expect(userRepo.updatePasswordHash).toHaveBeenCalledWith(
      token.userId,
      expect.any(String),
    );
    expect(tokenStore.markUsed).toHaveBeenCalledWith(token.id);
  });

  // ESC-07: token not found → 400, no DB write
  it('ESC-07: token not found → 400 HttpException, no password update', async () => {
    const { service, tokenStore, userRepo } = makeMocks();
    tokenStore.findByHash.mockResolvedValue(null);

    const err = await service
      .resetPassword('nonexistent-token', 'newPass')
      .catch((e) => e);

    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST); // 400
    // OCL §6.2: updatePasswordHash NOT called
    expect(userRepo.updatePasswordHash).not.toHaveBeenCalled();
    expect(tokenStore.markUsed).not.toHaveBeenCalled();
  });

  // ESC-07: token expired → 410, no DB write
  it('ESC-07: expired token → 410 HttpException, no password update', async () => {
    const { service, tokenStore, userRepo } = makeMocks();
    const expiredToken = makeToken({
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
    });
    tokenStore.findByHash.mockResolvedValue(expiredToken);

    const err = await service
      .resetPassword('some-raw-token', 'newPass')
      .catch((e) => e);

    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(HttpStatus.GONE); // 410
    expect(userRepo.updatePasswordHash).not.toHaveBeenCalled();
    expect(tokenStore.markUsed).not.toHaveBeenCalled();
  });

  // ESC-07: token already used → 410, no DB write
  it('ESC-07: already-used token → 410 HttpException, no password update', async () => {
    const { service, tokenStore, userRepo } = makeMocks();
    const usedToken = makeToken({
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      usedAt: new Date(),
    });
    tokenStore.findByHash.mockResolvedValue(usedToken);

    const err = await service
      .resetPassword('some-raw-token', 'newPass')
      .catch((e) => e);

    expect(err).toBeInstanceOf(HttpException);
    expect((err as HttpException).getStatus()).toBe(HttpStatus.GONE); // 410
    expect(userRepo.updatePasswordHash).not.toHaveBeenCalled();
    expect(tokenStore.markUsed).not.toHaveBeenCalled();
  });

  // OCL §6.2: updated hash must be a valid Argon2id hash (not plaintext)
  it('ESC-06 (OCL §6.2): new password stored as Argon2id hash, never plaintext', async () => {
    const { service, tokenStore, userRepo } = makeMocks();
    const rawToken = 'b'.repeat(64);
    const token = makeToken({
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      usedAt: null,
    });
    tokenStore.findByHash.mockResolvedValue(token);

    await service.resetPassword(rawToken, 'myNewPassword');

    const [, newHash] = (userRepo.updatePasswordHash as jest.Mock).mock
      .calls[0] as [string, string];
    // Argon2id hashes start with $argon2id$
    expect(newHash).toMatch(/^\$argon2id\$/);
    // Raw password not stored
    expect(newHash).not.toBe('myNewPassword');
  });
});
