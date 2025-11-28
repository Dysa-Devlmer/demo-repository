import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum PlanType {
  SAAS_MULTI = 'saas-multi',
  SAAS_MULTI_TENANT = 'saas-multi-tenant', // Alias for compatibility
  SAAS_DEDICATED = 'saas-dedicated',
  ON_PREMISE = 'on-premise',
}

export enum BillingPeriod {
  MONTHLY = 'monthly',
  ANNUAL = 'annual',
}

export enum PaymentMethod {
  CARD = 'card',
  TRANSFER = 'transfer',
  INVOICE = 'invoice',
}

export class CreatePaymentDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  rut: string;

  @IsString()
  @IsNotEmpty()
  companyName: string;

  // For compatibility with old code
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsEnum(PlanType)
  @IsNotEmpty()
  planId: PlanType;

  // Alias for old code compatibility
  @IsEnum(PlanType)
  @IsOptional()
  plan?: PlanType;

  @IsString()
  @IsNotEmpty()
  planName: string;

  @IsEnum(BillingPeriod)
  @IsNotEmpty()
  billingPeriod: BillingPeriod;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  phone?: string;
}
