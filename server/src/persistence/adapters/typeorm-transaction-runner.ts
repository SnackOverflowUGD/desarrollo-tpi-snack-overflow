import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  type ITransactionRunner,
  type TxContext,
} from '../ports/transaction-runner.port.js';

/**
 * TypeORM-backed Unit-of-Work. This is the ONLY place in the codebase allowed
 * to touch `DataSource` / `QueryRunner` / `EntityManager`: it opens a
 * transaction, runs the caller's `work` with the transactional `EntityManager`
 * wrapped as the opaque `TxContext`, and commits on success / rolls back on
 * throw. The `EntityManager as unknown as TxContext` cast is confined here
 * (ADR-007).
 */
@Injectable()
export class TypeOrmTransactionRunner implements ITransactionRunner {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async runInTransaction<T>(work: (tx: TxContext) => Promise<T>): Promise<T> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      // qr.manager (EntityManager) is wrapped as the opaque TxContext
      const result = await work(qr.manager as unknown as TxContext);
      await qr.commitTransaction();
      return result;
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }
}
