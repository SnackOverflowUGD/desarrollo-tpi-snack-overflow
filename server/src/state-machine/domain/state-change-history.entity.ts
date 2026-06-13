import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContratacionEstado } from '../../contratacion/domain/contratacion-estado.enum.js';

@Entity('state_change_history')
export class StateChangeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'contratacion_id' })
  contratacionId: string;

  @Column({
    type: 'enum',
    enum: ContratacionEstado,
    name: 'estado_anterior',
    nullable: true,
  })
  estadoAnterior: ContratacionEstado | null;

  @Column({
    type: 'enum',
    enum: ContratacionEstado,
    name: 'estado_nuevo',
  })
  estadoNuevo: ContratacionEstado;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;
}
