import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class WebhookPaymentDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNotEmpty()
  data: {
    id: string;
  };

  @IsNumber()
  @IsOptional()
  date_created?: number;

  @IsString()
  @IsOptional()
  user_id?: string;
}
