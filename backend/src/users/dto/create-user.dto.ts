import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { UserRole } from '../../common/interfaces/user-role.enum.js';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 60, { message: 'Name must be between 5 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(400, { message: 'Address cannot exceed 400 characters' })
  address: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(16, { message: 'Password cannot exceed 16 characters' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`])/, {
    message: 'Password must contain at least one special character',
  })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be either USER or OWNER' })
  role?: UserRole;
}
