/**
 * Unit tests for RegistrationService — derived from spec.md (ESC-01..07) and
 * OCL contracts (design.md §6.1/6.2).
 *
 * All ports are mocked in-memory; no DB or Redis required.
 */
import { BadRequestException, ConflictException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { RegistrationService } from './registration.service.js';
import { ProviderStatus } from '../domain/provider-status.enum.js';
import { UserRole } from '../domain/user-role.enum.js';
import { UserStatus } from '../domain/user-status.enum.js';
import { RegisterDto } from '../dto/register.dto.js';
import type { User } from '../domain/user.entity.js';
import type { RegulatedTrade } from '../domain/regulated-trade.entity.js';
import type { IUserRepository, CreateUserData } from '../ports/user.repository.port.js';
import type { IRegulatedTradeRepository } from '../ports/regulated-trade.repository.port.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeUser(overrides: Partial<User> & { passwordHash?: string } = {}): User {
  return {
    id: 'user-uuid-1',
    name: 'Juan',
    lastName: 'Pérez',
    email: 'juan@example.com',
    phone: '+543764123456',
    passwordHash: '$argon2id$placeholder',
    role: UserRole.CLIENTE,
    status: UserStatus.ACTIVO,
    providerStatus: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as User;
}

function makeRegulatedTrade(overrides: Partial<RegulatedTrade> = {}): RegulatedTrade {
  return {
    id: 'trade-uuid-1',
    tradeName: 'gasista',
    createdAt: new Date(),
    ...overrides,
  } as RegulatedTrade;
}

function makeRegisterDto(overrides: Partial<RegisterDto> = {}): RegisterDto {
  const dto = new RegisterDto();
  dto.name = 'Juan';
  dto.lastName = 'Pérez';
  dto.email = 'Juan@Example.com'; // intentionally mixed case to test lowercasing
  dto.phone = '+543764123456';
  dto.password = 'SecurePass1';
  dto.role = UserRole.CLIENTE;
  dto.trade = undefined;
  return Object.assign(dto, overrides);
}

function makeMocks() {
  const userRepo: jest.Mocked<IUserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    updatePasswordHash: jest.fn().mockResolvedValue(undefined),
    create: jest.fn(),
  };

  const regulatedTradeRepo: jest.Mocked<IRegulatedTradeRepository> = {
    findByTradeName: jest.fn(),
  };

  const service = new RegistrationService(userRepo, regulatedTradeRepo);

  return { service, userRepo, regulatedTradeRepo };
}

// ---------------------------------------------------------------------------
// ESC-01: Registro exitoso como Cliente
// ---------------------------------------------------------------------------
describe('RegistrationService.register()', () => {
  // ESC-01: cliente → 201, providerStatus=null, status=activo
  it('ESC-01: role cliente → 201, providerStatus=null, status=activo', async () => {
    const { service, userRepo, regulatedTradeRepo } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(null);
    const createdUser = makeUser({
      role: UserRole.CLIENTE,
      providerStatus: null,
    });
    userRepo.create.mockResolvedValue(createdUser);

    const dto = makeRegisterDto({ role: UserRole.CLIENTE });
    const result = await service.register(dto);

    // OCL post-conditions (design §6.1)
    expect(result.status).toBe(UserStatus.ACTIVO);
    expect(result.providerStatus).toBeNull();
    expect(result.role).toBe(UserRole.CLIENTE);
    expect(result.message).toBe('Account created successfully.');

    // Email lowercased (design §3.1 step 1)
    const createData = userRepo.create.mock.calls[0][0] as CreateUserData;
    expect(createData.email).toBe('juan@example.com');

    // regulatedTradeRepo was NOT called for cliente
    expect(regulatedTradeRepo.findByTradeName).not.toHaveBeenCalled();
  });

  // OCL §6.1: password hash is Argon2id, not plaintext
  it('OCL §6.1: password stored as Argon2id hash, never plaintext', async () => {
    const { service, userRepo } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(null);
    const createdUser = makeUser({ role: UserRole.CLIENTE });
    userRepo.create.mockResolvedValue(createdUser);

    const dto = makeRegisterDto({ role: UserRole.CLIENTE, password: 'MySecure1' });
    await service.register(dto);

    const createData = userRepo.create.mock.calls[0][0] as CreateUserData;
    expect(createData.passwordHash).toMatch(/^\$argon2id\$/);
    expect(createData.passwordHash).not.toBe('MySecure1');
  });

  // ESC-02: prestador + non-regulated trade → habilitado
  it('ESC-02: prestador + non-regulated trade → providerStatus=habilitado', async () => {
    const { service, userRepo, regulatedTradeRepo } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(null);
    regulatedTradeRepo.findByTradeName.mockResolvedValue(null); // NOT regulated
    const createdUser = makeUser({
      role: UserRole.PRESTADOR,
      providerStatus: ProviderStatus.HABILITADO,
    });
    userRepo.create.mockResolvedValue(createdUser);

    const dto = makeRegisterDto({
      role: UserRole.PRESTADOR,
      trade: 'plomero', // not in regulated list
    });
    const result = await service.register(dto);

    expect(result.role).toBe(UserRole.PRESTADOR);
    expect(result.providerStatus).toBe(ProviderStatus.HABILITADO);
    expect(result.status).toBe(UserStatus.ACTIVO);
    expect(result.message).toBe('Account created successfully.');

    // Verify the repo was queried with lowercased trade name
    expect(regulatedTradeRepo.findByTradeName).toHaveBeenCalledWith('plomero');
  });

  // ESC-03: prestador + regulated trade → pendiente_habilitacion
  it('ESC-03: prestador + regulated trade → providerStatus=pendiente_habilitacion', async () => {
    const { service, userRepo, regulatedTradeRepo } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(null);
    regulatedTradeRepo.findByTradeName.mockResolvedValue(makeRegulatedTrade()); // IS regulated
    const createdUser = makeUser({
      role: UserRole.PRESTADOR,
      providerStatus: ProviderStatus.PENDIENTE_HABILITACION,
    });
    userRepo.create.mockResolvedValue(createdUser);

    const dto = makeRegisterDto({
      role: UserRole.PRESTADOR,
      trade: 'gasista', // in regulated list
    });
    const result = await service.register(dto);

    expect(result.role).toBe(UserRole.PRESTADOR);
    expect(result.providerStatus).toBe(ProviderStatus.PENDIENTE_HABILITACION);
    expect(result.status).toBe(UserStatus.ACTIVO);
    expect(result.message).toBe(
      'Cuenta creada. Verificá tu matrícula profesional para activar tu perfil de prestador.',
    );

    expect(regulatedTradeRepo.findByTradeName).toHaveBeenCalledWith('gasista');
  });

  // WARNING-01: prestador without trade → 422 BadRequestException
  it('WARNING-01: prestador without trade → BadRequestException (422)', async () => {
    const { service } = makeMocks();
    const dto = makeRegisterDto({
      role: UserRole.PRESTADOR,
      trade: undefined,
    });
    await expect(service.register(dto)).rejects.toThrow(BadRequestException);
  });

  // ESC-06: duplicate email → 409 ConflictException
  it('ESC-06: existing email → ConflictException (409), no account created', async () => {
    const { service, userRepo } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(makeUser()); // existing user

    const dto = makeRegisterDto();
    await expect(service.register(dto)).rejects.toThrow(ConflictException);

    // OCL §6.1 post-condition: create() was NOT called
    expect(userRepo.create).not.toHaveBeenCalled();
  });

  // ESC-06 (OCL §6.1): 409 response must NOT reveal account details
  it('ESC-06 (OCL §6.1): 409 message does not reveal account status or role', async () => {
    const { service, userRepo } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(makeUser({ role: UserRole.PRESTADOR, status: UserStatus.SUSPENDIDO }));

    const dto = makeRegisterDto();
    let error: Error | null = null;
    try {
      await service.register(dto);
    } catch (e) {
      error = e as Error;
    }

    expect(error).toBeInstanceOf(ConflictException);
    const conflict = error as ConflictException;
    const response = conflict.getResponse() as { message: string };
    // Must not leak role, status, or any detail beyond "already exists"
    expect(response.message).toBe('An account with this email already exists.');
    expect(response.message).not.toContain('prestador');
    expect(response.message).not.toContain('suspendido');
    expect(response.message).not.toContain('activo');
  });

  // ESC-07: desistimiento after 409 — no partial data persisted (trivial: no side effect)
  it('ESC-07: desistimiento after 409 — no partial data persists (no-op on cancel)', async () => {
    // This scenario is a client-side concern — the service never creates partial data.
    // Confirmed: if email exists, service throws before any write.
    const { service, userRepo } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(makeUser());

    const dto = makeRegisterDto();
    await expect(service.register(dto)).rejects.toThrow(ConflictException);
    expect(userRepo.create).not.toHaveBeenCalled();
  });

  // OCL §6.1 post-condition: providerStatus null for cliente regardless of trade field
  it('OCL §6.1: cliente providerStatus is always null even if trade is sent', async () => {
    const { service, userRepo, regulatedTradeRepo } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(null);
    const createdUser = makeUser({ role: UserRole.CLIENTE, providerStatus: null });
    userRepo.create.mockResolvedValue(createdUser);

    const dto = makeRegisterDto({
      role: UserRole.CLIENTE,
      trade: 'gasista', // trade sent but role is cliente — should be ignored
    });
    const result = await service.register(dto);

    expect(result.providerStatus).toBeNull();
    // regulatedTradeRepo should NOT be called for cliente even if trade is provided
    expect(regulatedTradeRepo.findByTradeName).not.toHaveBeenCalled();
  });

  // OCL §6.1: all user fields match the DTO
  it('OCL §6.1: user fields match DTO (name, lastName, email, phone, role)', async () => {
    const { service, userRepo } = makeMocks();
    userRepo.findByEmail.mockResolvedValue(null);
    const createdUser = makeUser({
      name: 'María',
      lastName: 'García',
      email: 'maria@example.com',
      phone: '+5491122334455',
      role: UserRole.CLIENTE,
    });
    userRepo.create.mockResolvedValue(createdUser);

    const dto = makeRegisterDto({
      name: 'María',
      lastName: 'García',
      email: 'MARIA@Example.com',
      phone: '+5491122334455',
      role: UserRole.CLIENTE,
    });
    const result = await service.register(dto);

    expect(result.email).toBe('maria@example.com');
    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'María',
        lastName: 'García',
        phone: '+5491122334455',
        role: UserRole.CLIENTE,
      }),
    );
  });
});
