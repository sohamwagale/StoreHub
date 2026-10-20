import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../interfaces/user-role.enum.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: (UserRole | 'USER' | 'OWNER')[]) => SetMetadata(ROLES_KEY, roles);
