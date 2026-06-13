import { Contratacion } from '../domain/contratacion.entity.js';

export const CONTRATACION_REPOSITORY = 'CONTRATACION_REPOSITORY';

export interface IContratacionRepository {
  save(contratacion: Contratacion): Promise<Contratacion>;
}
