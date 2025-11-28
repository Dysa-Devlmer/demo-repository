# 📚 Guía Completa del Sistema de Menú y Categorías

**Fecha**: 21 de noviembre de 2025
**Sistema**: ChatBotDysa - Gestión de Menú

---

## ✅ Estado Actual del Sistema

### **Servicios Activos**
```
✅ Backend API:     http://localhost:8005  (Estado: OK)
✅ Admin Panel:     http://localhost:7001  (Estado: OK)
✅ Base de Datos:   PostgreSQL localhost:15432 (Conectada)
✅ Cache Redis:     localhost:16379 (Opcional)
```

### **Endpoints Funcionando**
```
✅ GET    /api/menu          - Listar items del menú
✅ GET    /api/menu/:id      - Obtener item por ID
✅ POST   /api/menu          - Crear nuevo item
✅ PUT    /api/menu/:id      - Actualizar item
✅ DELETE /api/menu/:id      - Eliminar item

✅ GET    /api/conversations - Listar conversaciones
✅ POST   /api/conversations - Crear conversación
✅ PUT    /api/conversations/:id - Actualizar conversación (NUEVO)
✅ DELETE /api/conversations/:id - Eliminar conversación (NUEVO)
```

---

## 📊 CATEGORÍAS DEL SISTEMA

### **Categorías Predefinidas (ENUM en Base de Datos)**

El sistema utiliza un **ENUM** en PostgreSQL que define las categorías disponibles:

```sql
-- Categorías actuales:
CREATE TYPE menu_items_category_enum AS ENUM (
  'appetizer',      -- Entradas
  'main_course',    -- Platos Principales
  'dessert',        -- Postres
  'beverage',       -- Bebidas
  'special'         -- Snacks/Especiales
);
```

### **Traducción de Categorías en el Frontend**

| Valor en BD | Etiqueta en Español |
|-------------|---------------------|
| `appetizer` | Entradas |
| `main_course` | Platos Principales |
| `dessert` | Postres |
| `beverage` | Bebidas |
| `special` | Snacks |

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Backend - NestJS**

#### 1. **Entidad MenuItem** (`/apps/backend/src/entities/menu-item.entity.ts`)

```typescript
export enum MenuCategory {
  APPETIZER = "appetizer",
  MAIN_COURSE = "main_course",
  DESSERT = "dessert",
  BEVERAGE = "beverage",
  SPECIAL = "special",
}

@Entity("menu_items")
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column("decimal", { precision: 8, scale: 2 })
  price: number;

  @Column({
    type: "enum",
    enum: MenuCategory,
    default: MenuCategory.MAIN_COURSE,
  })
  category: MenuCategory;

  @Column({
    type: "enum",
    enum: DietaryType,
    default: DietaryType.REGULAR,
  })
  dietary_type: DietaryType;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: "simple-array", nullable: true })
  ingredients?: string[];

  @Column({ type: "simple-array", nullable: true })
  allergens?: string[];

  @Column({ nullable: true })
  preparationTime?: number; // en minutos

  @Column({ default: true })
  available: boolean;
}
```

#### 2. **Controlador MenuController** (`/apps/backend/src/menu/menu.controller.ts`)

```typescript
@Controller("menu")
export class MenuController {
  // POST /api/menu - Crear item
  @Post()
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }

  // GET /api/menu - Listar todos
  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  // GET /api/menu/:id - Obtener uno
  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.menuService.findOne(id);
  }

  // PUT /api/menu/:id - Actualizar
  @Put(":id")
  update(@Param("id") id: number, @Body() dto: UpdateMenuItemDto) {
    return this.menuService.update(id, dto);
  }

  // DELETE /api/menu/:id - Eliminar
  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.menuService.remove(id);
  }
}
```

---

## 🖥️ FRONTEND - Admin Panel

### **Ubicación**: `/apps/admin-panel/src/app/menu/page.tsx`

### **Funcionalidades del Frontend**

1. **Listar Items del Menú**
   - Muestra todos los productos en tarjetas
   - Filtrado por categoría
   - Búsqueda por nombre
   - Estadísticas (total, disponibles, no disponibles, precio promedio)

2. **Crear Nuevo Item**
   - Modal/Dialog con formulario
   - Campos requeridos: nombre, precio, categoría
   - Checkbox "Disponible" (checked por defecto)

3. **Editar Item**
   - Abrir modal con datos precargados
   - Modificar cualquier campo
   - Guardar cambios

4. **Eliminar Item**
   - Confirmación antes de eliminar
   - Eliminación permanente de la base de datos

5. **Toggle Disponibilidad**
   - Marcar/desmarcar como disponible
   - No elimina el producto, solo lo oculta

---

## ❓ ¿CÓMO FUNCIONA EL SISTEMA?

### **1. ¿Dónde creo las categorías?**

**Respuesta**: Las categorías están **PREDEFINIDAS** en el código y la base de datos.

**Actualmente NO puedes crear categorías desde el frontend**. Las categorías son fijas:
- Entradas (appetizer)
- Platos Principales (main_course)
- Postres (dessert)
- Bebidas (beverage)
- Snacks (special)

**Para agregar una nueva categoría**, necesitas:

1. **Modificar el ENUM en la entidad**:
   ```typescript
   // Archivo: /apps/backend/src/entities/menu-item.entity.ts
   export enum MenuCategory {
     APPETIZER = "appetizer",
     MAIN_COURSE = "main_course",
     DESSERT = "dessert",
     BEVERAGE = "beverage",
     SPECIAL = "special",
     NUEVA_CATEGORIA = "nueva_categoria", // ← AGREGAR AQUÍ
   }
   ```

2. **Crear una migración de base de datos**:
   ```bash
   cd apps/backend
   npm run migration:generate -- -n AddNewCategory
   npm run migration:run
   ```

3. **Actualizar el frontend** para mostrar la nueva categoría en el dropdown.

---

### **2. ¿Dónde creo productos/items?**

**Respuesta**: Desde el **Admin Panel** en `http://localhost:7001/menu`

**Pasos para crear un producto**:

1. Ir a **"Gestión de Menú"** en el Admin Panel
2. Click en **"Nuevo Platillo"** o **"+"**
3. Llenar el formulario:
   - **Nombre** (requerido): Ej: "Pastel de Choclo"
   - **Descripción** (opcional): Detalles del platillo
   - **Precio** (requerido): En CLP (pesos chilenos)
   - **Categoría** (requerido): Seleccionar una de las 5 opciones
   - **Disponible** (checkbox): Si está marcado, aparecerá en el menú
4. Click en **"Crear"**

**El backend creará el item en la tabla `menu_items`** automáticamente.

---

### **3. ¿Cómo elimino categorías?**

**Respuesta**: **NO puedes eliminar categorías** desde el frontend porque son ENUM de base de datos.

**Para eliminar una categoría** (proceso avanzado):

1. **Asegúrate de que NO haya items usando esa categoría**:
   ```sql
   SELECT COUNT(*) FROM menu_items WHERE category = 'beverage';
   ```

2. **Modificar el ENUM en la entidad** (remover la categoría)

3. **Crear una migración**:
   ```bash
   npm run migration:generate -- -n RemoveCategory
   npm run migration:run
   ```

⚠️ **ADVERTENCIA**: Eliminar categorías puede romper datos existentes. Mejor práctica: **NO eliminar**, solo dejar de usar.

---

### **4. ¿Cómo distingo entre cocina y barra?**

**Respuesta**: Actualmente **NO hay campo específico** para "área de preparación" (cocina/barra).

#### **Opción 1: Usar las categorías existentes**
- **Cocina**: `main_course` (platos principales), `appetizer` (entradas), `dessert` (postres)
- **Barra**: `beverage` (bebidas), `special` (snacks rápidos)

#### **Opción 2: Agregar campo `preparation_area`** (requiere modificación)

Si quieres un campo específico, necesitas:

1. **Agregar el campo a la entidad**:
   ```typescript
   // En menu-item.entity.ts
   export enum PreparationArea {
     KITCHEN = "kitchen",
     BAR = "bar",
     BOTH = "both"
   }

   @Column({
     type: "enum",
     enum: PreparationArea,
     default: PreparationArea.KITCHEN
   })
   preparation_area: PreparationArea;
   ```

2. **Crear migración**

3. **Actualizar frontend** para incluir el selector

---

## 🔧 CÓMO AGREGAR UNA NUEVA CATEGORÍA (Paso a Paso)

### **Ejemplo: Agregar categoría "Pizzas"**

#### **Paso 1: Backend - Modificar la entidad**

```typescript
// Archivo: /apps/backend/src/entities/menu-item.entity.ts

export enum MenuCategory {
  APPETIZER = "appetizer",
  MAIN_COURSE = "main_course",
  DESSERT = "dessert",
  BEVERAGE = "beverage",
  SPECIAL = "special",
  PIZZA = "pizza", // ← NUEVO
}
```

#### **Paso 2: Backend - Crear migración**

```bash
cd /Users/devlmer/ChatBotDysa/apps/backend

# Generar migración
npm run migration:generate -- -n AddPizzaCategory

# Ejecutar migración
npm run migration:run
```

#### **Paso 3: Frontend - Actualizar el dropdown**

```typescript
// Archivo: /apps/admin-panel/src/app/menu/page.tsx
// Buscar el <Select> de categorías y agregar:

<SelectItem value="pizza">Pizzas</SelectItem>
```

#### **Paso 4: Frontend - Actualizar traducción en filtros**

```typescript
// En el mismo archivo, donde se mapean las categorías:
const categoryLabels = {
  all: "Todos",
  appetizer: "Entradas",
  main_course: "Platos Principales",
  dessert: "Postres",
  beverage: "Bebidas",
  special: "Snacks",
  pizza: "Pizzas", // ← NUEVO
};
```

#### **Paso 5: Reiniciar backend**

```bash
# Si el backend está corriendo, reiniciarlo
cd /Users/devlmer/ChatBotDysa/apps/backend
npm run start:dev
```

---

## 🧪 EJEMPLO PRÁCTICO: Crear un Producto

### **Escenario**: Crear "Empanada de Pino" en categoría "Entradas"

#### **Desde el Admin Panel**:

1. Ir a: `http://localhost:7001/menu`
2. Click en **"Nuevo Platillo"**
3. Llenar:
   - **Nombre**: Empanada de Pino
   - **Descripción**: Empanada chilena rellena de carne, cebolla, aceitunas y huevo
   - **Precio**: 2500 (CLP)
   - **Categoría**: Entradas (appetizer)
   - **Disponible**: ✅ (checked)
4. Click en **"Crear"**

#### **Desde la API** (alternativo):

```bash
curl -X POST http://localhost:8005/api/menu \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_JWT" \
  -d '{
    "name": "Empanada de Pino",
    "description": "Empanada chilena rellena de carne, cebolla, aceitunas y huevo",
    "price": 2500,
    "category": "appetizer",
    "available": true
  }'
```

---

## 📋 TABLA COMPLETA: Campos de MenuItem

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| `id` | integer | Auto | ID único generado automáticamente | 1 |
| `name` | string | Sí | Nombre del platillo | "Pastel de Choclo" |
| `description` | text | No | Descripción detallada | "Tradicional pastel..." |
| `price` | decimal | Sí | Precio en CLP | 8500.00 |
| `category` | enum | Sí | Categoría del item | "main_course" |
| `dietary_type` | enum | Sí | Tipo de dieta | "regular", "vegetarian", "vegan", "gluten_free", "keto" |
| `image` | string | No | URL de la imagen | "/images/pastel.jpg" |
| `ingredients` | array | No | Lista de ingredientes | ["choclo", "carne", "pollo"] |
| `allergens` | array | No | Lista de alérgenos | ["gluten", "lácteos"] |
| `preparationTime` | integer | No | Tiempo de preparación (min) | 20 |
| `available` | boolean | Sí | Si está disponible | true / false |
| `createdAt` | timestamp | Auto | Fecha de creación | 2025-11-21 |
| `updatedAt` | timestamp | Auto | Fecha de actualización | 2025-11-21 |

---

## ⚠️ NOTAS IMPORTANTES

### **¿Qué NO puedes hacer desde el Admin Panel?**

❌ Crear nuevas categorías (están hardcoded en el ENUM)
❌ Modificar el ENUM de tipos de dieta
❌ Cambiar la estructura de la base de datos

### **¿Qué SÍ puedes hacer?**

✅ Crear, editar, eliminar productos/items
✅ Cambiar disponibilidad de productos
✅ Filtrar por categoría existente
✅ Buscar productos por nombre
✅ Ver estadísticas del menú

---

## 🔍 TROUBLESHOOTING

### **Problema: No aparecen los productos en el frontend**

**Solución**:
1. Verificar que el backend esté corriendo: `curl http://localhost:8005/health`
2. Verificar que existan items: `curl http://localhost:8005/api/menu`
3. Revisar consola del navegador para errores

### **Problema: No puedo crear un producto con una categoría nueva**

**Solución**: Las categorías están predefinidas. Necesitas agregar la categoría al ENUM primero (ver sección "Cómo agregar una nueva categoría").

### **Problema: Error "category is not a valid enum value"**

**Solución**: Estás intentando usar una categoría que no existe en el ENUM. Usa solo las 5 categorías disponibles o agrega una nueva siguiendo los pasos de migración.

---

## 📝 RESUMEN EJECUTIVO

### **Sistema de Categorías**:
- ✅ **5 categorías predefinidas**: Entradas, Platos Principales, Postres, Bebidas, Snacks
- ✅ **Categorías son ENUM** en PostgreSQL
- ❌ **No se pueden crear desde el frontend**
- ⚙️ **Se pueden agregar** modificando el código y migrando la BD

### **Sistema de Productos**:
- ✅ **Se crean desde el Admin Panel**: `http://localhost:7001/menu`
- ✅ **CRUD completo**: Crear, Leer, Actualizar, Eliminar
- ✅ **Filtrado y búsqueda** funcionando
- ✅ **Campo "available"** para mostrar/ocultar items

### **Área de Preparación (Cocina/Barra)**:
- ❌ **NO hay campo específico** actualmente
- ✅ **Solución temporal**: Usar categorías para diferenciar
- ⚙️ **Solución definitiva**: Agregar campo `preparation_area` (requiere desarrollo)

---

**¿Necesitas agregar el campo "preparation_area" (cocina/barra)?**

Si quieres que te ayude a implementar esta funcionalidad, puedo:
1. Agregar el ENUM `PreparationArea` a la entidad
2. Crear la migración de base de datos
3. Actualizar el formulario del frontend
4. Agregar filtros por área de preparación

¡Avísame si quieres que lo implemente!
