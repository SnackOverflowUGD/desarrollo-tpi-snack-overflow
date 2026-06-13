import Redis from 'ioredis';
import {
  RedisAttemptStore,
  redisClientFactory,
} from '../src/auth/adapters/redis-attempt-store.js';

/**
 * Integration test for RedisAttemptStore against a REAL Redis instance.
 *
 * Runs under `npm run test:e2e` (CI provides a redis:7 service container;
 * locally: `docker compose up -d`). This is the home for ESC-09 — the lockout
 * must auto-expire once its TTL elapses — which cannot be exercised by the
 * in-memory unit fakes, hence the matching `it.skip` in auth.controller.spec.ts.
 */
describe('RedisAttemptStore (integration, real Redis)', () => {
  let redis: Redis;
  let store: RedisAttemptStore;

  // Unique per-run key namespace so parallel/repeated runs never collide.
  const userId = `test-user-${process.pid}`;

  beforeAll(async () => {
    redis = redisClientFactory();
    await redis.connect(); // lazyConnect: true → open explicitly
    store = new RedisAttemptStore(redis);
  });

  afterEach(async () => {
    await store.reset(userId);
  });

  afterAll(async () => {
    await redis.quit();
  });

  it('increment returns a monotonically increasing counter', async () => {
    expect(await store.increment(userId)).toBe(1);
    expect(await store.increment(userId)).toBe(2);
    expect(await store.increment(userId)).toBe(3);
  });

  it('lock makes isLocked true while the key lives', async () => {
    expect(await store.isLocked(userId)).toBe(false);
    await store.lock(userId, 60);
    expect(await store.isLocked(userId)).toBe(true);
  });

  it('reset clears both attempts and lock keys', async () => {
    await store.increment(userId);
    await store.lock(userId, 60);
    await store.reset(userId);
    expect(await store.isLocked(userId)).toBe(false);
    expect(await store.increment(userId)).toBe(1); // counter restarted from 0
  });

  // ESC-09 / RN-AUTH-04: after the lockout TTL elapses, the account unlocks
  // automatically. Uses a 1s TTL instead of the real 30min to keep the test fast.
  it('ESC-09: lock auto-expires once its TTL elapses', async () => {
    await store.lock(userId, 1); // 1 second
    expect(await store.isLocked(userId)).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 1300));

    expect(await store.isLocked(userId)).toBe(false);
  }, 10_000);
});
