import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { JwtPayload } from '../auth/strategies/jwt.strategy.js';
import { UserRole } from '../auth/domain/user-role.enum.js';
import { PrestadorAutogestionService } from './application/prestador-autogestion.service.js';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto.js';
import { CrearServicioDto } from './dto/crear-servicio.dto.js';
import { ActualizarServicioDto } from './dto/actualizar-servicio.dto.js';
import { MiPerfilDto, MiPerfilServicioDto } from './dto/mi-perfil.dto.js';

/**
 * Authenticated prestador self-management surface (PSM-REQ-01/02/09/10).
 *
 * Every route is addressed by `req.user.sub` ONLY — no prestador id ever
 * enters the path, so profile access is ownership-safe by construction
 * (design decision (b)). Servicio subresources add an in-service ownership
 * guard that returns 404 (existence-hiding, mirrors `ContratacionController`).
 *
 * `AuthGuard('jwt')` at the controller level returns 401 without a session.
 * A role guard restricts the surface to prestadores (403 otherwise); clientes
 * and administradores have no self-managed prestador profile.
 */
@Controller('prestadores')
@UseGuards(AuthGuard('jwt'))
export class PrestadorController {
  constructor(
    private readonly autogestionService: PrestadorAutogestionService,
  ) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMiPerfil(@Req() req: Request): Promise<MiPerfilDto> {
    const user = this.requirePrestador(req);
    return this.autogestionService.getMiPerfil(user.sub);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async actualizarPerfil(
    @Body() dto: ActualizarPerfilDto,
    @Req() req: Request,
  ): Promise<MiPerfilDto> {
    const user = this.requirePrestador(req);
    return this.autogestionService.actualizarPerfil(user.sub, dto);
  }

  @Get('me/servicios')
  @HttpCode(HttpStatus.OK)
  async listMisServicios(@Req() req: Request): Promise<MiPerfilServicioDto[]> {
    const user = this.requirePrestador(req);
    const perfil = await this.autogestionService.getMiPerfil(user.sub);
    return perfil.servicios;
  }

  @Post('me/servicios')
  @HttpCode(HttpStatus.CREATED)
  async crearServicio(
    @Body() dto: CrearServicioDto,
    @Req() req: Request,
  ): Promise<MiPerfilServicioDto> {
    const user = this.requirePrestador(req);
    return this.autogestionService.crearServicio(user.sub, dto);
  }

  @Patch('me/servicios/:id')
  @HttpCode(HttpStatus.OK)
  async actualizarServicio(
    @Param('id') id: string,
    @Body() dto: ActualizarServicioDto,
    @Req() req: Request,
  ): Promise<MiPerfilServicioDto> {
    const user = this.requirePrestador(req);
    return this.autogestionService.actualizarServicio(user.sub, id, dto);
  }

  @Delete('me/servicios/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarServicio(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<void> {
    const user = this.requirePrestador(req);
    await this.autogestionService.eliminarServicio(user.sub, id);
  }

  /**
   * Role guard: only a prestador owns a self-managed profile. Clientes and
   * administradores are rejected with 403 (not 404) — the /me surface itself
   * exists, but the caller's role has no prestador identity here.
   */
  private requirePrestador(req: Request): JwtPayload {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.PRESTADOR) {
      throw new ForbiddenException(
        'Only prestadores can manage a prestador profile.',
      );
    }
    return user;
  }
}
