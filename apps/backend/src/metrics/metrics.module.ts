import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';
import { ConnectivityProbe } from './connectivity.probe';

@Module({
  controllers: [MetricsController],
  providers: [MetricsService, ConnectivityProbe],
  exports: [MetricsService],
})
export class MetricsModule {}
