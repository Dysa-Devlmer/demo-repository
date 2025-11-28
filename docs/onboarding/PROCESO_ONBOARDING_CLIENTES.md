# 🚀 PROCESO DE ONBOARDING Y DEPLOYMENT - ChatBotDysa Enterprise+++++

**Guía completa: De la venta a la instalación en producción**

---

## 📋 ÍNDICE

1. [Modelos de Deployment](#modelos-de-deployment)
2. [Proceso de Onboarding (Paso a Paso)](#proceso-de-onboarding)
3. [Opción A: SaaS Multi-Tenant (Recomendado)](#opción-a-saas-multi-tenant)
4. [Opción B: Deployment Dedicado](#opción-b-deployment-dedicado)
5. [Opción C: On-Premise (Cliente VIP)](#opción-c-on-premise)
6. [Checklist de Entrega](#checklist-de-entrega)
7. [Script de Setup Automatizado](#script-de-setup-automatizado)

---

## 🎯 MODELOS DE DEPLOYMENT

### **Opción A: SaaS Multi-Tenant (RECOMENDADO) ⭐**

**¿Qué es?**
Un solo sistema donde todos los clientes comparten la infraestructura, pero sus datos están completamente separados.

**Ventajas:**
- ✅ **Setup en 1 hora**: Solo cargas menú y configuración
- ✅ **Costo mínimo**: $99.990/mes sin infraestructura adicional
- ✅ **Mantenimiento centralizado**: Updates automáticos para todos
- ✅ **Escalable**: Soporta miles de clientes
- ✅ **Backup automático**: Incluido

**Desventajas:**
- ⚠️ Recursos compartidos (aunque aislados)
- ⚠️ No customización de código

**Ideal para:** 90% de los clientes (Don Luigi, Sabores de Chile, Burger Express)

---

### **Opción B: Deployment Dedicado**

**¿Qué es?**
Una instancia separada del sistema solo para ese cliente en la nube.

**Ventajas:**
- ✅ Recursos dedicados
- ✅ Customización de código posible
- ✅ URLs propias (bot.donluigi.cl)
- ✅ Aislamiento total

**Desventajas:**
- ⚠️ Costo mayor: $199.990/mes
- ⚠️ Setup 3-5 días
- ⚠️ Requiere gestión de infraestructura

**Ideal para:** Cadenas con +5 locales, clientes enterprise

---

### **Opción C: On-Premise (En Servidores del Cliente)**

**¿Qué es?**
Instalas ChatBotDysa en los servidores físicos o cloud del cliente.

**Ventajas:**
- ✅ Control total
- ✅ Datos nunca salen de su infraestructura
- ✅ Cumplimiento normativo estricto

**Desventajas:**
- ⚠️ Costo: $499.990 setup + $149.990/mes soporte
- ⚠️ Cliente debe tener infraestructura
- ⚠️ Setup 1-2 semanas
- ⚠️ Updates manuales

**Ideal para:** Bancos, gobierno, grandes corporaciones

---

## 📝 PROCESO DE ONBOARDING (PASO A PASO)

### **FASE 1: CIERRE DE VENTA (Día 0)**

**Después de la demo, si el cliente dice "SÍ":**

1. ✅ **Firmar contrato**
   - Plan Enterprise+++++ - $99.990/mes
   - Compromiso mínimo: 6 meses
   - 14 días garantía de devolución

2. ✅ **Primer pago**
   - Transferencia bancaria o Webpay
   - Factura automática

3. ✅ **Formulario de onboarding** (Google Form o Typeform)
   ```
   Datos a recopilar:
   - Nombre del restaurante
   - RUT
   - Dirección(es)
   - Teléfono de contacto
   - Email del administrador
   - WhatsApp Business número
   - Horarios de atención
   - Logo (PNG o JPG)
   - Menú actual (PDF, Excel o Word)
   - Sistema POS actual (si tiene)
   - Método de pago preferido (Webpay, Stripe, etc.)
   ```

4. ✅ **Email de bienvenida**
   ```
   Asunto: ¡Bienvenido a ChatBotDysa! 🎉

   Hola [Nombre],

   ¡Felicidades por dar el paso hacia la automatización!

   Próximos pasos:
   1. Completar formulario: [link]
   2. Llamada de kick-off: [agendar]
   3. Setup en 3-5 días hábiles

   Tu Customer Success Manager: [Nombre]
   WhatsApp directo: +56 9 XXXX XXXX
   ```

---

### **FASE 2: KICK-OFF CALL (Día 1-2)**

**Videollamada 30-45 minutos con el cliente:**

**Agenda:**
1. ✅ Presentar al equipo (Customer Success Manager, técnico)
2. ✅ Revisar formulario de onboarding
3. ✅ Explicar proceso y timeline
4. ✅ Aclarar dudas técnicas
5. ✅ Definir expectativas

**Documentos a compartir:**
- Checklist de onboarding
- Timeline esperado
- Contactos de soporte

---

### **FASE 3: CONFIGURACIÓN TÉCNICA (Día 2-4)**

#### **A. Crear cuenta del cliente en el sistema**

**Opción SaaS Multi-Tenant:**

```bash
# Script de creación de cliente nuevo
cd /Users/devlmer/ChatBotDysa/apps/backend

# Ejecutar script de setup
node scripts/create-new-client.js \
  --name "Don Luigi" \
  --rut "76.123.456-7" \
  --email "admin@donluigi.cl" \
  --phone "+56912345678" \
  --plan "enterprise"
```

Este script debe:
1. Crear usuario admin del restaurante en tabla `users`
2. Crear perfil de restaurante en tabla `restaurants`
3. Generar credenciales únicas
4. Enviar email con acceso

#### **B. Cargar menú del cliente**

**Opción 1: Manual (si menú es simple)**
- Ingresar items uno por uno desde Admin Panel `/menu`

**Opción 2: Bulk import (si menú tiene +30 items)**

```bash
# Preparar CSV del menú del cliente
# Formato: name,description,price,category,dietary_type,ingredients,allergens,preparationTime

# Importar
node scripts/import-menu.js \
  --client-id 123 \
  --file "don-luigi-menu.csv"
```

**Ejemplo CSV:**
```csv
name,description,price,category,dietary_type,ingredients,allergens,preparationTime
Pizza Margherita,Salsa tomate mozzarella albahaca,12990,main_course,vegetarian,"[""tomate"",""mozzarella"",""albahaca""]","[""gluten"",""lactosa""]",15
Pizza Pepperoni,Tomate mozzarella pepperoni,14990,main_course,regular,"[""tomate"",""mozzarella"",""pepperoni""]","[""gluten"",""lactosa""]",15
```

#### **C. Configurar WhatsApp Business**

**Pasos:**
1. Cliente debe tener WhatsApp Business API
   - Si no tiene, gestionar en Meta: https://business.facebook.com
   - Costo: ~$50 USD/mes Meta

2. Obtener credenciales:
   - `WHATSAPP_PHONE_NUMBER_ID`
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_VERIFY_TOKEN`

3. Configurar webhook:
   ```
   URL: https://api.chatbotdysa.cl/webhooks/whatsapp/{client-id}
   Verify Token: {generado-por-sistema}
   ```

4. Suscribirse a eventos:
   - messages
   - message_status
   - messaging_postbacks

**Test de integración:**
```bash
# Enviar mensaje de prueba
curl -X POST "https://api.chatbotdysa.cl/api/whatsapp/test-message" \
  -H "Authorization: Bearer {client-token}" \
  -d '{"to": "+56912345678", "message": "Hola desde ChatBotDysa!"}'
```

#### **D. Personalizar respuestas del bot**

**Configurar en Admin Panel `/settings`:**

```json
{
  "bot": {
    "name": "Luigi Bot",
    "greeting": "¡Hola! Soy Luigi Bot de Pizzería Don Luigi. ¿En qué puedo ayudarte hoy?",
    "tone": "friendly",
    "language": "es-CL",
    "fallback_message": "No entendí eso. ¿Podrías reformular?",
    "business_hours": {
      "monday": {"open": "11:00", "close": "23:00"},
      "tuesday": {"open": "11:00", "close": "23:00"},
      "wednesday": {"open": "11:00", "close": "23:00"},
      "thursday": {"open": "11:00", "close": "23:00"},
      "friday": {"open": "11:00", "close": "01:00"},
      "saturday": {"open": "11:00", "close": "01:00"},
      "sunday": {"open": "12:00", "close": "23:00"}
    },
    "after_hours_message": "Gracias por contactarnos. Estamos cerrados ahora. Abrimos mañana a las {open_time}."
  }
}
```

#### **E. Configurar métodos de pago (opcional)**

**Si usan Webpay Plus:**
```javascript
{
  "payment": {
    "provider": "webpay",
    "commerce_code": "597055555532",
    "api_key": "...",
    "environment": "production"
  }
}
```

**Si usan Stripe:**
```javascript
{
  "payment": {
    "provider": "stripe",
    "publishable_key": "pk_live_...",
    "secret_key": "sk_live_...",
    "currency": "CLP"
  }
}
```

---

### **FASE 4: TESTING Y CAPACITACIÓN (Día 5-6)**

#### **A. Testing interno**

**Checklist de testing:**

```bash
# 1. Probar flujo de pedido completo
Cliente: "Hola"
Bot: "¡Hola! ..."

Cliente: "Quiero pedir una pizza"
Bot: [Muestra menú de pizzas]

Cliente: "La Margherita"
Bot: "¿Para delivery o retiro?"
# ... hasta confirmación final

# 2. Probar reserva
Cliente: "Quiero reservar mesa"
Bot: "¿Para cuántas personas?"
# ...

# 3. Probar consultas de menú
Cliente: "¿Tienen opciones vegetarianas?"
Bot: [Lista items vegetarianos]

# 4. Probar horarios fuera de atención
# Enviar mensaje a las 3 AM
Bot: "Gracias por contactarnos. Estamos cerrados..."

# 5. Probar errores y fallbacks
Cliente: "asdfghjkl"
Bot: "No entendí eso..."
```

**Si algo falla:** Ajustar configuración y re-testear

#### **B. Sesión de capacitación con el cliente (1-2 horas)**

**Videollamada en vivo mostrando:**

1. **Admin Panel** (30 min)
   - Login y navegación
   - Ver pedidos entrantes
   - Cambiar estados de pedidos
   - Ver reservas
   - Modificar menú en tiempo real
   - Ver base de clientes

2. **Operación diaria** (20 min)
   - Cómo reciben notificaciones de pedidos
   - Cómo confirmar/cancelar reservas
   - Qué hacer si hay error
   - Contacto de soporte

3. **Q&A** (10 min)
   - Resolver dudas
   - Casos específicos del cliente

**Entregar:**
- ✅ PDF: "Guía rápida de uso diario"
- ✅ Video tutorial grabado (Loom)
- ✅ Credenciales en sobre cerrado
- ✅ Contactos de soporte

---

### **FASE 5: GO-LIVE (Día 7)**

#### **Soft Launch (Primeros 3 días)**

**Activar en modo "prueba controlada":**

1. ✅ Bot activo pero monitoreado 24/7 por tu equipo
2. ✅ Pedidos requieren confirmación manual del restaurante antes de procesarse
3. ✅ Tú respondes cualquier consulta compleja del bot
4. ✅ Llamada diaria con cliente para feedback

**Monitorear:**
- Tasa de respuestas correctas del bot
- Pedidos completados exitosamente
- Quejas o confusiones de clientes
- Tiempo de respuesta promedio

#### **Full Launch (Día 10+)**

**Si soft launch fue exitoso:**

1. ✅ Quitar confirmación manual
2. ✅ Bot opera 100% autónomo
3. ✅ Cliente tiene control total
4. ✅ Tú monitores solo analytics semanales

**Email de confirmación:**
```
Asunto: ¡ChatBotDysa está LIVE! 🚀

Hola [Nombre],

¡Felicitaciones! ChatBotDysa está oficialmente activo para [Restaurante].

Estadísticas primeros 7 días:
- Conversaciones: 45
- Pedidos completados: 23
- Reservas: 8
- Satisfacción: 96%

Próximos pasos:
- Revisar analytics semanal
- Optimizar respuestas según feedback
- Expandir a más canales (SMS, Web)

¿Dudas? Estamos aquí: soporte@chatbotdysa.cl
```

---

### **FASE 6: SOPORTE CONTINUO (Mes 1+)**

#### **Primera semana:**
- ✅ Check-in diario (WhatsApp)
- ✅ Monitoreo activo de conversaciones
- ✅ Ajustes inmediatos si hay problemas

#### **Primer mes:**
- ✅ Call semanal de seguimiento
- ✅ Reporte de analytics
- ✅ Optimización de respuestas del bot
- ✅ Capacitación adicional si necesario

#### **Meses 2-6:**
- ✅ Call mensual de revisión
- ✅ Reporte de analytics mensual
- ✅ Updates de features nuevas
- ✅ Soporte 24/7 por WhatsApp/Email

---

## 🛠️ OPCIÓN A: SAAS MULTI-TENANT (IMPLEMENTACIÓN)

### **Arquitectura del sistema:**

```
chatbotdysa.cl (Sistema central)
├── Backend API (Puerto 8005)
├── Admin Panel (Puerto 7001)
├── Landing Page (Puerto 6001)
└── PostgreSQL Database
    ├── Schema: public
    │   ├── restaurants (tabla de clientes)
    │   ├── users (admins por restaurante)
    │   ├── menu_items (items filtrados por restaurant_id)
    │   ├── orders (pedidos filtrados por restaurant_id)
    │   ├── reservations (reservas filtradas por restaurant_id)
    │   └── customers (clientes filtrados por restaurant_id)
    └── Row-Level Security (RLS) para aislamiento
```

### **Cambios necesarios en el código:**

#### **1. Agregar campo `restaurant_id` a todas las tablas**

```sql
-- Migration: add restaurant_id to all tables
ALTER TABLE menu_items ADD COLUMN restaurant_id INT REFERENCES restaurants(id);
ALTER TABLE orders ADD COLUMN restaurant_id INT REFERENCES restaurants(id);
ALTER TABLE reservations ADD COLUMN restaurant_id INT REFERENCES restaurants(id);
ALTER TABLE customers ADD COLUMN restaurant_id INT REFERENCES restaurants(id);

-- Index for performance
CREATE INDEX idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX idx_reservations_restaurant ON reservations(restaurant_id);
CREATE INDEX idx_customers_restaurant ON customers(restaurant_id);
```

#### **2. Crear tabla `restaurants`**

```sql
CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL, -- don-luigi, sabores-chile
  rut VARCHAR(20) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  logo_url VARCHAR(500),

  -- Plan y billing
  plan VARCHAR(50) DEFAULT 'enterprise', -- starter, enterprise, premium
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, cancelled
  billing_cycle VARCHAR(20) DEFAULT 'monthly',
  monthly_price DECIMAL(10,2) DEFAULT 99990,

  -- WhatsApp config
  whatsapp_phone VARCHAR(20),
  whatsapp_business_id VARCHAR(255),
  whatsapp_access_token TEXT,

  -- Bot configuration
  bot_settings JSONB,

  -- Timestamps
  trial_ends_at TIMESTAMP,
  subscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Seed con los 3 clientes demo
INSERT INTO restaurants (name, slug, rut, email, phone, plan, status)
VALUES
('Pizzería Don Luigi', 'don-luigi', '76.123.456-7', 'admin@donluigi.cl', '+56912345678', 'enterprise', 'active'),
('Sabores de Chile', 'sabores-chile', '76.234.567-8', 'admin@saboreschile.cl', '+56923456789', 'enterprise', 'active'),
('Burger Express', 'burger-express', '76.345.678-9', 'admin@burgerexpress.cl', '+56934567890', 'enterprise', 'active');
```

#### **3. Modificar controllers para filtrar por restaurant_id**

```typescript
// backend/src/modules/menu/menu.service.ts

@Injectable()
export class MenuService {
  async findAll(restaurantId: number): Promise<MenuItem[]> {
    return this.menuRepository.find({
      where: { restaurant_id: restaurantId, available: true },
      order: { category: 'ASC', name: 'ASC' }
    });
  }

  async create(createMenuDto: CreateMenuDto, restaurantId: number): Promise<MenuItem> {
    const menuItem = this.menuRepository.create({
      ...createMenuDto,
      restaurant_id: restaurantId
    });
    return this.menuRepository.save(menuItem);
  }
}
```

#### **4. Middleware de autenticación con restaurant_id**

```typescript
// backend/src/middleware/restaurant-context.middleware.ts

@Injectable()
export class RestaurantContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Extraer restaurant_id del JWT token
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req['restaurantId'] = decoded.restaurant_id;
    next();
  }
}
```

#### **5. Admin Panel con filtro por restaurante**

```typescript
// admin-panel/src/lib/api.ts

const getRestaurantId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.restaurant_id;
};

export const getOrders = async () => {
  const restaurantId = getRestaurantId();
  const response = await fetch(
    `${API_URL}/orders?restaurant_id=${restaurantId}`,
    {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    }
  );
  return response.json();
};
```

---

## 📦 OPCIÓN B: DEPLOYMENT DEDICADO

### **Para clientes que quieren instancia separada:**

**Stack recomendado:**
- ✅ **Cloud:** AWS, Google Cloud o DigitalOcean
- ✅ **Región:** us-east-1 (por latencia a Chile)
- ✅ **Servicios:**
  - EC2 / Compute Engine / Droplet (4 vCPU, 8GB RAM)
  - RDS / Cloud SQL / Managed Database (PostgreSQL 14+)
  - S3 / Cloud Storage (para archivos)
  - CloudFront / CDN (para assets estáticos)

**Costo estimado mensual:**
- Compute: $80-120 USD
- Database: $50-80 USD
- Storage: $10-20 USD
- CDN: $5-10 USD
- **Total:** ~$150-230 USD/mes

**Pasos de deployment:**

```bash
# 1. Crear servidor
# AWS EC2 ejemplo
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.medium \
  --key-name chatbotdysa-key \
  --security-group-ids sg-0123456789 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=donluigi-chatbot}]'

# 2. SSH al servidor
ssh -i chatbotdysa-key.pem ubuntu@ec2-xx-xxx-xxx-xx.compute.amazonaws.com

# 3. Instalar dependencias
sudo apt update
sudo apt install -y nodejs npm postgresql-client docker docker-compose nginx

# 4. Clonar repositorio
git clone https://github.com/tu-org/chatbotdysa.git
cd chatbotdysa

# 5. Configurar variables de entorno
cp .env.example .env.production
nano .env.production
# Editar con datos del cliente

# 6. Build y deploy con Docker
docker-compose -f docker-compose.prod.yml up -d

# 7. Configurar Nginx reverse proxy
sudo nano /etc/nginx/sites-available/donluigi
# Configurar SSL con Let's Encrypt
sudo certbot --nginx -d bot.donluigi.cl

# 8. Seed inicial con datos del cliente
docker exec -it chatbotdysa-backend npm run seed:donluigi
```

---

## 🏢 OPCIÓN C: ON-PREMISE

### **Para clientes que quieren el sistema en sus servidores:**

**Requisitos mínimos:**
- ✅ Servidor Linux (Ubuntu 20.04+ o CentOS 8+)
- ✅ 8GB RAM mínimo
- ✅ 4 vCPU
- ✅ 100GB SSD
- ✅ IP pública con puerto 443 abierto
- ✅ Dominio propio (bot.donluigi.cl)

**Entregables al cliente:**

1. ✅ **Código fuente** (en USB o repo privado GitHub)
2. ✅ **Documentación de instalación** (50 páginas)
3. ✅ **Scripts de deployment automatizados**
4. ✅ **Licencia de uso** (contrato firmado)
5. ✅ **Capacitación técnica** (4 horas con su equipo IT)
6. ✅ **SLA de soporte** (respuesta en 4 horas)

**Pasos de instalación:**

```bash
# 1. Cliente descarga el paquete
# chatbotdysa-v1.0.0-onpremise.tar.gz

# 2. Descomprimir
tar -xzf chatbotdysa-v1.0.0-onpremise.tar.gz
cd chatbotdysa

# 3. Ejecutar instalador automatizado
sudo ./install.sh \
  --domain bot.donluigi.cl \
  --email admin@donluigi.cl \
  --db-password supersecret123

# 4. El script hace todo automáticamente:
# - Instala dependencias
# - Crea base de datos
# - Configura SSL
# - Inicia servicios
# - Crea usuario admin

# 5. Al finalizar muestra:
✅ Installation complete!

Admin Panel: https://bot.donluigi.cl
Username: admin@donluigi.cl
Password: [generado-random]

# 6. Cliente accede y cambia contraseña
```

---

## ✅ CHECKLIST DE ENTREGA AL CLIENTE

### **Documentos:**
- [ ] Contrato firmado y escaneado
- [ ] Factura primer mes
- [ ] Credenciales de acceso (usuario/password)
- [ ] Guía rápida de uso (PDF, 5 páginas)
- [ ] Video tutorial (Loom, 10 minutos)
- [ ] Contactos de soporte (WhatsApp, Email, Teléfono)
- [ ] SLA (Service Level Agreement)

### **Técnico:**
- [ ] WhatsApp Business integrado y funcionando
- [ ] Menú completo cargado (mínimo 10 items)
- [ ] Bot responde correctamente a consultas básicas
- [ ] Pedidos se registran en Admin Panel
- [ ] Reservas se registran correctamente
- [ ] Notificaciones funcionan (email/WhatsApp)
- [ ] Analytics muestra datos en tiempo real
- [ ] Backup automático configurado

### **Capacitación:**
- [ ] Sesión de onboarding 1-2 horas completada
- [ ] Cliente sabe cómo ver pedidos
- [ ] Cliente sabe cómo modificar menú
- [ ] Cliente sabe cómo contactar soporte
- [ ] Cliente tiene acceso a documentación

---

## 🎓 MODELO DE SOPORTE

### **Canales de soporte:**

1. **WhatsApp:** +56 9 XXXX XXXX (respuesta en 30 minutos, 9am-9pm)
2. **Email:** soporte@chatbotdysa.cl (respuesta en 4 horas)
3. **Teléfono:** +56 2 XXXX XXXX (emergencias 24/7)
4. **Portal:** soporte.chatbotdysa.cl (tickets)

### **SLA (Service Level Agreement):**

| Prioridad | Tiempo de respuesta | Tiempo de resolución |
|-----------|---------------------|----------------------|
| **Crítico** (Sistema caído) | 15 minutos | 2 horas |
| **Alta** (Funcionalidad no opera) | 1 hora | 8 horas |
| **Media** (Bug menor) | 4 horas | 24 horas |
| **Baja** (Pregunta/mejora) | 24 horas | 5 días |

---

## 💰 RESUMEN DE COSTOS POR MODELO

| Modelo | Setup | Mensual | Ideal Para |
|--------|-------|---------|------------|
| **SaaS Multi-Tenant** | $0 | $99.990 CLP | Restaurantes 1-3 locales |
| **Deployment Dedicado** | $500.000 CLP | $199.990 CLP | Cadenas 5+ locales |
| **On-Premise** | $2.500.000 CLP | $149.990 CLP | Corporaciones enterprise |

---

## 🚀 PRÓXIMOS PASOS

**Si cliente firma hoy:**

✅ **Día 0:** Contrato + Pago
✅ **Día 1-2:** Kick-off call + Formulario
✅ **Día 3-5:** Setup técnico
✅ **Día 6-7:** Testing + Capacitación
✅ **Día 8-10:** Go-live soft launch
✅ **Día 11+:** Full operation

**Total:** Cliente operando en **10 días hábiles**

---

¿Necesitas los scripts automatizados de creación de clientes? Te los creo ahora.
