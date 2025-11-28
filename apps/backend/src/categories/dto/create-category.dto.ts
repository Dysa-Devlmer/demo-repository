import { IsString, IsOptional, IsEnum, IsInt, IsBoolean, MinLength, MaxLength } from 'class-validator';
import { PreparationArea } from '../../entities/category.entity';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  icon?: string;

  @IsEnum(PreparationArea)
  preparation_area: PreparationArea;

  @IsOptional()
  @IsInt()
  display_order?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
