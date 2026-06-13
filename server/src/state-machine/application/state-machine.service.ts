import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContratacionEstado } from '../../contratacion/domain/contratacion-estado.enum.js';
import type { IContratacionStateMachine } from '../../contratacion/ports/state-machine.port.js';
import { InvalidTransitionError } from '../domain/invalid-transition.error.js';
import { StateChangeHistory } from '../domain/state-change-history.entity.js';
import { NOTIFIER, type INotifier } from '../ports/notifier.port.js';

@Injectable()
export class StateMachineService implements IContratacionStateMachine {
  private readonly logger = new Logger(StateMachineService.name);

  private readonly TRANSITIONS: Record<
    ContratacionEstado,
    ContratacionEstado[]
  > = {
    [ContratacionEstado.SOLICITADA]: [
      ContratacionEstado.PRESUPUESTADA,
      ContratacionEstado.CANCELADA,
    ],
    [ContratacionEstado.PRESUPUESTADA]: [
      ContratacionEstado.CONFIRMADA,
      ContratacionEstado.CANCELADA,
    ],
    [ContratacionEstado.CONFIRMADA]: [
      ContratacionEstado.EN_CURSO,
      ContratacionEstado.CANCELADA,
    ],
    [ContratacionEstado.EN_CURSO]: [
      ContratacionEstado.FINALIZADA,
      ContratacionEstado.CANCELADA,
    ],
    [ContratacionEstado.FINALIZADA]: [],
    [ContratacionEstado.CANCELADA]: [],
  };

  constructor(
    @InjectRepository(StateChangeHistory)
    private readonly historyRepo: Repository<StateChangeHistory>,
    @Inject(NOTIFIER)
    private readonly notifier: INotifier,
  ) {}

  async transitionTo(
    contratacionId: string,
    estado: ContratacionEstado,
  ): Promise<void> {
    const lastRecord = await this.historyRepo.findOne({
      where: { contratacionId },
      order: { timestamp: 'DESC' },
    });

    // No history + target is SOLICITADA → first registration, skip validation
    if (!lastRecord && estado === ContratacionEstado.SOLICITADA) {
      await this.saveHistory(contratacionId, null, estado);
      await this.notifyBestEffort(contratacionId, null, estado);
      return;
    }

    const estadoActual =
      lastRecord?.estadoNuevo ?? ContratacionEstado.SOLICITADA;

    // Validate transition against matrix
    const allowed = this.TRANSITIONS[estadoActual];
    if (!allowed || !allowed.includes(estado)) {
      throw new InvalidTransitionError(contratacionId, estadoActual, estado);
    }

    await this.saveHistory(contratacionId, estadoActual, estado);
    await this.notifyBestEffort(contratacionId, estadoActual, estado);
  }

  private async saveHistory(
    contratacionId: string,
    estadoAnterior: ContratacionEstado | null,
    estadoNuevo: ContratacionEstado,
  ): Promise<void> {
    const record = this.historyRepo.create({
      contratacionId,
      estadoAnterior,
      estadoNuevo,
    });
    await this.historyRepo.save(record);
  }

  private async notifyBestEffort(
    contratacionId: string,
    estadoAnterior: ContratacionEstado | null,
    estadoNuevo: ContratacionEstado,
  ): Promise<void> {
    try {
      await this.notifier.notify({
        contratacionId,
        estadoAnterior: estadoAnterior ?? ContratacionEstado.SOLICITADA,
        estadoNuevo,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.warn(
        `Notifier failed for contratacion ${contratacionId} transition ${estadoAnterior} → ${estadoNuevo}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
