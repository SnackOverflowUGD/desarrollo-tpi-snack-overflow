import { RegulatedTrade } from '../domain/regulated-trade.entity.js';

export const REGULATED_TRADE_REPOSITORY = 'REGULATED_TRADE_REPOSITORY';

export interface IRegulatedTradeRepository {
  findByTradeName(tradeName: string): Promise<RegulatedTrade | null>;
}
