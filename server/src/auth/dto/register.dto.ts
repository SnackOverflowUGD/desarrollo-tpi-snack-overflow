import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RegistrableRole } from '../domain/registrable-role.enum.js';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  // RN-REG-01: only `cliente` / `prestador` are self-registrable.
  // `administrador` is rejected at the DTO boundary (422 via global pipe).
  @IsEnum(RegistrableRole)
  @IsNotEmpty()
  role: RegistrableRole;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  trade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  localidad?: string;
}
