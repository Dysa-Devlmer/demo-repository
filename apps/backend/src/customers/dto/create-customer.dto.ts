import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  IsEnum,
  IsObject,
  IsBoolean,
} from "class-validator";
import { CustomerSource } from "../../entities/customer.entity";

export class CreateCustomerDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  phone?: string;

  @IsOptional()
  @IsString()
  @Length(7, 20)
  whatsapp_phone?: string;

  @IsOptional()
  @IsEnum(CustomerSource)
  source?: CustomerSource;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsObject()
  preferences?: {
    dietary_restrictions?: string[];
    favorite_dishes?: string[];
    preferred_contact_method?: string;
    language?: string;
  };

  @IsOptional()
  @IsObject()
  metadata?: {
    first_visit?: Date;
    total_orders?: number;
    total_spent?: number;
    loyalty_points?: number;
    notes?: string;
  };

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
