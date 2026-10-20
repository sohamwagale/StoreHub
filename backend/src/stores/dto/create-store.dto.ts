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
}
