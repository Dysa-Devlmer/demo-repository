import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import { Report, ReportType, ReportFormat } from '../entities/report.entity';
import { Customer } from '../entities/customer.entity';
import { Order } from '../entities/order.entity';
import { MenuItem } from '../entities/menu-item.entity';
import { Reservation } from '../entities/reservation.entity';

interface ReportData {
  title: string;
  description: string;
  generatedAt: Date;
  dateRange?: string;
  data: any[];
  summary?: Record<string, any>;
}

@Injectable()
export class ReportGeneratorService {
  private readonly logger = new Logger(ReportGeneratorService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(MenuItem)
    private readonly menuRepo: Repository<MenuItem>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
  ) {}

  /**
   * Generate report file based on configuration
   */
  async generateReport(report: Report): Promise<Buffer> {
    this.logger.log(`Generating ${report.format} report: ${report.name}`);

    // 1. Collect data based on report type
    const reportData = await this.collectReportData(report);

    // 2. Generate file based on format
    switch (report.format) {
      case ReportFormat.PDF:
        return this.generatePDF(reportData);
      case ReportFormat.EXCEL:
        return this.generateExcel(reportData);
      case ReportFormat.CSV:
        return this.generateCSV(reportData);
      default:
        throw new Error(`Unsupported format: ${report.format}`);
    }
  }

  /**
   * Collect data based on report type
   */
  private async collectReportData(report: Report): Promise<ReportData> {
    const generatedAt = new Date();

    switch (report.type) {
      case ReportType.SALES:
        return this.collectSalesData(report, generatedAt);
      case ReportType.CUSTOMERS:
        return this.collectCustomersData(report, generatedAt);
      case ReportType.MENU:
        return this.collectMenuData(report, generatedAt);
      case ReportType.RESERVATIONS:
        return this.collectReservationsData(report, generatedAt);
      case ReportType.OPERATIONS:
        return this.collectOperationsData(report, generatedAt);
      default:
        return {
          title: report.name,
          description: report.description || '',
          generatedAt,
          data: [],
        };
    }
  }

  /**
   * Collect sales data
   */
  private async collectSalesData(
    report: Report,
    generatedAt: Date,
  ): Promise<ReportData> {
    const orders = await this.orderRepo.find({
      relations: ['customer'],
      order: { created_at: 'DESC' },
      take: 1000,
    });

    const data = orders.map((order) => ({
      id: order.id,
      customer: order.customer_name || 'N/A',
      total: order.total,
      status: order.status,
      date: order.created_at,
    }));

    const summary = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + Number(o.total || 0), 0),
      averageOrderValue:
        orders.length > 0
          ? orders.reduce((sum, o) => sum + Number(o.total || 0), 0) /
            orders.length
          : 0,
    };

    return {
      title: report.name,
      description: report.description || 'Reporte de Ventas',
      generatedAt,
      dateRange: report.dateRange,
      data,
      summary,
    };
  }

  /**
   * Collect customers data
   */
  private async collectCustomersData(
    report: Report,
    generatedAt: Date,
  ): Promise<ReportData> {
    const customers = await this.customerRepo.find({
      relations: ['reservations'],
      order: { created_at: 'DESC' },
      take: 1000,
    });

    const data = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email || 'N/A',
      phone: customer.phone || 'N/A',
      whatsapp: customer.whatsapp_phone || 'N/A',
      source: customer.source,
      totalReservations: customer.reservations?.length || 0,
      active: customer.is_active ? 'Sí' : 'No',
      registeredAt: customer.created_at,
    }));

    const summary = {
      totalCustomers: customers.length,
      activeCustomers: customers.filter((c) => c.is_active).length,
      bySource: this.groupByField(customers, 'source'),
    };

    return {
      title: report.name,
      description: report.description || 'Reporte de Clientes',
      generatedAt,
      dateRange: report.dateRange,
      data,
      summary,
    };
  }

  /**
   * Collect menu data
   */
  private async collectMenuData(
    report: Report,
    generatedAt: Date,
  ): Promise<ReportData> {
    const menuItems = await this.menuRepo.find({
      order: { category: 'ASC', name: 'ASC' },
      take: 1000,
    });

    const data = menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      available: item.available ? 'Sí' : 'No',
      description: item.description || 'N/A',
    }));

    const summary = {
      totalItems: menuItems.length,
      availableItems: menuItems.filter((i) => i.available).length,
      byCategory: this.groupByField(menuItems, 'category'),
      averagePrice:
        menuItems.length > 0
          ? menuItems.reduce((sum, i) => sum + Number(i.price || 0), 0) /
            menuItems.length
          : 0,
    };

    return {
      title: report.name,
      description: report.description || 'Reporte de Menú',
      generatedAt,
      dateRange: report.dateRange,
      data,
      summary,
    };
  }

  /**
   * Collect reservations data
   */
  private async collectReservationsData(
    report: Report,
    generatedAt: Date,
  ): Promise<ReportData> {
    const reservations = await this.reservationRepo.find({
      order: { reservation_date: 'DESC' },
      take: 1000,
    });

    const data = reservations.map((reservation) => ({
      id: reservation.id,
      code: reservation.reservation_code,
      customer: reservation.customer_name,
      phone: reservation.customer_phone || 'N/A',
      date: reservation.reservation_date,
      partySize: reservation.party_size,
      status: reservation.status,
    }));

    const summary = {
      totalReservations: reservations.length,
      byStatus: this.groupByField(reservations, 'status'),
      totalGuests: reservations.reduce(
        (sum, r) => sum + (r.party_size || 0),
        0,
      ),
      averagePartySize:
        reservations.length > 0
          ? reservations.reduce((sum, r) => sum + (r.party_size || 0), 0) /
            reservations.length
          : 0,
    };

    return {
      title: report.name,
      description: report.description || 'Reporte de Reservas',
      generatedAt,
      dateRange: report.dateRange,
      data,
      summary,
    };
  }

  /**
   * Collect operations data (summary of all)
   */
  private async collectOperationsData(
    report: Report,
    generatedAt: Date,
  ): Promise<ReportData> {
    const [orders, customers, menuItems, reservations] = await Promise.all([
      this.orderRepo.count(),
      this.customerRepo.count(),
      this.menuRepo.count(),
      this.reservationRepo.count(),
    ]);

    const data = [
      { metric: 'Total Órdenes', value: orders },
      { metric: 'Total Clientes', value: customers },
      { metric: 'Items en Menú', value: menuItems },
      { metric: 'Total Reservas', value: reservations },
    ];

    return {
      title: report.name,
      description: report.description || 'Reporte de Operaciones',
      generatedAt,
      dateRange: report.dateRange,
      data,
      summary: { orders, customers, menuItems, reservations },
    };
  }

  /**
   * Generate PDF report
   */
  private async generatePDF(reportData: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(reportData.title, { align: 'center' });

      doc.moveDown();

      if (reportData.description) {
        doc
          .fontSize(12)
          .font('Helvetica')
          .text(reportData.description, { align: 'center' });
        doc.moveDown();
      }

      // Metadata
      doc
        .fontSize(10)
        .font('Helvetica')
        .text(`Generado: ${reportData.generatedAt.toLocaleString('es-ES')}`, {
          align: 'right',
        });

      if (reportData.dateRange) {
        doc.text(`Período: ${reportData.dateRange}`, { align: 'right' });
      }

      doc.moveDown(2);

      // Summary section
      if (reportData.summary) {
        doc.fontSize(14).font('Helvetica-Bold').text('Resumen Ejecutivo');
        doc.moveDown(0.5);

        Object.entries(reportData.summary).forEach(([key, value]) => {
          const label = this.formatLabel(key);
          const valueStr =
            typeof value === 'object'
              ? JSON.stringify(value, null, 2)
              : String(value);

          doc.fontSize(10).font('Helvetica').text(`${label}: ${valueStr}`);
        });

        doc.moveDown(2);
      }

      // Data section
      if (reportData.data.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Datos Detallados');
        doc.moveDown(0.5);

        // Simple table representation
        const headers = Object.keys(reportData.data[0]);
        doc.fontSize(9).font('Helvetica-Bold');

        // Table headers
        headers.forEach((header, i) => {
          doc.text(this.formatLabel(header), 50 + i * 80, doc.y, {
            width: 75,
            continued: i < headers.length - 1,
          });
        });

        doc.moveDown();

        // Table rows (limit to first 50 for PDF)
        doc.font('Helvetica');
        reportData.data.slice(0, 50).forEach((row) => {
          const y = doc.y;
          headers.forEach((header, i) => {
            const value = row[header];
            const valueStr =
              value instanceof Date
                ? value.toLocaleDateString('es-ES')
                : String(value || 'N/A');

            doc.text(valueStr, 50 + i * 80, y, {
              width: 75,
              continued: i < headers.length - 1,
            });
          });
          doc.moveDown();

          // Add new page if needed
          if (doc.y > 700) {
            doc.addPage();
          }
        });

        if (reportData.data.length > 50) {
          doc.moveDown();
          doc
            .fontSize(8)
            .text(
              `Mostrando 50 de ${reportData.data.length} registros. Descargue en formato Excel para ver todos.`,
            );
        }
      }

      // Footer
      const pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(8)
          .text(
            `Página ${i + 1} de ${pages.count}`,
            50,
            doc.page.height - 50,
            { align: 'center' },
          );
      }

      doc.end();
    });
  }

  /**
   * Generate Excel report
   */
  private async generateExcel(reportData: ReportData): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'ChatBotDysa';
    workbook.created = reportData.generatedAt;

    // Summary sheet
    if (reportData.summary) {
      const summarySheet = workbook.addWorksheet('Resumen');

      summarySheet.addRow(['Reporte:', reportData.title]);
      summarySheet.addRow(['Descripción:', reportData.description]);
      summarySheet.addRow([
        'Generado:',
        reportData.generatedAt.toLocaleString('es-ES'),
      ]);
      if (reportData.dateRange) {
        summarySheet.addRow(['Período:', reportData.dateRange]);
      }
      summarySheet.addRow([]);

      summarySheet.addRow(['Resumen Ejecutivo']);
      Object.entries(reportData.summary).forEach(([key, value]) => {
        const valueStr =
          typeof value === 'object'
            ? JSON.stringify(value, null, 2)
            : String(value);
        summarySheet.addRow([this.formatLabel(key), valueStr]);
      });

      // Style summary sheet
      summarySheet.getColumn(1).width = 25;
      summarySheet.getColumn(2).width = 50;
      summarySheet.getRow(1).font = { bold: true };
    }

    // Data sheet
    if (reportData.data.length > 0) {
      const dataSheet = workbook.addWorksheet('Datos');

      // Add headers
      const headers = Object.keys(reportData.data[0]);
      const headerRow = dataSheet.addRow(headers.map(this.formatLabel));
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Add data rows
      reportData.data.forEach((row) => {
        const values = headers.map((header) => {
          const value = row[header];
          return value instanceof Date
            ? value.toLocaleDateString('es-ES')
            : value;
        });
        dataSheet.addRow(values);
      });

      // Auto-fit columns
      headers.forEach((header, i) => {
        const column = dataSheet.getColumn(i + 1);
        column.width = Math.min(Math.max(header.length + 5, 15), 50);
      });

      // Add filters
      dataSheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: 1, column: headers.length },
      };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  /**
   * Generate CSV report
   */
  private generateCSV(reportData: ReportData): Buffer {
    if (reportData.data.length === 0) {
      return Buffer.from('No hay datos disponibles');
    }

    const headers = Object.keys(reportData.data[0]);

    // CSV header row
    const csvRows: string[] = [
      headers.map(this.formatLabel).map(this.escapeCsvValue).join(','),
    ];

    // CSV data rows
    reportData.data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        const valueStr =
          value instanceof Date
            ? value.toLocaleDateString('es-ES')
            : String(value || '');
        return this.escapeCsvValue(valueStr);
      });
      csvRows.push(values.join(','));
    });

    return Buffer.from(csvRows.join('\n'), 'utf-8');
  }

  /**
   * Helper: Escape CSV values
   */
  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Helper: Format field labels
   */
  private formatLabel(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  /**
   * Helper: Group array by field
   */
  private groupByField(array: any[], field: string): Record<string, number> {
    return array.reduce(
      (acc, item) => {
        const key = item[field] || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  }
}
