import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ProviderStatus } from '../domain/provider-status.enum.js';
import { UserRole } from '../domain/user-role.enum.js';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  email: string;
  name: string;
  lastName: string;
  providerStatus?: ProviderStatus;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'changeme',
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    // Returns the payload as-is; it is attached to request.user by Passport
    return payload;
  }
}
