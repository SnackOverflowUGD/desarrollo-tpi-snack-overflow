import {
  Controller,
  Get,
  Query,
  Param,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import { BuscadorService } from './application/buscador.service.js';
import { BuscarPrestadoresDto } from './dto/buscar-prestadores.dto.js';

/**
 * Catalogo controller — public search endpoints (no auth required per UC04 preconditions).
 */
@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly buscadorService: BuscadorService) {}

  /**
   * GET /catalogo/prestadores?oficio=...&ubicacion=...&orden=...&page=...&pageSize=...
   * Searches for providers by trade and location (public, no auth).
   */
  @Get('prestadores')
  async buscarPrestadores(
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }))
    dto: BuscarPrestadoresDto,
  ) {
    return this.buscadorService.buscar(dto);
  }

  /**
   * GET /catalogo/prestadores/:id
   * Returns the full public profile of a provider (ESC-06).
   */
  @Get('prestadores/:id')
  async obtenerPerfil(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    prestadorId: string,
  ) {
    return this.buscadorService.obtenerPerfil(prestadorId);
  }
}
