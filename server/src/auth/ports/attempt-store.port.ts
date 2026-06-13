export const ATTEMPT_STORE = 'ATTEMPT_STORE';

export interface IAttemptStore {
  increment(userId: string): Promise<number>;
  isLocked(userId: string): Promise<boolean>;
  lock(userId: string, ttlSeconds: number): Promise<void>;
  reset(userId: string): Promise<void>;
}
