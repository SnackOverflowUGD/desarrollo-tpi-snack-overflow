import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { JwtPayload } from '../auth/strategies/jwt.strategy.js';
import { ContratacionService } from './application/contratacion.service.js';
import { CreateContratacionDto } from './dto/create-contratacion.dto.js';
import { ContratacionResponseDto } from './dto/contratacion-response.dto.js';

@Controller('contrataciones')
@UseGuards(AuthGuard('jwt'))
export class ContratacionController {
  constructor(private readonly contratacionService: ContratacionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateContratacionDto,
    @Req() req: Request,
  ): Promise<ContratacionResponseDto> {
    const user = req.user as JwtPayload;
    return this.contratacionService.create(dto, user.sub, user.role);
  }
}
