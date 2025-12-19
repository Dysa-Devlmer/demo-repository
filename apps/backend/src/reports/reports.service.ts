import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Report,
  ReportType,
  ReportFormat,
  ReportSchedule,
  ReportStatus,
} from '../entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportResponseDto } from './dto/report-response.dto';
import { ReportGeneratorService } from './report-generator.service';
import { ReportStorageService } from './report-storage.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportsRepo: Repository<Report>,
    private readonly generatorService: ReportGeneratorService,
    private readonly storageService: ReportStorageService
  ) {}

  /**
   * Create a new report configuration
   */
  async create(dto: CreateReportDto, userId: number): Promise<ReportResponseDto> {
    // Validate metrics array is not empty
    if (!dto.metrics || dto.metrics.length === 0) {
      throw new BadRequestException('At least one metric must be specified');
    }

    const report = this.reportsRepo.create({
      name: dto.name,
      description: dto.description,
      type: dto.type,
      format: dto.format || ReportFormat.PDF,
      schedule: dto.schedule || ReportSchedule.MANUAL,
      status: dto.status || ReportStatus.ACTIVE,
      metrics: dto.metrics,
      filters: dto.filters,
      dateRange: dto.dateRange,
      createdBy: userId,
    });

    const saved = await this.reportsRepo.save(report);

    this.logger.log(
      `Report "${saved.name}" created by user ${userId} - Type: ${saved.type}, Format: ${saved.format}`
    );

    return this.toResponseDto(saved);
  }

  /**
   * Find all reports with optional filtering
   */
  async findAll(filters?: {
    type?: ReportType;
    status?: ReportStatus;
    userId?: number;
  }): Promise<ReportResponseDto[]> {
    const queryBuilder = this.reportsRepo
      .createQueryBuilder('report')
      .orderBy('report.updatedAt', 'DESC');

    if (filters?.type) {
      queryBuilder.andWhere('report.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      queryBuilder.andWhere('report.status = :status', { status: filters.status });
    }

    if (filters?.userId) {
      queryBuilder.andWhere('report.createdBy = :userId', { userId: filters.userId });
    }

    const reports = await queryBuilder.getMany();
    return reports.map((report) => this.toResponseDto(report));
  }

  /**
   * Find one report by ID
   */
  async findOne(id: number): Promise<ReportResponseDto> {
    const report = await this.reportsRepo.findOne({
      where: { id },
    });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    return this.toResponseDto(report);
  }

  /**
   * Update report configuration
   */
  async update(id: number, dto: UpdateReportDto): Promise<ReportResponseDto> {
    const report = await this.reportsRepo.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    // Validate metrics if provided
    if (dto.metrics && dto.metrics.length === 0) {
      throw new BadRequestException('At least one metric must be specified');
    }

    Object.assign(report, dto);

    const updated = await this.reportsRepo.save(report);

    this.logger.log(`Report ${id} "${updated.name}" updated`);

    return this.toResponseDto(updated);
  }

  /**
   * Archive report (soft delete)
   */
  async archive(id: number): Promise<ReportResponseDto> {
    const report = await this.reportsRepo.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    report.status = ReportStatus.ARCHIVED;
    const archived = await this.reportsRepo.save(report);

    this.logger.log(`Report ${id} "${archived.name}" archived`);

    return this.toResponseDto(archived);
  }

  /**
   * Hard delete report (admin only)
   */
  async remove(id: number): Promise<void> {
    const report = await this.reportsRepo.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    await this.reportsRepo.remove(report);

    this.logger.warn(`Report ${id} "${report.name}" permanently deleted`);
  }

  /**
   * Generate report based on configuration
   * Generates actual PDF, Excel, or CSV file
   */
  async generate(id: number): Promise<{ url: string; generatedAt: Date }> {
    const report = await this.reportsRepo.findOne({ where: { id } });

    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }

    if (report.status !== ReportStatus.ACTIVE) {
      throw new BadRequestException('Only active reports can be generated');
    }

    try {
      // 1. Generate report file using ReportGeneratorService
      this.logger.log(`Generating ${report.format} report: ${report.name}`);
      const fileBuffer = await this.generatorService.generateReport(report);

      // 2. Store file using ReportStorageService
      const storedFile = await this.storageService.storeReport(
        report.id,
        report.format,
        fileBuffer
      );

      // 3. Update report with generation info
      const generatedAt = new Date();
      report.lastGenerated = generatedAt;
      report.lastGeneratedUrl = storedFile.url;
      await this.reportsRepo.save(report);

      this.logger.log(
        `Report ${id} "${report.name}" generated successfully - Format: ${report.format}, Size: ${storedFile.size} bytes, URL: ${storedFile.url}`
      );

      return {
        url: storedFile.url,
        generatedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to generate report ${id} "${report.name}"`, error);
      throw new BadRequestException(`Failed to generate report: ${error.message}`);
    }
  }

  /**
   * Get reports by type
   */
  async getByType(type: ReportType): Promise<ReportResponseDto[]> {
    const reports = await this.reportsRepo.find({
      where: { type, status: ReportStatus.ACTIVE },
      order: { updatedAt: 'DESC' },
    });

    return reports.map((report) => this.toResponseDto(report));
  }

  /**
   * Get scheduled reports
   */
  async getScheduledReports(): Promise<ReportResponseDto[]> {
    const reports = await this.reportsRepo
      .createQueryBuilder('report')
      .where('report.schedule != :manual', { manual: ReportSchedule.MANUAL })
      .andWhere('report.status = :active', { active: ReportStatus.ACTIVE })
      .orderBy('report.schedule', 'ASC')
      .getMany();

    return reports.map((report) => this.toResponseDto(report));
  }

  /**
   * Get reports statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    draft: number;
    archived: number;
    byType: Record<ReportType, number>;
    byFormat: Record<ReportFormat, number>;
    scheduled: number;
  }> {
    const [total, active, draft, archived] = await Promise.all([
      this.reportsRepo.count(),
      this.reportsRepo.count({ where: { status: ReportStatus.ACTIVE } }),
      this.reportsRepo.count({ where: { status: ReportStatus.DRAFT } }),
      this.reportsRepo.count({ where: { status: ReportStatus.ARCHIVED } }),
    ]);

    const allReports = await this.reportsRepo.find();

    const byType = {
      [ReportType.SALES]: 0,
      [ReportType.CUSTOMERS]: 0,
      [ReportType.MENU]: 0,
      [ReportType.RESERVATIONS]: 0,
      [ReportType.OPERATIONS]: 0,
      [ReportType.CUSTOM]: 0,
    };

    const byFormat = {
      [ReportFormat.PDF]: 0,
      [ReportFormat.EXCEL]: 0,
      [ReportFormat.CSV]: 0,
    };

    let scheduled = 0;

    allReports.forEach((report) => {
      byType[report.type]++;
      byFormat[report.format]++;
      if (report.schedule !== ReportSchedule.MANUAL) {
        scheduled++;
      }
    });

    return {
      total,
      active,
      draft,
      archived,
      byType,
      byFormat,
      scheduled,
    };
  }

  /**
   * Convert entity to response DTO
   */
  private toResponseDto(report: Report): ReportResponseDto {
    return {
      id: report.id,
      name: report.name,
      description: report.description,
      type: report.type,
      format: report.format,
      schedule: report.schedule,
      status: report.status,
      metrics: report.metrics,
      filters: report.filters,
      dateRange: report.dateRange,
      lastGenerated: report.lastGenerated,
      lastGeneratedUrl: report.lastGeneratedUrl,
      createdBy: report.createdBy,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    };
  }
}
