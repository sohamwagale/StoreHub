import { IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(3, 60, { message: 'Name must be between 3 and 60 characters' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400, { message: 'Address cannot exceed 400 characters' })
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Bio cannot exceed 300 characters' })
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
