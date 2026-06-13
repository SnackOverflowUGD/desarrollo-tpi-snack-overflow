import { User } from '../domain/user.entity.js';
import { ProviderStatus } from '../domain/provider-status.enum.js';
import { UserRole } from '../domain/user-role.enum.js';
import { UserStatus } from '../domain/user-status.enum.js';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export interface CreateUserData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  providerStatus: ProviderStatus | null;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  updatePasswordHash(userId: string, newHash: string): Promise<void>;
  create(data: CreateUserData): Promise<User>;
}
