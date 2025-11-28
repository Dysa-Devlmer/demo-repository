import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  IsEnum,
  IsArray,
  IsObject,
  IsInt,
} from "class-validator";
import { MenuCategory, DietaryType } from "../../entities/menu-item.entity";

enum PreparationArea {
  KITCHEN = "kitchen",
  BAR = "bar",
  BOTH = "both",
}

export class CreateMenuItemDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsEnum(MenuCategory)
  category?: MenuCategory;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsEnum(PreparationArea)
  preparation_area?: PreparationArea;

  @IsOptional()
  @IsEnum(DietaryType)
  dietary_type?: DietaryType;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  preparationTime?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;
}
