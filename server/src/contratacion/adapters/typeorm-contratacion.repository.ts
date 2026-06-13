import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contratacion } from '../domain/contratacion.entity.js';
import { IContratacionRepository } from '../ports/contratacion-repository.port.js';

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
}
