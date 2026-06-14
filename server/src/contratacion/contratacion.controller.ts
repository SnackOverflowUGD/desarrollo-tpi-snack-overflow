import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { JwtPayload } from '../auth/strategies/jwt.strategy.js';
import { ContratacionService } from './application/contratacion.service.js';
import { CreateContratacionDto } from './dto/create-contratacion.dto.js';
import { ContratacionResponseDto } from './dto/contratacion-response.dto.js';
import { ContratacionListItemDto } from './dto/contratacion-list-item.dto.js';
import { ContratacionDetailDto } from './dto/contratacion-detail.dto.js';
import { ListContratacionesQueryDto } from './dto/list-contrataciones-query.dto.js';
import { SendProposalDto } from './dto/send-proposal.dto.js';

@Controller('contrataciones')
@UseGuards(AuthGuard('jwt'))
export class ContratacionController {
  constructor(private readonly contratacionService: ContratacionService) {}

  /**
   * UC08 (ADR-08-01, REQ-01/08): role-aware inbox.
   *
   * `sub`/`role` are derived from the JWT (req.user), NEVER from the query —
   * the only accepted query param is `?estado=`. AuthGuard('jwt') at the
   * controller level already returns 401 without a session, so no extra code
   * is needed here.
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async list(
    @Query() query: ListContratacionesQueryDto,
    @Req() req: Request,
  ): Promise<ContratacionListItemDto[]> {
    const user = req.user as JwtPayload;
    return this.contratacionService.list(user.sub, user.role, query);
  }

  /**
   * UC09 detail + state timeline. `sub`/`role` are derived from the JWT; the
   * service enforces the participant guard (404 for non-participants — never
   * leaks existence). Declared AFTER `@Get()` so the static inbox route is not
   * shadowed by this dynamic `:id` route.
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getDetail(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ContratacionDetailDto> {
    const user = req.user as JwtPayload;
    return this.contratacionService.getDetail(id, user.sub, user.role);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateContratacionDto,
    @Req() req: Request,
  ): Promise<ContratacionResponseDto> {
    const user = req.user as JwtPayload;
    return this.contratacionService.create(dto, user.sub, user.role);
  }

  @Post(':id/proposal')
  @HttpCode(HttpStatus.OK)
  async sendProposal(
    @Param('id') id: string,
    @Body() dto: SendProposalDto,
    @Req() req: Request,
  ): Promise<ContratacionResponseDto> {
    const user = req.user as JwtPayload;
    return this.contratacionService.sendProposal(id, dto, user.sub, user.role);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ContratacionResponseDto> {
    const user = req.user as JwtPayload;
    return this.contratacionService.reject(id, user.sub, user.role);
  }

  // ── UC09 transitions: sub/role derived from req.user, NEVER the body ──

  @Post(':id/confirm')
  @HttpCode(HttpStatus.OK)
  async confirm(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ContratacionResponseDto> {
    const user = req.user as JwtPayload;
    return this.contratacionService.confirm(id, user.sub, user.role);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ContratacionResponseDto> {
    const user = req.user as JwtPayload;
    return this.contratacionService.start(id, user.sub, user.role);
  }

  @Post(':id/finish')
  @HttpCode(HttpStatus.OK)
  async finish(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ContratacionResponseDto> {
    const user = req.user as JwtPayload;
    return this.contratacionService.finish(id, user.sub, user.role);
  }

  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ContratacionResponseDto> {
    const user = req.user as JwtPayload;
    return this.contratacionService.cancel(id, user.sub, user.role);
  }
}
