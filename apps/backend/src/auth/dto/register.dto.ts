// apps/backend/src/auth/dto/register.dto.ts
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @IsString()
  @Matches(/^[^<>]*$/, { message: 'El nombre contiene caracteres no permitidos' })
  firstName: string;

  @IsString()
  @Matches(/^[^<>]*$/, { message: 'El apellido contiene caracteres no permitidos' })
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
