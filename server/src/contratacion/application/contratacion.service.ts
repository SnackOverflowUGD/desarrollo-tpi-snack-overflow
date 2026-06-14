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
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../auth/ports/user.repository.port.js';
import { Contratacion } from '../domain/contratacion.entity.js';
import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';
import { CreateContratacionDto } from '../dto/create-contratacion.dto.js';
import { ContratacionResponseDto } from '../dto/contratacion-response.dto.js';
import { ContratacionListItemDto } from '../dto/contratacion-list-item.dto.js';
import { ListContratacionesQueryDto } from '../dto/list-contrataciones-query.dto.js';
import { SendProposalDto } from '../dto/send-proposal.dto.js';
import {
  AVAILABILITY_SERVICE,
  type IAvailabilityService,
} from '../ports/availability-service.port.js';
import {
  CONTRATACION_REPOSITORY,
  type ContratacionFiltro,
  type IContratacionRepository,
} from '../ports/contratacion-repository.port.js';
import {
  STATE_MACHINE,
  type IContratacionStateMachine,
} from '../ports/state-machine.port.js';

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
    @Inject(STATE_MACHINE)
    private readonly stateMachine: IContratacionStateMachine,
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
    if ((clienteRole as UserRole) !== UserRole.CLIENTE) {
      throw new ForbiddenException(
        'Only authenticated clients can create contrataciones.',
      );
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
      await this.stateMachine.transitionTo(
        saved.id,
        ContratacionEstado.SOLICITADA,
      );

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
          await this.availabilityService.release(
            dto.prestadorId,
            dto.fecha,
            dto.franja,
          );
          this.logger.warn(
            `SLOT_RELEASED prestadorId=${dto.prestadorId} fecha=${dto.fecha} franja=${dto.franja}`,
          );
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

  // ---------------------------------------------------------------------------
  // UC08: List contrataciones — role-aware inbox (GET /contrataciones)
  // ---------------------------------------------------------------------------
  /**
   * Role-aware listing (ADR-08-01, REQ-01/02).
   *
   * The filtering dimension is derived from the caller's role, NEVER from the
   * request input (RN-CON-07 isolation):
   *   PRESTADOR → prestadorId = userId
   *   CLIENTE   → clienteId = userId   (reused by MI-09.3, only adds its UI)
   *
   * Each item is enriched with `clienteNombre` (ADR-08-02) by resolving the
   * client User via the already-injected USER_REPOSITORY. This is an N+1
   * resolution accepted for the TPI (documented limit); a null client falls
   * back to a 'Cliente' placeholder so the list never breaks. Order is
   * delegated to the repo (createdAt DESC) — the service does NOT reorder.
   */
  async list(
    userId: string,
    role: string,
    query: ListContratacionesQueryDto,
  ): Promise<ContratacionListItemDto[]> {
    const filtro: ContratacionFiltro = { estado: query.estado };
    if ((role as UserRole) === UserRole.PRESTADOR) {
      filtro.prestadorId = userId;
    } else {
      filtro.clienteId = userId;
    }

    const contrataciones =
      await this.contratacionRepo.findByParticipante(filtro);

    return Promise.all(
      contrataciones.map(async (c) => {
        const cliente = await this.userRepo.findById(c.clienteId);
        const clienteNombre = cliente
          ? `${cliente.name} ${cliente.lastName}`
          : 'Cliente';
        return new ContratacionListItemDto({
          id: c.id,
          ubicacion: c.ubicacion,
          prestadorId: c.prestadorId,
          clienteId: c.clienteId,
          clienteNombre,
          fecha: c.fecha,
          franja: c.franja,
          descripcion: c.descripcion,
          fechaPropuesta: c.fechaPropuesta,
          franjaPropuesta: c.franjaPropuesta,
          precioEstimado: c.precioEstimado,
          estado: c.estado,
          createdAt: c.createdAt,
        });
      }),
    );
  }

  // ---------------------------------------------------------------------------
  // UC08: Send proposal (prestador → presupuestada)
  // ---------------------------------------------------------------------------
  async sendProposal(
    id: string,
    dto: SendProposalDto,
    userId: string,
    role: string,
  ): Promise<ContratacionResponseDto> {
    // 1. Only PRESTADOR can send proposals (RN-CON-01)
    if ((role as UserRole) !== UserRole.PRESTADOR) {
      throw new ForbiddenException('Only prestadores can send proposals.');
    }

    // 2. Find contratación
    const contratacion = await this.contratacionRepo.findById(id);
    if (!contratacion) {
      throw new NotFoundException('Contratación not found.');
    }

    // 3. Only the assigned prestador can act — hide existence via 404
    if (contratacion.prestadorId !== userId) {
      throw new NotFoundException('Contratación not found.');
    }

    // 4. Must be in SOLICITADA state
    if (contratacion.estado !== ContratacionEstado.SOLICITADA) {
      throw new ConflictException(
        'Contratación is not in a state that accepts proposals.',
      );
    }

    // 5. Validate fecha is today or future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fechaDate = new Date(dto.fecha);
    if (fechaDate < today) {
      throw new UnprocessableEntityException(
        'The proposal date must be today or a future date.',
      );
    }

    // 5b. Validate precioEstimado > 0
    if (dto.precioEstimado <= 0) {
      throw new UnprocessableEntityException(
        'The estimated price must be greater than zero.',
      );
    }

    // 6. Update entity with proposal data
    contratacion.fechaPropuesta = dto.fecha;
    contratacion.franjaPropuesta = dto.franja;
    contratacion.precioEstimado = dto.precioEstimado;
    contratacion.estado = ContratacionEstado.PRESUPUESTADA;

    // 7. Save (simple save, no QueryRunner)
    const saved = await this.contratacionRepo.save(contratacion);

    // 8. Invoke UC09 state machine transition → PRESUPUESTADA
    await this.stateMachine.transitionTo(
      saved.id,
      ContratacionEstado.PRESUPUESTADA,
    );

    this.logger.log(`PROPOSAL_SENT id=${saved.id}`);

    // 9. Return response
    return new ContratacionResponseDto({
      id: saved.id,
      ubicacion: saved.ubicacion,
      prestadorId: saved.prestadorId,
      clienteId: saved.clienteId,
      fecha: saved.fecha,
      franja: saved.franja,
      descripcion: saved.descripcion,
      fechaPropuesta: saved.fechaPropuesta,
      franjaPropuesta: saved.franjaPropuesta,
      precioEstimado: saved.precioEstimado,
      estado: saved.estado,
      createdAt: saved.createdAt,
    });
  }

  // ---------------------------------------------------------------------------
  // UC08: Reject request (prestador → cancelada)
  // ---------------------------------------------------------------------------
  async reject(
    id: string,
    userId: string,
    role: string,
  ): Promise<ContratacionResponseDto> {
    // 1. Only PRESTADOR can reject requests (RN-CON-01)
    if ((role as UserRole) !== UserRole.PRESTADOR) {
      throw new ForbiddenException('Only prestadores can reject requests.');
    }

    // 2. Find contratación
    const contratacion = await this.contratacionRepo.findById(id);
    if (!contratacion) {
      throw new NotFoundException('Contratación not found.');
    }

    // 3. Only the assigned prestador can act — hide existence via 404
    if (contratacion.prestadorId !== userId) {
      throw new NotFoundException('Contratación not found.');
    }

    // 4. Must be in SOLICITADA state
    if (contratacion.estado !== ContratacionEstado.SOLICITADA) {
      throw new ConflictException(
        'Contratación is not in a state that can be rejected.',
      );
    }

    // 5. Update estado and save
    contratacion.estado = ContratacionEstado.CANCELADA;
    const saved = await this.contratacionRepo.save(contratacion);

    // 6. Invoke UC09 state machine transition → CANCELADA
    await this.stateMachine.transitionTo(
      saved.id,
      ContratacionEstado.CANCELADA,
    );

    this.logger.log(`REQUEST_REJECTED id=${saved.id}`);

    // 7. Return response
    return new ContratacionResponseDto({
      id: saved.id,
      ubicacion: saved.ubicacion,
      prestadorId: saved.prestadorId,
      clienteId: saved.clienteId,
      fecha: saved.fecha,
      franja: saved.franja,
      descripcion: saved.descripcion,
      fechaPropuesta: saved.fechaPropuesta,
      franjaPropuesta: saved.franjaPropuesta,
      precioEstimado: saved.precioEstimado,
      estado: saved.estado,
      createdAt: saved.createdAt,
    });
  }
}
