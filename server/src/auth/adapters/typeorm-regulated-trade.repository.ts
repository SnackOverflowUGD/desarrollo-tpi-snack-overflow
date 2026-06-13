import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegulatedTrade } from '../domain/regulated-trade.entity.js';
import { IRegulatedTradeRepository } from '../ports/regulated-trade.repository.port.js';

@Injectable()
export class TypeOrmRegulatedTradeRepository implements IRegulatedTradeRepository {
  constructor(
    @InjectRepository(RegulatedTrade)
    private readonly repo: Repository<RegulatedTrade>,
  ) {}

  async findByTradeName(tradeName: string): Promise<RegulatedTrade | null> {
    return this.repo.findOne({ where: { tradeName } });
  }
}
