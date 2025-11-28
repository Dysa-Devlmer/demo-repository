# 🚀 Plan de Implementación: Sistema Profesional de Categorías

**Fecha**: 21 de noviembre de 2025
**Objetivo**: Crear sistema CRUD completo para categorías + Campo preparation_area

---

## 📋 RESUMEN EJECUTIVO

**Cambios principales**:
1. ✅ Crear nueva tabla `categories` con CRUD completo
2. ✅ Agregar campo `preparation_area` (cocina/barra/ambos)
3. ✅ Mantener compatibilidad con sistema actual (ENUM)
4. ✅ Panel de administración profesional para gestionar categorías
5. ✅ Control de permisos (admin, cajera, dueños pueden gestionar)

---

## 🏗️ ARQUITECTURA DEL NUEVO SISTEMA

### **1. Base de Datos**

#### **Nueva Tabla: `categories`**
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,          -- "Platos Principales"
  slug VARCHAR(100) UNIQUE NOT NULL,          -- "platos-principales"
  description TEXT,                           -- Descripción opcional
  icon VARCHAR(50),                           -- Ícono (ej: "utensils", "coffee")
  preparation_area preparation_area_enum DEFAULT 'kitchen', -- NUEVO
  display_order INT DEFAULT 0,                -- Orden de visualización
  is_active BOOLEAN DEFAULT true,             -- Activo/Inactivo
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### **Nuevo ENUM: `preparation_area_enum`**
```sql
CREATE TYPE preparation_area_enum AS ENUM (
  'kitchen',  -- Cocina
  'bar',      -- Barra
  'both'      -- Ambos
);
```

#### **Modificación a `menu_items`**
```sql
ALTER TABLE menu_items
ADD COLUMN category_id INT REFERENCES categories(id),
ADD COLUMN preparation_area preparation_area_enum DEFAULT 'kitchen';

-- Mantener category (ENUM) por compatibilidad
-- Los items pueden tener ambos: category_id (nuevo) y category (legacy)
```

---

### **2. Backend (NestJS)**

#### **A. Nueva Entidad: `Category`**
**Ubicación**: `/apps/backend/src/entities/category.entity.ts`

```typescript
@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ length: 100, unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ nullable: true })
  icon?: string;

  @Column({
    type: "enum",
    enum: PreparationArea,
    default: PreparationArea.KITCHEN
  })
  preparation_area: PreparationArea;

  @Column({ default: 0 })
  display_order: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => MenuItem, menuItem => menuItem.category_ref)
  menu_items: MenuItem[];
}
```

#### **B. Modificar Entidad: `MenuItem`**
**Ubicación**: `/apps/backend/src/entities/menu-item.entity.ts`

**Agregar**:
```typescript
// Nuevo ENUM
export enum PreparationArea {
  KITCHEN = "kitchen",
  BAR = "bar",
  BOTH = "both"
}

// En la clase MenuItem:
@ManyToOne(() => Category, category => category.menu_items, { nullable: true })
@JoinColumn({ name: "category_id" })
category_ref?: Category;

@Column({ type: "int", nullable: true })
category_id?: number;

@Column({
  type: "enum",
  enum: PreparationArea,
  default: PreparationArea.KITCHEN
})
preparation_area: PreparationArea;

// Mantener el category (ENUM) por compatibilidad
@Column({
  type: "enum",
  enum: MenuCategory,
  default: MenuCategory.MAIN_COURSE
})
category: MenuCategory; // Legacy - mantener por compatibilidad
```

#### **C. Nuevo Módulo: Categories**

**Archivos a crear**:
1. `/apps/backend/src/categories/categories.module.ts`
2. `/apps/backend/src/categories/categories.controller.ts`
3. `/apps/backend/src/categories/categories.service.ts`
4. `/apps/backend/src/categories/dto/create-category.dto.ts`
5. `/apps/backend/src/categories/dto/update-category.dto.ts`

**Endpoints**:
```
GET    /api/categories         - Listar todas las categorías
GET    /api/categories/:id     - Obtener categoría por ID
POST   /api/categories         - Crear nueva categoría
PUT    /api/categories/:id     - Actualizar categoría
DELETE /api/categories/:id     - Eliminar categoría
PUT    /api/categories/reorder - Reordenar categorías
```

#### **D. DTOs**

**CreateCategoryDto**:
```typescript
export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsEnum(PreparationArea)
  @IsOptional()
  preparation_area?: PreparationArea;

  @IsInt()
  @IsOptional()
  display_order?: number;
}
```

---

### **3. Frontend (Next.js 14 + Admin Panel)**

#### **A. Nueva Página: Gestión de Categorías**
**Ubicación**: `/apps/admin-panel/src/app/categories/page.tsx`

**Funcionalidades**:
- ✅ Listar todas las categorías
- ✅ Crear nueva categoría
- ✅ Editar categoría existente
- ✅ Eliminar categoría
- ✅ Activar/Desactivar categoría
- ✅ Reordenar categorías (drag & drop)
- ✅ Filtrar por área de preparación
- ✅ Estadísticas: Total de categorías, activas, inactivas

**UI Components**:
```
┌─────────────────────────────────────────┐
│  Gestión de Categorías                  │
│                                         │
│  [+ Nueva Categoría]  [Filtros ▼]      │
└─────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ 📊 Estadísticas                          │
│  Total: 8  |  Activas: 7  | Inactivas: 1│
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ 🍽️ Platos Principales    [Cocina]        │
│ 12 items  |  Orden: 1    [✏️] [🗑️] [⋮]  │
├──────────────────────────────────────────┤
│ 🥗 Entradas              [Cocina]        │
│ 8 items   |  Orden: 2    [✏️] [🗑️] [⋮]  │
├──────────────────────────────────────────┤
│ ☕ Bebidas               [Barra]         │
│ 15 items  |  Orden: 3    [✏️] [🗑️] [⋮]  │
└──────────────────────────────────────────┘
```

#### **B. Modal/Dialog: Crear/Editar Categoría**

**Campos del formulario**:
```
┌─────────────────────────────────────────┐
│ ✨ Nueva Categoría                       │
├─────────────────────────────────────────┤
│                                         │
│ Nombre *                                │
│ [_________________________]             │
│                                         │
│ Descripción (opcional)                  │
│ [_________________________]             │
│ [_________________________]             │
│                                         │
│ Ícono (opcional)                        │
│ [Seleccionar ícono ▼]                   │
│  🍽️ 🥗 🍕 🍰 ☕ 🍺 🍷                    │
│                                         │
│ Área de Preparación *                   │
│ ( ) Cocina                              │
│ ( ) Barra                               │
│ ( ) Ambos                               │
│                                         │
│ Orden de visualización                  │
│ [___] (numérico)                        │
│                                         │
│ [✓] Activa                              │
│                                         │
│  [Cancelar]  [Guardar]                  │
└─────────────────────────────────────────┘
```

#### **C. Actualizar: Formulario de Menú**
**Ubicación**: `/apps/admin-panel/src/app/menu/page.tsx`

**Cambios**:
1. Reemplazar dropdown de categorías fijas por dropdown dinámico desde `/api/categories`
2. Agregar selector de "Área de Preparación"
3. Filtrar categorías por área de preparación

**Nuevo formulario**:
```
┌─────────────────────────────────────────┐
│ Nombre del Platillo *                   │
│ [_________________________]             │
│                                         │
│ Categoría *                             │
│ [Seleccionar categoría ▼]               │  ← DINÁMICO
│  - Platos Principales (Cocina)          │
│  - Entradas (Cocina)                    │
│  - Bebidas (Barra)                      │
│  - Postres (Cocina)                     │
│                                         │
│ Área de Preparación *                   │
│ ( ) Cocina                              │
│ ( ) Barra                               │
│ ( ) Ambos                               │
│                                         │
│ Precio *                                │
│ [_________]                             │
└─────────────────────────────────────────┘
```

---

### **4. Migraciones**

#### **Migración 1: Crear tabla categories**
```typescript
// XXX-CreateCategoriesTable.ts
export class CreateCategoriesTable1700000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Crear ENUM preparation_area
    await queryRunner.query(`
      CREATE TYPE preparation_area_enum AS ENUM ('kitchen', 'bar', 'both')
    `);

    // Crear tabla categories
    await queryRunner.query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        preparation_area preparation_area_enum DEFAULT 'kitchen',
        display_order INT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Insertar categorías iniciales
    await queryRunner.query(`
      INSERT INTO categories (name, slug, preparation_area, display_order) VALUES
      ('Entradas', 'entradas', 'kitchen', 1),
      ('Platos Principales', 'platos-principales', 'kitchen', 2),
      ('Postres', 'postres', 'kitchen', 3),
      ('Bebidas', 'bebidas', 'bar', 4),
      ('Snacks', 'snacks', 'both', 5)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE categories`);
    await queryRunner.query(`DROP TYPE preparation_area_enum`);
  }
}
```

#### **Migración 2: Agregar campos a menu_items**
```typescript
// XXX-AddCategoryIdAndPreparationAreaToMenuItem.ts
export class AddCategoryIdAndPreparationArea1700000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar category_id
    await queryRunner.query(`
      ALTER TABLE menu_items
      ADD COLUMN category_id INT REFERENCES categories(id)
    `);

    // Agregar preparation_area
    await queryRunner.query(`
      ALTER TABLE menu_items
      ADD COLUMN preparation_area preparation_area_enum DEFAULT 'kitchen'
    `);

    // Migrar datos existentes (mapear category ENUM a category_id)
    await queryRunner.query(`
      UPDATE menu_items SET category_id = (
        SELECT id FROM categories WHERE
        slug = CASE menu_items.category
          WHEN 'appetizer' THEN 'entradas'
          WHEN 'main_course' THEN 'platos-principales'
          WHEN 'dessert' THEN 'postres'
          WHEN 'beverage' THEN 'bebidas'
          WHEN 'special' THEN 'snacks'
        END
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE menu_items DROP COLUMN category_id`);
    await queryRunner.query(`ALTER TABLE menu_items DROP COLUMN preparation_area`);
  }
}
```

---

## 🔐 SISTEMA DE PERMISOS

### **Permisos necesarios**:
```typescript
// Ya existen en el sistema:
"menu.create"    // Crear items de menú
"menu.update"    // Actualizar items de menú
"menu.delete"    // Eliminar items de menú

// NUEVOS - Agregar a la tabla permissions:
"categories.create"   // Crear categorías
"categories.read"     // Ver categorías
"categories.update"   // Actualizar categorías
"categories.delete"   // Eliminar categorías
"categories.manage"   // Gestión completa (reordenar, activar/desactivar)
```

### **Roles con acceso**:
- ✅ **Admin**: Acceso completo a todo
- ✅ **Gerente/Dueño**: Puede gestionar categorías
- ✅ **Cajera**: Puede ver y crear categorías (depende de configuración)
- ❌ **Mesero**: Solo lectura de categorías

---

## 📊 COMPATIBILIDAD Y MIGRACIÓN

### **Fase de Transición**:
1. **Mantener ambos sistemas** (ENUM y tabla categories) durante 2-3 meses
2. **Priorizar category_id** (nuevo) sobre category (legacy)
3. **Sincronizar automáticamente**: Si se usa category (ENUM), actualizar category_id
4. **Eventual deprecación**: En el futuro, eliminar el campo category (ENUM)

### **Lógica de Compatibilidad en el Service**:
```typescript
async create(dto: CreateMenuItemDto) {
  const item = new MenuItem();

  // Priorizar nuevo sistema
  if (dto.category_id) {
    item.category_id = dto.category_id;
    item.category_ref = await this.categoriesRepo.findOne(dto.category_id);
    // Sincronizar con legacy
    item.category = this.mapCategoryIdToEnum(dto.category_id);
  }
  // Fallback a sistema legacy
  else if (dto.category) {
    item.category = dto.category;
    // Intentar sincronizar con nuevo sistema
    item.category_id = await this.mapEnumToCategoryId(dto.category);
  }

  return this.menuItemsRepo.save(item);
}
```

---

## 🎯 FLUJO DE USUARIO

### **Escenario 1: Admin crea nueva categoría**
1. Admin va a `/categories`
2. Click en "+ Nueva Categoría"
3. Llena formulario:
   - Nombre: "Pizzas"
   - Área: "Cocina"
   - Ícono: 🍕
4. Guarda
5. **Resultado**: Nueva categoría disponible para usar en productos

### **Escenario 2: Cajera crea producto con nueva categoría**
1. Cajera va a `/menu`
2. Click en "+ Nuevo Platillo"
3. Selecciona categoría del dropdown dinámico
4. **Dropdown muestra**: Pizzas 🍕 (Cocina)
5. Selecciona área de preparación: "Cocina"
6. Guarda
7. **Resultado**: Producto creado y enviado a cocina

### **Escenario 3: Filtrar productos por área**
1. Usuario va a `/menu`
2. Filtros:
   - [Todas las áreas ▼]
   - [Solo Cocina]
   - [Solo Barra]
   - [Ambos]
3. **Resultado**: Lista filtrada de productos

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### **Backend**:
- [ ] Crear entidad `Category`
- [ ] Actualizar entidad `MenuItem` con `preparation_area` y `category_id`
- [ ] Crear módulo `CategoriesModule`
- [ ] Crear controlador `CategoriesController`
- [ ] Crear servicio `CategoriesService`
- [ ] Crear DTOs (Create/Update)
- [ ] Crear migración para tabla `categories`
- [ ] Crear migración para agregar campos a `menu_items`
- [ ] Agregar seeders con categorías iniciales
- [ ] Actualizar `MenuService` para usar category_id
- [ ] Agregar permisos de categorías a la BD

### **Frontend**:
- [ ] Crear página `/categories/page.tsx`
- [ ] Crear componente `CategoryList`
- [ ] Crear componente `CreateCategoryDialog`
- [ ] Crear componente `EditCategoryDialog`
- [ ] Actualizar API client con endpoints de categorías
- [ ] Actualizar formulario de menú con dropdown dinámico
- [ ] Agregar selector de `preparation_area` al formulario
- [ ] Agregar filtros por área de preparación
- [ ] Actualizar permisos en el frontend

### **Testing**:
- [ ] Probar CRUD de categorías
- [ ] Probar creación de producto con nueva categoría
- [ ] Probar compatibilidad con sistema legacy
- [ ] Probar filtros por área
- [ ] Probar permisos (admin, gerente, cajera)

---

## 🚀 ESTIMACIÓN DE TIEMPO

- **Backend**: 2-3 horas
- **Frontend**: 2-3 horas
- **Migraciones y seeds**: 30 min
- **Testing**: 1 hora

**Total**: 6-7 horas aproximadamente

---

## 📝 NOTAS IMPORTANTES

1. **No romper nada**: El sistema actual seguirá funcionando
2. **Migración gradual**: Los productos existentes se migrarán automáticamente
3. **Rollback fácil**: Si algo falla, podemos revertir a ENUM
4. **Escalable**: Agregar categorías ahora es simple y profesional
5. **Control de permisos**: Solo usuarios autorizados pueden gestionar

---

**¿Proceder con la implementación?**

Este plan te da un sistema profesional donde:
- ✅ Admin/Gerentes/Cajeras pueden crear/editar/eliminar categorías
- ✅ Categorías tienen área de preparación (cocina/barra/ambos)
- ✅ Sistema es escalable y fácil de mantener
- ✅ No rompe compatibilidad con código existente
