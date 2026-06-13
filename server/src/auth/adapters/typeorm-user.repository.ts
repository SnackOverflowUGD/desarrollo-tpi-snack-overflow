import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity.js';
import { CreateUserData, IUserRepository } from '../ports/user.repository.port.js';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email: email.toLowerCase() } });
  }

  findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async updatePasswordHash(userId: string, newHash: string): Promise<void> {
    await this.repo.update({ id: userId }, { passwordHash: newHash });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.repo.save(data);
  }
}
