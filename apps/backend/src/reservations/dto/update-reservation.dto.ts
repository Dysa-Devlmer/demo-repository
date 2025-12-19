import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateReservationDto {
  @IsOptional()
  @IsInt()
  customerId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  people?: number;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsInt()
  table_number?: number;

  @IsOptional()
  @IsString()
  occasion?: string;

  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'])
  status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  special_requests?: string;
}
