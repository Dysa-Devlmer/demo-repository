// apps/backend/src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;
}
