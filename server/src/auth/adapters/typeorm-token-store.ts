import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { PasswordResetToken } from '../domain/password-reset-token.entity.js';
import { ITokenStore } from '../ports/token-store.port.js';

@Injectable()
export class TypeOrmTokenStore implements ITokenStore {
  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly repo: Repository<PasswordResetToken>,
  ) {}

  async save(record: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    const token = this.repo.create({
      userId: record.userId,
      tokenHash: record.tokenHash,
      expiresAt: record.expiresAt,
      usedAt: null,
    });
    await this.repo.save(token);
  }

  findByHash(tokenHash: string): Promise<PasswordResetToken | null> {
    return this.repo.findOne({ where: { tokenHash } });
  }

  async markUsed(tokenId: string): Promise<void> {
    await this.repo.update({ id: tokenId }, { usedAt: new Date() });
  }

  countWithinHour(userId: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.repo.count({
      where: {
        userId,
        createdAt: MoreThan(oneHourAgo),
      },
    });
  }
}
