export const TRANSACTION_RUNNER = 'TRANSACTION_RUNNER';

/**
 * Opaque transactional context. Domain/application code NEVER inspects its
 * shape — only adapters unwrap it. The private brand prevents passing a plain
 * object where a real tx is expected.
 */
export interface TxContext {
  readonly __txBrand: unique symbol;
}

export interface ITransactionRunner {
  /**
   * Runs `work` inside a single transaction. Commits if it resolves; rolls
   * back if it throws (the error is re-thrown unchanged). The TxContext passed
   * to `work` MUST be forwarded to every repository/port call that has to
   * enlist in the same atomic unit.
   */
  runInTransaction<T>(work: (tx: TxContext) => Promise<T>): Promise<T>;
}
