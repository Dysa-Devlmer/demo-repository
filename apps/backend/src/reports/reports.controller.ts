import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query,
  Res,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles, ROLES } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { ReportsService } from './reports.service';
import { ReportStorageService } from './report-storage.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportType, ReportStatus } from '../entities/report.entity';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly storageService: ReportStorageService,
  ) {}

  @Post()
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Create new report configuration',
    description: 'Create a new report configuration. Requires admin, manager or staff role.',
  })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({
    status: 201,
    description: 'Report configuration created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  create(@Body() dto: CreateReportDto, @User() user: any) {
    return this.reportsService.create(dto, user.id);
  }

  @Get()
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Get all report configurations',
    description:
      'Retrieve a list of all report configurations. Supports filtering by type and status. Requires admin, manager or staff role.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ReportType,
    description: 'Filter by report type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ReportStatus,
    description: 'Filter by report status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of report configurations retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  findAll(
    @Query('type') type?: ReportType,
    @Query('status') status?: ReportStatus,
    @User() user?: any,
  ) {
    return this.reportsService.findAll({ type, status });
  }

  @Get('statistics')
  @RequireRoles(ROLES.ADMIN)
  @ApiOperation({
    summary: 'Get reports statistics',
    description: 'Get comprehensive statistics about all reports. Requires admin role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  getStatistics() {
    return this.reportsService.getStatistics();
  }

  @Get('scheduled')
  @RequireRoles(ROLES.ADMIN)
  @ApiOperation({
    summary: 'Get scheduled reports',
    description: 'Get all reports that have automated schedules. Requires admin role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Scheduled reports retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  getScheduledReports() {
    return this.reportsService.getScheduledReports();
  }

  @Get('type/:type')
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Get reports by type',
    description: 'Get all active reports of a specific type. Requires admin, manager or staff role.',
  })
  @ApiParam({
    name: 'type',
    enum: ReportType,
    description: 'Report type',
  })
  @ApiResponse({
    status: 200,
    description: 'Reports of specified type retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  getByType(@Param('type') type: ReportType) {
    return this.reportsService.getByType(type);
  }

  @Get(':id')
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Get report configuration by ID',
    description:
      'Retrieve detailed information about a specific report configuration. Requires admin, manager or staff role.',
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Report configuration retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Post(':id/generate')
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Generate report',
    description:
      'Generate a report based on its configuration. Returns the URL of the generated file. Requires admin, manager or staff role.',
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Report generated successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL of the generated report file' },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Report is not active' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  generate(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.generate(id);
  }

  @Put(':id')
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Update report configuration',
    description: 'Update an existing report configuration. Requires admin, manager or staff role.',
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiBody({ type: UpdateReportDto })
  @ApiResponse({
    status: 200,
    description: 'Report configuration updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReportDto) {
    return this.reportsService.update(id, dto);
  }

  @Put(':id/archive')
  @RequireRoles(ROLES.ADMIN)
  @ApiOperation({
    summary: 'Archive report',
    description:
      'Archive a report configuration (soft delete). Archived reports can be restored. Requires admin role.',
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Report archived successfully',
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.archive(id);
  }

  @Get('files/:filename')
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Download generated report file',
    description:
      'Download a previously generated report file. Requires admin, manager or staff role.',
  })
  @ApiParam({ name: 'filename', description: 'Report filename', type: String })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
  })
  @ApiResponse({ status: 404, description: 'File not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async downloadFile(@Param('filename') filename: string, @Res() res: Response) {
    try {
      // Check if file exists
      if (!this.storageService.fileExists(filename)) {
        throw new NotFoundException('File not found');
      }

      // Get file buffer
      const fileBuffer = await this.storageService.retrieveReport(filename);

      // Determine content type based on file extension
      const extension = filename.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';

      switch (extension) {
        case 'pdf':
          contentType = 'application/pdf';
          break;
        case 'xlsx':
        case 'excel':
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'csv':
          contentType = 'text/csv';
          break;
      }

      // Set headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', fileBuffer.length);

      // Send file
      res.send(fileBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException('Failed to retrieve file');
    }
  }

  @Delete(':id')
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
  @ApiOperation({
    summary: 'Delete report configuration',
    description:
      'Permanently delete a report configuration from the system. Requires admin or manager role. This action cannot be undone.',
  })
  @ApiParam({ name: 'id', description: 'Report ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Report configuration deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin role' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }
}
