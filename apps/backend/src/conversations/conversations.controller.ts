import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  HttpException,
  NotFoundException
} from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { ConversationsService } from './conversations.service';
import { OllamaService } from '../modules/ai/ollama.service';
import { ConversationChannel } from '../entities/conversation.entity';

@Controller('conversations')
@UseGuards(AuthGuard)
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly ollamaService: OllamaService
  ) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('channel') channel?: string,
    @Query('customerId') customerId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.conversationsService.findAll({
      status: status as any,
      channel: channel as any,
      customerId: customerId ? parseInt(customerId) : undefined,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.conversationsService.findOne(id);
  }

  @Post()
  async create(@Body() createDto: {
    customer_phone: string;
    customer_name?: string;
    platform?: string;
    status?: string;
  }) {
    // Buscar o crear cliente basándose en el teléfono
    let customer = await this.conversationsService['customersRepo'].findOne({
      where: { phone: createDto.customer_phone }
    });

    // Si no existe, crear un nuevo cliente
    if (!customer) {
      const newCustomer = this.conversationsService['customersRepo'].create({
        name: createDto.customer_name || 'Cliente ' + createDto.customer_phone,
        phone: createDto.customer_phone,
        source: 'admin' as any,
        is_active: true
      });
      customer = await this.conversationsService['customersRepo'].save(newCustomer);
    }

    if (!customer) {
      throw new HttpException('Failed to create customer', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const conversation = await this.conversationsService.create({
      customerId: customer.id,
      channel: (createDto.platform === 'whatsapp' ? ConversationChannel.WHATSAPP :
                createDto.platform === 'phone' ? ConversationChannel.PHONE :
                ConversationChannel.WEB_WIDGET) as ConversationChannel,
      subject: createDto.platform ? `${createDto.platform} conversation` : 'New conversation',
      metadata: {
        platform: createDto.platform || 'web',
        created_from: 'admin_panel'
      }
    });

    return {
      success: true,
      data: conversation
    };
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() messageDto: {
      message: string;
      sender: 'customer' | 'bot' | 'human';
    }
  ) {
    try {
      // Guardar el mensaje del usuario
      const userMessage = await this.conversationsService.addMessage(id, {
        content: messageDto.message,
        sender: messageDto.sender,
      });

      // Si el mensaje es del cliente, generar respuesta de AI
      let aiResponse: any = null;
      if (messageDto.sender === 'customer') {
        // Obtener la conversación completa con historial
        const conversation = await this.conversationsService.findOne(id);

        // Preparar contexto para Ollama
        const previousMessages = conversation.messages
          .slice(-5) // Últimos 5 mensajes para contexto
          .map(msg => ({
            role: msg.role === 'bot' ? 'assistant' as const : msg.role === 'user' ? 'user' as const : 'user' as const,
            content: msg.content
          }));

        // Generar respuesta con Ollama
        const aiResponseText = await this.ollamaService.generateRestaurantResponse(
          messageDto.message,
          {
            customerName: conversation.customer?.name,
            previousMessages,
            restaurantInfo: {
              name: 'ChatBotDysa Restaurant',
              address: 'Santiago, Chile',
              phone: '+56 9 1234 5678',
              hours: 'Lunes a Domingo: 12:00 - 23:00',
              specialties: ['Comida Chilena', 'Mariscos', 'Parrilladas']
            }
          }
        );

        // Guardar respuesta de AI
        aiResponse = await this.conversationsService.addMessage(id, {
          content: aiResponseText,
          sender: 'bot',
        });
      }

      return {
        success: true,
        data: {
          user_message: userMessage,
          ai_response: aiResponse?.content,
          message_id: aiResponse?.id
        }
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar el mensaje';
      throw new HttpException(
        {
          success: false,
          error: errorMessage
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: {
      status?: string;
      agent_id?: string;
      metadata?: any;
    }
  ) {
    try {
      const updated = await this.conversationsService.update(id, updateDto);
      return {
        success: true,
        data: updated
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la conversación';
      throw new HttpException(
        {
          success: false,
          error: errorMessage
        },
        error instanceof NotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    try {
      await this.conversationsService.delete(id);
      return {
        success: true,
        message: 'Conversación eliminada exitosamente'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la conversación';
      throw new HttpException(
        {
          success: false,
          error: errorMessage
        },
        error instanceof NotFoundException ? HttpStatus.NOT_FOUND : HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('stats/summary')
  async getStats() {
    return this.conversationsService.getStatistics();
  }
}