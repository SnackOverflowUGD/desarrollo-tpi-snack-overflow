import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmUserRepository } from '../auth/adapters/typeorm-user.repository.js';
import { User } from '../auth/domain/user.entity.js';
import { USER_REPOSITORY } from '../auth/ports/user.repository.port.js';
import { PersistenceModule } from '../persistence/persistence.module.js';
import { StateMachineModule } from '../state-machine/state-machine.module.js';
import { TypeOrmContratacionRepository } from './adapters/typeorm-contratacion.repository.js';
import { ContratacionService } from './application/contratacion.service.js';
import { ContratacionController } from './contratacion.controller.js';
import { Contratacion } from './domain/contratacion.entity.js';
import {
  AVAILABILITY_SERVICE,
  type IAvailabilityService,
} from './ports/availability-service.port.js';
import { CONTRATACION_REPOSITORY } from './ports/contratacion-repository.port.js';

/**
 * Stub adapter for AvailabilityService — no-op until UC06 (agenda) is implemented.
 * All methods log calls for traceability.
 */
class StubAvailabilityService implements IAvailabilityService {
  private readonly logger = new Logger(StubAvailabilityService.name);

  isAvailable(
    _prestadorId: string,
    _fecha: string,
    _franja: string,
  ): Promise<boolean> {
    this.logger.warn(
      'STUB: isAvailable always returns true — UC06 not yet implemented',
    );
    return Promise.resolve(true);
  }

  reserve(
    _prestadorId: string,
    _fecha: string,
    _franja: string,
    _contratacionId: string,
  ): Promise<void> {
    this.logger.warn('STUB: reserve is a no-op — UC06 not yet implemented');
    return Promise.resolve();
  }

  release(
    _prestadorId: string,
    _fecha: string,
    _franja: string,
  ): Promise<void> {
    this.logger.warn('STUB: release is a no-op — UC06 not yet implemented');
    return Promise.resolve();
  }
}

@Module({
  imports: [
    TypeOrmModule.forFeature([Contratacion, User]),
    PersistenceModule,
    StateMachineModule,
  ],
  controllers: [ContratacionController],
  providers: [
    ContratacionService,

    // ── Port → adapter bindings ──
    {
      provide: CONTRATACION_REPOSITORY,
      useClass: TypeOrmContratacionRepository,
    },
    {
      provide: USER_REPOSITORY,
      useClass: TypeOrmUserRepository,
    },
    {
      provide: AVAILABILITY_SERVICE,
      useClass: StubAvailabilityService,
    },
  ],
})
export class ContratacionModule {}
