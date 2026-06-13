import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserRole } from '../../auth/domain/user-role.enum.js';
import { UserStatus } from '../../auth/domain/user-status.enum.js';
import { USER_REPOSITORY, type IUserRepository } from '../../auth/ports/user.repository.port.js';
import { Contratacion } from '../domain/contratacion.entity.js';
import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';
import { CreateContratacionDto } from '../dto/create-contratacion.dto.js';
import { ContratacionResponseDto } from '../dto/contratacion-response.dto.js';
import {
  AVAILABILITY_SERVICE,
  type IAvailabilityService,
} from '../ports/availability-service.port.js';
import {
  CONTRATACION_REPOSITORY,
  type IContratacionRepository,
} from '../ports/contratacion-repository.port.js';
import { STATE_MACHINE, type IContratacionStateMachine } from '../ports/state-machine.port.js';

@Injectable()
export class ContratacionService {
  private readonly logger = new Logger(ContratacionService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(CONTRATACION_REPOSITORY)
    private readonly contratacionRepo: IContratacionRepository,
    @Inject(AVAILABILITY_SERVICE)
    private readonly availabilityService: IAvailabilityService,
    @Inject(STATE_MACHINE) private readonly stateMachine: IContratacionStateMachine,
  ) {}

  /**
   * Create a new contratación with atomicity guarantees.
   *
   * The entire operation is wrapped in a TypeORM QueryRunner transaction:
   * if any step fails, the DB transaction is rolled back AND the reserved
   * slot is released (compensating action) — ensuring no inconsistent state.
   *
   * Flow (mapped from design.md §Data Flow):
   *   1. Validate prestador exists + is active (RN-CON-05)
   *   2. Validate fecha ≥ today (RN-CON-06)
   *   3. Verify franja availability
   *   4. Reserve franja
   *   5. Create Contratacion with estado SOLICITADA (RN-CON-03)
   *   6. Invoke UC09 state machine transition → SOLICITADA
   *   7. Commit transaction → 201
   *
   * On any failure: rollback + release slot → 409 / 422 / 404 / 500
   */
  async create(
    dto: CreateContratacionDto,
    clienteId: string,
    clienteRole: string,
  ): Promise<ContratacionResponseDto> {
    // ── Authorization gate (RNF-S.1 / RN-CON-01) ──
    if (clienteRole !== UserRole.CLIENTE) {
      throw new ForbiddenException('Only authenticated clients can create contrataciones.');
    }

    // ── Step 1: Validate prestador exists and is active (RN-CON-05) ──
    const prestador = await this.userRepo.findById(dto.prestadorId);
    if (
      !prestador ||
      prestador.role !== UserRole.PRESTADOR ||
      prestador.status !== UserStatus.ACTIVO
    ) {
      throw new NotFoundException('Prestador not found or not available.');
    }

    // ── Step 2: Validate fecha is today or future (RN-CON-06) ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fechaDate = new Date(dto.fecha);
    if (fechaDate < today) {
      throw new UnprocessableEntityException(
        'The date must be today or a future date.',
      );
    }

    // ── Begin atomic transaction ──
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let slotReserved = false;

    try {
      // ── Step 3: Verify franja availability ──
      const available = await this.availabilityService.isAvailable(
        dto.prestadorId,
        dto.fecha,
        dto.franja,
      );
      if (!available) {
        throw new ConflictException(
          'The selected time slot is no longer available. Please choose another.',
        );
      }

      // ── Step 4: Build entity ──
      const contratacion = new Contratacion();
      contratacion.ubicacion = dto.ubicacion;
      contratacion.prestadorId = dto.prestadorId;
      contratacion.clienteId = clienteId;
      contratacion.fecha = dto.fecha;
      contratacion.franja = dto.franja;
      contratacion.descripcion = dto.descripcion;
      contratacion.estado = ContratacionEstado.SOLICITADA;

      // ── Step 5: Persist within transaction ──
      const saved = await queryRunner.manager.save(contratacion);

      // ── Step 6: Reserve franja ──
      await this.availabilityService.reserve(
        dto.prestadorId,
        dto.fecha,
        dto.franja,
        saved.id,
      );
      slotReserved = true;

      // ── Step 7: Invoke UC09 state machine → estado solicitada (RN-CON-03) ──
      await this.stateMachine.transitionTo(saved.id, ContratacionEstado.SOLICITADA);

      // ── Commit ──
      await queryRunner.commitTransaction();
      this.logger.log(`CONTRATACION_CREATED id=${saved.id}`);

      return new ContratacionResponseDto({
        id: saved.id,
        ubicacion: saved.ubicacion,
        prestadorId: saved.prestadorId,
        clienteId: saved.clienteId,
        fecha: saved.fecha,
        franja: saved.franja,
        descripcion: saved.descripcion,
        estado: saved.estado,
        createdAt: saved.createdAt,
      });
    } catch (error) {
      // ── Rollback DB transaction ──
      try {
        await queryRunner.rollbackTransaction();
      } catch {
        // Best-effort: if rollback fails, the connection might be broken
        this.logger.error('ROLLBACK_FAILED during contratacion creation');
      }

      // ── Compensating action: release slot if it was reserved ──
      if (slotReserved) {
        try {
          await this.availabilityService.release(dto.prestadorId, dto.fecha, dto.franja);
          this.logger.warn(`SLOT_RELEASED prestadorId=${dto.prestadorId} fecha=${dto.fecha} franja=${dto.franja}`);
        } catch {
          this.logger.error('SLOT_RELEASE_FAILED after rollback');
        }
      }

      // Re-throw known NestJS HTTP exceptions as-is
      if (
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof UnprocessableEntityException
      ) {
        throw error;
      }

      // Unknown errors → 500 (ESC-07)
      this.logger.error(
        `CONTRATACION_CREATION_FAILED prestadorId=${dto.prestadorId} error=${(error as Error).message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
