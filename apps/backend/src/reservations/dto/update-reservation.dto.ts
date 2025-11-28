import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateReservationDto {
  @IsOptional()
  @IsInt()
  customerId?: number;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  people?: number;

  @IsOptional()
  @IsEnum(["pending", "confirmed", "seated", "completed", "cancelled", "no_show"])
  status?: "pending" | "confirmed" | "seated" | "completed" | "cancelled" | "no_show";

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}
