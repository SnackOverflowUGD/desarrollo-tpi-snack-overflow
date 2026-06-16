import {
  ConflictException,
  Inject,
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import * as argon2 from 'argon2';
import { RegisterDto } from '../dto/register.dto.js';
import { RegisterResponseDto } from '../dto/register-response.dto.js';
import {
  type IRegulatedTradeRepository,
  REGULATED_TRADE_REPOSITORY,
} from '../ports/regulated-trade.repository.port.js';
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '../ports/user.repository.port.js';
import {
  type IPrestadorRepository,
  PRESTADOR_REPOSITORY,
  CreatePrestadorData,
} from '../ports/prestador-repository.port.js';
import { ProviderStatus } from '../domain/provider-status.enum.js';
import { UserRole } from '../domain/user-role.enum.js';
import { UserStatus } from '../domain/user-status.enum.js';
import { getCoordsForLocalidad } from '../../catalogo/domain/cobertura-util.js';
import { CoberturaZona } from '../../catalogo/domain/cobertura-zona.value.js';

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(REGULATED_TRADE_REPOSITORY)
    private readonly regulatedTradeRepo: IRegulatedTradeRepository,
    @Inject(PRESTADOR_REPOSITORY)
    private readonly prestadorRepo: IPrestadorRepository,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Capitalizes the first letter of each word separated by hyphens or spaces.
   * E.g., "electricista" → "Electricista", "tecnico-refrigeracion" → "Técnico Refrigeración"
   * This matches the client-side TRADES label format for server-side categoria mapping.
   */
  private capitalizeTradeLabel(trade: string): string {
    return trade
      .split(/[- ]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    // Step 1: Normalize email to lowercase
    const normalizedEmail = dto.email.toLowerCase();

    // RegistrableRole and UserRole share their string values; bridge the
    // nominal enum gap once so the rest of the flow works in UserRole terms.
    const role = dto.role as unknown as UserRole;

    // Step 1b: Defense in depth (RN-REG-01, ESC-08). The DTO already restricts
    // role to cliente/prestador, but the service must not trust its input: even
    // if `administrador` slips past the boundary, reject it as a validation
    // failure (422) before any persistence happens. Privilege-escalation guard.
    if (role === UserRole.ADMINISTRADOR) {
      this.logger.warn('REGISTER_REJECTED_NON_REGISTRABLE_ROLE');
      throw new UnprocessableEntityException(
        'Role is not allowed for self-registration.',
      );
    }

    // Step 2: Check duplicate email (ESC-06, RN-REG-02)
    const existing = await this.userRepo.findByEmail(normalizedEmail);
    if (existing) {
      this.logger.log('REGISTER_DUPLICATE_EMAIL');
      throw new ConflictException('An account with this email already exists.');
    }

    // Step 3: Determine providerStatus and prestador data
    let providerStatus: ProviderStatus | null = null;
    let prestadorData: CreatePrestadorData | null = null;

    if (role === UserRole.PRESTADOR) {
      // trade is required for prestador (validated in service per design §5.4)
      if (!dto.trade) {
        throw new UnprocessableEntityException(
          'Trade is required for prestador role.',
        );
      }

      // localidad is required for prestador (ESC-LOCALIDAD-01, ESC-LOCALIDAD-02)
      if (!dto.localidad) {
        throw new UnprocessableEntityException(
          'Localidad is required for prestador role.',
        );
      }

      // Validate localidad is known (ESC-LOCALIDAD-03)
      let coords: { lat: number; lng: number };
      try {
        coords = getCoordsForLocalidad(dto.localidad);
      } catch {
        throw new UnprocessableEntityException(
          `Unknown localidad: "${dto.localidad}".`,
        );
      }

      const regulated = await this.regulatedTradeRepo.findByTradeName(
        dto.trade.toLowerCase(),
      );
      providerStatus = regulated
        ? ProviderStatus.PENDIENTE_HABILITACION
        : ProviderStatus.HABILITADO;

      // Build categoria from trade value (capitalized label for search matching)
      const categoria = this.capitalizeTradeLabel(dto.trade);

      // Generate zona_cobertura as 16.5km circle around localidad
      const zonaCobertura = CoberturaZona.fromCircle(
        { lat: coords.lat, lng: coords.lng },
        16.5,
        dto.localidad,
      ).toJSON();

      // Build prestador data
      prestadorData = {
        id: '', // Will be set to user.id after user creation
        nombreCompleto: `${dto.name} ${dto.lastName}`,
        oficios: [dto.trade],
        categoria,
        localidad: dto.localidad,
        zonaCobertura,
        cuentaActiva: true,
        visible: providerStatus === ProviderStatus.HABILITADO,
        disponibilidadResumen: null,
        calificacionPromedio: 0,
        cantidadResenas: 0,
      };
    }
    // else role === 'cliente' → providerStatus stays null (RN-REG-06, ESC-01)

    // Step 4: Hash password with Argon2id (RN-REG-04)
    const passwordHash = await argon2.hash(dto.password);

    // Step 5: Create user + prestador in a transaction
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // Create user
      const user = await this.userRepo.create({
        name: dto.name,
        lastName: dto.lastName,
        email: normalizedEmail,
        phone: dto.phone,
        passwordHash,
        role,
        status: UserStatus.ACTIVO,
        providerStatus,
      });

      // Create prestador if role is prestador
      if (prestadorData) {
        prestadorData.id = user.id;
        await this.prestadorRepo.create(prestadorData, qr);
      }

      await qr.commitTransaction();

      this.logger.log(
        `REGISTER_SUCCESS userId=${user.id} role=${user.role}${prestadorData ? ' + prestador' : ''}`,
      );

      // Step 6: Build response
      const response = new RegisterResponseDto();
      response.id = user.id;
      response.email = user.email;
      response.role = user.role;
      response.status = user.status;
      response.providerStatus = user.providerStatus;

      if (providerStatus === ProviderStatus.PENDIENTE_HABILITACION) {
        response.message =
          'Cuenta creada. Verificá tu matrícula profesional para activar tu perfil de prestador.';
      } else {
        response.message = 'Account created successfully.';
      }

      return response;
    } catch (error) {
      await qr.rollbackTransaction();
      throw error;
    } finally {
      await qr.release();
    }
  }
}
