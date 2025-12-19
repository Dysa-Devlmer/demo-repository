import { SetMetadata } from '@nestjs/common';

export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// Common permission constants for easy reuse
// ✅ Updated to match database format: module.action (not module:action)
export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_READ: 'dashboard.read',
  DASHBOARD_MANAGE: 'dashboard.manage',

  // Customers
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_UPDATE: 'customers.update',
  CUSTOMERS_DELETE: 'customers.delete',
  CUSTOMERS_EXPORT: 'customers.export',

  // Orders
  ORDERS_CREATE: 'orders.create',
  ORDERS_READ: 'orders.read',
  ORDERS_UPDATE: 'orders.update',
  ORDERS_DELETE: 'orders.delete',

  // Menu
  MENU_CREATE: 'menu.create',
  MENU_READ: 'menu.read',
  MENU_UPDATE: 'menu.update',
  MENU_DELETE: 'menu.delete',

  // Reservations
  RESERVATIONS_CREATE: 'reservations.create',
  RESERVATIONS_READ: 'reservations.read',
  RESERVATIONS_UPDATE: 'reservations.update',
  RESERVATIONS_DELETE: 'reservations.delete',

  // Conversations
  CONVERSATIONS_READ: 'conversations.read',
  CONVERSATIONS_MANAGE: 'conversations.manage',

  // Settings
  SETTINGS_READ: 'settings.read',
  SETTINGS_UPDATE: 'settings.update',

  // Users
  USERS_CREATE: 'users.create',
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_DELETE: 'users.delete',

  // Roles
  ROLES_CREATE: 'roles.create',
  ROLES_READ: 'roles.read',
  ROLES_UPDATE: 'roles.update',
  ROLES_DELETE: 'roles.delete',

  // System
  SYSTEM_MANAGE: 'system.manage',

  // Reports
  REPORTS_READ: 'reports.read',
  REPORTS_EXPORT: 'reports.export',

  // Audit
  AUDIT_READ: 'audit.read',
};
