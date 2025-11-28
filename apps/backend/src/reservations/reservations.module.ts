import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReservationsService } from "./reservations.service";
import { ReservationsController } from "./reservations.controller";
import { Reservation } from "../entities/reservation.entity";
import { Customer } from "../entities/customer.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Customer])],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
