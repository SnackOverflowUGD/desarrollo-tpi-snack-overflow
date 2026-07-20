import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Contratacion } from '../domain/contratacion.entity.js';
import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';
import { CreateContratacionDto } from '../dto/create-contratacion.dto.js';
import { ContratacionResponseDto } from '../dto/contratacion-response.dto.js';
import { ContratacionListItemDto } from '../dto/contratacion-list-item.dto.js';
import { ContratacionDetailDto } from '../dto/contratacion-detail.dto.js';
import { ListContratacionesQueryDto } from '../dto/list-contrataciones-query.dto.js';
import { SendProposalDto } from '../dto/send-proposal.dto.js';
import {
  AVAILABILITY_SERVICE,
  type IAvailabilityService,
} from '../ports/availability-service.port.js';
import {
  PARTICIPANT_DIRECTORY,
  ParticipantRole,
  type IParticipantDirectory,
} from '../ports/participant-directory.port.js';
import {
  CONTRATACION_REPOSITORY,
  type ContratacionFiltro,
  type IContratacionRepository,
} from '../ports/contratacion-repository.port.js';
import {
  STATE_MACHINE,
  type IContratacionStateMachine,
} from '../ports/state-machine.port.js';
import {
  TRANSACTION_RUNNER,
  type ITransactionRunner,
} from '../../persistence/ports/transaction-runner.port.js';

@Injectable()
export class ContratacionService {
  private readonly logger = new Logger(ContratacionService.name);

  constructor(
    @Inject(TRANSACTION_RUNNER)
    private readonly txRunner: ITransactionRunner,
    @Inject(PARTICIPANT_DIRECTORY)
    private readonly participants: IParticipantDirectory,
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
   * The entity INSERT and the first `state_change_history` row commit/rollback
   * together inside a single `runInTransaction` (RN-ACID-01/03/05). The franja
   * reservation is NOT part of the DB transaction (it is an external resource),
   * so its compensating action (`release`) runs in the `catch` that wraps the
   * Unit-of-Work. Guards (rol/prestador/fecha) run BEFORE opening the tx.
   *
   * Flow (mapped from design.md §Data Flow / D4):
   *   1. Authorization gate (RN-CON-01) — outside tx
   *   2. Validate prestador exists + is active (RN-CON-05) — outside tx
   *   3. Validate fecha ≥ today (RN-CON-06) — outside tx
   *   ── runInTransaction(tx) ──
   *   4. Verify franja availability
   *   5. Persist Contratacion (estado SOLICITADA) enlisted in tx (RN-CON-03)
   *   6. Reserve franja (external resource; compensated on failure)
   *   7. State machine transition → SOLICITADA (history INSERT enlisted in tx)
   *   ── commit / rollback ──
   *
   * On any failure: rollback (automatic) + release slot if it was reserved.
   */
  async create(
    dto: CreateContratacionDto,
    clienteId: string,
    clienteRole: string,
  ): Promise<ContratacionResponseDto> {
    // ── Authorization gate (RNF-S.1 / RN-CON-01) — outside tx ──
    if ((clienteRole as ParticipantRole) !== ParticipantRole.CLIENTE) {
      throw new ForbiddenException(
        'Only authenticated clients can create contrataciones.',
      );
    }

    // ── Validate prestador exists, has the PRESTADOR role and is active
    //    (RN-CON-05) — outside tx ──
    const prestadorRole = await this.participants.getRole(dto.prestadorId);
    const prestadorActive = await this.participants.isActive(dto.prestadorId);
    if (prestadorRole !== ParticipantRole.PRESTADOR || !prestadorActive) {
      throw new NotFoundException('Prestador not found or not available.');
    }

    // ── Validate fecha is today or future (RN-CON-06) — outside tx ──
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fechaDate = new Date(dto.fecha);
    if (fechaDate < today) {
      throw new UnprocessableEntityException(
        'The date must be today or a future date.',
      );
    }

    let slotReserved = false;

    try {
      const saved = await this.txRunner.runInTransaction(async (tx) => {
        // ── Verify franja availability ──
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

        // ── Build entity ──
        const contratacion = new Contratacion();
        contratacion.ubicacion = dto.ubicacion;
        contratacion.prestadorId = dto.prestadorId;
        contratacion.clienteId = clienteId;
        contratacion.fecha = dto.fecha;
        contratacion.franja = dto.franja;
        contratacion.descripcion = dto.descripcion;
        contratacion.estado = ContratacionEstado.SOLICITADA;

        // ── Persist within transaction ──
        const persisted = await this.contratacionRepo.save(contratacion, tx);

        // ── Reserve franja (external resource) ──
        await this.availabilityService.reserve(
          dto.prestadorId,
          dto.fecha,
          dto.franja,
          persisted.id,
        );
        slotReserved = true;

        // ── State machine → SOLICITADA (history INSERT enlisted in tx) ──
        await this.stateMachine.transitionTo(
          persisted.id,
          ContratacionEstado.SOLICITADA,
          tx,
        );

        return persisted;
      });

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
    if ((role as ParticipantRole) === ParticipantRole.PRESTADOR) {
      filtro.prestadorId = userId;
    } else {
      filtro.clienteId = userId;
    }

    const contrataciones =
      await this.contratacionRepo.findByParticipante(filtro);

    return Promise.all(
      contrataciones.map(async (c) => {
        // Both participants are resolved via PARTICIPANT_DIRECTORY: `clienteId`
        // is a user id directly, and `prestadorId` references the Prestador
        // catalog row whose PK IS the provider's user id (the create flow
        // validates it through the directory with role PRESTADOR). So the same
        // lookup mirrors clienteNombre for prestadorNombre. N+1 accepted for the
        // TPI (documented limit, ADR-08-02); null falls back to a placeholder.
        const [clienteNombreRaw, prestadorNombreRaw] = await Promise.all([
          this.participants.getDisplayName(c.clienteId),
          this.participants.getDisplayName(c.prestadorId),
        ]);
        const clienteNombre = clienteNombreRaw ?? 'Cliente';
        const prestadorNombre = prestadorNombreRaw ?? 'Prestador';
        return new ContratacionListItemDto({
          id: c.id,
          ubicacion: c.ubicacion,
          prestadorId: c.prestadorId,
          clienteId: c.clienteId,
          clienteNombre,
          prestadorNombre,
          fecha: c.fecha,
          franja: c.franja,
          descripcion: c.descripcion,
          fechaPropuesta: c.fechaPropuesta,
          franjaPropuesta: c.franjaPropuesta,
          precioEstimado: c.precioEstimado,
          justificacionPrecio: c.justificacionPrecio,
          estado: c.estado,
          createdAt: c.createdAt,
        });
      }),
    );
  }

  // ---------------------------------------------------------------------------
  // UC09: Detail + state timeline (GET /contrataciones/:id)
  // ---------------------------------------------------------------------------
  /**
   * Returns the full contratación plus its state-change timeline. Ownership
   * guard mirrors the transitions: the requester must be the cliente
   * (userId === clienteId) OR the prestador participant
   * (userId === prestadorId, the Prestador→userId link). A non-participant —
   * or a missing contratación — yields a 404 so existence is never leaked
   * (RN-CON-07). The history comes through the state-machine port (hexagonal
   * boundary; the contratacion module never touches the history repo).
   */
  async getDetail(
    id: string,
    userId: string,
    _role: string,
  ): Promise<ContratacionDetailDto> {
    const contratacion = await this.contratacionRepo.findById(id);
    if (
      !contratacion ||
      (contratacion.clienteId !== userId && contratacion.prestadorId !== userId)
    ) {
      throw new NotFoundException('Contratación not found.');
    }

    const [clienteNombreRaw, prestadorNombreRaw, history] = await Promise.all([
      this.participants.getDisplayName(contratacion.clienteId),
      this.participants.getDisplayName(contratacion.prestadorId),
      this.stateMachine.getHistory(contratacion.id),
    ]);

    const clienteNombre = clienteNombreRaw ?? 'Cliente';
    const prestadorNombre = prestadorNombreRaw ?? 'Prestador';

    return new ContratacionDetailDto({
      id: contratacion.id,
      ubicacion: contratacion.ubicacion,
      prestadorId: contratacion.prestadorId,
      prestadorNombre,
      clienteId: contratacion.clienteId,
      clienteNombre,
      fecha: contratacion.fecha,
      franja: contratacion.franja,
      descripcion: contratacion.descripcion,
      fechaPropuesta: contratacion.fechaPropuesta,
      franjaPropuesta: contratacion.franjaPropuesta,
      precioEstimado: contratacion.precioEstimado,
      justificacionPrecio: contratacion.justificacionPrecio,
      estado: contratacion.estado,
      createdAt: contratacion.createdAt,
      historial: history.map((h) => ({
        estadoAnterior: h.estadoAnterior,
        estadoNuevo: h.estadoNuevo,
        timestamp: h.timestamp,
      })),
    });
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
    if ((role as ParticipantRole) !== ParticipantRole.PRESTADOR) {
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
    contratacion.justificacionPrecio = dto.justificacionPrecio ?? null;
    contratacion.estado = ContratacionEstado.PRESUPUESTADA;

    // 7. Atomic: entity UPDATE + history INSERT commit/rollback together
    const saved = await this.txRunner.runInTransaction(async (tx) => {
      const persisted = await this.contratacionRepo.save(contratacion, tx);
      await this.stateMachine.transitionTo(
        persisted.id,
        ContratacionEstado.PRESUPUESTADA,
        tx,
      );
      return persisted;
    });

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
      justificacionPrecio: saved.justificacionPrecio,
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
    if ((role as ParticipantRole) !== ParticipantRole.PRESTADOR) {
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

    // 5. Update estado
    contratacion.estado = ContratacionEstado.CANCELADA;

    // 6. Atomic: entity UPDATE + history INSERT commit/rollback together
    const saved = await this.txRunner.runInTransaction(async (tx) => {
      const persisted = await this.contratacionRepo.save(contratacion, tx);
      await this.stateMachine.transitionTo(
        persisted.id,
        ContratacionEstado.CANCELADA,
        tx,
      );
      return persisted;
    });

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
      justificacionPrecio: saved.justificacionPrecio,
      estado: saved.estado,
      createdAt: saved.createdAt,
    });
  }

  // ---------------------------------------------------------------------------
  // UC09: Confirm proposal (cliente → confirmada)  REQ-01, ESC-UI-03
  // ---------------------------------------------------------------------------
  /**
   * Mirrors `reject`: rol → ownership (404, hides existence) → current-state
   * guard (409 ConflictException, NOT a bubbled InvalidTransitionError which is
   * a plain Error → would map to 500, ADR-09-02) → set estado → save →
   * stateMachine.transitionTo (2nd barrier, defense in depth).
   */
  async confirm(
    id: string,
    userId: string,
    role: string,
  ): Promise<ContratacionResponseDto> {
    // 1. Only CLIENTE can confirm (RN-CON-01)
    if ((role as ParticipantRole) !== ParticipantRole.CLIENTE) {
      throw new ForbiddenException('Only clients can confirm proposals.');
    }

    // 2. Find + ownership (hide existence via 404, RN-CON-07)
    const contratacion = await this.contratacionRepo.findById(id);
    if (!contratacion || contratacion.clienteId !== userId) {
      throw new NotFoundException('Contratación not found.');
    }

    // 3. Current-state guard (409 ConflictException, NOT bubbled SM error)
    if (contratacion.estado !== ContratacionEstado.PRESUPUESTADA) {
      throw new ConflictException(
        'Contratación is not in a state that can be confirmed.',
      );
    }

    // 4. Set estado
    contratacion.estado = ContratacionEstado.CONFIRMADA;

    // 5. Atomic: entity UPDATE + history INSERT commit/rollback together
    //    (state machine is the 2nd barrier, defense in depth, inside the tx)
    const saved = await this.txRunner.runInTransaction(async (tx) => {
      const persisted = await this.contratacionRepo.save(contratacion, tx);
      await this.stateMachine.transitionTo(
        persisted.id,
        ContratacionEstado.CONFIRMADA,
        tx,
      );
      return persisted;
    });

    this.logger.log(`CONTRATACION_CONFIRMED id=${saved.id}`);

    return this.toResponseDto(saved);
  }

  // ---------------------------------------------------------------------------
  // UC09: Start work (prestador → en_curso)  REQ-02, ESC-UI-04
  // ---------------------------------------------------------------------------
  async start(
    id: string,
    userId: string,
    role: string,
  ): Promise<ContratacionResponseDto> {
    // 1. Only PRESTADOR can start work
    if ((role as ParticipantRole) !== ParticipantRole.PRESTADOR) {
      throw new ForbiddenException('Only prestadores can start work.');
    }

    // 2. Find + ownership (404, hide existence)
    const contratacion = await this.contratacionRepo.findById(id);
    if (!contratacion || contratacion.prestadorId !== userId) {
      throw new NotFoundException('Contratación not found.');
    }

    // 3. Current-state guard (409)
    if (contratacion.estado !== ContratacionEstado.CONFIRMADA) {
      throw new ConflictException(
        'Contratación is not in a state that can be started.',
      );
    }

    // 4. Set estado
    contratacion.estado = ContratacionEstado.EN_CURSO;

    // 5. Atomic: entity UPDATE + history INSERT commit/rollback together
    const saved = await this.txRunner.runInTransaction(async (tx) => {
      const persisted = await this.contratacionRepo.save(contratacion, tx);
      await this.stateMachine.transitionTo(
        persisted.id,
        ContratacionEstado.EN_CURSO,
        tx,
      );
      return persisted;
    });

    this.logger.log(`CONTRATACION_STARTED id=${saved.id}`);

    return this.toResponseDto(saved);
  }

  // ---------------------------------------------------------------------------
  // UC09: Finish service (prestador → finalizada, terminal)  REQ-03, ESC-UI-05
  // ---------------------------------------------------------------------------
  async finish(
    id: string,
    userId: string,
    role: string,
  ): Promise<ContratacionResponseDto> {
    // 1. Only PRESTADOR can finish work
    if ((role as ParticipantRole) !== ParticipantRole.PRESTADOR) {
      throw new ForbiddenException('Only prestadores can finish work.');
    }

    // 2. Find + ownership (404, hide existence)
    const contratacion = await this.contratacionRepo.findById(id);
    if (!contratacion || contratacion.prestadorId !== userId) {
      throw new NotFoundException('Contratación not found.');
    }

    // 3. Current-state guard (409)
    if (contratacion.estado !== ContratacionEstado.EN_CURSO) {
      throw new ConflictException(
        'Contratación is not in a state that can be finished.',
      );
    }

    // 4. Set estado
    contratacion.estado = ContratacionEstado.FINALIZADA;

    // 5. Atomic: entity UPDATE + history INSERT commit/rollback together
    const saved = await this.txRunner.runInTransaction(async (tx) => {
      const persisted = await this.contratacionRepo.save(contratacion, tx);
      await this.stateMachine.transitionTo(
        persisted.id,
        ContratacionEstado.FINALIZADA,
        tx,
      );
      return persisted;
    });

    this.logger.log(`CONTRATACION_FINISHED id=${saved.id}`);

    return this.toResponseDto(saved);
  }

  // ---------------------------------------------------------------------------
  // UC09: Cancel (cliente OR prestador participant → cancelada, terminal)
  // REQ-04, ESC-UI-06. Reused by UC21 "rechazar propuesta" (presupuestada →
  // cancelada). Participant guard: either id matches → 404 otherwise (NOT 403).
  // ---------------------------------------------------------------------------
  async cancel(
    id: string,
    userId: string,
    _role: string,
  ): Promise<ContratacionResponseDto> {
    // 1. Find + participant guard (cliente OR prestador). Any other → 404.
    //    No role gate: both participants may cancel (RN-CON-07).
    const contratacion = await this.contratacionRepo.findById(id);
    if (
      !contratacion ||
      (contratacion.clienteId !== userId && contratacion.prestadorId !== userId)
    ) {
      throw new NotFoundException('Contratación not found.');
    }

    // 2. Terminal-state guard (409): already finalizada/cancelada cannot cancel.
    if (
      contratacion.estado === ContratacionEstado.FINALIZADA ||
      contratacion.estado === ContratacionEstado.CANCELADA
    ) {
      throw new ConflictException(
        'Contratación is already in a terminal state and cannot be cancelled.',
      );
    }

    // 3. Set estado (any active state → cancelada)
    contratacion.estado = ContratacionEstado.CANCELADA;

    // 4. Atomic: entity UPDATE + history INSERT commit/rollback together
    const saved = await this.txRunner.runInTransaction(async (tx) => {
      const persisted = await this.contratacionRepo.save(contratacion, tx);
      await this.stateMachine.transitionTo(
        persisted.id,
        ContratacionEstado.CANCELADA,
        tx,
      );
      return persisted;
    });

    this.logger.log(`CONTRATACION_CANCELLED id=${saved.id}`);

    return this.toResponseDto(saved);
  }

  // ---------------------------------------------------------------------------
  // Shared response mapper for the UC09 transitions.
  // ---------------------------------------------------------------------------
  private toResponseDto(saved: Contratacion): ContratacionResponseDto {
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
      justificacionPrecio: saved.justificacionPrecio,
      estado: saved.estado,
      createdAt: saved.createdAt,
    });
  }
}
