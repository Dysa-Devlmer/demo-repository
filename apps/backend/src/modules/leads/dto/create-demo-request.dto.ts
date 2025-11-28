import { IsString, IsEmail, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateDemoRequestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  restaurant: string;

  @IsString()
  @IsOptional()
  employees?: string;

  @IsString()
  @IsOptional()
  preferredDate?: string;

  @IsString()
  @IsOptional()
  preferredTime?: string;

  @IsString()
  @IsOptional()
  message?: string;
}
