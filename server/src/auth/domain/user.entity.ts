import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProviderStatus } from './provider-status.enum.js';
import { UserRole } from './user-role.enum.js';
import { UserStatus } from './user-status.enum.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, name: 'password_hash' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVO })
  status: UserStatus;

  // NULL for non-prestador roles (RNF-S.1)
  @Column({
    type: 'enum',
    enum: ProviderStatus,
    nullable: true,
    name: 'provider_status',
    default: null,
  })
  providerStatus: ProviderStatus | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
