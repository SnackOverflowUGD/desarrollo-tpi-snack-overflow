import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestador } from '../domain/prestador.entity.js';
import { Servicio } from '../domain/servicio.entity.js';
import { filtrarYPaginarPorCobertura } from '../domain/cobertura-paginacion.util.js';
import {
  IPrestadorRepository,
  BusquedaCriteria,
  PaginatedResult,
} from '../ports/prestador-repository.port.js';
import {
  SERVICIO_REPOSITORY,
  type IServicioRepository,
} from '../ports/servicio-repository.port.js';
import { PrestadorResumen } from '../dto/prestador-resumen.dto.js';
import {
  PrestadorPerfil,
  ServicioDto,
} from '../dto/prestador-perfil.dto.js';

@Injectable()
export class TypeOrmPrestadorRepository implements IPrestadorRepository {
  constructor(
    @InjectRepository(Prestador)
    private readonly repo: Repository<Prestador>,
    @Inject(SERVICIO_REPOSITORY)
    private readonly servicioRepo: IServicioRepository,
  ) {}

  async findByCobertura(
    criteria: BusquedaCriteria,
  ): Promise<PaginatedResult<PrestadorResumen>> {
    const page = criteria.page ?? 1;
    const pageSize = criteria.pageSize ?? 20;

    const query = this.repo
      .createQueryBuilder('p')
      .where('p.cuentaActiva = :activa', { activa: true })
      .andWhere('p.tieneServiciosPublicados = :tieneServicios', {
        tieneServicios: true,
      })
      .andWhere('p.visible = :visible', { visible: true })
      .andWhere('p.categoria = :categoria', { categoria: criteria.oficio });

    if (criteria.calificacionMinima !== undefined) {
      query.andWhere('p.calificacionPromedio >= :calMin', {
        calMin: criteria.calificacionMinima,
      });
    }

    // Fetch the FULL candidate set matching every SQL-able predicate (no
    // skip/take here): the coverage (point-in-polygon) check runs in app code
    // over GeoJSON, so it must be applied to all candidates BEFORE paginating
    // — otherwise `total` is wrong and pages under-fill (RN-CAT-06).
    const candidatos = await query
      .orderBy('p.calificacionPromedio', 'DESC')
      .addOrderBy('p.cantidadResenas', 'DESC')
      .getMany();

    const { data, total } = filtrarYPaginarPorCobertura(
      candidatos,
      (p) => !p.cubreUbicacion || p.cubreUbicacion(criteria.ubicacion),
      page,
      pageSize,
    );

    return {
      data: data.map((p) => this.toResumen(p)),
      total,
      page,
      pageSize,
    };
  }

  async findByIdWithProfile(id: string): Promise<PrestadorPerfil | null> {
    const prestador = await this.repo.findOne({ where: { id } });
    if (!prestador) return null;

    const servicios = await this.servicioRepo.findByPrestadorId(id);
    return this.toPerfil(prestador, servicios);
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
      franjasDisponiblesProximos7Dias:
        p.disponibilidadResumen?.franjasDisponiblesProximos7Dias,
      centroCobertura: p.getCentroCobertura() ?? undefined,
    };
  }

  private toPerfil(p: Prestador, servicios: Servicio[]): PrestadorPerfil {
    return {
      id: p.id,
      nombreCompleto: p.nombreCompleto,
      oficios: p.oficios ?? [],
      calificacionPromedio: Number(p.calificacionPromedio),
      cantidadResenas: p.cantidadResenas,
      zonaCobertura: p.localidad ? [p.localidad] : [],
      servicios: servicios.map((s) => this.toServicioDto(s)),
      // Reviews are UC14 (iteration 3) — no Resena entity exists yet, so this is
      // honestly empty rather than fabricated. The contract already carries it.
      resenas: [],
    };
  }

  private toServicioDto(s: Servicio): ServicioDto {
    const rango = s.getRangoPrecio
      ? s.getRangoPrecio()
      : { min: s.rangoPrecioMin, max: s.rangoPrecioMax };
    return {
      id: s.id,
      categoria: s.categoria,
      descripcion: s.descripcion,
      rangoPrecio: rango,
    };
  }
}
