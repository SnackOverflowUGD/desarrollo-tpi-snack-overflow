import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { STATE_MACHINE } from '../contratacion/ports/state-machine.port.js';
import { TypeOrmStateChangeHistoryRepository } from './adapters/typeorm-state-change-history.repository.js';
import { StateMachineService } from './application/state-machine.service.js';
import { StateChangeHistory } from './domain/state-change-history.entity.js';
import { NOTIFIER, type INotifier } from './ports/notifier.port.js';
import { STATE_CHANGE_HISTORY_REPOSITORY } from './ports/state-change-history-repository.port.js';
import { ContratacionEstado } from '../contratacion/domain/contratacion-estado.enum.js';

/**
 * Stub adapter for INotifier — no-op until UC19 is implemented.
 * All methods log calls for traceability.
 */
class StubNotifier implements INotifier {
  private readonly logger = new Logger(StubNotifier.name);

  notify(_params: {
    contratacionId: string;
    estadoAnterior: ContratacionEstado;
    estadoNuevo: ContratacionEstado;
    timestamp: Date;
  }): Promise<void> {
    this.logger.warn(
      `STUB: notify is a no-op — UC19 not yet implemented. Would notify: ${_params.contratacionId} transitioned from ${_params.estadoAnterior} to ${_params.estadoNuevo}`,
    );
    return Promise.resolve();
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([StateChangeHistory])],
  providers: [
    StateMachineService,
    { provide: STATE_MACHINE, useExisting: StateMachineService },
    {
      provide: STATE_CHANGE_HISTORY_REPOSITORY,
      useClass: TypeOrmStateChangeHistoryRepository,
    },
    { provide: NOTIFIER, useClass: StubNotifier },
  ],
  exports: [STATE_MACHINE],
})
export class StateMachineModule {}
