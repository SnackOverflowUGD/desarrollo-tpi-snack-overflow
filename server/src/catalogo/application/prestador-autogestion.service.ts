import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import {
  PRESTADOR_REPOSITORY,
  type IPrestadorRepository,
  type UpdatePrestadorData,
} from '../ports/prestador-repository.port.js';
import {
  SERVICIO_REPOSITORY,
  type IServicioRepository,
  type UpdateServicioData,
} from '../ports/servicio-repository.port.js';
import { Prestador } from '../domain/prestador.entity.js';
import { Servicio } from '../domain/servicio.entity.js';
import { CoberturaZona } from '../domain/cobertura-zona.value.js';
import { getCoordsForLocalidad } from '../domain/cobertura-util.js';
import { ActualizarPerfilDto } from '../dto/actualizar-perfil.dto.js';
import { CrearServicioDto } from '../dto/crear-servicio.dto.js';
import { ActualizarServicioDto } from '../dto/actualizar-servicio.dto.js';
import {
  MiPerfilDto,
  MiPerfilServicioDto,
} from '../dto/mi-perfil.dto.js';

/**
 * Prestador self-management application service.
 *
 * Owns the publishing business rule: `tieneServiciosPublicados` is recomputed
 * (= at least one visible servicio) inside the SAME transaction as every
 * servicio mutation, so search visibility can never drift from reality
 * (PSM-REQ-06). A localidad change regenerates `zonaCobertura` via the shared
 * `getCoordsForLocalidad` + `CoberturaZona.fromCircle(coords, 16.5, localidad)`
 * — identical to registration (PSM-REQ-03).
 *
 * All operations are addressed by the JWT `sub`; servicio subresources add an
 * explicit ownership guard that returns 404 (existence-hiding).
 */
@Injectable()
export class PrestadorAutogestionService {
  /** Coverage radius (km) — must match registration's zona generation. */
  private static readonly COBERTURA_RADIO_KM = 16.5;

  constructor(
    @Inject(PRESTADOR_REPOSITORY)
    private readonly prestadorRepo: IPrestadorRepository,
    @Inject(SERVICIO_REPOSITORY)
    private readonly servicioRepo: IServicioRepository,
    private readonly dataSource: DataSource,
  ) {}

  // -------------------------------------------------------------------------
  // Profile
  // -------------------------------------------------------------------------

  async getMiPerfil(sub: string): Promise<MiPerfilDto> {
    const prestador = await this.prestadorRepo.findById(sub);
    if (!prestador) {
      throw new NotFoundException('Prestador profile not found.');
    }
    const servicios =
      await this.servicioRepo.findByPrestadorIdIncludingHidden(sub);
    return this.toMiPerfil(prestador, servicios);
  }

  async actualizarPerfil(
    sub: string,
    dto: ActualizarPerfilDto,
  ): Promise<MiPerfilDto> {
    const prestador = await this.prestadorRepo.findById(sub);
    if (!prestador) {
      throw new NotFoundException('Prestador profile not found.');
    }

    const patch: UpdatePrestadorData = {};
    if (dto.oficios !== undefined) patch.oficios = dto.oficios;
    if (dto.categoria !== undefined) patch.categoria = dto.categoria;
    if (dto.visible !== undefined) patch.visible = dto.visible;
    if (dto.disponibilidadResumen !== undefined) {
      patch.disponibilidadResumen = dto.disponibilidadResumen;
    }

    // localidad change → regenerate zona atomically with the localidad write
    // (single repo.update = one save). Unknown localidad is rejected (400).
    if (dto.localidad !== undefined && dto.localidad !== prestador.localidad) {
      const coords = this.resolveCoords(dto.localidad);
      patch.localidad = dto.localidad;
      patch.zonaCobertura = CoberturaZona.fromCircle(
        { lat: coords.lat, lng: coords.lng },
        PrestadorAutogestionService.COBERTURA_RADIO_KM,
        dto.localidad,
      ).toJSON();
    }

    const updated = await this.prestadorRepo.update(sub, patch);
    const servicios =
      await this.servicioRepo.findByPrestadorIdIncludingHidden(sub);
    return this.toMiPerfil(updated, servicios);
  }

  // -------------------------------------------------------------------------
  // Servicios (each mutation is transactional with the publish-flag recompute)
  // -------------------------------------------------------------------------

  async crearServicio(
    sub: string,
    dto: CrearServicioDto,
  ): Promise<MiPerfilServicioDto> {
    this.assertPriceRange(dto.rangoPrecioMin, dto.rangoPrecioMax);
    return this.withTransaction(async (qr) => {
      const servicio = await this.servicioRepo.create(
        {
          prestadorId: sub,
          categoria: dto.categoria,
          descripcion: dto.descripcion,
          rangoPrecioMin: dto.rangoPrecioMin ?? null,
          rangoPrecioMax: dto.rangoPrecioMax ?? null,
          visible: dto.visible ?? true,
        },
        qr,
      );
      await this.recomputePublishFlag(sub, qr);
      return this.toServicioDto(servicio);
    });
  }

  async actualizarServicio(
    sub: string,
    servicioId: string,
    dto: ActualizarServicioDto,
  ): Promise<MiPerfilServicioDto> {
    this.assertPriceRange(dto.rangoPrecioMin, dto.rangoPrecioMax);
    await this.assertOwnership(sub, servicioId);
    return this.withTransaction(async (qr) => {
      const patch: UpdateServicioData = {};
      if (dto.categoria !== undefined) patch.categoria = dto.categoria;
      if (dto.descripcion !== undefined) patch.descripcion = dto.descripcion;
      if (dto.rangoPrecioMin !== undefined) {
        patch.rangoPrecioMin = dto.rangoPrecioMin;
      }
      if (dto.rangoPrecioMax !== undefined) {
        patch.rangoPrecioMax = dto.rangoPrecioMax;
      }
      if (dto.visible !== undefined) patch.visible = dto.visible;

      const servicio = await this.servicioRepo.update(servicioId, patch, qr);
      await this.recomputePublishFlag(sub, qr);
      return this.toServicioDto(servicio);
    });
  }

  async eliminarServicio(sub: string, servicioId: string): Promise<void> {
    await this.assertOwnership(sub, servicioId);
    await this.withTransaction(async (qr) => {
      await this.servicioRepo.softDelete(servicioId, qr);
      await this.recomputePublishFlag(sub, qr);
    });
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  /**
   * Ownership guard for servicio subresources: returns 404 (not 403) so the
   * existence of another prestador's servicio is never disclosed. Mirrors the
   * ContratacionController participant guard.
   */
  private async assertOwnership(
    sub: string,
    servicioId: string,
  ): Promise<void> {
    const servicio = await this.servicioRepo.findById(servicioId);
    if (!servicio || servicio.prestadorId !== sub) {
      throw new NotFoundException('Servicio not found.');
    }
  }

  private assertPriceRange(
    min: number | null | undefined,
    max: number | null | undefined,
  ): void {
    if (min != null && max != null && min > max) {
      throw new BadRequestException(
        'rangoPrecioMin must be less than or equal to rangoPrecioMax.',
      );
    }
  }

  private resolveCoords(localidad: string): { lat: number; lng: number } {
    try {
      return getCoordsForLocalidad(localidad);
    } catch {
      throw new BadRequestException(`Unknown localidad: "${localidad}".`);
    }
  }

  /**
   * Recomputes and persists `tieneServiciosPublicados` (= at least one visible
   * servicio) inside the caller's transaction — never outside it (PSM-REQ-06).
   */
  private async recomputePublishFlag(
    sub: string,
    qr: QueryRunner,
  ): Promise<void> {
    const visibles = await this.servicioRepo.countVisibleByPrestadorId(sub, qr);
    await this.prestadorRepo.update(
      sub,
      { tieneServiciosPublicados: visibles > 0 },
      qr,
    );
  }

  /**
   * QueryRunner transaction boundary — same lifecycle as
   * `RegistrationService` (connect → begin → commit / rollback → release).
   */
  private async withTransaction<T>(
    work: (qr: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const result = await work(qr);
      await qr.commitTransaction();
      return result;
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }

  private toMiPerfil(prestador: Prestador, servicios: Servicio[]): MiPerfilDto {
    return {
      id: prestador.id,
      nombreCompleto: prestador.nombreCompleto,
      categoria: prestador.categoria,
      oficios: prestador.oficios ?? [],
      localidad: prestador.localidad,
      zonaCobertura: prestador.zonaCobertura,
      disponibilidadResumen: prestador.disponibilidadResumen,
      visible: prestador.visible,
      tieneServiciosPublicados: prestador.tieneServiciosPublicados,
      servicios: servicios.map((s) => this.toServicioDto(s)),
    };
  }

  private toServicioDto(servicio: Servicio): MiPerfilServicioDto {
    return {
      id: servicio.id,
      categoria: servicio.categoria,
      descripcion: servicio.descripcion,
      rangoPrecioMin: servicio.rangoPrecioMin,
      rangoPrecioMax: servicio.rangoPrecioMax,
      visible: servicio.visible,
    };
  }
}
