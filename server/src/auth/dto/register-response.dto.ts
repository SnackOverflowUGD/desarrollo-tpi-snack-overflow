import { ProviderStatus } from '../domain/provider-status.enum.js';
import { UserRole } from '../domain/user-role.enum.js';
import { UserStatus } from '../domain/user-status.enum.js';

export class RegisterResponseDto {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  providerStatus: ProviderStatus | null;
  message: string;
}
