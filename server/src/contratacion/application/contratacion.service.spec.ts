/**
 * Unit tests for ContratacionService — derived from spec.md (ESC-01..07)
 * and design.md data flow / interfaces.
 *
 * All ports are mocked in-memory; no DB or Redis required.
 * DataSource / QueryRunner are fully mocked to isolate the service.
 */
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { DataSource } from 'typeorm';
import { UserRole } from '../../auth/domain/user-role.enum.js';
import { UserStatus } from '../../auth/domain/user-status.enum.js';
import type { User } from '../../auth/domain/user.entity.js';
import type { IUserRepository } from '../../auth/ports/user.repository.port.js';
import { ContratacionEstado } from '../domain/contratacion-estado.enum.js';
import type { Contratacion } from '../domain/contratacion.entity.js';
import { CreateContratacionDto } from '../dto/create-contratacion.dto.js';
import type { IAvailabilityService } from '../ports/availability-service.port.js';
import type { IContratacionRepository } from '../ports/contratacion-repository.port.js';
import type { IContratacionStateMachine } from '../ports/state-machine.port.js';
import { ContratacionService } from './contratacion.service.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePrestador(overrides: Partial<User> = {}): User {
  return {
    id: 'prestador-uuid-1',
    email: 'prestador@example.com',
    passwordHash: 'hash',
    role: UserRole.PRESTADOR,
    status: UserStatus.ACTIVO,
    providerStatus: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

function makeCreateDto(overrides: Partial<CreateContratacionDto> = {}): CreateContratacionDto {
  const dto = new CreateContratacionDto();
  dto.ubicacion = 'Av. Siempre Viva 123, Springfield';
  dto.prestadorId = 'prestador-uuid-1';
  dto.fecha = '2026-06-20';
  dto.franja = '08:00-09:00';
  dto.descripcion = 'Se rompió el caño de la cocina.';
  return Object.assign(dto, overrides);
}

function makeContratacion(overrides: Partial<Contratacion> = {}): Contratacion {
  return {
    id: 'contratacion-uuid-1',
    ubicacion: 'Av. Siempre Viva 123, Springfield',
    prestadorId: 'prestador-uuid-1',
    clienteId: 'cliente-uuid-1',
    fecha: '2026-06-20',
    franja: '08:00-09:00',
    descripcion: 'Se rompió el caño de la cocina.',
    estado: ContratacionEstado.SOLICITADA,
    fechaPropuesta: null,
    franjaPropuesta: null,
    precioEstimado: null,
    createdAt: new Date('2026-06-13'),
    ...overrides,
  } as Contratacion;
}

function makeMocks() {
  const mockQueryRunner = {
    connect: jest.fn().mockResolvedValue(undefined),
    startTransaction: jest.fn().mockResolvedValue(undefined),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    rollbackTransaction: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
    manager: {
      save: jest.fn(),
    },
  };

  const dataSource = {
    createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
  } as unknown as jest.Mocked<DataSource>;

  const userRepo: jest.Mocked<IUserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePasswordHash: jest.fn(),
  };

  const contratacionRepo: jest.Mocked<IContratacionRepository> = {
    save: jest.fn(),
    findById: jest.fn(),
  };

  const availabilityService: jest.Mocked<IAvailabilityService> = {
    isAvailable: jest.fn(),
    reserve: jest.fn(),
    release: jest.fn(),
  };

  const stateMachine: jest.Mocked<IContratacionStateMachine> = {
    transitionTo: jest.fn(),
  };

  const service = new ContratacionService(
    dataSource,
    userRepo,
    contratacionRepo,
    availabilityService,
    stateMachine,
  );

  return {
    service,
    dataSource,
    mockQueryRunner,
    userRepo,
    contratacionRepo,
    availabilityService,
    stateMachine,
  };
}

// ---------------------------------------------------------------------------
// ESC-01: Solicitud exitosa — flujo básico
// ---------------------------------------------------------------------------
describe('ContratacionService.create()', () => {
  it('ESC-01: valid request → returns ContratacionResponseDto with 201', async () => {
    const {
      service,
      userRepo,
      mockQueryRunner,
      availabilityService,
      stateMachine,
    } = makeMocks();
    const dto = makeCreateDto();
    const prestador = makePrestador();
    userRepo.findById.mockResolvedValue(prestador);
    availabilityService.isAvailable.mockResolvedValue(true);
    availabilityService.reserve.mockResolvedValue(undefined);
    stateMachine.transitionTo.mockResolvedValue(undefined);

    // Simulate QueryRunner manager.save returning the saved entity
    mockQueryRunner.manager.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({
        ...entity,
        id: 'contratacion-uuid-1',
        createdAt: new Date('2026-06-13'),
      }),
    );

    const result = await service.create(
      dto,
      'cliente-uuid-1',
      UserRole.CLIENTE,
    );

    // ── Response shape ──
    expect(result).toBeDefined();
    expect(result.id).toBe('contratacion-uuid-1');
    expect(result.ubicacion).toBe(dto.ubicacion);
    expect(result.prestadorId).toBe(dto.prestadorId);
    expect(result.clienteId).toBe('cliente-uuid-1');
    expect(result.fecha).toBe(dto.fecha);
    expect(result.franja).toBe(dto.franja);
    expect(result.descripcion).toBe(dto.descripcion);
    expect(result.estado).toBe(ContratacionEstado.SOLICITADA);
    expect(result.createdAt).toBeDefined();

    // ── Transaction flow ──
    expect(mockQueryRunner.connect).toHaveBeenCalled();
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
      expect.objectContaining({ ubicacion: dto.ubicacion }),
    );
    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();

    // ── Availability + state machine called ──
    expect(availabilityService.isAvailable).toHaveBeenCalledWith(
      dto.prestadorId,
      dto.fecha,
      dto.franja,
    );
    expect(availabilityService.reserve).toHaveBeenCalledWith(
      dto.prestadorId,
      dto.fecha,
      dto.franja,
      'contratacion-uuid-1',
    );
    expect(stateMachine.transitionTo).toHaveBeenCalledWith(
      'contratacion-uuid-1',
      ContratacionEstado.SOLICITADA,
    );

    // ── User validation ──
    expect(userRepo.findById).toHaveBeenCalledWith(dto.prestadorId);

    // ── rollback NOT called on happy path ──
    expect(mockQueryRunner.rollbackTransaction).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // RN-CON-01 / RNF-S.1: Solo clientes autenticados
  // -----------------------------------------------------------------------
  it('RN-CON-01: non-cliente role → ForbiddenException 403', async () => {
    const { service } = makeMocks();

    await expect(
      service.create(makeCreateDto(), 'user-uuid', UserRole.PRESTADOR),
    ).rejects.toThrow(ForbiddenException);

    await expect(
      service.create(makeCreateDto(), 'user-uuid', UserRole.ADMINISTRADOR),
    ).rejects.toThrow(ForbiddenException);
  });

  // -----------------------------------------------------------------------
  // ESC-05: Prestador inactivo o inexistente
  // -----------------------------------------------------------------------
  it('ESC-05: prestador not found → NotFoundException 404', async () => {
    const { service, userRepo } = makeMocks();
    userRepo.findById.mockResolvedValue(null);

    await expect(
      service.create(makeCreateDto(), 'cliente-uuid', UserRole.CLIENTE),
    ).rejects.toThrow(NotFoundException);
  });

  it('ESC-05: prestador is not a PRESTADOR role → NotFoundException 404', async () => {
    const { service, userRepo } = makeMocks();
    userRepo.findById.mockResolvedValue(
      makePrestador({ role: UserRole.CLIENTE }),
    );

    await expect(
      service.create(makeCreateDto(), 'cliente-uuid', UserRole.CLIENTE),
    ).rejects.toThrow(NotFoundException);
  });

  it('ESC-05: prestador is SUSPENDIDO → NotFoundException 404', async () => {
    const { service, userRepo } = makeMocks();
    userRepo.findById.mockResolvedValue(
      makePrestador({ status: UserStatus.SUSPENDIDO }),
    );

    await expect(
      service.create(makeCreateDto(), 'cliente-uuid', UserRole.CLIENTE),
    ).rejects.toThrow(NotFoundException);
  });

  // -----------------------------------------------------------------------
  // ESC-06: Fecha en el pasado
  // -----------------------------------------------------------------------
  it('ESC-06: fecha in the past → UnprocessableEntityException 422', async () => {
    const { service, userRepo } = makeMocks();
    userRepo.findById.mockResolvedValue(makePrestador());
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const dto = makeCreateDto({ fecha: yesterday });

    await expect(
      service.create(dto, 'cliente-uuid', UserRole.CLIENTE),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  // -----------------------------------------------------------------------
  // ESC-03: Franja ya no disponible
  // -----------------------------------------------------------------------
  it('ESC-03: franja not available → ConflictException 409', async () => {
    const { service, userRepo, availabilityService, mockQueryRunner } =
      makeMocks();
    userRepo.findById.mockResolvedValue(makePrestador());
    availabilityService.isAvailable.mockResolvedValue(false);

    await expect(
      service.create(makeCreateDto(), 'cliente-uuid', UserRole.CLIENTE),
    ).rejects.toThrow(ConflictException);

    // Transaction started but rolled back
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();

    // Reserve / transition NOT called
    expect(availabilityService.reserve).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // ESC-07: Falla en reserva de franja (rollback)
  // -----------------------------------------------------------------------
  it('ESC-07: availabilityService.reserve fails → rollback + release called', async () => {
    const { service, userRepo, mockQueryRunner, availabilityService, stateMachine } =
      makeMocks();
    const dto = makeCreateDto();
    userRepo.findById.mockResolvedValue(makePrestador());
    availabilityService.isAvailable.mockResolvedValue(true);
    mockQueryRunner.manager.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({
        ...entity,
        id: 'contratacion-uuid-1',
        createdAt: new Date('2026-06-13'),
      }),
    );
    availabilityService.reserve.mockRejectedValue(new Error('Reservation service timeout'));

    await expect(
      service.create(dto, 'cliente-uuid', UserRole.CLIENTE),
    ).rejects.toThrow();

    // Rollback was called
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();

    // Slot was NOT reserved so release should NOT be called
    expect(availabilityService.release).not.toHaveBeenCalled();

    // state machine NOT called
    expect(stateMachine.transitionTo).not.toHaveBeenCalled();
  });

  // -----------------------------------------------------------------------
  // ESC-07: State machine fails → rollback + release slot
  // -----------------------------------------------------------------------
  it('ESC-07: stateMachine.transitionTo fails → rollback + release slot', async () => {
    const { service, userRepo, mockQueryRunner, availabilityService, stateMachine } =
      makeMocks();
    const dto = makeCreateDto();
    userRepo.findById.mockResolvedValue(makePrestador());
    availabilityService.isAvailable.mockResolvedValue(true);
    mockQueryRunner.manager.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({
        ...entity,
        id: 'contratacion-uuid-1',
        createdAt: new Date('2026-06-13'),
      }),
    );
    availabilityService.reserve.mockResolvedValue(undefined);
    stateMachine.transitionTo.mockRejectedValue(new Error('State machine unavailable'));

    await expect(
      service.create(dto, 'cliente-uuid', UserRole.CLIENTE),
    ).rejects.toThrow();

    // Rollback was called
    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.commitTransaction).not.toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();

    // Slot WAS reserved, so release must be called as compensating action
    expect(availabilityService.release).toHaveBeenCalledWith(
      dto.prestadorId,
      dto.fecha,
      dto.franja,
    );
  });
});

// ---------------------------------------------------------------------------
// UC08: SendProposal — Enviar propuesta
// ---------------------------------------------------------------------------
describe('ContratacionService.sendProposal()', () => {
  it('UC08-SP-01: valid proposal → returns ContratacionResponseDto', async () => {
    const { service, contratacionRepo, stateMachine } = makeMocks();
    const contratacion = makeContratacion();
    contratacionRepo.findById.mockResolvedValue(contratacion);
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({
        ...entity,
        id: 'contratacion-uuid-1',
        createdAt: new Date('2026-06-13'),
      }),
    );
    stateMachine.transitionTo.mockResolvedValue(undefined);

    const dto = {
      fecha: '2026-06-20',
      franja: '10:00-11:00',
      precioEstimado: 150.0,
    };

    const result = await service.sendProposal(
      'contratacion-uuid-1',
      dto,
      'prestador-uuid-1',
      UserRole.PRESTADOR,
    );

    expect(result).toBeDefined();
    expect(result.id).toBe('contratacion-uuid-1');
    expect(result.fechaPropuesta).toBe('2026-06-20');
    expect(result.franjaPropuesta).toBe('10:00-11:00');
    expect(result.precioEstimado).toBe(150.0);
    expect(result.estado).toBe(ContratacionEstado.PRESUPUESTADA);

    expect(contratacionRepo.findById).toHaveBeenCalledWith('contratacion-uuid-1');
    expect(contratacionRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        fechaPropuesta: '2026-06-20',
        franjaPropuesta: '10:00-11:00',
        precioEstimado: 150.0,
        estado: ContratacionEstado.PRESUPUESTADA,
      }),
    );
    expect(stateMachine.transitionTo).toHaveBeenCalledWith(
      'contratacion-uuid-1',
      ContratacionEstado.PRESUPUESTADA,
    );
  });

  it('UC08-SP-02: role CLIENTE → ForbiddenException 403', async () => {
    const { service } = makeMocks();

    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: '2026-06-20', franja: '10:00-11:00', precioEstimado: 150.0 },
        'cliente-uuid-1',
        UserRole.CLIENTE,
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('UC08-SP-03: prestadorId mismatch → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    const contratacion = makeContratacion({ prestadorId: 'other-prestador' });
    contratacionRepo.findById.mockResolvedValue(contratacion);

    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: '2026-06-20', franja: '10:00-11:00', precioEstimado: 150.0 },
        'prestador-uuid-1',
        UserRole.PRESTADOR,
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC08-SP-04: estado not SOLICITADA → ConflictException 409', async () => {
    const { service, contratacionRepo } = makeMocks();
    const contratacion = makeContratacion({
      estado: ContratacionEstado.PRESUPUESTADA,
    });
    contratacionRepo.findById.mockResolvedValue(contratacion);

    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: '2026-06-20', franja: '10:00-11:00', precioEstimado: 150.0 },
        'prestador-uuid-1',
        UserRole.PRESTADOR,
      ),
    ).rejects.toThrow(ConflictException);
  });

  it('UC08-SP-05: fecha in the past → UnprocessableEntityException 422', async () => {
    const { service, contratacionRepo } = makeMocks();
    const contratacion = makeContratacion();
    contratacionRepo.findById.mockResolvedValue(contratacion);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: yesterday, franja: '10:00-11:00', precioEstimado: 150.0 },
        'prestador-uuid-1',
        UserRole.PRESTADOR,
      ),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('UC08-SP-06: precioEstimado <= 0 → UnprocessableEntityException 422', async () => {
    const { service, contratacionRepo } = makeMocks();
    const contratacion = makeContratacion();
    contratacionRepo.findById.mockResolvedValue(contratacion);

    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: '2026-06-20', franja: '10:00-11:00', precioEstimado: 0 },
        'prestador-uuid-1',
        UserRole.PRESTADOR,
      ),
    ).rejects.toThrow(UnprocessableEntityException);

    await expect(
      service.sendProposal(
        'contratacion-uuid-1',
        { fecha: '2026-06-20', franja: '10:00-11:00', precioEstimado: -50 },
        'prestador-uuid-1',
        UserRole.PRESTADOR,
      ),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it('UC08-SP-07: findById returns null → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(null);

    await expect(
      service.sendProposal(
        'nonexistent-id',
        { fecha: '2026-06-20', franja: '10:00-11:00', precioEstimado: 150.0 },
        'prestador-uuid-1',
        UserRole.PRESTADOR,
      ),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// UC08: Reject — Rechazar solicitud
// ---------------------------------------------------------------------------
describe('ContratacionService.reject()', () => {
  it('UC08-RE-01: valid reject → returns ContratacionResponseDto with CANCELADA', async () => {
    const { service, contratacionRepo, stateMachine } = makeMocks();
    const contratacion = makeContratacion();
    contratacionRepo.findById.mockResolvedValue(contratacion);
    contratacionRepo.save.mockImplementation(
      async (entity: Contratacion): Promise<Contratacion> => ({
        ...entity,
        id: 'contratacion-uuid-1',
        createdAt: new Date('2026-06-13'),
      }),
    );
    stateMachine.transitionTo.mockResolvedValue(undefined);

    const result = await service.reject(
      'contratacion-uuid-1',
      'prestador-uuid-1',
      UserRole.PRESTADOR,
    );

    expect(result).toBeDefined();
    expect(result.id).toBe('contratacion-uuid-1');
    expect(result.estado).toBe(ContratacionEstado.CANCELADA);

    expect(contratacionRepo.findById).toHaveBeenCalledWith('contratacion-uuid-1');
    expect(contratacionRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ estado: ContratacionEstado.CANCELADA }),
    );
    expect(stateMachine.transitionTo).toHaveBeenCalledWith(
      'contratacion-uuid-1',
      ContratacionEstado.CANCELADA,
    );
  });

  it('UC08-RE-02: findById returns null → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    contratacionRepo.findById.mockResolvedValue(null);

    await expect(
      service.reject('nonexistent-id', 'prestador-uuid-1', UserRole.PRESTADOR),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC08-RE-03: estado not SOLICITADA → ConflictException 409', async () => {
    const { service, contratacionRepo } = makeMocks();
    const contratacion = makeContratacion({
      estado: ContratacionEstado.PRESUPUESTADA,
    });
    contratacionRepo.findById.mockResolvedValue(contratacion);

    await expect(
      service.reject('contratacion-uuid-1', 'prestador-uuid-1', UserRole.PRESTADOR),
    ).rejects.toThrow(ConflictException);
  });

  it('UC08-RE-04: prestadorId mismatch → NotFoundException 404', async () => {
    const { service, contratacionRepo } = makeMocks();
    const contratacion = makeContratacion({ prestadorId: 'other-prestador' });
    contratacionRepo.findById.mockResolvedValue(contratacion);

    await expect(
      service.reject('contratacion-uuid-1', 'prestador-uuid-1', UserRole.PRESTADOR),
    ).rejects.toThrow(NotFoundException);
  });

  it('UC08-RE-05: role CLIENTE → ForbiddenException 403', async () => {
    const { service } = makeMocks();

    await expect(
      service.reject('contratacion-uuid-1', 'cliente-uuid-1', UserRole.CLIENTE),
    ).rejects.toThrow(ForbiddenException);
  });
});
