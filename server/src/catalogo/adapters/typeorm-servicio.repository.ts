import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from '../domain/servicio.entity.js';
import { IServicioRepository } from '../ports/servicio-repository.port.js';

@Injectable()
export class TypeOrmServicioRepository implements IServicioRepository {
  constructor(
    @InjectRepository(Servicio)
    private readonly repo: Repository<Servicio>,
  ) {}

  async findByPrestadorId(prestadorId: string): Promise<Servicio[]> {
    return this.repo.find({
      where: { prestadorId, visible: true },
      order: { categoria: 'ASC' },
    });
  }
}
