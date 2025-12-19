import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { QuickReply, QuickReplyCategory } from '../../entities/quick-reply.entity';

@Injectable()
export class QuickRepliesService {
  private readonly logger = new Logger(QuickRepliesService.name);

  constructor(
    @InjectRepository(QuickReply)
    private readonly quickRepliesRepo: Repository<QuickReply>
  ) {}

  async create(data: {
    title: string;
    content: string;
    category?: QuickReplyCategory;
    shortcut?: string;
    variables?: string[];
  }): Promise<QuickReply> {
    const quickReply = this.quickRepliesRepo.create({
      title: data.title,
      content: data.content,
      category: data.category || QuickReplyCategory.CUSTOM,
      shortcut: data.shortcut,
      variables: data.variables,
    });

    const saved = await this.quickRepliesRepo.save(quickReply);
    this.logger.log(`Quick reply created: ${saved.title}`);

    return saved;
  }

  async findAll(filters?: {
    category?: QuickReplyCategory;
    search?: string;
    active_only?: boolean;
  }): Promise<QuickReply[]> {
    const queryBuilder = this.quickRepliesRepo
      .createQueryBuilder('qr')
      .orderBy('qr.usage_count', 'DESC')
      .addOrderBy('qr.title', 'ASC');

    if (filters?.category) {
      queryBuilder.andWhere('qr.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(qr.title ILIKE :search OR qr.content ILIKE :search OR qr.shortcut ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters?.active_only !== false) {
      queryBuilder.andWhere('qr.is_active = :isActive', { isActive: true });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<QuickReply> {
    const quickReply = await this.quickRepliesRepo.findOne({
      where: { id },
    });

    if (!quickReply) {
      throw new NotFoundException(`Quick reply with ID ${id} not found`);
    }

    return quickReply;
  }

  async findByShortcut(shortcut: string): Promise<QuickReply | null> {
    return this.quickRepliesRepo.findOne({
      where: { shortcut, is_active: true },
    });
  }

  async update(
    id: number,
    data: Partial<{
      title: string;
      content: string;
      category: QuickReplyCategory;
      shortcut: string;
      is_active: boolean;
      variables: string[];
    }>
  ): Promise<QuickReply> {
    const quickReply = await this.findOne(id);

    Object.assign(quickReply, data);

    const updated = await this.quickRepliesRepo.save(quickReply);
    this.logger.log(`Quick reply updated: ${updated.title}`);

    return updated;
  }

  async incrementUsage(id: number): Promise<void> {
    await this.quickRepliesRepo.increment({ id }, 'usage_count', 1);
  }

  async delete(id: number): Promise<void> {
    const quickReply = await this.findOne(id);
    await this.quickRepliesRepo.remove(quickReply);

    this.logger.log(`Quick reply deleted: ${quickReply.title}`);
  }

  /**
   * Process content with variables
   * Replaces {variable} with provided values
   */
  processContent(content: string, variables: Record<string, string>): string {
    let processed = content;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{${key}\\}`, 'gi');
      processed = processed.replace(regex, value);
    }

    return processed;
  }

  /**
   * Seed default quick replies
   */
  async seedDefaults(): Promise<void> {
    const count = await this.quickRepliesRepo.count();
    if (count > 0) {
      this.logger.log('Quick replies already exist, skipping seed');
      return;
    }

    const defaults = [
      {
        title: 'Saludo',
        content: '¡Hola {nombre}! Bienvenido/a a ChatBotDysa. ¿En qué puedo ayudarte hoy?',
        category: QuickReplyCategory.GREETING,
        shortcut: '/saludo',
        variables: ['nombre'],
      },
      {
        title: 'Despedida',
        content:
          '¡Gracias por contactarnos! Si tienes más preguntas, no dudes en escribirnos. ¡Que tengas un excelente día!',
        category: QuickReplyCategory.FAREWELL,
        shortcut: '/despedida',
        variables: [],
      },
      {
        title: 'Horario de atención',
        content:
          'Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00 hrs. ¿Hay algo más en lo que pueda ayudarte?',
        category: QuickReplyCategory.INFO,
        shortcut: '/horario',
        variables: [],
      },
      {
        title: 'En espera',
        content: 'Gracias por tu paciencia. Un agente te atenderá en breve.',
        category: QuickReplyCategory.SUPPORT,
        shortcut: '/espera',
        variables: [],
      },
      {
        title: 'Transferir a agente',
        content:
          'Entiendo tu consulta. Voy a transferirte con un agente especializado que podrá ayudarte mejor. Por favor espera un momento.',
        category: QuickReplyCategory.SUPPORT,
        shortcut: '/transferir',
        variables: [],
      },
      {
        title: 'Promociones',
        content:
          '¡Tenemos promociones especiales para ti! Visita nuestra sección de ofertas o pregúntame por nuestras promociones actuales.',
        category: QuickReplyCategory.SALES,
        shortcut: '/promo',
        variables: [],
      },
      {
        title: 'Confirmar pedido',
        content:
          'Tu pedido #{pedido} ha sido confirmado. Te notificaremos cuando esté listo. ¡Gracias por tu preferencia!',
        category: QuickReplyCategory.SALES,
        shortcut: '/confirmarpedido',
        variables: ['pedido'],
      },
      {
        title: 'Problema técnico',
        content:
          'Lamentamos los inconvenientes. Nuestro equipo técnico está trabajando para resolver el problema. Te mantendremos informado.',
        category: QuickReplyCategory.SUPPORT,
        shortcut: '/tecnico',
        variables: [],
      },
    ];

    for (const data of defaults) {
      await this.create(data);
    }

    this.logger.log(`Seeded ${defaults.length} default quick replies`);
  }
}
