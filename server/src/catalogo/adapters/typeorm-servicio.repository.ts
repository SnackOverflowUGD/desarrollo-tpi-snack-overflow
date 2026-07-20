import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { Repository, QueryRunner } from 'typeorm';
import { Servicio } from '../domain/servicio.entity.js';
import {
  IServicioRepository,
  CreateServicioData,
  UpdateServicioData,
} from '../ports/servicio-repository.port.js';

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

  async findByPrestadorIdIncludingHidden(
    prestadorId: string,
  ): Promise<Servicio[]> {
    return this.repo.find({
      where: { prestadorId },
      order: { categoria: 'ASC' },
    });
  }

  async findById(id: string): Promise<Servicio | null> {
    return this.repo.findOne({ where: { id } });
  }

  async countVisibleByPrestadorId(
    prestadorId: string,
    qr?: QueryRunner,
  ): Promise<number> {
    const manager = qr?.manager ?? this.repo.manager;
    return manager.count(Servicio, {
      where: { prestadorId, visible: true },
    });
  }

  async create(data: CreateServicioData, qr?: QueryRunner): Promise<Servicio> {
    const manager = qr?.manager ?? this.repo.manager;
    // Servicio.id is a plain uuid PrimaryColumn (not DB-generated), so the
    // adapter owns id assignment — same ownership boundary as persistence.
    const servicio = this.repo.create({
      id: randomUUID(),
      prestadorId: data.prestadorId,
      categoria: data.categoria,
      descripcion: data.descripcion,
      rangoPrecioMin: data.rangoPrecioMin,
      rangoPrecioMax: data.rangoPrecioMax,
      visible: data.visible,
    });
    return manager.save(Servicio, servicio);
  }

  async update(
    id: string,
    patch: UpdateServicioData,
    qr?: QueryRunner,
  ): Promise<Servicio> {
    const manager = qr?.manager ?? this.repo.manager;
    const existing = await manager.findOne(Servicio, { where: { id } });
    if (!existing) {
      throw new Error(`Servicio not found: ${id}`);
    }
    manager.merge(Servicio, existing, patch);
    return manager.save(Servicio, existing);
  }

  async softDelete(id: string, qr?: QueryRunner): Promise<void> {
    // Soft delete = preserve the row, flip visibility off (reversible).
    const manager = qr?.manager ?? this.repo.manager;
    await manager.update(Servicio, { id }, { visible: false });
  }
}
