import { Injectable, Logger } from '@nestjs/common';
import { CreateDemoRequestDto } from './dto/create-demo-request.dto';
import { CreateRegistrationDto } from './dto/create-registration.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  async createDemoRequest(createDemoRequestDto: CreateDemoRequestDto) {
    try {
      this.logger.log(`Nueva solicitud de demo recibida de: ${createDemoRequestDto.email}`);

      // En un entorno real, aquí se haría:
      // 1. Guardar en base de datos
      // 2. Enviar email de notificación al equipo de ventas
      // 3. Enviar email de confirmación al cliente
      // 4. Integrar con CRM (HubSpot, Salesforce, etc.)

      // Por ahora, simplemente loggeamos la información
      this.logger.log(`Datos de la solicitud:`, {
        name: createDemoRequestDto.name,
        email: createDemoRequestDto.email,
        phone: createDemoRequestDto.phone,
        restaurant: createDemoRequestDto.restaurant,
        employees: createDemoRequestDto.employees || 'No especificado',
        preferredDate: createDemoRequestDto.preferredDate || 'No especificado',
        preferredTime: createDemoRequestDto.preferredTime || 'No especificado',
        message: createDemoRequestDto.message || 'Sin mensaje adicional',
      });

      // Simulamos el envío exitoso
      return {
        success: true,
        message: 'Solicitud de demo recibida correctamente',
        data: {
          leadId: `lead_${Date.now()}`,
          name: createDemoRequestDto.name,
          email: createDemoRequestDto.email,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error procesando solicitud de demo: ${error.message}`);
      throw error;
    }
  }

  async createContactRequest(contactData: any) {
    try {
      this.logger.log(`Nueva solicitud de contacto recibida de: ${contactData.email}`);

      // Similar al demo request, aquí se procesaría el contacto
      return {
        success: true,
        message: 'Solicitud de contacto recibida correctamente',
        data: {
          contactId: `contact_${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      this.logger.error(`Error procesando solicitud de contacto: ${error.message}`);
      throw error;
    }
  }

  async createRegistration(createRegistrationDto: CreateRegistrationDto) {
    try {
      this.logger.log(`Nuevo registro de restaurante: ${createRegistrationDto.restaurantName}`);

      // En producción, aquí se haría:
      // 1. Validar que el subdomain esté disponible
      // 2. Crear tenant en base de datos
      // 3. Crear esquema de base de datos del tenant
      // 4. Crear usuario administrador
      // 5. Enviar email de bienvenida
      // 6. Inicializar configuración por defecto
      // 7. Crear factura/pago en Mercado Pago
      // 8. Notificar al equipo de ventas

      this.logger.log(`Datos de registro:`, {
        restaurantName: createRegistrationDto.restaurantName,
        ownerName: createRegistrationDto.ownerName,
        email: createRegistrationDto.email,
        phone: createRegistrationDto.phone,
        city: createRegistrationDto.city,
        subdomain: createRegistrationDto.subdomain,
        plan: createRegistrationDto.plan,
      });

      // Validar que aceptó términos
      if (!createRegistrationDto.agreedToTerms || !createRegistrationDto.agreedToPrivacy) {
        throw new Error('Debe aceptar los términos y condiciones');
      }

      // Generar ID de tenant
      const tenantId = `tenant_${Date.now()}`;
      const accessUrl = `https://${createRegistrationDto.subdomain}.chatbotdysa.com`;

      return {
        success: true,
        message: 'Registro completado exitosamente',
        data: {
          tenantId,
          restaurantName: createRegistrationDto.restaurantName,
          subdomain: createRegistrationDto.subdomain,
          accessUrl,
          adminEmail: createRegistrationDto.email,
          plan: createRegistrationDto.plan,
          createdAt: new Date().toISOString(),
          status: 'pending_payment', // o 'active' si el pago se procesa inmediatamente
        },
      };
    } catch (error) {
      this.logger.error(`Error procesando registro: ${error.message}`);
      throw error;
    }
  }
}
