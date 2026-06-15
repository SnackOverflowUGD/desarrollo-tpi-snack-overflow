import { Module } from '@nestjs/common';
import { TypeOrmTransactionRunner } from './adapters/typeorm-transaction-runner.js';
import { TRANSACTION_RUNNER } from './ports/transaction-runner.port.js';

/**
 * Neutral shared infrastructure module (ADR-001): provides the
 * `ITransactionRunner` Unit-of-Work behind the `TRANSACTION_RUNNER` token so
 * feature modules can run atomic operations without depending on each other or
 * on TypeORM types. The single TypeORM adapter is the only place that knows a
 * `TxContext` wraps an `EntityManager`.
 */
@Module({
  providers: [
    { provide: TRANSACTION_RUNNER, useClass: TypeOrmTransactionRunner },
  ],
  exports: [TRANSACTION_RUNNER],
})
export class PersistenceModule {}
