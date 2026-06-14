import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contratacion } from '../domain/contratacion.entity.js';
import type {
  ContratacionFiltro,
  IContratacionRepository,
} from '../ports/contratacion-repository.port.js';

@Injectable()
export class TypeOrmContratacionRepository implements IContratacionRepository {
  constructor(
    @InjectRepository(Contratacion)
    private readonly repo: Repository<Contratacion>,
  ) {}

  async save(contratacion: Contratacion): Promise<Contratacion> {
    return this.repo.save(contratacion);
  }

  async findById(id: string): Promise<Contratacion | null> {
    return this.repo.findOne({ where: { id } });
  }

  /**
   * UC08 (ADR-08-01, REQ-01): query contrataciones by participant dimension.
   *
   * Builds the `where` from only the set keys of the filter (the service sets
   * exactly one of prestadorId/clienteId, plus an optional estado). Ordered by
   * createdAt DESC (most recent first). No pagination — the prestador's pending
   * inbox is naturally bounded for the TPI (documented limit, ADR-08-02).
   */
  async findByParticipante(f: ContratacionFiltro): Promise<Contratacion[]> {
    const where: Record<string, unknown> = {};
    if (f.prestadorId) where.prestadorId = f.prestadorId;
    if (f.clienteId) where.clienteId = f.clienteId;
    if (f.estado) where.estado = f.estado;
    return this.repo.find({ where, order: { createdAt: 'DESC' } });
  }
}
