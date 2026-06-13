import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Attach this guard to any endpoint that requires a valid JWT Bearer token.
 * It delegates to JwtStrategy for token extraction and validation.
 * Downstream feature modules import JwtAuthGuard from AuthModule exports.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
