import { IsArray, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateRatingDto {
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating cannot exceed 5' })
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Review cannot exceed 1000 characters' })
  review?: string;

  @IsOptional()
  @IsArray({ message: 'Photos must be an array of image URLs' })
  @IsString({ each: true, message: 'Each photo must be a valid string URL' })
  photos?: string[];
}
