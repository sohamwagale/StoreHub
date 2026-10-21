import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty({ message: 'Store name is required' })
  @MinLength(2, { message: 'Store name must be at least 2 characters' })
  @MaxLength(100, { message: 'Store name cannot exceed 100 characters' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Store address is required' })
  @MaxLength(400, { message: 'Store address cannot exceed 400 characters' })
  address: string;

  @IsString()
  @IsNotEmpty({ message: 'Store category is required' })
  category?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  latitude?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  longitude?: number;

  @IsOptional()
  @IsArray({ message: 'Photos must be an array of image URLs' })
  @IsString({ each: true, message: 'Each photo must be a valid string URL' })
  photos?: string[];

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description cannot exceed 2000 characters' })
  description?: string;

  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(50, { message: 'Phone cannot exceed 50 characters' })
  phone?: string;

  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  @MaxLength(255, { message: 'Website cannot exceed 255 characters' })
  website?: string;

  @IsOptional()
  @IsString({ message: 'Opening hours summary must be a string' })
  @MaxLength(100, { message: 'Opening hours cannot exceed 100 characters' })
  openingHours?: string;

  @IsOptional()
  schedule?: Record<string, string>;

  @IsOptional()
  @IsArray({ message: 'Highlights must be an array' })
  highlights?: Array<{ title: string; description: string }>;

  @IsOptional()
  @IsString({ message: 'Parking info must be a string' })
  @MaxLength(255, { message: 'Parking info cannot exceed 255 characters' })
  parkingInfo?: string;

  @IsOptional()
  @IsString({ message: 'Support email must be a string' })
  @MaxLength(100, { message: 'Support email cannot exceed 100 characters' })
  supportEmail?: string;

  @IsOptional()
  @IsString({ message: 'Merchant notice must be a string' })
  @MaxLength(500, { message: 'Merchant notice cannot exceed 500 characters' })
  merchantNotice?: string;
}
