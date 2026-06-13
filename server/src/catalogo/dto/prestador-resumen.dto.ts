import { Coordenadas } from '../ports/geocoding.port.js';

/**
 * Search result item — summary view of a provider in search results.
 */
export class PrestadorResumen {
  id!: string;
  nombreCompleto!: string;
  oficios!: string[];
  calificacionPromedio!: number;
  cantidadResenas!: number;
  disponibilidad!: 'disponible_esta_semana' | 'proxima_disponible' | 'sin_disponibilidad' | null;
  proximaFechaDisponible?: string;
  franjasDisponiblesProximos7Dias?: number;
  distanciaKm?: number;
  centroCobertura?: Coordenadas;
}
