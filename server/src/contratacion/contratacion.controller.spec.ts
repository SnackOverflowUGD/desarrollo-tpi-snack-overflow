/**
 * Unit tests for ContratacionController — UC08 GET /contrataciones (design §Testing).
 *
 * The service is mocked; the controller is exercised directly. Covers that the
 * controller derives sub/role from req.user (NEVER from the query) and forwards
 * query.estado to the service. @IsEnum validation (400 on bad ?estado=) is a
 * ValidationPipe + DTO concern asserted via the DTO's class-validator metadata.
 */
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import type { Request } from 'express';
import { UserRole } from '../auth/domain/user-role.enum.js';
import type { JwtPayload } from '../auth/strategies/jwt.strategy.js';
import { ContratacionController } from './contratacion.controller.js';
import type { ContratacionService } from './application/contratacion.service.js';
import { ContratacionEstado } from './domain/contratacion-estado.enum.js';
import { ListContratacionesQueryDto } from './dto/list-contrataciones-query.dto.js';

function makeReq(user: JwtPayload): Request {
  return { user } as unknown as Request;
}

describe('ContratacionController.list()', () => {
  function setup() {
    const service = {
      list: jest.fn().mockResolvedValue([]),
    } as unknown as jest.Mocked<ContratacionService>;
    const controller = new ContratacionController(service);
    return { service, controller };
  }

  it('derives sub/role from req.user (never from the query) and forwards estado', async () => {
    const { service, controller } = setup();
    const query: ListContratacionesQueryDto = {
      estado: ContratacionEstado.SOLICITADA,
    };
    const req = makeReq({
      sub: 'prestador-uuid-1',
      role: UserRole.PRESTADOR,
    });

    await controller.list(query, req);

    expect(service.list).toHaveBeenCalledWith(
      'prestador-uuid-1',
      UserRole.PRESTADOR,
      query,
    );
  });

  it('passes a CLIENTE identity through (role-aware, MI-09.3 branch)', async () => {
    const { service, controller } = setup();
    const req = makeReq({ sub: 'cliente-uuid-1', role: UserRole.CLIENTE });

    await controller.list({}, req);

    expect(service.list).toHaveBeenCalledWith(
      'cliente-uuid-1',
      UserRole.CLIENTE,
      {},
    );
  });
});

describe('ListContratacionesQueryDto validation (400 on bad ?estado=)', () => {
  it('accepts a valid estado from the enum', async () => {
    const dto = plainToInstance(ListContratacionesQueryDto, {
      estado: 'solicitada',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('accepts an absent estado (optional)', async () => {
    const dto = plainToInstance(ListContratacionesQueryDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an out-of-enum estado (→ 400 via @IsEnum)', async () => {
    const dto = plainToInstance(ListContratacionesQueryDto, {
      estado: 'no-existe',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });
});
