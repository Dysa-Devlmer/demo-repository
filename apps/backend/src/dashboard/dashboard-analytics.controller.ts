import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { DashboardAnalyticsService } from './dashboard-analytics.service';
import type { Period } from './dashboard-analytics.service';

@ApiTags('Dashboard Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard/analytics')
export class DashboardAnalyticsController {
  constructor(private readonly analyticsService: DashboardAnalyticsService) {}

  @Get('trends')
  @RequirePermissions('dashboard.read')
  @ApiOperation({
    summary: 'Get conversation and order trends',
    description: 'Returns trends data for conversations and orders grouped by period',
  })
  @ApiQuery({
    name: 'period',
    enum: ['7d', '30d', '90d'],
    required: false,
    description: 'Time period for trends (7 days, 30 days, or 90 days)',
  })
  @ApiResponse({ status: 200, description: 'Returns trend data points' })
  async getTrends(@Query('period') period?: Period) {
    return this.analyticsService.getTrends(period || '7d');
  }

  @Get('revenue')
  @RequirePermissions('dashboard.read')
  @ApiOperation({
    summary: 'Get revenue by period',
    description: 'Returns revenue data grouped by period (daily, weekly, or monthly)',
  })
  @ApiQuery({
    name: 'period',
    enum: ['7d', '30d', '90d'],
    required: false,
    description: 'Time period for revenue data',
  })
  @ApiResponse({ status: 200, description: 'Returns revenue data points' })
  async getRevenue(@Query('period') period?: Period) {
    return this.analyticsService.getRevenueByPeriod(period || '7d');
  }

  @Get('orders-by-status')
  @RequirePermissions('dashboard.read')
  @ApiOperation({
    summary: 'Get order distribution by status',
    description: 'Returns the count of orders grouped by their status',
  })
  @ApiResponse({ status: 200, description: 'Returns order distribution' })
  async getOrdersByStatus() {
    return this.analyticsService.getOrdersByStatus();
  }

  @Get('customers-by-source')
  @RequirePermissions('dashboard.read')
  @ApiOperation({
    summary: 'Get customer distribution by source',
    description: 'Returns the count of customers grouped by acquisition source',
  })
  @ApiResponse({ status: 200, description: 'Returns customer source distribution' })
  async getCustomersBySource() {
    return this.analyticsService.getCustomersBySource();
  }
}
