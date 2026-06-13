import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestador } from '../domain/prestador.entity.js';
import { IPrestadorRepository, BusquedaCriteria, PaginatedResult } from '../ports/prestador-repository.port.js';
import { PrestadorResumen } from '../dto/prestador-resumen.dto.js';
import { PrestadorPerfil, ServicioDto, ResenaDto } from '../dto/prestador-perfil.dto.js';

@Injectable()
export class TypeOrmPrestadorRepository implements IPrestadorRepository {
  constructor(
    @InjectRepository(Prestador)
    private readonly repo: Repository<Prestador>,
  ) {}

  async findByCobertura(criteria: BusquedaCriteria): Promise<PaginatedResult<PrestadorResumen>> {
    const page = criteria.page ?? 1;
    const pageSize = criteria.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const query = this.repo
      .createQueryBuilder('p')
      .where('p.cuentaActiva = :activa', { activa: true })
      .andWhere('p.tieneServiciosPublicados = :tieneServicios', { tieneServicios: true })
      .andWhere('p.visible = :visible', { visible: true })
      .andWhere('p.categoria = :categoria', { categoria: criteria.oficio });

    if (criteria.calificacionMinima !== undefined) {
      query.andWhere('p.calificacionPromedio >= :calMin', { calMin: criteria.calificacionMinima });
    }

    const [rows, total] = await Promise.all([
      query
        .skip(skip)
        .take(pageSize)
        .orderBy('p.calificacionPromedio', 'DESC')
        .addOrderBy('p.cantidadResenas', 'DESC')
        .getMany(),
      query.getCount(),
    ]);

    // Filter by coverage zone in application code (GeoJSON, not PostGIS)
    const data = rows
      .filter((p) => !p.cubreUbicacion || p.cubreUbicacion(criteria.ubicacion))
      .map((p) => this.toResumen(p));

    return {
      data,
      total: data.length,
      page,
      pageSize,
    };
  }

  async findByIdWithProfile(id: string): Promise<PrestadorPerfil | null> {
    const prestador = await this.repo.findOne({ where: { id } });
    if (!prestador) return null;

    return this.toPerfil(prestador);
  }

  private toResumen(p: Prestador): PrestadorResumen {
    return {
      id: p.id,
      nombreCompleto: p.nombreCompleto,
      oficios: p.oficios ?? [],
      calificacionPromedio: Number(p.calificacionPromedio),
      cantidadResenas: p.cantidadResenas,
      disponibilidad: p.disponibilidadResumen?.estado ?? null,
      proximaFechaDisponible: p.disponibilidadResumen?.proximaFecha,
      franjasDisponiblesProximos7Dias: p.disponibilidadResumen?.franjasDisponiblesProximos7Dias,
      centroCobertura: p.getCentroCobertura() ?? undefined,
    };
  }

  private toPerfil(p: Prestador): PrestadorPerfil {
    return {
      id: p.id,
      nombreCompleto: p.nombreCompleto,
      oficios: p.oficios ?? [],
      calificacionPromedio: Number(p.calificacionPromedio),
      cantidadResenas: p.cantidadResenas,
      zonaCobertura: p.localidad ? [p.localidad] : [],
      servicios: [],
      resenas: [],
    };
  }
}
