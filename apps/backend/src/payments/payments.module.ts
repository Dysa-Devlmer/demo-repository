import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MercadoPagoService } from './mercadopago.service';
import { User } from '../auth/entities/user.entity';
import { Payment } from '../entities/payment.entity';
import { Subscription } from '../entities/subscription.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Payment, Subscription]),
    ConfigModule,
    CommonModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoService],
  exports: [PaymentsService, MercadoPagoService],
})
export class PaymentsModule {}
