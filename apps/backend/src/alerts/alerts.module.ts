import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { AlertInboxEntity } from './entities/alert-inbox.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlertInboxEntity])],
  controllers: [AlertsController],
  providers: [AlertsService],
})
export class AlertsModule {}
