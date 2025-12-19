import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { Customer } from '../entities/customer.entity';
import { Conversation } from '../entities/conversation.entity';

export type Period = '7d' | '30d' | '90d';

export interface TrendDataPoint {
  name: string;
  conversaciones: number;
  ordenes: number;
}

export interface RevenueDataPoint {
  name: string;
  revenue: number;
}

export interface DistributionDataPoint {
  name: string;
  value: number;
  color?: string;
}

@Injectable()
export class DashboardAnalyticsService {
  private readonly logger = new Logger(DashboardAnalyticsService.name);

  constructor(
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customersRepo: Repository<Customer>,
    @InjectRepository(Conversation)
    private readonly conversationsRepo: Repository<Conversation>
  ) {}

  /**
   * Get conversation and order trends for a given period
   */
  async getTrends(period: Period = '7d'): Promise<TrendDataPoint[]> {
    const days = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Fetch conversations and orders from the period
    const conversations = await this.conversationsRepo.find({
      where: {
        created_at: MoreThanOrEqual(startDate),
      },
      select: ['id', 'created_at'],
    });

    const orders = await this.ordersRepo.find({
      where: {
        created_at: MoreThanOrEqual(startDate),
      },
      select: ['id', 'created_at'],
    });

    // Group by date
    const data = this.groupByPeriod(period, conversations, orders, startDate);
    return data;
  }

  /**
   * Get revenue by period
   */
  async getRevenueByPeriod(period: Period = '7d'): Promise<RevenueDataPoint[]> {
    const days = this.getPeriodDays(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.ordersRepo.find({
      where: {
        created_at: MoreThanOrEqual(startDate),
        status: OrderStatus.DELIVERED,
      },
      select: ['id', 'created_at', 'total'],
    });

    return this.groupRevenueByPeriod(period, orders, startDate);
  }

  /**
   * Get order distribution by status
   */
  async getOrdersByStatus(): Promise<DistributionDataPoint[]> {
    const orders = await this.ordersRepo
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('order.status')
      .getRawMany();

    const statusLabels: Record<string, string> = {
      [OrderStatus.PENDING]: 'Pendiente',
      [OrderStatus.CONFIRMED]: 'Confirmado',
      [OrderStatus.PREPARING]: 'En Preparación',
      [OrderStatus.READY]: 'Listo',
      [OrderStatus.DELIVERED]: 'Entregado',
      [OrderStatus.CANCELLED]: 'Cancelado',
    };

    return orders.map((item, index) => ({
      name: statusLabels[item.status] || item.status,
      value: parseInt(item.count, 10),
    }));
  }

  /**
   * Get customer distribution by source
   */
  async getCustomersBySource(): Promise<DistributionDataPoint[]> {
    const customers = await this.customersRepo
      .createQueryBuilder('customer')
      .select('customer.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('customer.source IS NOT NULL')
      .groupBy('customer.source')
      .getRawMany();

    const sourceLabels: Record<string, string> = {
      whatsapp: 'WhatsApp',
      web_chat: 'Web Chat',
      facebook: 'Facebook',
      instagram: 'Instagram',
      referral: 'Referido',
      organic: 'Orgánico',
    };

    return customers.map((item, index) => ({
      name: sourceLabels[item.source] || item.source || 'Desconocido',
      value: parseInt(item.count, 10),
    }));
  }

  /**
   * Convert period string to number of days
   */
  private getPeriodDays(period: Period): number {
    switch (period) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      default:
        return 7;
    }
  }

  /**
   * Group conversations and orders by period buckets
   */
  private groupByPeriod(
    period: Period,
    conversations: any[],
    orders: any[],
    startDate: Date
  ): TrendDataPoint[] {
    if (period === '7d') {
      // Group by day of week
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const buckets: Record<string, { conversaciones: number; ordenes: number }> = {};

      // Initialize buckets for last 7 days
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dayName = dayNames[date.getDay()];
        buckets[dayName] = { conversaciones: 0, ordenes: 0 };
      }

      // Count conversations
      conversations.forEach((conv) => {
        const date = new Date(conv.created_at);
        const dayName = dayNames[date.getDay()];
        if (buckets[dayName]) {
          buckets[dayName].conversaciones++;
        }
      });

      // Count orders
      orders.forEach((order) => {
        const date = new Date(order.created_at);
        const dayName = dayNames[date.getDay()];
        if (buckets[dayName]) {
          buckets[dayName].ordenes++;
        }
      });

      // Convert to array in correct order
      const result: TrendDataPoint[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dayName = dayNames[date.getDay()];
        result.push({
          name: dayName,
          conversaciones: buckets[dayName].conversaciones,
          ordenes: buckets[dayName].ordenes,
        });
      }

      return result;
    } else if (period === '30d') {
      // Group by week
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      const buckets = weeks.map(() => ({ conversaciones: 0, ordenes: 0 }));

      conversations.forEach((conv) => {
        const date = new Date(conv.created_at);
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.min(Math.floor(daysDiff / 7), 3);
        buckets[weekIndex].conversaciones++;
      });

      orders.forEach((order) => {
        const date = new Date(order.created_at);
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.min(Math.floor(daysDiff / 7), 3);
        buckets[weekIndex].ordenes++;
      });

      return weeks.map((name, index) => ({
        name,
        conversaciones: buckets[index].conversaciones,
        ordenes: buckets[index].ordenes,
      }));
    } else {
      // Group by month
      const months = ['Mes 1', 'Mes 2', 'Mes 3'];
      const buckets = months.map(() => ({ conversaciones: 0, ordenes: 0 }));

      conversations.forEach((conv) => {
        const date = new Date(conv.created_at);
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const monthIndex = Math.min(Math.floor(daysDiff / 30), 2);
        buckets[monthIndex].conversaciones++;
      });

      orders.forEach((order) => {
        const date = new Date(order.created_at);
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const monthIndex = Math.min(Math.floor(daysDiff / 30), 2);
        buckets[monthIndex].ordenes++;
      });

      return months.map((name, index) => ({
        name,
        conversaciones: buckets[index].conversaciones,
        ordenes: buckets[index].ordenes,
      }));
    }
  }

  /**
   * Group revenue by period buckets
   */
  private groupRevenueByPeriod(period: Period, orders: any[], startDate: Date): RevenueDataPoint[] {
    if (period === '7d') {
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      const buckets: Record<string, number> = {};

      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dayName = dayNames[date.getDay()];
        buckets[dayName] = 0;
      }

      orders.forEach((order) => {
        const date = new Date(order.created_at);
        const dayName = dayNames[date.getDay()];
        if (buckets[dayName] !== undefined) {
          buckets[dayName] += order.total || 0;
        }
      });

      const result: RevenueDataPoint[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dayName = dayNames[date.getDay()];
        result.push({
          name: dayName,
          revenue: Math.round(buckets[dayName]),
        });
      }

      return result;
    } else if (period === '30d') {
      const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'];
      const buckets = weeks.map(() => 0);

      orders.forEach((order) => {
        const date = new Date(order.created_at);
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const weekIndex = Math.min(Math.floor(daysDiff / 7), 3);
        buckets[weekIndex] += order.total || 0;
      });

      return weeks.map((name, index) => ({
        name,
        revenue: Math.round(buckets[index]),
      }));
    } else {
      const months = ['Mes 1', 'Mes 2', 'Mes 3'];
      const buckets = months.map(() => 0);

      orders.forEach((order) => {
        const date = new Date(order.created_at);
        const daysDiff = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const monthIndex = Math.min(Math.floor(daysDiff / 30), 2);
        buckets[monthIndex] += order.total || 0;
      });

      return months.map((name, index) => ({
        name,
        revenue: Math.round(buckets[index]),
      }));
    }
  }
}
