import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardSnapshotController } from './dashboard-snapshot.controller';
import { DashboardSnapshotService } from './dashboard-snapshot.service';
import { DashboardAnalyticsController } from './dashboard-analytics.controller';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import { DashboardSnapshot } from '../entities/dashboard-snapshot.entity';
import { Order } from '../entities/order.entity';
import { Customer } from '../entities/customer.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { Reservation } from '../entities/reservation.entity';
import { Conversation } from '../entities/conversation.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DashboardSnapshot,
      Order,
      Customer,
      MenuItem,
      Reservation,
      Conversation,
    ]),
    CommonModule,
  ],
  controllers: [DashboardSnapshotController, DashboardAnalyticsController],
  providers: [DashboardSnapshotService, DashboardAnalyticsService],
  exports: [DashboardSnapshotService, DashboardAnalyticsService],
})
export class DashboardModule {}
