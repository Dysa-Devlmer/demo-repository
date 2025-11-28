# 🏢 Gestión Multi-Sucursal - ChatBotDysa Enterprise+++++

**Sistema de gestión centralizada para restaurantes con múltiples ubicaciones**

---

## 🎯 ¿Qué es Multi-Sucursal?

ChatBotDysa soporta restaurantes con múltiples ubicaciones (sucursales, franquicias, locales) de forma nativa.

**Características:**
- ✅ Dashboard central (Casa Matriz ve todo)
- ✅ Dashboards individuales (cada sucursal ve solo lo suyo)
- ✅ WhatsApp independiente por sucursal
- ✅ Menú compartido O independiente
- ✅ Inventario local por sucursal
- ✅ Reportes consolidados
- ✅ Gestión de usuarios por sucursal

---

## 📋 Proceso de Creación

### Opción 1: Durante la instalación inicial

Cuando ejecutas `create-client.bat`, el script pregunta:

```batch
¿El restaurante tiene sucursales? (S/N): S
¿Cuantas sucursales tiene? 3

--- Sucursal 1 de 3 ---
Nombre de la sucursal: Centro
Dirección: Av. Providencia 123, Santiago
Telefono WhatsApp: +56912345671
Email: centro@restaurante.com

--- Sucursal 2 de 3 ---
Nombre de la sucursal: Mall Plaza
Dirección: Mall Plaza Oeste, Local 205
Telefono WhatsApp: +56912345672
Email: mall@restaurante.com

--- Sucursal 3 de 3 ---
Nombre de la sucursal: Aeropuerto
Dirección: Aeropuerto Internacional, Terminal 2
Telefono WhatsApp: +56912345673
Email: aeropuerto@restaurante.com
```

**Resultado:**
- Crea cuenta principal (Casa Matriz)
- Crea 3 cuentas de sucursales
- Genera credenciales únicas para cada una
- Configura relaciones en base de datos

### Opción 2: Agregar sucursales después

Si el cliente inicia con una sola ubicación y luego quiere agregar sucursales:

```batch
# Ejecutar nuevamente create-client.bat
cd C:\ChatBotDysa\INSTALADORES_CLIENTES\USB_INSTALLER\scripts
create-client.bat

# Ingresar el mismo nombre del restaurante principal
Nombre del restaurante: Don Luigi [MISMO NOMBRE]
Email: sucursal-nueva@donluigi.cl [NUEVO EMAIL]
...
```

---

## 🏗️ Arquitectura Multi-Sucursal

### Estructura de Base de Datos

```sql
restaurants
├── id: 1 (Casa Matriz)
│   ├── name: "Don Luigi"
│   ├── parent_id: NULL
│   └── is_parent: true
│
├── id: 2 (Sucursal Centro)
│   ├── name: "Don Luigi - Centro"
│   ├── parent_id: 1
│   └── is_parent: false
│
├── id: 3 (Sucursal Mall)
│   ├── name: "Don Luigi - Mall"
│   ├── parent_id: 1
│   └── is_parent: false
│
└── id: 4 (Sucursal Aeropuerto)
    ├── name: "Don Luigi - Aeropuerto"
    ├── parent_id: 1
    └── is_parent: false
```

### Relaciones

```
Casa Matriz (restaurant_id: 1)
  ↓
  ├─ Users: admin@donluigi.cl (ve todo)
  ├─ Dashboard: Consolidado de todas las sucursales
  └─ Permisos: Gestión global

Sucursal Centro (restaurant_id: 2)
  ↓
  ├─ Users: centro@donluigi.cl (ve solo sucursal Centro)
  ├─ Dashboard: Solo datos de Centro
  ├─ WhatsApp: +56912345671 (independiente)
  ├─ Orders: filtrados por restaurant_id = 2
  ├─ Menu: compartido O propio
  └─ Inventory: local

Sucursal Mall (restaurant_id: 3)
  ↓
  ├─ Users: mall@donluigi.cl
  ├─ Dashboard: Solo datos de Mall
  ├─ WhatsApp: +56912345672
  └─ ...
```

---

## 🔐 Gestión de Usuarios y Permisos

### Tipos de usuarios

#### 1. Administrador Casa Matriz

```
Email: admin@restaurante.com
Permisos:
  ✅ Ve todas las sucursales
  ✅ Gestiona menú global
  ✅ Reportes consolidados
  ✅ Crear/editar sucursales
  ✅ Gestionar usuarios
  ✅ Configuración global
```

**Dashboard:**
- Total de pedidos de TODAS las sucursales
- Ingresos consolidados
- Comparativa de sucursales
- Ranking de productos más vendidos (global)

#### 2. Administrador de Sucursal

```
Email: centro@restaurante.com
Permisos:
  ✅ Ve solo SU sucursal
  ✅ Gestiona pedidos locales
  ✅ Inventario local
  ✅ Reportes de su sucursal
  ❌ No ve otras sucursales
  ❌ No edita menú global (si está compartido)
```

**Dashboard:**
- Pedidos solo de su sucursal
- Ingresos de su sucursal
- Stock local
- Performance de su equipo

#### 3. Operador de Sucursal

```
Email: operador-centro@restaurante.com
Permisos:
  ✅ Ve pedidos de SU sucursal
  ✅ Cambia estados de pedidos
  ✅ Ve reservas
  ❌ No edita menú
  ❌ No ve reportes
  ❌ No gestiona usuarios
```

---

## 📱 Configuración WhatsApp por Sucursal

Cada sucursal tiene su propio WhatsApp Business:

### Casa Matriz

```
WhatsApp: +56912345670
Función: Atención general, consultas comerciales
Redirige: A la sucursal más cercana al cliente
```

### Sucursal Centro

```
WhatsApp: +56912345671
Función: Pedidos y reservas solo de Centro
Delivery: Radio de 5km desde Av. Providencia 123
Horario: Lun-Dom 11:00-23:00
```

### Sucursal Mall

```
WhatsApp: +56912345672
Función: Pedidos solo para retiro en mall
Delivery: No disponible (política del mall)
Horario: Lun-Dom 10:00-22:00
```

### Configuración

```
Admin Panel → Sucursales → Centro → Conectar WhatsApp
1. Click en "Conectar WhatsApp"
2. Escanear QR con WhatsApp Business de esa sucursal
3. Configurar mensaje de bienvenida personalizado:
   "¡Hola! Bienvenido a Don Luigi Centro 🍕
    Estamos en Av. Providencia 123.
    ¿En qué te puedo ayudar?"
```

---

## 🍕 Gestión de Menú

### Opción A: Menú Compartido (Recomendado)

Todas las sucursales comparten el mismo menú.

**Ventajas:**
- ✅ Gestión centralizada
- ✅ Consistencia de marca
- ✅ Cambios se aplican a todas

**Configuración:**
```
Admin Panel → Menú → Configuración
☑ Menú compartido entre sucursales
```

**Gestión de disponibilidad local:**
```
Sucursal Centro → Menú → Pizza Pepperoni
☐ Disponible (se acabó mozzarella hoy)

→ Solo en Centro se marca como no disponible
→ Otras sucursales siguen vendiendo
```

### Opción B: Menús Independientes

Cada sucursal tiene su propio menú.

**Ventajas:**
- ✅ Flexibilidad total por sucursal
- ✅ Productos exclusivos por ubicación
- ✅ Precios diferenciados

**Ejemplo:**
```
Sucursal Aeropuerto:
  - Pizza Individual (exclusiva): $9.990
  - Tiempos de preparación más cortos
  - Menú reducido (espacio limitado)

Sucursal Centro:
  - Menú completo
  - Promociones locales
  - Eventos especiales
```

---

## 📊 Reportes y Analytics

### Dashboard Casa Matriz

```
Pedidos Hoy: 156 total
  ├─ Centro:      67 pedidos ($890.450)
  ├─ Mall:        54 pedidos ($720.380)
  └─ Aeropuerto:  35 pedidos ($468.920)

Gráfico de Comparativa:
  [Barras comparando ventas por sucursal]

Top 10 Productos (Global):
  1. Pizza Pepperoni: 89 vendidas
  2. Pizza 4 Quesos: 67 vendidas
  ...

Sucursal con mejor performance: Centro (+23% vs promedio)
```

### Dashboard Sucursal Individual

```
Centro - Pedidos Hoy: 67

Estados:
  ├─ Pending:    12
  ├─ Preparing:   8
  ├─ Out:         4
  └─ Delivered:  43

Pedidos por hora: [Gráfico]
Top productos SU sucursal: [Lista]
Clientes frecuentes: [Lista]
```

---

## 🚚 Gestión de Delivery

### Por Sucursal

Cada sucursal puede tener configuración propia:

```
Sucursal Centro:
  ✅ Delivery disponible
  Radio: 5 km
  Costo: $2.500 (< 3km), $3.500 (3-5km)
  Tiempo estimado: 30-45 min

Sucursal Mall:
  ❌ Delivery NO disponible
  Solo retiro en local
  Razón: Política del mall

Sucursal Aeropuerto:
  ✅ Delivery limitado
  Solo zona terminal
  Costo fijo: $5.000
  Tiempo: 15-20 min
```

### Asignación Automática

El bot puede asignar pedidos a la sucursal más cercana:

```
Cliente: "Quiero pedir una pizza"
Bot: "¿Cuál es tu dirección de entrega?"
Cliente: "Av. Apoquindo 4500"

Bot (internamente):
  - Calcula distancia a cada sucursal
  - Centro: 2.3 km ✅ Más cercana
  - Mall: 5.8 km
  - Aeropuerto: 12 km

Bot: "Perfecto, tu pedido será preparado en Don Luigi Centro
      y llegará en 30-40 minutos."

→ Pedido se crea con restaurant_id = 2 (Centro)
```

---

## 👥 Workflow de Equipo

### Caso: Restaurant con 3 sucursales

**Mañana (8:00 AM):**

1. **Casa Matriz:**
   ```
   Admin General (admin@donluigi.cl):
   - Revisa reportes del día anterior
   - Ve que Sucursal Mall tuvo bajo rendimiento
   - Programa promoción 2x1 solo para Mall
   ```

2. **Cada Sucursal:**
   ```
   Centro (centro@donluigi.cl):
   - Login a su dashboard
   - Marca ingredientes no disponibles
   - Revisa reservas del día

   Mall (mall@donluigi.cl):
   - Lo mismo para su sucursal

   Aeropuerto (aeropuerto@donluigi.cl):
   - Lo mismo para su sucursal
   ```

**Durante el servicio:**

```
Cliente hace pedido por WhatsApp de Centro
→ Llega notificación SOLO a Centro
→ Centro prepara y entrega
→ Casa Matriz ve el pedido en dashboard consolidado
```

**Fin del día (11:00 PM):**

```
Casa Matriz:
- Genera reporte consolidado
- Compara performance de sucursales
- Identifica insights:
  * Centro vendió más pizzas
  * Mall vendió más pastas
  * Aeropuerto más bebidas

- Ajusta inventario para mañana
```

---

## ⚙️ Configuración Técnica

### Variables de Entorno

```bash
# Casa Matriz
RESTAURANT_ID=1
PARENT_ID=null
IS_PARENT=true

# Sucursal Centro
RESTAURANT_ID=2
PARENT_ID=1
IS_PARENT=false

# Sucursal Mall
RESTAURANT_ID=3
PARENT_ID=1
IS_PARENT=false
```

### Filtros en Queries

```javascript
// Casa Matriz ve todo
const orders = await prisma.order.findMany({
  where: {
    OR: [
      { restaurant_id: 1 },     // Sus pedidos directos
      { parent_id: 1 }          // Pedidos de sucursales
    ]
  }
});

// Sucursal Centro ve solo lo suyo
const orders = await prisma.order.findMany({
  where: {
    restaurant_id: 2           // Solo sucursal Centro
  }
});
```

---

## 📈 Casos de Uso Reales

### Caso 1: Pizzería con 3 locales

```
Don Luigi
├── Centro (flagship)
├── Mall (solo retiro)
└── Aeropuerto (delivery limitado)

Menú: Compartido
Precios: Aeropuerto +15% (premium)
WhatsApp: Independiente por sucursal
Dashboard: Casa matriz ve consolidado
```

### Caso 2: Cadena de fast food (10 franquicias)

```
Burger Express
├── Casa Matriz (no atiende público)
├── Franquicia Providencia
├── Franquicia Las Condes
├── ... (8 más)

Menú: Compartido (control de marca)
Precios: Iguales (política corporativa)
Inventario: Local por franquicia
Reportes: Consolidados + ranking sucursales
```

### Caso 3: Restaurant con cocina central

```
Sabores de Chile
├── Cocina Central (producción)
├── Punto Venta 1
├── Punto Venta 2
└── Punto Venta 3

Menú: Compartido
Stock: Centralizado (cocina central)
Pedidos: Puntos de venta reciben de cocina central
Delivery: Solo desde cocina central
```

---

## ✅ Checklist Configuración Multi-Sucursal

```
□ Crear cuenta Casa Matriz
□ Crear cuentas de cada sucursal
□ Configurar WhatsApp de cada sucursal
□ Definir: ¿Menú compartido o independiente?
□ Configurar horarios por sucursal
□ Configurar zonas de delivery
□ Asignar usuarios a cada sucursal
□ Configurar permisos
□ Probar pedido en cada sucursal
□ Verificar dashboard consolidado
□ Capacitar equipo de cada sucursal
```

---

**ChatBotDysa Enterprise+++++**
*Sistema multi-sucursal escalable*

© 2025 ChatBotDysa - Todos los derechos reservados
