import { IsNotEmpty, Length, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters' })
  @Matches(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  @Matches(/[0-9]/, { message: 'Password must contain at least one number' })
  @Matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/, {
    message: 'Password must contain at least one special character',
  })
  newPassword: string;
}
