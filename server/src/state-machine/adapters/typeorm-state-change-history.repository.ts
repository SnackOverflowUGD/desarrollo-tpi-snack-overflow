import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ContratacionEstado } from '../../contratacion/domain/contratacion-estado.enum.js';
import { type TxContext } from '../../persistence/ports/transaction-runner.port.js';
import { StateChangeHistory } from '../domain/state-change-history.entity.js';
import { type IStateChangeHistoryRepository } from '../ports/state-change-history-repository.port.js';

/**
 * TypeORM adapter for `state_change_history`. Unwraps the opaque `TxContext`
 * into the transactional `EntityManager` when present; otherwise uses the
 * default injected `Repository` (auto-commit). This is the only state-machine
 * file that imports TypeORM types.
 */
@Injectable()
export class TypeOrmStateChangeHistoryRepository implements IStateChangeHistoryRepository {
  constructor(
    @InjectRepository(StateChangeHistory)
    private readonly repo: Repository<StateChangeHistory>,
  ) {}

  async findLast(
    contratacionId: string,
    tx?: TxContext,
  ): Promise<StateChangeHistory | null> {
    const manager = this.managerFor(tx);
    return manager.findOne(StateChangeHistory, {
      where: { contratacionId },
      order: { timestamp: 'DESC' },
    });
  }

  async findAll(contratacionId: string): Promise<StateChangeHistory[]> {
    return this.repo.find({
      where: { contratacionId },
      order: { timestamp: 'ASC' },
    });
  }

  async save(
    record: {
      contratacionId: string;
      estadoAnterior: ContratacionEstado | null;
      estadoNuevo: ContratacionEstado;
    },
    tx?: TxContext,
  ): Promise<void> {
    const manager = this.managerFor(tx);
    const entity = manager.create(StateChangeHistory, record);
    await manager.save(StateChangeHistory, entity);
  }

  private managerFor(tx?: TxContext): EntityManager {
    return (tx as unknown as EntityManager) ?? this.repo.manager;
  }
}
