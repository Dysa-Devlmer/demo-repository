import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecurityController } from './security.controller';
import { AuditMiddleware } from '../common/middleware/audit.middleware';
import { AuditLog } from '../common/entities/audit-log.entity';
import { AuditReviewService } from '../common/services/audit-review.service';
import { SecurityAlertsService } from './services/security-alerts.service';
import { LogArchivingService } from './services/log-archiving.service';
import { ComplianceReportsService } from './services/compliance-reports.service';
import { CommonModule } from '../common/common.module';
import { TwilioModule } from '../modules/twilio/twilio.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), CommonModule, TwilioModule],
  controllers: [SecurityController],
  providers: [
    AuditMiddleware,
    AuditReviewService,
    SecurityAlertsService,
    LogArchivingService,
    ComplianceReportsService,
  ],
  exports: [
    AuditMiddleware,
    AuditReviewService,
    SecurityAlertsService,
    LogArchivingService,
    ComplianceReportsService,
  ],
})
export class SecurityModule {}
