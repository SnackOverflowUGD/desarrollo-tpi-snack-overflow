import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { IAttemptStore } from '../ports/attempt-store.port.js';

export const REDIS_CLIENT = 'REDIS_CLIENT';

const ATTEMPTS_KEY = (userId: string) => `auth:attempts:${userId}`;
const LOCKED_KEY = (userId: string) => `auth:locked:${userId}`;

const LOCK_TTL_SECONDS = 30 * 60; // 30 minutes per RN-AUTH-04

@Injectable()
export class RedisAttemptStore implements IAttemptStore {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(userId: string): Promise<number> {
    const count = await this.redis.incr(ATTEMPTS_KEY(userId));
    // Keep the attempts key alive so it survives across separate sessions;
    // TTL is not enforced here — the lockout key (auth:locked) is the authoritative timer.
    return count;
  }

  async isLocked(userId: string): Promise<boolean> {
    const val = await this.redis.get(LOCKED_KEY(userId));
    return val !== null;
  }

  async lock(userId: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(LOCKED_KEY(userId), '1', 'EX', ttlSeconds);
  }

  async reset(userId: string): Promise<void> {
    await this.redis.del(ATTEMPTS_KEY(userId), LOCKED_KEY(userId));
  }
}

export function redisClientFactory(): Redis {
  return new Redis({
    host: process.env.REDIS_HOST ?? 'localhost',
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? undefined,
    lazyConnect: true,
  });
}

export const LOCK_TTL = LOCK_TTL_SECONDS;
