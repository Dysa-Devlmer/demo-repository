# RBAC System - Usage Guide
**ChatBotDysa Enterprise**

---

## 📋 Overview

The RBAC (Role-Based Access Control) system provides enterprise-grade authorization with:
- **4 Roles:** admin, manager, staff, user
- **35 Permissions** across 12 modules
- **Granular control** via decorators and guards

---

## 🔐 Current Roles

| Role | Description | Permission Count |
|------|-------------|------------------|
| `admin` | Administrador - Acceso completo | 35 (all) |
| `manager` | Gerente - Gestión restaurante | ~25 (no system/users/roles) |
| `staff` | Empleado - Operaciones diarias | ~18 (read, create, update only) |
| `user` | Usuario - Lectura básica | ~5 (read only) |

---

## 🎯 Permissions by Module

### Dashboard
- `dashboard.read` - Ver dashboard
- `dashboard.manage` - Gestionar dashboard

### Customers
- `customers.create` - Crear clientes
- `customers.read` - Ver clientes
- `customers.update` - Actualizar clientes
- `customers.delete` - Eliminar clientes
- `customers.export` - Exportar clientes

### Orders
- `orders.create` - Crear pedidos
- `orders.read` - Ver pedidos
- `orders.update` - Actualizar pedidos
- `orders.delete` - Eliminar pedidos

### Menu
- `menu.create` - Crear items
- `menu.read` - Ver menú
- `menu.update` - Actualizar menú
- `menu.delete` - Eliminar items

### Reservations
- `reservations.create` - Crear reservas
- `reservations.read` - Ver reservas
- `reservations.update` - Actualizar reservas
- `reservations.delete` - Eliminar reservas

### Conversations
- `conversations.read` - Ver conversaciones
- `conversations.manage` - Gestionar conversaciones

### Settings
- `settings.read` - Ver configuración
- `settings.update` - Actualizar configuración

### Users
- `users.create` - Crear usuarios
- `users.read` - Ver usuarios
- `users.update` - Actualizar usuarios
- `users.delete` - Eliminar usuarios

### Roles
- `roles.create` - Crear roles
- `roles.read` - Ver roles
- `roles.update` - Actualizar roles
- `roles.delete` - Eliminar roles

### System
- `system.manage` - Gestionar sistema

### Reports
- `reports.read` - Ver reportes
- `reports.export` - Exportar reportes

### Audit
- `audit.read` - Ver auditoría

---

## 💻 Usage in Controllers

### Option 1: Role-Based Guards (Coarse-Grained)

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles, ROLES } from '../auth/decorators/roles.decorator';

@Controller('customers')
@UseGuards(AuthGuard, RolesGuard)
export class CustomersController {

  @Get()
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  findAll() {
    // Only admin, manager, or staff can access
    return this.customersService.findAll();
  }

  @Delete(':id')
  @RequireRoles(ROLES.ADMIN)
  remove(@Param('id') id: number) {
    // Only admin can delete
    return this.customersService.remove(id);
  }
}
```

**When to use:** When you need role-level control (e.g., "only admins")

---

### Option 2: Permission-Based Guards (Fine-Grained)

```typescript
import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions, PERMISSIONS } from '../auth/decorators/permissions.decorator';

@Controller('customers')
@UseGuards(AuthGuard, PermissionsGuard)
export class CustomersController {

  @Get()
  @RequirePermissions(PERMISSIONS.CUSTOMERS_READ)
  findAll() {
    // Anyone with customers.read permission
    return this.customersService.findAll();
  }

  @Post()
  @RequirePermissions(PERMISSIONS.CUSTOMERS_CREATE)
  create(@Body() dto: CreateCustomerDto) {
    // Anyone with customers.create permission
    return this.customersService.create(dto);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.CUSTOMERS_DELETE)
  remove(@Param('id') id: number) {
    // Anyone with customers.delete permission
    return this.customersService.remove(id);
  }
}
```

**When to use:** When you need granular control based on specific permissions

---

### Option 3: Combining Both (Recommended)

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions, PERMISSIONS } from '../auth/decorators/permissions.decorator';

@Controller('settings')
@UseGuards(AuthGuard, PermissionsGuard)
export class SettingsController {

  @Get()
  @RequirePermissions(PERMISSIONS.SETTINGS_READ)
  findAll() {
    // Anyone with settings.read permission (admin, manager)
    return this.settingsService.findAll();
  }

  @Post()
  @RequirePermissions(PERMISSIONS.SETTINGS_UPDATE)
  update(@Body() dto: UpdateSettingsDto) {
    // Only users with settings.update (admin only - system permission)
    return this.settingsService.update(dto);
  }
}
```

---

## 🧪 Testing Permissions

### 1. Login to Get JWT Token

```bash
curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@zgamersa.com",
    "password": "Admin123!"
  }' | python3 -m json.tool
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "admin@zgamersa.com",
    "roles": [
      {
        "id": 1,
        "name": "admin",
        "displayName": "Administrador",
        "permissions": [
          {"name": "dashboard.read"},
          {"name": "customers.create"},
          // ... all 35 permissions
        ]
      }
    ]
  },
  "accessToken": "eyJ...",
  "expiresIn": 3600
}
```

### 2. Use Token to Access Protected Endpoints

```bash
JWT="eyJ..."

# Should succeed (admin has customers.read)
curl -H "Authorization: Bearer $JWT" http://localhost:8005/api/customers

# Should succeed (admin has customers.create)
curl -X POST -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Customer","email":"test@example.com"}' \
  http://localhost:8005/api/customers

# Should succeed (admin has customers.delete)
curl -X DELETE -H "Authorization: Bearer $JWT" \
  http://localhost:8005/api/customers/1
```

### 3. Test Permission Denial

Create a test user with limited permissions:

```sql
-- Insert test staff user
INSERT INTO users (email, password, "firstName", "lastName", status)
VALUES ('staff@test.com', '$2b$10$...', 'Staff', 'User', 'active');

-- Assign staff role
INSERT INTO user_roles ("userId", "roleId")
SELECT u.id, r.id FROM users u, roles r
WHERE u.email = 'staff@test.com' AND r.name = 'staff';
```

Login as staff and try admin-only operations:

```bash
# Login as staff
STAFF_JWT=$(curl -X POST http://localhost:8005/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@test.com","password":"Admin123!"}' \
  | jq -r '.data.accessToken')

# Should succeed (staff has customers.read)
curl -H "Authorization: Bearer $STAFF_JWT" http://localhost:8005/api/customers

# Should FAIL with 403 (staff doesn't have customers.delete)
curl -X DELETE -H "Authorization: Bearer $STAFF_JWT" \
  http://localhost:8005/api/customers/1
```

**Expected response:**
```json
{
  "statusCode": 403,
  "message": "Acceso denegado. Se requieren permisos: customers.delete"
}
```

---

## 🔧 Adding New Permissions

### 1. Add to Database

```sql
-- Add new permission
INSERT INTO permissions (name, "displayName", description, module, action, "isActive", "isSystem")
VALUES ('products.import', 'Importar Productos', 'Importar productos desde CSV', 'products', 'create', true, false);

-- Assign to admin role
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name = 'products.import';
```

### 2. Add to Code Constants

Edit `apps/backend/src/auth/decorators/permissions.decorator.ts`:

```typescript
export const PERMISSIONS = {
  // ... existing permissions

  // Products
  PRODUCTS_IMPORT: "products.import",
};
```

### 3. Use in Controller

```typescript
@Post('import')
@RequirePermissions(PERMISSIONS.PRODUCTS_IMPORT)
importProducts(@Body() dto: ImportProductsDto) {
  return this.productsService.import(dto);
}
```

---

## 📊 Database Schema

### Tables

- `roles` - Role definitions (admin, manager, staff, user)
- `permissions` - Permission definitions (module.action)
- `role_permissions` - Many-to-many: roles ↔ permissions
- `user_roles` - Many-to-many: users ↔ roles

### Key Relationships

```
User → user_roles → Role → role_permissions → Permission
```

User inherits all permissions from all assigned roles.

---

## 🎨 Frontend Integration

### React Context Provider (Future Implementation)

```typescript
// apps/admin-panel/src/contexts/PermissionsContext.tsx
import { createContext, useContext } from 'react';

interface PermissionsContextType {
  permissions: string[];
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

export const usePermissions = () => {
  const context = useContext(PermissionsContext);

  return {
    can: (permission: string) => context.permissions.includes(permission),
    canAny: (permissions: string[]) =>
      permissions.some(p => context.permissions.includes(p)),
    canAll: (permissions: string[]) =>
      permissions.every(p => context.permissions.includes(p)),
  };
};

// Usage in components
function CustomersPage() {
  const { can } = usePermissions();

  return (
    <div>
      <h1>Customers</h1>
      {can('customers.create') && (
        <Button onClick={handleCreate}>New Customer</Button>
      )}
      <CustomersList />
      {can('customers.export') && (
        <Button onClick={handleExport}>Export CSV</Button>
      )}
    </div>
  );
}
```

---

## ✅ Best Practices

### 1. Always Use Guards

```typescript
// ❌ BAD - No authentication
@Controller('customers')
export class CustomersController {}

// ✅ GOOD - Auth + Permissions
@Controller('customers')
@UseGuards(AuthGuard, PermissionsGuard)
export class CustomersController {}
```

### 2. Use Constants, Not Strings

```typescript
// ❌ BAD - Magic strings
@RequirePermissions('customers.read')

// ✅ GOOD - Type-safe constants
@RequirePermissions(PERMISSIONS.CUSTOMERS_READ)
```

### 3. Granular Permissions

```typescript
// ❌ BAD - Too coarse
@RequireRoles(ROLES.ADMIN)

// ✅ GOOD - Specific permission
@RequirePermissions(PERMISSIONS.CUSTOMERS_DELETE)
```

### 4. Document Permission Requirements

```typescript
/**
 * Delete a customer
 * @requires customers.delete permission
 * @param id - Customer ID
 */
@Delete(':id')
@RequirePermissions(PERMISSIONS.CUSTOMERS_DELETE)
remove(@Param('id') id: number) {
  return this.customersService.remove(id);
}
```

---

## 🐛 Troubleshooting

### Issue: "Usuario no autenticado"

**Cause:** No JWT token in request

**Solution:** Include `Authorization: Bearer <token>` header

### Issue: "Acceso denegado"

**Cause:** User doesn't have required permission

**Solution:**
1. Check user's roles: `SELECT * FROM user_roles WHERE "userId" = 1;`
2. Check role's permissions: `SELECT * FROM role_permissions WHERE "roleId" = 1;`
3. Assign missing permission or role

### Issue: Permission constants don't match database

**Cause:** Using old `:` format instead of `.` format

**Solution:** Update to use `module.action` format (e.g., `customers.read`)

---

## 📚 Related Files

- `apps/backend/src/auth/decorators/permissions.decorator.ts` - Permission constants
- `apps/backend/src/auth/decorators/roles.decorator.ts` - Role constants
- `apps/backend/src/auth/guards/permissions.guard.ts` - Permission guard
- `apps/backend/src/auth/guards/roles.guard.ts` - Role guard
- `/tmp/seed-roles-permissions.sql` - Database seed script

---

## 🎯 Summary

The RBAC system provides:
- ✅ Enterprise-grade authorization
- ✅ 4 roles with hierarchical permissions
- ✅ 35 granular permissions across 12 modules
- ✅ Easy-to-use decorators and guards
- ✅ Type-safe constants
- ✅ Comprehensive testing support

Use `@RequirePermissions()` for granular control and `@RequireRoles()` for broader access control.

---

**Last Updated:** 2025-10-05
**ChatBotDysa Enterprise - RBAC System**
