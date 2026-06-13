/**
 * Prestador Entity (Read Model / Search Projection)
 * TypeORM entity for the prestadores search view.
 * Maps to a database view or joined query over users + servicios + cobertura_zonas.
 */

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { CoberturaZona } from './cobertura-zona.value.js';

@Entity('prestadores')
@Index(['categoria', 'visible'])
@Index(['calificacionPromedio'])
export class Prestador {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar', { length: 255, name: 'nombre_completo' })
  nombreCompleto!: string;

  @Column('simple-array', { name: 'oficios', nullable: true })
  oficios!: string[];

  @Column('varchar', { length: 100, name: 'categoria' })
  categoria!: string;

  @Column('decimal', { precision: 3, scale: 1, name: 'calificacion_promedio', default: 0 })
  calificacionPromedio!: number;

  @Column('int', { name: 'cantidad_resenas', default: 0 })
  cantidadResenas!: number;

  @Column('jsonb', { name: 'zona_cobertura', nullable: true })
  zonaCobertura!: CoberturaZona | null;

  @Column('varchar', { length: 255, name: 'localidad', nullable: true })
  localidad!: string | null;

  @Column('boolean', { name: 'cuenta_activa', default: true })
  cuentaActiva!: boolean;

  @Column('boolean', { name: 'tiene_servicios_publicados', default: false })
  tieneServiciosPublicados!: boolean;

  @Column('boolean', { name: 'visible', default: true })
  visible!: boolean;

  @Column('jsonb', { name: 'disponibilidad_resumen', nullable: true })
  disponibilidadResumen!: {
    estado: 'disponible_esta_semana' | 'proxima_disponible' | 'sin_disponibilidad';
    proximaFecha?: string;
    franjasDisponiblesProximos7Dias?: number;
  } | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  /**
   * Gets the coverage zone as a CoberturaZona value object.
   */
  getCoberturaZona(): CoberturaZona | null {
    if (!this.zonaCobertura) return null;
    // If stored as plain object, reconstruct
    if (this.zonaCobertura instanceof CoberturaZona) {
      return this.zonaCobertura;
    }
    // Reconstruct from plain object
    return new CoberturaZona(
      this.zonaCobertura.geometry,
      this.zonaCobertura.localidad,
    );
  }

  /**
   * Gets the center of the coverage zone for distance calculations.
   */
  getCentroCobertura(): { lat: number; lng: number } | null {
    const zona = this.getCoberturaZona();
    if (!zona) return null;
    const center = zona.getCenter();
    return { lat: center.lat, lng: center.lng };
  }

  /**
   * Checks if this provider covers a given location.
   */
  cubreUbicacion(coordenadas: { lat: number; lng: number }): boolean {
    const zona = this.getCoberturaZona();
    if (!zona) {
      // Fallback: if no explicit zone, check localidad match (handled at query level)
      return false;
    }
    return zona.containsPoint(coordenadas);
  }
}