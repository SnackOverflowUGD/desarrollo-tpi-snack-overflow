import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmUserRepository } from '../auth/adapters/typeorm-user.repository.js';
import { User } from '../auth/domain/user.entity.js';
import { USER_REPOSITORY } from '../auth/ports/user.repository.port.js';
import { TypeOrmContratacionRepository } from './adapters/typeorm-contratacion.repository.js';
import { ContratacionService } from './application/contratacion.service.js';
import { ContratacionController } from './contratacion.controller.js';
import { Contratacion } from './domain/contratacion.entity.js';
import { ContratacionEstado } from './domain/contratacion-estado.enum.js';
import {
  AVAILABILITY_SERVICE,
  type IAvailabilityService,
} from './ports/availability-service.port.js';
import {
  CONTRATACION_REPOSITORY,
  type IContratacionRepository,
} from './ports/contratacion-repository.port.js';
import {
  STATE_MACHINE,
  type IContratacionStateMachine,
} from './ports/state-machine.port.js';

/**
 * Stub adapter for AvailabilityService — no-op until UC06 (agenda) is implemented.
 * All methods log calls for traceability.
 */
class StubAvailabilityService implements IAvailabilityService {
  private readonly logger = new Logger(StubAvailabilityService.name);

  async isAvailable(_prestadorId: string, _fecha: string, _franja: string): Promise<boolean> {
    this.logger.warn('STUB: isAvailable always returns true — UC06 not yet implemented');
    return true;
  }

  async reserve(
    _prestadorId: string,
    _fecha: string,
    _franja: string,
    _contratacionId: string,
  ): Promise<void> {
    this.logger.warn('STUB: reserve is a no-op — UC06 not yet implemented');
  }

  async release(_prestadorId: string, _fecha: string, _franja: string): Promise<void> {
    this.logger.warn('STUB: release is a no-op — UC06 not yet implemented');
  }
}

/**
 * Stub adapter for ContratacionStateMachine — no-op until UC09 is implemented.
 */
class StubStateMachine implements IContratacionStateMachine {
  private readonly logger = new Logger(StubStateMachine.name);

  async transitionTo(_contratacionId: string, _estado: ContratacionEstado): Promise<void> {
    this.logger.warn('STUB: transitionTo is a no-op — UC09 not yet implemented');
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([Contratacion, User])],
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
    {
      provide: STATE_MACHINE,
      useClass: StubStateMachine,
    },
  ],
})
export class ContratacionModule {}
