import { PasswordResetToken } from '../domain/password-reset-token.entity.js';

export const TOKEN_STORE = 'TOKEN_STORE';

export interface ITokenStore {
  save(record: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findByHash(tokenHash: string): Promise<PasswordResetToken | null>;
  markUsed(tokenId: string): Promise<void>;
  countWithinHour(userId: string): Promise<number>;
}
