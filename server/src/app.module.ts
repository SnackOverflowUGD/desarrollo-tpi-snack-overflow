import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PasswordResetToken } from './auth/domain/password-reset-token.entity.js';
import { RegulatedTrade } from './auth/domain/regulated-trade.entity.js';
import { User } from './auth/domain/user.entity.js';
import { Contratacion } from './contratacion/domain/contratacion.entity.js';
import { ContratacionModule } from './contratacion/contratacion.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'snack_user',
      password: process.env.DB_PASSWORD ?? 'snack_password',
      database: process.env.DB_NAME ?? 'snack_overflow',
      entities: [User, PasswordResetToken, RegulatedTrade, Contratacion],
      // synchronize only for development — disable in production
      synchronize: process.env.NODE_ENV !== 'production',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    ContratacionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
