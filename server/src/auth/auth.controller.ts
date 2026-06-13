import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './application/auth.service.js';
import { RegistrationService } from './application/registration.service.js';
import { ForgotPasswordDto } from './dto/forgot-password.dto.js';
import { GenericMessageDto } from './dto/generic-message.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { LoginResponseDto } from './dto/login-response.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import { RegisterResponseDto } from './dto/register-response.dto.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly registrationService: RegistrationService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.registrationService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<GenericMessageDto> {
    await this.authService.requestPasswordReset(dto.email);
    return { message: 'If that email is registered, a recovery link has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<GenericMessageDto> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { message: 'Password updated successfully.' };
  }
}
