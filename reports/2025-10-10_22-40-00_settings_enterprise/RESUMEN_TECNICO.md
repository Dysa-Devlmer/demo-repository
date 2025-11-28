# 📋 RESUMEN TÉCNICO - SETTINGS ENTERPRISE

**Fecha**: 2025-10-10 22:40:00
**Módulo**: Settings Enterprise
**Versión**: 1.0.0

---

## 🔧 CAMBIOS EN BASE DE DATOS

### Nuevas Tablas

#### 1. `settings`
```sql
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active',
  is_sensitive BOOLEAN DEFAULT false,
  is_required BOOLEAN DEFAULT false,
  validation_rules JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_settings_category_key ON settings(category, key);
CREATE INDEX idx_settings_status ON settings(status);
CREATE INDEX idx_settings_key ON settings(key);
```

#### 2. `setting_history`
```sql
CREATE TABLE setting_history (
  id SERIAL PRIMARY KEY,
  setting_id INTEGER NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(255),
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_setting_history_setting_created ON setting_history(setting_id, created_at);
```

---

## 📦 DEPENDENCIAS

### Paquetes Utilizados
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/typeorm": "^10.0.0",
  "typeorm": "^0.3.17",
  "class-validator": "^0.14.0",
  "winston": "^3.11.0"
}
```

### Importaciones Clave
```typescript
import { Repository, MoreThan } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException, NotFoundException, Logger } from "@nestjs/common";
```

---

## 🏗️ ARQUITECTURA DE CAPAS

```
┌─────────────────────────────────────┐
│  SettingsEnterpriseController      │
│  - 13 endpoints REST                │
│  - Validación de permisos RBAC     │
│  - Transformación de DTOs           │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  SettingsEnterpriseService          │
│  - Lógica de negocio                │
│  - Validaciones                     │
│  - Logging                          │
│  - Manejo de historial              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  TypeORM Repositories               │
│  - settingsRepo                     │
│  - historyRepo                      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  PostgreSQL Database                │
│  - settings table                   │
│  - setting_history table            │
└─────────────────────────────────────┘
```

---

## 🔐 SEGURIDAD IMPLEMENTADA

### 1. Autenticación y Autorización

**Guards Aplicados:**
```typescript
@UseGuards(JwtAuthGuard, PermissionsGuard)
```

**Permisos Requeridos:**
- `settings.read` - Lectura de configuraciones
- `settings.update` - Modificación de configuraciones

### 2. Enmascaramiento de Datos

**Algoritmo:**
```typescript
private maskValue(value: string): string {
  if (!value || value.length < 8) {
    return "****";
  }
  // Muestra primeros 4 y últimos 4 caracteres
  return value.substring(0, 4) + "****" + value.substring(value.length - 4);
}
```

**Ejemplos:**
```
Input:  "EAABwzLixnjYBOZC3IFN12345678"
Output: "EAAB****5678"

Input:  "AC1234567890abcdef1234567890"
Output: "AC12****7890"
```

### 3. Validación de Entrada

**Tipos de Validación:**

| Tipo | Validador | Ejemplo |
|------|-----------|---------|
| Email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | `admin@zgamersa.com` |
| URL | `new URL(value)` | `https://api.whatsapp.com` |
| Pattern | `new RegExp(pattern)` | `^wamid_.*` |
| Length | `value.length >= min && value.length <= max` | `10-100` |
| Options | `options.includes(value)` | `['dev', 'prod']` |

### 4. Auditoría

**Eventos Auditados:**
```typescript
enum SettingChangeAction {
  CREATED = "created",
  UPDATED = "updated",
  DELETED = "deleted",
  ACTIVATED = "activated",
  ARCHIVED = "archived"
}
```

Cada evento registra:
- `old_value` - Valor anterior (enmascarado si es sensible)
- `new_value` - Valor nuevo (enmascarado si es sensible)
- `changed_by` - Email del usuario
- `reason` - Motivo del cambio
- `metadata` - IP, user agent, session ID

---

## 🚀 PERFORMANCE

### Optimizaciones Implementadas

#### 1. Índices de Base de Datos
```sql
-- Búsqueda rápida por categoría y clave (consulta más común)
CREATE INDEX idx_settings_category_key ON settings(category, key);

-- Filtrado por estado
CREATE INDEX idx_settings_status ON settings(status);

-- Búsqueda única por clave
CREATE INDEX idx_settings_key ON settings(key);

-- Historial ordenado por fecha
CREATE INDEX idx_setting_history_setting_created ON setting_history(setting_id, created_at);
```

#### 2. Paginación
```typescript
// Evita cargar todas las configuraciones en memoria
const skip = (page - 1) * limit;
queryBuilder.skip(skip).take(limit);
```

#### 3. Query Builder Optimizado
```typescript
// Solo selecciona campos necesarios
const queryBuilder = this.settingsRepo
  .createQueryBuilder("setting")
  .where("setting.category = :category", { category })
  .andWhere("setting.status = :status", { status: 'active' })
  .orderBy("setting.key", "ASC");
```

#### 4. Lazy Loading
```typescript
// Relaciones solo se cargan cuando se necesitan
@ManyToOne(() => Setting, { onDelete: "CASCADE" })
setting: Setting; // No se carga automáticamente
```

### Métricas Esperadas

| Operación | Tiempo Esperado | Registros |
|-----------|----------------|-----------|
| `create()` | < 50ms | 1 |
| `findAll()` (paginado) | < 100ms | 20 |
| `findByKey()` | < 20ms | 1 |
| `update()` | < 80ms | 1 |
| `getHistory()` | < 150ms | 20 |
| `getStatistics()` | < 300ms | N/A |
| `bulkUpdate()` | < 500ms | 10 |

---

## 🧪 PRUEBAS

### Casos de Prueba Recomendados

#### 1. CRUD Básico
```typescript
describe('Settings CRUD', () => {
  it('should create a new setting', async () => {
    const setting = await service.create({
      key: 'test.key',
      value: 'test_value',
      category: SettingCategory.GENERAL,
      changedBy: 'test@test.com'
    });
    expect(setting.id).toBeDefined();
    expect(setting.status).toBe(SettingStatus.ACTIVE);
  });

  it('should not allow duplicate keys', async () => {
    await expect(service.create({
      key: 'test.key', // ya existe
      value: 'another_value',
      category: SettingCategory.GENERAL
    })).rejects.toThrow(BadRequestException);
  });

  it('should mask sensitive values', async () => {
    const setting = await service.findByKey('sensitive.token', false);
    expect(setting.value).toMatch(/\*\*\*\*/);
  });
});
```

#### 2. Validación
```typescript
describe('Settings Validation', () => {
  it('should validate email format', async () => {
    const setting = await service.create({
      key: 'admin.email',
      value: 'invalid-email',
      category: SettingCategory.GENERAL,
      validationRules: { type: 'email' }
    });

    await expect(service.update('admin.email', {
      value: 'invalid-email'
    })).rejects.toThrow('Invalid email format');
  });

  it('should validate URL format', async () => {
    await expect(service.update('api.url', {
      value: 'not-a-url'
    })).rejects.toThrow('Invalid URL format');
  });
});
```

#### 3. Estados
```typescript
describe('Settings States', () => {
  it('should activate archived setting', async () => {
    await service.archive('test.key', 'admin@test.com');
    const activated = await service.activate('test.key', 'admin@test.com');
    expect(activated.status).toBe(SettingStatus.ACTIVE);
  });

  it('should create history record on state change', async () => {
    await service.archive('test.key', 'admin@test.com', 'Testing');
    const history = await service.getHistory('test.key', 1);
    expect(history[0].action).toBe(SettingChangeAction.ARCHIVED);
  });
});
```

#### 4. Agregación
```typescript
describe('Settings Aggregation', () => {
  it('should return correct statistics', async () => {
    const stats = await service.getStatistics();
    expect(stats.total).toBeGreaterThan(0);
    expect(stats.active + stats.draft + stats.archived).toBe(stats.total);
  });

  it('should track user changes', async () => {
    const changes = await service.getChangesByUser('admin@test.com', 10);
    expect(changes.length).toBeGreaterThan(0);
    expect(changes[0].changed_by).toBe('admin@test.com');
  });
});
```

### Comandos de Prueba

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas del módulo Settings
npm test -- settings

# Ejecutar con coverage
npm test -- --coverage

# Ejecutar en modo watch
npm test -- --watch
```

---

## 📊 MONITORING Y LOGS

### Eventos Loggeados

#### Nivel: LOG (Informativo)
```typescript
✅ "Setting 'key' created by user"
✅ "Setting 'key' updated by user: value: old → new"
✅ "Bulk update completed: X success, Y failed"
```

#### Nivel: WARN (Advertencia)
```typescript
⚠️ "Setting 'key' deleted by user"
⚠️ "Setting 'key' archived by user"
```

#### Nivel: ERROR (Error)
```typescript
❌ "Error getting settings: {message}"
❌ "Error updating settings: {message}"
```

### Integración con Winston

```typescript
private readonly logger = new Logger(SettingsEnterpriseService.name);

this.logger.log(`Setting '${data.key}' created by ${data.changedBy || "system"}`);
this.logger.warn(`Setting '${key}' deleted by ${changedBy || "system"}`);
this.logger.error("Error getting settings:", error.message);
```

### Métricas a Monitorear

```typescript
// Prometheus-style metrics (futuro)
settings_total{status="active"} 38
settings_total{status="draft"} 3
settings_total{status="archived"} 4
settings_changes_24h 15
settings_sensitive_count 12
settings_update_duration_seconds{operation="create"} 0.045
settings_update_duration_seconds{operation="update"} 0.078
```

---

## 🔄 MIGRACIÓN

### Script de Migración desde .env

```typescript
// scripts/migrate-env-to-db.ts

import { SettingsEnterpriseService } from './modules/settings/settings-enterprise.service';
import { SettingCategory } from './entities/setting.entity';
import * as dotenv from 'dotenv';

async function migrateEnvToDatabase() {
  dotenv.config();

  const envMappings = [
    // Restaurant
    { key: 'restaurant.name', value: process.env.RESTAURANT_NAME, category: SettingCategory.RESTAURANT },
    { key: 'restaurant.phone', value: process.env.RESTAURANT_PHONE, category: SettingCategory.RESTAURANT },
    { key: 'restaurant.email', value: process.env.RESTAURANT_EMAIL, category: SettingCategory.RESTAURANT },
    { key: 'restaurant.address', value: process.env.RESTAURANT_ADDRESS, category: SettingCategory.RESTAURANT },

    // WhatsApp
    { key: 'whatsapp.phone_number', value: process.env.WA_BUSINESS_PHONE_NUMBER, category: SettingCategory.WHATSAPP, isSensitive: true },
    { key: 'whatsapp.access_token', value: process.env.WA_ACCESS_TOKEN, category: SettingCategory.WHATSAPP, isSensitive: true, isRequired: true },
    { key: 'whatsapp.webhook_url', value: process.env.WA_WEBHOOK_URL, category: SettingCategory.WHATSAPP },

    // Twilio
    { key: 'twilio.account_sid', value: process.env.TWILIO_ACCOUNT_SID, category: SettingCategory.TWILIO, isSensitive: true },
    { key: 'twilio.auth_token', value: process.env.TWILIO_AUTH_TOKEN, category: SettingCategory.TWILIO, isSensitive: true },
    { key: 'twilio.phone_number', value: process.env.TWILIO_PHONE_NUMBER, category: SettingCategory.TWILIO },

    // Ollama
    { key: 'ollama.url', value: process.env.OLLAMA_URL, category: SettingCategory.OLLAMA },
    { key: 'ollama.model', value: process.env.OLLAMA_MODEL, category: SettingCategory.OLLAMA },

    // Database
    { key: 'database.host', value: process.env.DATABASE_HOST, category: SettingCategory.DATABASE },
    { key: 'database.port', value: process.env.DATABASE_PORT, category: SettingCategory.DATABASE },
    { key: 'database.name', value: process.env.DATABASE_NAME, category: SettingCategory.DATABASE },
  ];

  let migrated = 0;
  let skipped = 0;

  for (const mapping of envMappings) {
    if (!mapping.value) {
      console.log(`⚠️  Skipping ${mapping.key} - no value in .env`);
      skipped++;
      continue;
    }

    try {
      await settingsService.create({
        key: mapping.key,
        value: mapping.value,
        category: mapping.category,
        isSensitive: mapping.isSensitive || false,
        isRequired: mapping.isRequired || false,
        changedBy: 'migration_script'
      });
      console.log(`✅ Migrated ${mapping.key}`);
      migrated++;
    } catch (error) {
      console.log(`❌ Error migrating ${mapping.key}: ${error.message}`);
    }
  }

  console.log(`\n📊 Migration Summary:`);
  console.log(`  ✅ Migrated: ${migrated}`);
  console.log(`  ⚠️  Skipped: ${skipped}`);
}

migrateEnvToDatabase();
```

### Ejecutar Migración

```bash
# Desarrollo
npm run migration:env-to-db

# Producción
NODE_ENV=production npm run migration:env-to-db
```

---

## 🛠️ TROUBLESHOOTING

### Problema 1: Configuración no se actualiza

**Síntoma:**
```
PUT /api/settings/enterprise/whatsapp.token
Response: 200 OK pero el valor no cambia
```

**Causa:** Caché de aplicación o configuración en memoria

**Solución:**
```typescript
// Limpiar caché después de actualizar
await cacheManager.del(`setting:${key}`);

// Reiniciar servicio si restart_required = true
if (setting.metadata?.restart_required) {
  await notifyRestartRequired(setting.key);
}
```

### Problema 2: Error de permisos

**Síntoma:**
```
403 Forbidden: Insufficient permissions
```

**Causa:** Usuario no tiene permiso `settings.update`

**Solución:**
```sql
-- Verificar permisos del usuario
SELECT p.permission
FROM user_permissions p
WHERE p.user_id = 1;

-- Agregar permiso
INSERT INTO user_permissions (user_id, permission)
VALUES (1, 'settings.update');
```

### Problema 3: Validación falla

**Síntoma:**
```
400 Bad Request: Invalid email format
```

**Causa:** Valor no cumple con validation_rules

**Solución:**
```typescript
// Actualizar reglas de validación
await service.update('admin.email', {
  value: 'admin@zgamersa.com', // email válido
  changedBy: 'admin@zgamersa.com'
});

// O remover validación
UPDATE settings
SET validation_rules = NULL
WHERE key = 'admin.email';
```

---

## 📚 REFERENCIAS

### Documentación Oficial

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Class Validator](https://github.com/typestack/class-validator)
- [Winston Logger](https://github.com/winstonjs/winston)

### Código Relacionado

- Dashboard Enterprise: `/reportes/DASHBOARD_ENTERPRISE_100_PERCENT.md`
- Reservations Service: `/apps/backend/src/reservations/reservations.service.ts`
- Conversations Service: `/apps/backend/src/conversations/conversations.service.ts`

---

**Documento Técnico v1.0**
**Última actualización**: 2025-10-10 22:40:00
