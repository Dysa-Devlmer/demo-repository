# Sistema de Reportes - ChatBotDysa

## 📋 Descripción General

Sistema completo de gestión de reportes con backend NestJS + TypeORM y frontend Next.js 14.

## 🏗️ Arquitectura

```
Backend (NestJS)
├── entities/report.entity.ts         # Entidad TypeORM con enums
├── reports/
│   ├── dto/
│   │   ├── create-report.dto.ts      # DTO para crear reportes
│   │   ├── update-report.dto.ts      # DTO para actualizar reportes
│   │   └── report-response.dto.ts    # DTO para respuestas
│   ├── reports.controller.ts         # Endpoints REST + Swagger
│   ├── reports.service.ts            # Lógica de negocio
│   └── reports.module.ts             # Módulo NestJS

Frontend (Next.js 14)
├── lib/api.ts                         # API Service actualizado
└── app/reports/
    ├── page.tsx                       # Lista de reportes
    ├── builder/page.tsx               # Crear reporte
    └── [id]/page.tsx                  # Editar reporte
```

## 📊 Modelo de Datos

### Entidad Report

```typescript
{
  id: number;
  name: string;                        // Nombre del reporte
  description?: string;                // Descripción opcional
  type: ReportType;                    // sales | customers | menu | reservations | operations | custom
  format: ReportFormat;                // pdf | excel | csv
  schedule: ReportSchedule;            // manual | daily | weekly | monthly
  status: ReportStatus;                // draft | active | archived
  metrics: string[];                   // Array de métricas a incluir
  filters?: Record<string, any>;       // Filtros personalizados
  dateRange?: string;                  // Rango de fechas
  lastGenerated?: Date;                // Última generación
  lastGeneratedUrl?: string;           // URL del último archivo generado
  createdBy: number;                   // ID del usuario creador
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔌 Endpoints API

### Gestión de Reportes

| Método | Endpoint | Descripción | Permisos |
|--------|----------|-------------|----------|
| GET | `/api/reports` | Listar reportes (con filtros) | Admin, Staff |
| GET | `/api/reports/:id` | Obtener reporte por ID | Admin, Staff |
| GET | `/api/reports/statistics` | Estadísticas generales | Admin |
| GET | `/api/reports/scheduled` | Reportes programados | Admin |
| GET | `/api/reports/type/:type` | Reportes por tipo | Admin, Staff |
| POST | `/api/reports` | Crear nuevo reporte | Admin, Staff |
| POST | `/api/reports/:id/generate` | Generar archivo del reporte | Admin, Staff |
| PUT | `/api/reports/:id` | Actualizar reporte | Admin, Staff |
| PUT | `/api/reports/:id/archive` | Archivar reporte (soft delete) | Admin |
| DELETE | `/api/reports/:id` | Eliminar reporte (hard delete) | Admin |

### Parámetros de Consulta

**GET /api/reports**
- `type`: Filtrar por tipo (sales, customers, etc.)
- `status`: Filtrar por estado (draft, active, archived)

## 🎯 Funcionalidades del Service

### ReportsService

**CRUD Básico:**
- `create(dto, userId)` - Crear reporte
- `findAll(filters)` - Listar con filtros
- `findOne(id)` - Obtener por ID
- `update(id, dto)` - Actualizar
- `remove(id)` - Eliminar (hard delete)

**Funciones Avanzadas:**
- `archive(id)` - Archivar (soft delete)
- `generate(id)` - Generar archivo del reporte
- `getByType(type)` - Filtrar por tipo
- `getScheduledReports()` - Obtener reportes programados
- `getStatistics()` - Estadísticas completas:
  ```typescript
  {
    total: number;
    active: number;
    draft: number;
    archived: number;
    byType: Record<ReportType, number>;
    byFormat: Record<ReportFormat, number>;
    scheduled: number;
  }
  ```

## 💻 Uso del API Service (Frontend)

```typescript
import { apiService } from '@/lib/api';

// Listar reportes
const reports = await apiService.reports.getAll();
const salesReports = await apiService.reports.getAll({ type: 'sales' });

// Crear reporte
const newReport = await apiService.reports.create({
  name: 'Ventas Mensuales',
  type: 'sales',
  format: 'pdf',
  schedule: 'monthly',
  metrics: ['revenue', 'orders_count'],
  dateRange: 'last_30_days'
});

// Generar reporte
const result = await apiService.reports.generate(reportId);
window.open(result.data.url, '_blank');

// Actualizar reporte
await apiService.reports.update(reportId, {
  name: 'Nuevo Nombre',
  metrics: ['revenue', 'orders_count', 'avg_order_value']
});

// Archivar reporte
await apiService.reports.archive(reportId);

// Eliminar reporte
await apiService.reports.delete(reportId);

// Estadísticas
const stats = await apiService.reports.getStatistics();

// Reportes programados
const scheduled = await apiService.reports.getScheduled();

// Reportes por tipo
const customerReports = await apiService.reports.getByType('customers');
```

## 🔒 Seguridad

- **Autenticación:** JWT Bearer Token requerido en todos los endpoints
- **Autorización RBAC:**
  - Admin: Acceso completo (CRUD + estadísticas + archivado)
  - Staff: Crear, listar, ver, actualizar, generar
- **Guards:** `AuthGuard` + `RolesGuard`
- **Validación:** DTOs con class-validator decorators

## 🗄️ Base de Datos

La tabla `reports` se sincroniza automáticamente en desarrollo gracias a TypeORM `synchronize: true`.

La entidad está registrada en:
```typescript
// apps/backend/src/database/entities.ts
export { Report } from "../entities/report.entity";
```

## 📝 Validaciones (DTOs)

```typescript
// CreateReportDto
{
  @IsString() @Length(1, 200)
  name: string;

  @IsOptional() @IsString()
  description?: string;

  @IsEnum(ReportType)
  type: ReportType;

  @IsOptional() @IsEnum(ReportFormat)
  format?: ReportFormat;

  @IsOptional() @IsEnum(ReportSchedule)
  schedule?: ReportSchedule;

  @IsOptional() @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsArray() @IsString({ each: true })
  metrics: string[];

  @IsOptional() @IsObject()
  filters?: Record<string, any>;

  @IsOptional() @IsString()
  dateRange?: string;
}
```

## 🎨 Páginas Frontend

### 1. Lista de Reportes (`/reports`)
- Tabla con todos los reportes
- Filtros por tipo y búsqueda
- Acciones: Ver, Editar, Generar, Eliminar
- Botón para crear nuevo reporte

### 2. Crear Reporte (`/reports/builder`)
- Formulario completo para configuración
- Selección de tipo, formato, programación
- Selección múltiple de métricas
- Validación client-side

### 3. Editar Reporte (`/reports/[id]`)
- Formulario pre-cargado con datos existentes
- Actualización de configuración
- Generación de reporte desde la página de edición
- Historial de generaciones (preparado para futuro)

## ✅ Estado de Implementación

- ✅ Backend completo (Entity, DTOs, Service, Controller, Module)
- ✅ Frontend completo (API Service, 3 páginas)
- ✅ Integración completa con AppModule
- ✅ Entidad registrada en database/entities.ts
- ✅ TypeScript sin errores (frontend y backend)
- ✅ Build exitoso (frontend y backend)
- ✅ Documentación Swagger automática
- ✅ Logging implementado
- ✅ Manejo de errores robusto

## 🚀 Próximos Pasos Recomendados

1. **Implementar generación real de archivos:**
   - PDF con bibliotecas como `pdfkit` o `puppeteer`
   - Excel con `exceljs`
   - CSV con buffer nativo de Node.js

2. **Agregar almacenamiento de archivos:**
   - AWS S3 / Google Cloud Storage
   - Sistema de archivos local para desarrollo
   - URLs firmadas para descarga segura

3. **Implementar scheduler para reportes automáticos:**
   - `@nestjs/schedule` con cron jobs
   - Queue con Bull/BullMQ para procesamiento asíncrono

4. **Historial de generaciones:**
   - Tabla `report_generations` relacionada con `reports`
   - Guardar metadata de cada generación

5. **Testing:**
   - Unit tests para service y controller
   - E2E tests para endpoints
   - Integration tests con base de datos de prueba

## 📚 Referencias

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Swagger/OpenAPI](https://swagger.io/)
