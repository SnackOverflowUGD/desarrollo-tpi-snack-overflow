export const AVAILABILITY_SERVICE = 'AVAILABILITY_SERVICE';

export interface IAvailabilityService {
  isAvailable(prestadorId: string, fecha: string, franja: string): Promise<boolean>;
  reserve(prestadorId: string, fecha: string, franja: string, contratacionId: string): Promise<void>;
  release(prestadorId: string, fecha: string, franja: string): Promise<void>;
}
