// apps/backend/src/database/entities.ts

// Core Business Entities
export { Customer } from "../entities/customer.entity";
export { Category } from "../entities/category.entity";
export { MenuItem } from "../entities/menu-item.entity";
export { Order } from "../entities/order.entity";
export { OrderItem } from "../entities/order-item.entity";
export { Promotion } from "../entities/promotion.entity";
export { Reservation } from "../entities/reservation.entity";
export { Table } from "../entities/table.entity";
export { Review } from "../entities/review.entity";
export { Notification } from "../entities/notification.entity";
export { Conversation } from "../entities/conversation.entity";
export { Message } from "../entities/message.entity";
export { Report } from "../entities/report.entity";

// Payments & Subscriptions
export { Payment } from "../entities/payment.entity";
export { Subscription } from "../entities/subscription.entity";

// Settings & Configuration
export { Setting } from "../entities/setting.entity";
export { SettingHistory } from "../entities/setting-history.entity";

// Analytics & Monitoring
export { DashboardSnapshot } from "../entities/dashboard-snapshot.entity";

// Enterprise Authentication & Authorization
export { User } from "../auth/entities/user.entity";
export { Role } from "../auth/entities/role.entity";
export { Permission } from "../auth/entities/permission.entity";
export { AuditLog } from "../auth/entities/audit-log.entity";
