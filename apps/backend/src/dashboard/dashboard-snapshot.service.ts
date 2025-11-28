import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThan, MoreThan } from "typeorm";
import {
  DashboardSnapshot,
  SnapshotType,
  SnapshotStatus,
} from "../entities/dashboard-snapshot.entity";
import { Order } from "../entities/order.entity";
import { Customer } from "../entities/customer.entity";
import { MenuItem } from "../entities/menu-item.entity";
import { Reservation } from "../entities/reservation.entity";
import { Conversation } from "../entities/conversation.entity";

@Injectable()
export class DashboardSnapshotService {
  private readonly logger = new Logger(DashboardSnapshotService.name);

  constructor(
    @InjectRepository(DashboardSnapshot)
    private readonly snapshotRepo: Repository<DashboardSnapshot>,
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Customer)
    private readonly customersRepo: Repository<Customer>,
    @InjectRepository(MenuItem)
    private readonly menuRepo: Repository<MenuItem>,
    @InjectRepository(Reservation)
    private readonly reservationsRepo: Repository<Reservation>,
    @InjectRepository(Conversation)
    private readonly conversationsRepo: Repository<Conversation>,
  ) {}

  /**
   * Create a snapshot of current dashboard metrics
   */
  async createSnapshot(
    type: SnapshotType = SnapshotType.DAILY,
    triggeredBy: string = "manual",
  ): Promise<DashboardSnapshot> {
    const startTime = Date.now();
    const snapshotDate = new Date();

    this.logger.log(`Creating ${type} snapshot triggered by ${triggeredBy}`);

    // Get all metrics in parallel
    const [
      revenueMetrics,
      customerMetrics,
      menuMetrics,
      reservationMetrics,
      conversationMetrics,
    ] = await Promise.all([
      this.getRevenueMetrics(),
      this.getCustomerMetrics(),
      this.getMenuMetrics(),
      this.getReservationMetrics(),
      this.getConversationMetrics(),
    ]);

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(
      revenueMetrics,
      customerMetrics,
    );

    // Get comparison with previous snapshot
    const comparison = await this.getComparison(type);

    const snapshot = new DashboardSnapshot();
    snapshot.snapshot_type = type;
    snapshot.snapshot_date = snapshotDate;
    snapshot.status = SnapshotStatus.ACTIVE;

    // Revenue
    snapshot.total_revenue = revenueMetrics.totalRevenue;
    snapshot.average_order_value = revenueMetrics.averageOrderValue;
    snapshot.total_orders = revenueMetrics.totalOrders;
    snapshot.completed_orders = revenueMetrics.completedOrders;
    snapshot.pending_orders = revenueMetrics.pendingOrders;
    snapshot.cancelled_orders = revenueMetrics.cancelledOrders;

    // Customers
    snapshot.total_customers = customerMetrics.total;
    snapshot.new_customers = customerMetrics.new;
    snapshot.customer_growth_rate = customerMetrics.growthRate;
    snapshot.active_customers = customerMetrics.active;

    // Menu
    snapshot.total_menu_items = menuMetrics.total;
    snapshot.active_menu_items = menuMetrics.active;
    snapshot.top_selling_items = menuMetrics.topSelling;

    // Reservations
    snapshot.total_reservations = reservationMetrics.total;
    snapshot.confirmed_reservations = reservationMetrics.confirmed;
    snapshot.completed_reservations = reservationMetrics.completed;
    snapshot.cancelled_reservations = reservationMetrics.cancelled;
    snapshot.no_show_reservations = reservationMetrics.noShow;
    snapshot.reservation_fulfillment_rate = reservationMetrics.fulfillmentRate;

    // Conversations
    snapshot.total_conversations = conversationMetrics.total;
    snapshot.active_conversations = conversationMetrics.active;
    snapshot.resolved_conversations = conversationMetrics.resolved;
    snapshot.escalated_conversations = conversationMetrics.escalated;
    snapshot.avg_satisfaction_score = conversationMetrics.avgSatisfaction;
    snapshot.bot_resolution_rate = conversationMetrics.botResolutionRate;

    // Performance
    snapshot.revenue_per_customer = performanceMetrics.revenuePerCustomer;
    snapshot.revenue_per_order = performanceMetrics.revenuePerOrder;
    snapshot.order_completion_rate = performanceMetrics.orderCompletionRate;
    snapshot.customer_retention_rate = performanceMetrics.customerRetentionRate;

    // Comparison
    snapshot.comparison = comparison || {
      revenue_change: 0,
      orders_change: 0,
      customers_change: 0,
      reservations_change: 0,
      satisfaction_change: 0,
      period: "N/A",
    };

    // Metadata
    snapshot.metadata = {
      triggered_by: triggeredBy,
      execution_time_ms: Date.now() - startTime,
      data_sources: ["orders", "customers", "menu", "reservations", "conversations"],
    };

    const saved = await this.snapshotRepo.save(snapshot);

    this.logger.log(
      `Snapshot ${saved.id} created successfully in ${Date.now() - startTime}ms`,
    );

    return saved;
  }

  /**
   * Get all snapshots with pagination and filtering
   */
  async findAll(filters?: {
    type?: SnapshotType;
    status?: SnapshotStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{
    data: DashboardSnapshot[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 30;
    const skip = (page - 1) * limit;

    const queryBuilder = this.snapshotRepo
      .createQueryBuilder("snapshot")
      .orderBy("snapshot.snapshot_date", "DESC");

    if (filters?.type) {
      queryBuilder.andWhere("snapshot.snapshot_type = :type", {
        type: filters.type,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere("snapshot.status = :status", {
        status: filters.status,
      });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere("snapshot.snapshot_date >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("snapshot.snapshot_date <= :endDate", {
        endDate: filters.endDate,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit };
  }

  /**
   * Get snapshot by ID
   */
  async findOne(id: number): Promise<DashboardSnapshot> {
    const snapshot = await this.snapshotRepo.findOne({ where: { id } });
    if (!snapshot) {
      throw new NotFoundException(`Snapshot with ID ${id} not found`);
    }
    return snapshot;
  }

  /**
   * Get latest snapshot
   */
  async getLatest(type?: SnapshotType): Promise<DashboardSnapshot> {
    const query = this.snapshotRepo
      .createQueryBuilder("snapshot")
      .where("snapshot.status = :status", { status: SnapshotStatus.ACTIVE })
      .orderBy("snapshot.snapshot_date", "DESC")
      .limit(1);

    if (type) {
      query.andWhere("snapshot.snapshot_type = :type", { type });
    }

    const snapshot = await query.getOne();

    if (!snapshot) {
      throw new NotFoundException("No snapshots found");
    }

    return snapshot;
  }

  /**
   * Get snapshot trend (last N snapshots)
   */
  async getTrend(
    type: SnapshotType,
    limit: number = 7,
  ): Promise<DashboardSnapshot[]> {
    return this.snapshotRepo.find({
      where: {
        snapshot_type: type,
        status: SnapshotStatus.ACTIVE,
      },
      order: {
        snapshot_date: "DESC",
      },
      take: limit,
    });
  }

  /**
   * Compare two snapshots
   */
  async compare(
    snapshot1Id: number,
    snapshot2Id: number,
  ): Promise<{
    snapshot1: DashboardSnapshot;
    snapshot2: DashboardSnapshot;
    differences: any;
  }> {
    const [snapshot1, snapshot2] = await Promise.all([
      this.findOne(snapshot1Id),
      this.findOne(snapshot2Id),
    ]);

    const differences = {
      revenue_change: this.calculatePercentageChange(
        snapshot1.total_revenue,
        snapshot2.total_revenue,
      ),
      orders_change: this.calculatePercentageChange(
        snapshot1.total_orders,
        snapshot2.total_orders,
      ),
      customers_change: this.calculatePercentageChange(
        snapshot1.total_customers,
        snapshot2.total_customers,
      ),
      reservations_change: this.calculatePercentageChange(
        snapshot1.total_reservations,
        snapshot2.total_reservations,
      ),
      satisfaction_change: this.calculatePercentageChange(
        snapshot1.avg_satisfaction_score,
        snapshot2.avg_satisfaction_score,
      ),
      avg_order_value_change: this.calculatePercentageChange(
        snapshot1.average_order_value,
        snapshot2.average_order_value,
      ),
    };

    return { snapshot1, snapshot2, differences };
  }

  /**
   * Archive old snapshots
   */
  async archiveOldSnapshots(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.snapshotRepo.update(
      {
        snapshot_date: LessThan(cutoffDate),
        status: SnapshotStatus.ACTIVE,
      },
      {
        status: SnapshotStatus.ARCHIVED,
      },
    );

    this.logger.log(
      `Archived ${result.affected} snapshots older than ${daysOld} days`,
    );

    return result.affected || 0;
  }

  /**
   * Delete snapshot
   */
  async remove(id: number): Promise<void> {
    const snapshot = await this.findOne(id);
    snapshot.status = SnapshotStatus.DELETED;
    await this.snapshotRepo.save(snapshot);

    this.logger.warn(`Snapshot ${id} marked as deleted`);
  }

  /**
   * Hard delete snapshot (admin only)
   */
  async hardDelete(id: number): Promise<void> {
    const snapshot = await this.findOne(id);
    await this.snapshotRepo.remove(snapshot);

    this.logger.warn(`Snapshot ${id} permanently deleted`);
  }

  /**
   * Get revenue metrics
   */
  private async getRevenueMetrics() {
    const orders = await this.ordersRepo.find();

    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0,
    );
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === "delivered").length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      pendingOrders,
      cancelledOrders,
      averageOrderValue,
    };
  }

  /**
   * Get customer metrics
   */
  private async getCustomerMetrics() {
    const total = await this.customersRepo.count();

    // New customers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCustomers = await this.customersRepo.count({
      where: {
        created_at: MoreThan(startOfMonth),
      },
    });

    // Growth rate
    const lastMonthStart = new Date(startOfMonth);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const lastMonthTotal = await this.customersRepo.count({
      where: {
        created_at: LessThan(startOfMonth),
      },
    });

    const growthRate =
      lastMonthTotal > 0 ? ((total - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Active customers (ordered in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeCustomersCount = await this.ordersRepo
      .createQueryBuilder("order")
      .select("COUNT(DISTINCT order.customer_id)", "count")
      .where("order.created_at >= :date", { date: thirtyDaysAgo })
      .getRawOne();

    return {
      total,
      new: newCustomers,
      growthRate: Math.round(growthRate * 100) / 100,
      active: parseInt(activeCustomersCount?.count || "0"),
    };
  }

  /**
   * Get menu metrics
   */
  private async getMenuMetrics() {
    const total = await this.menuRepo.count();
    const active = await this.menuRepo.count({
      where: { available: true },
    });

    // Top selling items (from order_items)
    const topSelling = await this.ordersRepo.query(`
      SELECT
        mi.id,
        mi.name,
        COUNT(oi.id)::int as quantity,
        SUM(oi.price * oi.quantity)::decimal as revenue
      FROM order_items oi
      JOIN menu_items mi ON oi.menu_item_id = mi.id
      GROUP BY mi.id, mi.name
      ORDER BY quantity DESC
      LIMIT 5
    `);

    return {
      total,
      active,
      topSelling: topSelling.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: parseInt(item.quantity),
        revenue: parseFloat(item.revenue || 0),
      })),
    };
  }

  /**
   * Get reservation metrics
   */
  private async getReservationMetrics() {
    const [total, confirmed, completed, cancelled, noShow] = await Promise.all([
      this.reservationsRepo.count(),
      this.reservationsRepo.count({ where: { status: "confirmed" } }),
      this.reservationsRepo.count({ where: { status: "completed" } }),
      this.reservationsRepo.count({ where: { status: "cancelled" } }),
      this.reservationsRepo.count({ where: { status: "no_show" } }),
    ]);

    const fulfillmentRate =
      total > 0 ? (completed / (total - cancelled)) * 100 : 0;

    return {
      total,
      confirmed,
      completed,
      cancelled,
      noShow,
      fulfillmentRate: Math.round(fulfillmentRate * 100) / 100,
    };
  }

  /**
   * Get conversation metrics
   */
  private async getConversationMetrics() {
    const conversations = await this.conversationsRepo.find();

    const total = conversations.length;
    const active = conversations.filter((c) => c.status === "active").length;
    const resolved = conversations.filter((c) => c.status === "resolved").length;
    const escalated = conversations.filter((c) => c.status === "escalated").length;

    const avgSatisfaction =
      conversations
        .filter((c) => c.satisfaction_score)
        .reduce((sum, c) => sum + (c.satisfaction_score || 0), 0) /
        (conversations.filter((c) => c.satisfaction_score).length || 1);

    const botResolved = conversations.filter(
      (c) => c.status === "resolved" && c.human_messages === 0,
    ).length;
    const botResolutionRate = resolved > 0 ? (botResolved / resolved) * 100 : 0;

    return {
      total,
      active,
      resolved,
      escalated,
      avgSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      botResolutionRate: Math.round(botResolutionRate * 100) / 100,
    };
  }

  /**
   * Calculate performance metrics
   */
  private calculatePerformanceMetrics(revenueMetrics: any, customerMetrics: any) {
    const revenuePerCustomer =
      customerMetrics.total > 0
        ? revenueMetrics.totalRevenue / customerMetrics.total
        : 0;

    const revenuePerOrder =
      revenueMetrics.totalOrders > 0
        ? revenueMetrics.totalRevenue / revenueMetrics.totalOrders
        : 0;

    const orderCompletionRate =
      revenueMetrics.totalOrders > 0
        ? (revenueMetrics.completedOrders / revenueMetrics.totalOrders) * 100
        : 0;

    // Retention: customers with >1 order / total customers
    const customerRetentionRate = customerMetrics.active / customerMetrics.total * 100 || 0;

    return {
      revenuePerCustomer: Math.round(revenuePerCustomer * 100) / 100,
      revenuePerOrder: Math.round(revenuePerOrder * 100) / 100,
      orderCompletionRate: Math.round(orderCompletionRate * 100) / 100,
      customerRetentionRate: Math.round(customerRetentionRate * 100) / 100,
    };
  }

  /**
   * Get comparison with previous snapshot
   */
  private async getComparison(type: SnapshotType) {
    const previous = await this.snapshotRepo.findOne({
      where: {
        snapshot_type: type,
        status: SnapshotStatus.ACTIVE,
      },
      order: {
        snapshot_date: "DESC",
      },
    });

    if (!previous) {
      return null;
    }

    // Calculate changes from current metrics
    const current = await this.getRevenueMetrics();
    const currentCustomers = await this.getCustomerMetrics();
    const currentReservations = await this.getReservationMetrics();
    const currentConversations = await this.getConversationMetrics();

    return {
      revenue_change: this.calculatePercentageChange(
        previous.total_revenue,
        current.totalRevenue,
      ),
      orders_change: current.totalOrders - previous.total_orders,
      customers_change: currentCustomers.total - previous.total_customers,
      reservations_change:
        currentReservations.total - previous.total_reservations,
      satisfaction_change: this.calculatePercentageChange(
        previous.avg_satisfaction_score,
        currentConversations.avgSatisfaction,
      ),
      period: this.getPeriodLabel(type),
    };
  }

  /**
   * Calculate percentage change
   */
  private calculatePercentageChange(
    oldValue: number,
    newValue: number,
  ): number {
    if (oldValue === 0) return 0;
    return Math.round(((newValue - oldValue) / oldValue) * 10000) / 100;
  }

  /**
   * Get period label
   */
  private getPeriodLabel(type: SnapshotType): string {
    switch (type) {
      case SnapshotType.HOURLY:
        return "vs last hour";
      case SnapshotType.DAILY:
        return "vs yesterday";
      case SnapshotType.WEEKLY:
        return "vs last week";
      case SnapshotType.MONTHLY:
        return "vs last month";
      default:
        return "vs previous snapshot";
    }
  }
}
