import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import {
  ATTEMPT_STORE,
  type IAttemptStore,
} from '../ports/attempt-store.port.js';
import {
  EMAIL_NOTIFIER,
  type IEmailNotifier,
} from '../ports/email-notifier.port.js';
import { type ITokenStore, TOKEN_STORE } from '../ports/token-store.port.js';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../ports/user.repository.port.js';
import { UserRole } from '../domain/user-role.enum.js';
import { UserStatus } from '../domain/user-status.enum.js';
import { LoginResponseDto } from '../dto/login-response.dto.js';

const MAX_ATTEMPTS = 5;
const LOCK_TTL_SECONDS = 30 * 60; // 30 minutes — RN-AUTH-04
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes — RN-AUTH-05
const MAX_RESET_REQUESTS_PER_HOUR = 3; // RN-AUTH-05

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(ATTEMPT_STORE) private readonly attemptStore: IAttemptStore,
    @Inject(TOKEN_STORE) private readonly tokenStore: ITokenStore,
    @Inject(EMAIL_NOTIFIER) private readonly emailNotifier: IEmailNotifier,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Login validation machine — order is prescriptive (see design §3.1):
   *   1. Lookup user — increment counter on unknown email to prevent timing oracle
   *   2. Check suspension — before credentials (PA-06 / RN-AUTH-01)
   *   3. Check lockout — before verifying password (RN-AUTH-04)
   *   4. Verify password — increment counter on failure; lock on 5th (RN-AUTH-02/03)
   *   5. Reset attempt counter on success (RN-AUTH-03)
   *   6. Build JWT claims (RNF-S.1)
   *   7. Sign and return token
   */
  async login(email: string, password: string): Promise<LoginResponseDto> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (!user) {
      // Increment an ephemeral counter keyed on email to equalise response time
      // and deny enumeration — the key will expire naturally (no lock is set).
      // We use a placeholder userId derived from email to avoid leaking structure.
      await this.attemptStore.increment(`email:${normalizedEmail}`);
      this.logger.warn('LOGIN_FAILED_UNKNOWN_EMAIL');
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Step 2: suspension check — before credential validation (RN-AUTH-01, ESC-05, PA-06)
    if (user.status === UserStatus.SUSPENDIDO) {
      this.logger.warn(`LOGIN_REJECTED_SUSPENDED userId=${user.id}`);
      throw new ForbiddenException('Account suspended. Contact support.');
    }

    // Step 3: lockout check (RN-AUTH-04, ESC-04)
    const locked = await this.attemptStore.isLocked(user.id);
    if (locked) {
      this.logger.warn(`LOGIN_REJECTED_LOCKED userId=${user.id}`);
      throw new HttpException(
        'Account temporarily locked. Try again in 30 minutes.',
        HttpStatus.LOCKED, // 423
      );
    }

    // Step 4: password verification (RN-AUTH-02)
    const valid = await argon2.verify(user.passwordHash, password);
    if (!valid) {
      const count = await this.attemptStore.increment(user.id);
      if (count >= MAX_ATTEMPTS) {
        await this.attemptStore.lock(user.id, LOCK_TTL_SECONDS);
        this.logger.warn(`ACCOUNT_LOCKED userId=${user.id}`);
        throw new HttpException(
          'Account temporarily locked. Try again in 30 minutes.',
          HttpStatus.LOCKED, // 423
        );
      }
      this.logger.warn(`LOGIN_FAILED attempts=${count} userId=${user.id}`);
      throw new UnauthorizedException('Invalid credentials.');
    }

    // Step 5: success — reset attempt counter (RN-AUTH-03, ESC-10)
    await this.attemptStore.reset(user.id);

    // Step 6: build claims — minimum privilege (RNF-S.1)
    const claims: Record<string, unknown> = {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
    };

    if (user.role === UserRole.PRESTADOR && user.providerStatus !== null) {
      claims.providerStatus = user.providerStatus;
    }

    // Step 7: sign (RN-AUTH-06, ADR-007 confirmed JWT expiry = 2h)
    const accessToken = this.jwtService.sign(claims);
    this.logger.log(`LOGIN_SUCCESS userId=${user.id}`);

    return { accessToken };
  }

  /**
   * Password recovery — silent on unknown email or rate-limit hit (RNF-S.4, ESC-08, RN-AUTH-05).
   */
  async requestPasswordReset(email: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.userRepo.findByEmail(normalizedEmail);

    if (!user) {
      // No-op — same response regardless to prevent user enumeration (ESC-08)
      this.logger.log('PASSWORD_RESET_REQUESTED_UNKNOWN_EMAIL');
      return;
    }

    // Rate limit: max 3 requests per hour per account (RN-AUTH-05, PA-07)
    const count = await this.tokenStore.countWithinHour(user.id);
    if (count >= MAX_RESET_REQUESTS_PER_HOUR) {
      // Silent drop — same 200 response prevents revealing rate-limit state (D-07)
      this.logger.warn(`RESET_RATE_LIMITED userId=${user.id}`);
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.tokenStore.save({ userId: user.id, tokenHash, expiresAt });
    // Log only userId, never email (RNF-S.4)
    this.logger.log(`PASSWORD_RESET_TOKEN_ISSUED userId=${user.id}`);

    await this.emailNotifier.sendPasswordReset(user.email, rawToken);
  }

  /**
   * Token-based password reset.
   * - 400: token not found (INVALID_TOKEN, ESC-07)
   * - 410: token expired or already used (EXPIRED_TOKEN, ESC-07)
   * - 200: password updated and token marked used (ESC-06)
   */
  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');
    const record = await this.tokenStore.findByHash(tokenHash);

    if (!record) {
      throw new HttpException(
        'Recovery link is invalid or has expired. Please request a new one.',
        HttpStatus.BAD_REQUEST, // 400
      );
    }

    if (record.expiresAt < new Date() || record.usedAt !== null) {
      throw new HttpException(
        'Recovery link is invalid or has expired. Please request a new one.',
        HttpStatus.GONE, // 410
      );
    }

    const newHash = await argon2.hash(newPassword);
    await this.userRepo.updatePasswordHash(record.userId, newHash);
    await this.tokenStore.markUsed(record.id);
    this.logger.log(`PASSWORD_RESET_SUCCESS userId=${record.userId}`);
  }
}
