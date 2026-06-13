import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller.js';
import { AuthService } from './application/auth.service.js';
import { NodemailerEmailNotifier } from './adapters/nodemailer-email-notifier.js';
import {
  REDIS_CLIENT,
  RedisAttemptStore,
  redisClientFactory,
} from './adapters/redis-attempt-store.js';
import { TypeOrmTokenStore } from './adapters/typeorm-token-store.js';
import { TypeOrmUserRepository } from './adapters/typeorm-user.repository.js';
import { PasswordResetToken } from './domain/password-reset-token.entity.js';
import { User } from './domain/user.entity.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { ATTEMPT_STORE } from './ports/attempt-store.port.js';
import { EMAIL_NOTIFIER } from './ports/email-notifier.port.js';
import { TOKEN_STORE } from './ports/token-store.port.js';
import { USER_REPOSITORY } from './ports/user.repository.port.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'changeme',
      signOptions: { expiresIn: '2h' },
    }),
    TypeOrmModule.forFeature([User, PasswordResetToken]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,

    // Redis client factory — injected by token to keep it testable
    {
      provide: REDIS_CLIENT,
      useFactory: redisClientFactory,
    },

    // Port → adapter bindings (ADR-002)
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: ATTEMPT_STORE,
      useClass: RedisAttemptStore,
    },
    {
      provide: TOKEN_STORE,
      useClass: TypeOrmTokenStore,
    },
    {
      provide: EMAIL_NOTIFIER,
      useClass: NodemailerEmailNotifier,
    },
  ],
  exports: [JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
