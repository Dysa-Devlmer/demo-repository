import { IsString, IsEmail, IsOptional, IsNotEmpty, IsBoolean, IsIn } from 'class-validator';

export class CreateRegistrationDto {
  // Restaurant Info
  @IsString()
  @IsNotEmpty()
  restaurantName: string;

  @IsString()
  @IsNotEmpty()
  ownerName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  // Subdomain
  @IsString()
  @IsNotEmpty()
  subdomain: string;

  // Plan Selection
  @IsString()
  @IsIn(['saas-multi', 'saas-dedicated', 'on-premise'])
  plan: string;

  // Payment Method
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  // Terms
  @IsBoolean()
  agreedToTerms: boolean;

  @IsBoolean()
  agreedToPrivacy: boolean;
}
