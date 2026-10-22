import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../../common/interfaces/user-role.enum.js';

export class GoogleLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Google ID token (credential) is required' })
  idToken: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be USER or OWNER' })
  role?: UserRole;
}
