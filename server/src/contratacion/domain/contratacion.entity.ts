import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ContratacionEstado } from './contratacion-estado.enum.js';

@Entity('contrataciones')
export class Contratacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500 })
  ubicacion: string;

  @Column({ name: 'prestador_id' })
  prestadorId: string;

  @Column({ name: 'cliente_id' })
  clienteId: string;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'varchar', length: 50 })
  franja: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'date', name: 'fecha_propuesta', nullable: true })
  fechaPropuesta: string | null;

  @Column({ type: 'varchar', length: 50, name: 'franja_propuesta', nullable: true })
  franjaPropuesta: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'precio_estimado', nullable: true })
  precioEstimado: number | null;

  @Column({
    type: 'enum',
    enum: ContratacionEstado,
    default: ContratacionEstado.SOLICITADA,
  })
  estado: ContratacionEstado;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
