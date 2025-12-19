import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface AnalyticsConfig {
  enabled: boolean;
  retentionDays: number;
  reportGeneration: {
    enabled: boolean;
    formats: string[];
    scheduleDaily: boolean;
    scheduleWeekly: boolean;
    scheduleMonthly: boolean;
  };
  realTimeTracking: boolean;
  performanceMetrics: boolean;
}

export interface MetricData {
  timestamp: string;
  category: string;
  metric: string;
  value: number;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface BusinessReport {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  period: {
    start: string;
    end: string;
  };
  sections: ReportSection[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    customerCount: number;
    averageOrderValue: number;
    topProducts: Array<{ name: string; sales: number }>;
    performanceScore: number;
  };
  generatedAt: string;
  format: 'json' | 'pdf' | 'excel' | 'csv';
}

export interface ReportSection {
  title: string;
  type: 'chart' | 'table' | 'metric' | 'text';
  data: any;
  insights?: string[];
  recommendations?: string[];
}

export interface DashboardMetrics {
  realTime: {
    activeOrders: number;
    onlineCustomers: number;
    currentRevenue: number;
    systemLoad: number;
    responseTime: number;
  };
  today: {
    revenue: number;
    orders: number;
    customers: number;
    averageOrderTime: number;
    customerSatisfaction: number;
  };
  trends: {
    revenueGrowth: number;
    orderGrowth: number;
    customerGrowth: number;
    performanceChange: number;
  };
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private config: AnalyticsConfig;
  private metricsCache: MetricData[] = [];
  private reportsCache: BusinessReport[] = [];

  constructor() {
    this.config = {
      enabled: process.env.ANALYTICS_ENABLED === 'true' || true,
      retentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '365'),
      reportGeneration: {
        enabled: process.env.REPORT_GENERATION_ENABLED === 'true' || true,
        formats: ['json', 'pdf', 'excel', 'csv'],
        scheduleDaily: true,
        scheduleWeekly: true,
        scheduleMonthly: true,
      },
      realTimeTracking: true,
      performanceMetrics: true,
    };

    this.logger.log('Analytics service initialized', {
      enabled: this.config.enabled,
      retentionDays: this.config.retentionDays,
      realTimeTracking: this.config.realTimeTracking,
    });

    // Initialize with some sample data
    this.initializeSampleData();
  }

  // Track business metrics
  async trackMetric(data: Omit<MetricData, 'timestamp'>): Promise<void> {
    if (!this.config.enabled) return;

    const metric: MetricData = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    this.metricsCache.push(metric);

    // Keep cache size manageable
    if (this.metricsCache.length > 10000) {
      this.metricsCache = this.metricsCache.slice(-5000);
    }

    this.logger.debug('Metric tracked', {
      module: 'ANALYTICS',
      action: 'metric_tracked',
      metadata: {
        category: data.category,
        metric: data.metric,
        value: data.value,
      },
    });
  }

  // Get real-time dashboard metrics
  getDashboardMetrics(): DashboardMetrics {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Simulate real-time metrics based on cached data
    const todayMetrics = this.metricsCache.filter((m) => new Date(m.timestamp) >= todayStart);

    const revenueMetrics = todayMetrics.filter((m) => m.category === 'revenue');
    const orderMetrics = todayMetrics.filter((m) => m.category === 'orders');
    const customerMetrics = todayMetrics.filter((m) => m.category === 'customers');

    const todayRevenue = revenueMetrics.reduce((sum, m) => sum + m.value, 0);
    const todayOrders = orderMetrics.length;
    const todayCustomers = new Set(customerMetrics.map((m) => m.tags?.customerId)).size;

    return {
      realTime: {
        activeOrders: Math.floor(Math.random() * 15) + 5,
        onlineCustomers: Math.floor(Math.random() * 50) + 20,
        currentRevenue: todayRevenue,
        systemLoad: Math.random() * 30 + 20,
        responseTime: Math.random() * 200 + 100,
      },
      today: {
        revenue: todayRevenue,
        orders: todayOrders,
        customers: todayCustomers,
        averageOrderTime: Math.random() * 15 + 10,
        customerSatisfaction: 4.2 + Math.random() * 0.6,
      },
      trends: {
        revenueGrowth: (Math.random() - 0.3) * 30,
        orderGrowth: (Math.random() - 0.2) * 25,
        customerGrowth: Math.random() * 20,
        performanceChange: (Math.random() - 0.4) * 15,
      },
      alerts: [
        {
          type: 'info',
          message: 'Sistema funcionando correctamente',
          timestamp: new Date().toISOString(),
          priority: 'low',
        },
        {
          type: 'warning',
          message: 'Inventario bajo en producto #123',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          priority: 'medium',
        },
      ],
    };
  }

  // Generate business reports
  async generateReport(
    type: 'daily' | 'weekly' | 'monthly' | 'custom',
    startDate?: string,
    endDate?: string,
    format: 'json' | 'pdf' | 'excel' | 'csv' = 'json'
  ): Promise<BusinessReport> {
    const reportId = `report_${type}_${Date.now()}`;

    let start: Date, end: Date;
    const now = new Date();

    switch (type) {
      case 'daily':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'weekly':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        end = now;
        break;
      case 'custom':
        start = startDate ? new Date(startDate) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = endDate ? new Date(endDate) : now;
        break;
    }

    // Filter metrics for the period
    const periodMetrics = this.metricsCache.filter((m) => {
      const timestamp = new Date(m.timestamp);
      return timestamp >= start && timestamp <= end;
    });

    // Calculate summary data
    const revenueMetrics = periodMetrics.filter((m) => m.category === 'revenue');
    const orderMetrics = periodMetrics.filter((m) => m.category === 'orders');
    const customerMetrics = periodMetrics.filter((m) => m.category === 'customers');

    const totalRevenue = revenueMetrics.reduce((sum, m) => sum + m.value, 0);
    const totalOrders = orderMetrics.length;
    const customerCount = new Set(customerMetrics.map((m) => m.tags?.customerId)).size;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Generate report sections
    const sections: ReportSection[] = [
      {
        title: 'Resumen Financiero',
        type: 'metric',
        data: {
          totalRevenue,
          totalOrders,
          averageOrderValue,
          revenueGrowth: Math.random() * 20 - 5,
        },
        insights: [
          'Los ingresos han mostrado una tendencia positiva',
          'El valor promedio de pedido se mantiene estable',
        ],
        recommendations: [
          'Considerar promociones para aumentar el valor promedio',
          'Implementar programas de fidelización',
        ],
      },
      {
        title: 'Análisis de Clientes',
        type: 'chart',
        data: {
          newCustomers: customerCount,
          returningCustomers: Math.floor(customerCount * 0.4),
          customerSatisfaction: 4.3,
          retentionRate: 0.75,
        },
        insights: ['Alta satisfacción del cliente', 'Buena tasa de retención'],
      },
      {
        title: 'Productos Más Vendidos',
        type: 'table',
        data: [
          { name: 'Pizza Margherita', sales: 45, revenue: 675 },
          { name: 'Hamburguesa Clásica', sales: 38, revenue: 570 },
          { name: 'Pasta Carbonara', sales: 32, revenue: 480 },
          { name: 'Ensalada César', sales: 28, revenue: 350 },
          { name: 'Tacos al Pastor', sales: 25, revenue: 375 },
        ],
      },
      {
        title: 'Rendimiento del Sistema',
        type: 'metric',
        data: {
          averageResponseTime: 145,
          uptime: 99.8,
          errorRate: 0.02,
          throughput: totalOrders,
        },
        insights: ['Excelente tiempo de respuesta', 'Alta disponibilidad del sistema'],
      },
    ];

    const report: BusinessReport = {
      id: reportId,
      type,
      period: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
      sections,
      summary: {
        totalRevenue,
        totalOrders,
        customerCount,
        averageOrderValue,
        topProducts: [
          { name: 'Pizza Margherita', sales: 45 },
          { name: 'Hamburguesa Clásica', sales: 38 },
          { name: 'Pasta Carbonara', sales: 32 },
        ],
        performanceScore: 92.5,
      },
      generatedAt: new Date().toISOString(),
      format,
    };

    // Cache the report
    this.reportsCache.push(report);
    if (this.reportsCache.length > 100) {
      this.reportsCache = this.reportsCache.slice(-50);
    }

    this.logger.log('Business report generated', {
      module: 'ANALYTICS',
      action: 'report_generated',
      metadata: {
        reportId,
        type,
        format,
        totalRevenue,
        totalOrders,
      },
    });

    return report;
  }

  // Get available reports
  getReports(): BusinessReport[] {
    return this.reportsCache.sort(
      (a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
    );
  }

  // Get specific report by ID
  getReport(reportId: string): BusinessReport | null {
    return this.reportsCache.find((r) => r.id === reportId) || null;
  }

  // Export report to different formats
  async exportReport(reportId: string, format: 'json' | 'csv' | 'excel' | 'pdf'): Promise<string> {
    const report = this.getReport(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);

      case 'csv':
        return this.reportToCSV(report);

      case 'excel':
        return `Excel export for report ${reportId} (simulated)`;

      case 'pdf':
        return `PDF export for report ${reportId} (simulated)`;

      default:
        throw new Error('Unsupported format');
    }
  }

  // Get analytics configuration
  getConfiguration(): AnalyticsConfig {
    return { ...this.config };
  }

  // Update analytics configuration
  updateConfiguration(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };

    this.logger.log('Analytics configuration updated', {
      module: 'ANALYTICS',
      action: 'config_updated',
      metadata: newConfig,
    });
  }

  // Scheduled report generation
  @Cron('0 6 * * *') // Daily at 6 AM
  async generateDailyReport(): Promise<void> {
    if (!this.config.reportGeneration.enabled || !this.config.reportGeneration.scheduleDaily) {
      return;
    }

    try {
      const report = await this.generateReport('daily');
      this.logger.log('Daily report generated automatically', {
        module: 'ANALYTICS',
        action: 'scheduled_daily_report',
        metadata: {
          reportId: report.id,
          totalRevenue: report.summary.totalRevenue,
        },
      });
    } catch (error) {
      this.logger.error('Failed to generate daily report', {
        module: 'ANALYTICS',
        action: 'scheduled_daily_report_failed',
        metadata: {
          error: error.message,
        },
      });
    }
  }

  @Cron('0 7 * * 1') // Weekly on Monday at 7 AM
  async generateWeeklyReport(): Promise<void> {
    if (!this.config.reportGeneration.enabled || !this.config.reportGeneration.scheduleWeekly) {
      return;
    }

    try {
      const report = await this.generateReport('weekly');
      this.logger.log('Weekly report generated automatically', {
        module: 'ANALYTICS',
        action: 'scheduled_weekly_report',
        metadata: {
          reportId: report.id,
        },
      });
    } catch (error) {
      this.logger.error('Failed to generate weekly report', {
        module: 'ANALYTICS',
        action: 'scheduled_weekly_report_failed',
        metadata: {
          error: error.message,
        },
      });
    }
  }

  @Cron('0 8 1 * *') // Monthly on 1st at 8 AM
  async generateMonthlyReport(): Promise<void> {
    if (!this.config.reportGeneration.enabled || !this.config.reportGeneration.scheduleMonthly) {
      return;
    }

    try {
      const report = await this.generateReport('monthly');
      this.logger.log('Monthly report generated automatically', {
        module: 'ANALYTICS',
        action: 'scheduled_monthly_report',
        metadata: {
          reportId: report.id,
        },
      });
    } catch (error) {
      this.logger.error('Failed to generate monthly report', {
        module: 'ANALYTICS',
        action: 'scheduled_monthly_report_failed',
        metadata: {
          error: error.message,
        },
      });
    }
  }

  // Clean up old data
  @Cron('0 3 * * *') // Daily at 3 AM
  async cleanupOldData(): Promise<void> {
    const cutoffDate = new Date(Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000);

    const initialCount = this.metricsCache.length;
    this.metricsCache = this.metricsCache.filter((m) => new Date(m.timestamp) > cutoffDate);

    const reportsInitialCount = this.reportsCache.length;
    this.reportsCache = this.reportsCache.filter((r) => new Date(r.generatedAt) > cutoffDate);

    this.logger.log('Analytics data cleanup completed', {
      module: 'ANALYTICS',
      action: 'data_cleanup',
      metadata: {
        metricsRemoved: initialCount - this.metricsCache.length,
        reportsRemoved: reportsInitialCount - this.reportsCache.length,
        retentionDays: this.config.retentionDays,
      },
    });
  }

  // Private helper methods
  private initializeSampleData(): void {
    // Generate sample data for the last 30 days
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);

      // Generate random revenue data
      for (let j = 0; j < Math.random() * 10 + 5; j++) {
        this.metricsCache.push({
          timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          category: 'revenue',
          metric: 'order_value',
          value: Math.random() * 50 + 10,
          tags: { customerId: `customer_${Math.floor(Math.random() * 100)}` },
        });
      }

      // Generate order data
      for (let j = 0; j < Math.random() * 15 + 8; j++) {
        this.metricsCache.push({
          timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          category: 'orders',
          metric: 'order_created',
          value: 1,
          tags: {
            customerId: `customer_${Math.floor(Math.random() * 100)}`,
            status: 'completed',
          },
        });
      }

      // Generate customer data
      for (let j = 0; j < Math.random() * 8 + 3; j++) {
        this.metricsCache.push({
          timestamp: new Date(date.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          category: 'customers',
          metric: 'customer_interaction',
          value: 1,
          tags: { customerId: `customer_${Math.floor(Math.random() * 100)}` },
        });
      }
    }

    this.logger.log('Sample analytics data initialized', {
      module: 'ANALYTICS',
      action: 'sample_data_init',
      metadata: {
        metricsCount: this.metricsCache.length,
      },
    });
  }

  private reportToCSV(report: BusinessReport): string {
    let csv = `Reporte de Negocio - ${report.type}\n`;
    csv += `ID: ${report.id}\n`;
    csv += `Período: ${report.period.start} - ${report.period.end}\n`;
    csv += `Generado: ${report.generatedAt}\n\n`;

    csv += `RESUMEN\n`;
    csv += `Ingresos Totales,${report.summary.totalRevenue}\n`;
    csv += `Órdenes Totales,${report.summary.totalOrders}\n`;
    csv += `Clientes,${report.summary.customerCount}\n`;
    csv += `Valor Promedio Orden,${report.summary.averageOrderValue.toFixed(2)}\n\n`;

    csv += `PRODUCTOS TOP\n`;
    csv += `Producto,Ventas\n`;
    report.summary.topProducts.forEach((p) => {
      csv += `${p.name},${p.sales}\n`;
    });

    return csv;
  }
}
