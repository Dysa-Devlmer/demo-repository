# 💳 Preparación e Integración de Mercado Pago

**Proyecto:** ChatBotDysa Enterprise+++++
**Fecha:** 2 de Octubre, 2025
**Versión:** 1.0.0
**Estado:** 📚 GUÍA DE IMPLEMENTACIÓN
**Prioridad:** 🔥🔥🔥 CRÍTICO - HACER MAÑANA
**Tiempo estimado:** 6-8 horas

---

## 📋 Resumen Ejecutivo

Guía completa paso a paso para integrar Mercado Pago en ChatBotDysa. Incluye instalación del SDK, implementación en backend y frontend, testing, y webhooks para confirmación asíncrona de pagos.

**¿Por qué Mercado Pago?**
- ✅ Líder en pagos en Chile y Latinoamérica
- ✅ Acepta todos los medios de pago locales
- ✅ Comisiones competitivas (4.99% + IVA)
- ✅ SDK oficial de Node.js
- ✅ Webhooks para confirmación asíncrona
- ✅ Checkout Pro (integración rápida)
- ✅ Checkout API (integración personalizada)

---

## 🎯 Plan de Integración

### Opción 1: Checkout Pro (Recomendado para empezar)
**Tiempo:** 2-3 horas
**Dificultad:** ⭐⭐☆☆☆

**Ventajas:**
- Más rápido de implementar
- Mercado Pago maneja el formulario de pago
- PCI compliance automático
- Menos código

**Desventajas:**
- Menos personalización
- Usuario sale de tu sitio

### Opción 2: Checkout API (Completo)
**Tiempo:** 6-8 horas
**Dificultad:** ⭐⭐⭐⭐☆

**Ventajas:**
- Formulario de pago en tu sitio
- 100% personalizable
- Mejor UX

**Desventajas:**
- Más código
- Requiere PCI compliance

**👉 RECOMENDACIÓN:** Empezar con Checkout Pro, luego migrar a Checkout API si es necesario.

---

## 1️⃣ INSTALACIÓN DEL SDK

### Paso 1: Instalar SDK en backend

```bash
cd /Users/devlmer/ChatBotDysa/apps/backend

# Instalar Mercado Pago SDK
npm install mercadopago

# Instalar tipos (si existen)
npm install --save-dev @types/mercadopago
```

**Versión recomendada:** `mercadopago@^2.0.0` (SDK v2 con TypeScript)

---

### Paso 2: Verificar instalación

```bash
# Verificar que se instaló correctamente
npm list mercadopago
```

**Output esperado:**
```
backend@0.0.1 /Users/devlmer/ChatBotDysa/apps/backend
└── mercadopago@2.0.0
```

---

## 2️⃣ CONFIGURACIÓN DE CREDENCIALES

### Paso 1: Obtener credenciales de Mercado Pago

**1.1. Crear cuenta (si no tienes):**
```
https://www.mercadopago.cl/registration
```

**1.2. Ir al panel de desarrolladores:**
```
https://www.mercadopago.cl/developers/panel
```

**1.3. Crear aplicación:**
- Click "Mis aplicaciones"
- Click "Crear aplicación"
- Nombre: "ChatBotDysa"
- Producto: "Pagos online"
- Click "Crear aplicación"

**1.4. Obtener credenciales de TEST:**
```
Public Key (TEST):  TEST-xxxxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxxxxxxxx
Access Token (TEST): TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxx
```

**1.5. Para PRODUCCIÓN (cuando estés listo):**
- Completar activación de cuenta
- Obtener credenciales de producción
```
Public Key (PROD):  APP_USR-xxxxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxxxxxxxx
Access Token (PROD): APP_USR-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxx
```

---

### Paso 2: Configurar variables de entorno

**Backend (`/apps/backend/.env.local`):**
```bash
# Mercado Pago - TEST (desarrollo)
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxx-xxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=tu-secreto-para-webhooks

# URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:8000
```

**Frontend (`/apps/website/.env.local`):**
```bash
# Mercado Pago - Public Key (frontend)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxxxx-xxxxxx-xxxxxx-xxxxxxxxxxxx
```

---

## 3️⃣ IMPLEMENTACIÓN EN BACKEND

### Archivo: `/apps/backend/src/payments/mercadopago.service.ts`

**Crear nuevo servicio:**

```typescript
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private mercadoPago: MercadoPagoConfig;
  private paymentClient: Payment;
  private preferenceClient: Preference;

  constructor(private configService: ConfigService) {
    // Inicializar SDK
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');

    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no configurado');
    }

    this.mercadoPago = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
        idempotencyKey: 'your-idempotency-key' // Opcional
      }
    });

    this.paymentClient = new Payment(this.mercadoPago);
    this.preferenceClient = new Preference(this.mercadoPago);

    this.logger.log('✅ Mercado Pago SDK inicializado');
  }

  /**
   * OPCIÓN 1: Checkout Pro - Crear preferencia de pago
   * Mercado Pago maneja el formulario de pago
   */
  async createPreference(dto: CreatePaymentDto) {
    try {
      this.logger.log(`Creating payment preference for plan: ${dto.planId}`);

      const preference = await this.preferenceClient.create({
        body: {
          items: [
            {
              id: dto.planId,
              title: dto.planName,
              description: `Plan ${dto.planName} - ChatBotDysa`,
              quantity: 1,
              currency_id: 'CLP',
              unit_price: dto.amount,
            }
          ],
          payer: {
            name: dto.businessName,
            email: dto.email,
            phone: {
              number: dto.phone,
            },
            identification: {
              type: 'RUT',
              number: dto.rut,
            },
          },
          back_urls: {
            success: `${this.configService.get('APP_URL')}/checkout/success`,
            failure: `${this.configService.get('APP_URL')}/checkout/payment?error=payment_failed`,
            pending: `${this.configService.get('APP_URL')}/checkout/payment?status=pending`,
          },
          auto_return: 'approved',
          notification_url: `${this.configService.get('API_URL')}/payments/webhook`,
          statement_descriptor: 'CHATBOTDYSA',
          external_reference: `ORDER_${Date.now()}`,
          metadata: {
            plan_id: dto.planId,
            business_name: dto.businessName,
            method: dto.method,
          },
        }
      });

      this.logger.log(`✅ Preference created: ${preference.id}`);

      return {
        preferenceId: preference.id,
        initPoint: preference.init_point, // URL para redireccionar
        sandboxInitPoint: preference.sandbox_init_point, // URL para testing
      };
    } catch (error) {
      this.logger.error(`❌ Error creating preference: ${error.message}`);
      throw new BadRequestException('Error al crear preferencia de pago');
    }
  }

  /**
   * OPCIÓN 2: Checkout API - Procesar pago directo
   * Tu frontend maneja el formulario, backend procesa el pago
   */
  async processPayment(dto: CreatePaymentDto) {
    try {
      this.logger.log(`Processing payment for plan: ${dto.planId}`);

      const payment = await this.paymentClient.create({
        body: {
          transaction_amount: dto.amount,
          description: `Plan ${dto.planName} - ChatBotDysa`,
          payment_method_id: dto.paymentMethodId || 'visa', // webpay, redcompra, etc.
          payer: {
            email: dto.email,
            identification: {
              type: 'RUT',
              number: dto.rut,
            },
          },
          token: dto.cardToken, // Token generado en frontend
          installments: 1,
          statement_descriptor: 'CHATBOTDYSA',
          notification_url: `${this.configService.get('API_URL')}/payments/webhook`,
          metadata: {
            plan_id: dto.planId,
            business_name: dto.businessName,
          },
        }
      });

      this.logger.log(`✅ Payment created: ${payment.id} - Status: ${payment.status}`);

      return {
        paymentId: payment.id,
        status: payment.status,
        statusDetail: payment.status_detail,
        transactionAmount: payment.transaction_amount,
      };
    } catch (error) {
      this.logger.error(`❌ Error processing payment: ${error.message}`);
      throw new BadRequestException('Error al procesar el pago');
    }
  }

  /**
   * Obtener información de un pago
   */
  async getPayment(paymentId: string) {
    try {
      const payment = await this.paymentClient.get({ id: paymentId });
      return payment;
    } catch (error) {
      this.logger.error(`❌ Error getting payment: ${error.message}`);
      throw new BadRequestException('Error al obtener información del pago');
    }
  }

  /**
   * Webhook handler - Procesar notificaciones de Mercado Pago
   */
  async handleWebhook(data: any) {
    try {
      this.logger.log(`📩 Webhook received: ${JSON.stringify(data)}`);

      const { type, data: webhookData } = data;

      if (type === 'payment') {
        const paymentId = webhookData.id;
        const payment = await this.getPayment(paymentId);

        this.logger.log(`Payment status: ${payment.status}`);

        // Actualizar estado en tu base de datos
        if (payment.status === 'approved') {
          await this.activateUserAccount(payment);
        }

        return { received: true };
      }

      return { received: true };
    } catch (error) {
      this.logger.error(`❌ Error handling webhook: ${error.message}`);
      return { received: false, error: error.message };
    }
  }

  /**
   * Activar cuenta del usuario después de pago aprobado
   */
  private async activateUserAccount(payment: any) {
    try {
      const metadata = payment.metadata;
      const planId = metadata.plan_id;
      const businessName = metadata.business_name;

      this.logger.log(`🎉 Activating account for: ${businessName}, plan: ${planId}`);

      // TODO: Implementar activación de cuenta
      // - Actualizar user.status = 'active' en DB
      // - Asignar plan al usuario
      // - Enviar email de confirmación
      // - Crear factura

      this.logger.log(`✅ Account activated for ${businessName}`);
    } catch (error) {
      this.logger.error(`❌ Error activating account: ${error.message}`);
    }
  }
}
```

---

### Archivo: `/apps/backend/src/payments/dto/create-payment.dto.ts`

```typescript
import { IsString, IsNumber, IsEmail, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  planId: string;

  @IsString()
  planName: string;

  @IsNumber()
  amount: number;

  @IsString()
  businessName: string;

  @IsString()
  rut: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  method?: string; // 'card', 'transfer', 'invoice'

  @IsString()
  @IsOptional()
  cardToken?: string; // Para Checkout API

  @IsString()
  @IsOptional()
  paymentMethodId?: string; // visa, mastercard, webpay, etc.
}
```

---

### Archivo: `/apps/backend/src/payments/payments.controller.ts`

**Agregar endpoints:**

```typescript
import { Controller, Post, Get, Body, Param, HttpCode } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  /**
   * POST /api/payments/create-preference
   * Crear preferencia para Checkout Pro
   */
  @Post('create-preference')
  async createPreference(@Body() dto: CreatePaymentDto) {
    return this.mercadoPagoService.createPreference(dto);
  }

  /**
   * POST /api/payments/process
   * Procesar pago directo (Checkout API)
   */
  @Post('process')
  async processPayment(@Body() dto: CreatePaymentDto) {
    return this.mercadoPagoService.processPayment(dto);
  }

  /**
   * GET /api/payments/:id
   * Obtener información de un pago
   */
  @Get(':id')
  async getPayment(@Param('id') id: string) {
    return this.mercadoPagoService.getPayment(id);
  }

  /**
   * POST /api/payments/webhook
   * Recibir notificaciones de Mercado Pago
   */
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() data: any) {
    return this.mercadoPagoService.handleWebhook(data);
  }
}
```

---

### Archivo: `/apps/backend/src/payments/payments.module.ts`

**Actualizar módulo:**

```typescript
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { MercadoPagoService } from './mercadopago.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService, MercadoPagoService],
  exports: [MercadoPagoService],
})
export class PaymentsModule {}
```

---

## 4️⃣ IMPLEMENTACIÓN EN FRONTEND

### Opción 1: Checkout Pro (Recomendado)

**Archivo: `/apps/website/src/app/checkout/payment/page.tsx`**

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    // Llamar al backend para crear preferencia
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        planId,
        planName: plan.name,
        amount: plan.total,
        businessName: formData.businessName,
        rut: formData.rut,
        email: formData.email,
        phone: formData.phone,
        method: selectedMethod,
      })
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    // Redireccionar a Mercado Pago
    window.location.href = data.initPoint // En producción
    // window.location.href = data.sandboxInitPoint // En desarrollo/testing

  } catch (error) {
    setError(error.message)
    setLoading(false)
  }
}
```

---

### Opción 2: Checkout API (Avanzado)

**Requiere:**
1. Cargar SDK de Mercado Pago en el frontend
2. Generar card token
3. Enviar token al backend

**No implementar esto al inicio. Usar Checkout Pro primero.**

---

## 5️⃣ TESTING DE PAGOS

### Tarjetas de test de Mercado Pago

**Tarjeta APROBADA:**
```
Número: 5031 7557 3453 0604
CVV: 123
Fecha: 11/25
Nombre: APRO (cualquier nombre)
```

**Tarjeta RECHAZADA:**
```
Número: 5031 4332 1540 6351
CVV: 123
Fecha: 11/25
Nombre: OTHE (cualquier nombre)
```

**RUT de test:**
```
11.111.111-1
```

**Email de test:**
```
test_user_123456@testuser.com
```

---

### Flujo de testing:

1. **Completar formulario de pago**
   - Usar datos de test
   - Click "Confirmar Pago"

2. **Redirección a Mercado Pago**
   - Se abre checkout de Mercado Pago
   - Usar tarjeta de test

3. **Pago aprobado**
   - Mercado Pago redirige a `/checkout/success`
   - Webhook se dispara en el backend

4. **Verificar en panel de Mercado Pago**
   - Ir a https://www.mercadopago.cl/developers/panel/payments
   - Ver el pago de test

---

## 6️⃣ WEBHOOKS Y CONFIRMACIÓN ASÍNCRONA

### Configurar webhook en Mercado Pago:

1. **Ir al panel de aplicaciones:**
```
https://www.mercadopago.cl/developers/panel/app/YOUR_APP_ID/webhooks
```

2. **Agregar webhook:**
- URL de producción: `https://api.chatbotdysa.com/payments/webhook`
- URL de desarrollo: `https://your-ngrok-url.ngrok.io/payments/webhook`
- Eventos: "Payments"

3. **Probar webhook:**
```bash
# Usar ngrok para exponer tu localhost
npx ngrok http 8000

# Copiar URL de ngrok y agregar en Mercado Pago
https://abc123.ngrok.io/payments/webhook
```

---

### Validar webhook signature (seguridad):

```typescript
async handleWebhook(data: any, headers: any) {
  // Verificar que viene de Mercado Pago
  const xSignature = headers['x-signature'];
  const xRequestId = headers['x-request-id'];

  // Validar firma
  const isValid = this.validateWebhookSignature(xSignature, xRequestId, data);

  if (!isValid) {
    throw new UnauthorizedException('Invalid webhook signature');
  }

  // Procesar webhook...
}

private validateWebhookSignature(signature: string, requestId: string, data: any): boolean {
  // Implementar validación según documentación de Mercado Pago
  // https://www.mercadopago.cl/developers/es/docs/your-integrations/notifications/webhooks
  return true; // Por ahora
}
```

---

## 7️⃣ CHECKLIST DE IMPLEMENTACIÓN

### Backend:
- [ ] Instalar SDK: `npm install mercadopago`
- [ ] Crear `mercadopago.service.ts`
- [ ] Implementar `createPreference()` (Checkout Pro)
- [ ] Implementar `processPayment()` (Checkout API - opcional)
- [ ] Implementar `handleWebhook()`
- [ ] Actualizar `payments.controller.ts`
- [ ] Actualizar `payments.module.ts`
- [ ] Configurar variables de entorno (.env.local)

### Frontend:
- [ ] Actualizar `handleSubmit()` en payment page
- [ ] Llamar a `/payments/create-preference`
- [ ] Redireccionar a `initPoint`
- [ ] Agregar public key a .env.local

### Testing:
- [ ] Probar con tarjeta de test APROBADA
- [ ] Probar con tarjeta de test RECHAZADA
- [ ] Verificar redirección a success
- [ ] Verificar webhook se dispara
- [ ] Ver pago en panel de Mercado Pago

### Producción:
- [ ] Obtener credenciales de producción
- [ ] Actualizar .env.production
- [ ] Configurar webhook URL real
- [ ] Completar activación de cuenta MP
- [ ] Testing en producción

---

## 8️⃣ ERRORES COMUNES Y SOLUCIONES

### Error: "Access token inválido"
**Solución:** Verificar que MERCADOPAGO_ACCESS_TOKEN esté configurado correctamente

### Error: "Preference not created"
**Solución:** Verificar que amount > 0 y que todos los campos requeridos estén presentes

### Error: "Webhook no se dispara"
**Solución:**
- Verificar que la URL del webhook sea pública (usar ngrok en desarrollo)
- Ver logs en panel de Mercado Pago

### Error: "Pago rechazado"
**Solución:** Usar tarjeta de test correcta (5031 7557 3453 0604)

---

## 📚 Recursos Adicionales

**Documentación oficial:**
- https://www.mercadopago.cl/developers/es/docs
- https://github.com/mercadopago/sdk-nodejs

**Sandbox para testing:**
- https://www.mercadopago.cl/developers/panel/test-payments

**Postman collection:**
- https://www.mercadopago.cl/developers/es/docs/your-integrations/testing/postman

---

## ⏱️ Tiempo Estimado por Fase

| Fase | Tiempo | Prioridad |
|------|--------|-----------|
| Instalación SDK | 10 min | 🔥🔥🔥 |
| Obtener credenciales | 15 min | 🔥🔥🔥 |
| Backend - Checkout Pro | 2h | 🔥🔥🔥 |
| Frontend - Checkout Pro | 1h | 🔥🔥🔥 |
| Testing | 1h | 🔥🔥🔥 |
| Webhooks | 2h | 🔥🔥 |
| **TOTAL (Checkout Pro)** | **6h** | |
| Backend - Checkout API | +3h | 🔥 |
| Frontend - Checkout API | +2h | 🔥 |
| **TOTAL (Completo)** | **11h** | |

---

## 🚀 Próximos Pasos

**MAÑANA (3 de Octubre):**

1. **Instalación (30 min):**
   - Instalar SDK
   - Obtener credenciales de TEST

2. **Backend (3h):**
   - Crear `mercadopago.service.ts`
   - Implementar Checkout Pro
   - Testing de endpoints

3. **Frontend (1h):**
   - Integrar con payment page
   - Testing de flujo completo

4. **Webhooks (2h):**
   - Configurar ngrok
   - Implementar handler
   - Testing de notificaciones

**TOTAL MAÑANA:** 6-7 horas

---

**ChatBotDysa Enterprise+++++**
*Guía de Integración de Mercado Pago*

© 2025 ChatBotDysa - Todos los derechos reservados

**Siguiente tarea:** Instalar SDK y obtener credenciales (MAÑANA)
