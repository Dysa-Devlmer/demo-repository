import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  Length,
} from 'class-validator';
import {
  ReportType,
  ReportFormat,
  ReportSchedule,
  ReportStatus,
} from '../../entities/report.entity';

export class CreateReportDto {
  @IsString()
  @Length(1, 200)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @IsOptional()
  @IsEnum(ReportSchedule)
  schedule?: ReportSchedule;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsArray()
  @IsString({ each: true })
  metrics: string[];

  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @IsOptional()
  @IsString()
  dateRange?: string;
}
