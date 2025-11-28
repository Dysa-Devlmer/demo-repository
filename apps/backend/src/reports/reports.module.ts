import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportGeneratorService } from './report-generator.service';
import { ReportStorageService } from './report-storage.service';
import { Report } from '../entities/report.entity';
import { Customer } from '../entities/customer.entity';
import { Order } from '../entities/order.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { Reservation } from '../entities/reservation.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Report, Customer, Order, MenuItem, Reservation]),
    CommonModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportGeneratorService, ReportStorageService],
  exports: [ReportsService, ReportGeneratorService, ReportStorageService],
})
export class ReportsModule {}
