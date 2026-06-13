/**
 * Servicio Entity
 * Published service offered by a prestador.
 */

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Prestador } from './prestador.entity.js';

@Entity('servicios')
@Index(['prestadorId'])
@Index(['categoria', 'visible'])
export class Servicio {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('uuid', { name: 'prestador_id' })
  prestadorId!: string;

  @ManyToOne(() => Prestador)
  @JoinColumn({ name: 'prestador_id' })
  prestador!: Prestador;

  @Column('varchar', { length: 100, name: 'categoria' })
  categoria!: string;

  @Column('text', { name: 'descripcion' })
  descripcion!: string;

  @Column('decimal', { precision: 10, scale: 2, name: 'rango_precio_min', nullable: true })
  rangoPrecioMin!: number | null;

  @Column('decimal', { precision: 10, scale: 2, name: 'rango_precio_max', nullable: true })
  rangoPrecioMax!: number | null;

  @Column('boolean', { name: 'visible', default: true })
  visible!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  /**
   * Gets the price range as a formatted object.
   */
  getRangoPrecio(): { min: number | null; max: number | null } {
    return {
      min: this.rangoPrecioMin,
      max: this.rangoPrecioMax,
    };
  }
}