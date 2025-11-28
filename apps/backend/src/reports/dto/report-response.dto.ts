import {
  ReportType,
  ReportFormat,
  ReportSchedule,
  ReportStatus,
} from '../../entities/report.entity';

export class ReportResponseDto {
  id: number;
  name: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  schedule: ReportSchedule;
  status: ReportStatus;
  metrics: string[];
  filters?: Record<string, any>;
  dateRange?: string;
  lastGenerated?: Date;
  lastGeneratedUrl?: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
}
