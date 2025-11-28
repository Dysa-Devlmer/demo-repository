import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export class CreateReservationDto {
  @IsInt()
  customerId: number;

  @IsDateString()
  date: string;

  @IsInt()
  @Min(1)
  people: number;

  @IsOptional()
  @IsEnum(["pending", "confirmed", "cancelled"])
  status?: "pending" | "confirmed" | "cancelled";

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  specialRequests?: string;
}
