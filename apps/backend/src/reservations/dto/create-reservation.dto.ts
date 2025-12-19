import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateReservationDto {
  @IsInt()
  customerId: number;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  time?: string;

  @IsInt()
  @Min(1)
  people: number;

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
  @IsEnum(['pending', 'confirmed', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'cancelled';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  special_requests?: string;
}
