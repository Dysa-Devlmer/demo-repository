import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull, Not, LessThan, DataSource } from "typeorm";
import {
  Conversation,
  ConversationStatus,
  ConversationChannel,
  ConversationMode,
} from "../entities/conversation.entity";
import { Message } from "../entities/message.entity";
import { Customer } from "../entities/customer.entity";

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectRepository(Conversation)
    private readonly conversationsRepo: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
    @InjectRepository(Customer)
    private readonly customersRepo: Repository<Customer>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a new conversation
   */
  async create(data: {
    customerId: number;
    channel: ConversationChannel;
    subject?: string;
    metadata?: any;
  }): Promise<Conversation> {
    const customer = await this.customersRepo.findOne({
      where: { id: data.customerId },
    });

    if (!customer) {
      throw new BadRequestException(
        `Customer with ID ${data.customerId} not found`,
      );
    }

    // Check if there's an active conversation for this customer
    const activeConversation = await this.conversationsRepo.findOne({
      where: {
        customer: { id: data.customerId },
        status: ConversationStatus.ACTIVE,
      },
      relations: ["customer", "messages"],
    });

    if (activeConversation) {
      // Update last activity time
      activeConversation.last_activity = new Date();
      await this.conversationsRepo.save(activeConversation);

      this.logger.log(
        `Returning existing active conversation ${activeConversation.session_id} for customer ${customer.name}`,
      );
      return activeConversation;
    }

    const sessionId = this.generateSessionId();

    const conversation = this.conversationsRepo.create({
      session_id: sessionId,
      customer,
      channel: data.channel,
      status: ConversationStatus.ACTIVE,
      subject: data.subject,
      metadata: data.metadata,
      last_activity: new Date(),
      message_count: 0,
      bot_messages: 0,
      human_messages: 0,
    });

    const saved = await this.conversationsRepo.save(conversation);

    this.logger.log(
      `Conversation ${sessionId} created for ${customer.name} via ${data.channel}`,
    );

    return saved;
  }

  /**
   * Find all conversations with pagination and filtering
   */
  async findAll(filters?: {
    status?: ConversationStatus;
    channel?: ConversationChannel;
    customerId?: number;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Conversation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.conversationsRepo
      .createQueryBuilder("conversation")
      .leftJoinAndSelect("conversation.customer", "customer")
      .leftJoinAndSelect("conversation.messages", "messages")
      .orderBy("conversation.last_activity", "DESC");

    if (filters?.status) {
      queryBuilder.andWhere("conversation.status = :status", {
        status: filters.status,
      });
    }

    if (filters?.channel) {
      queryBuilder.andWhere("conversation.channel = :channel", {
        channel: filters.channel,
      });
    }

    if (filters?.customerId) {
      queryBuilder.andWhere("conversation.customer.id = :customerId", {
        customerId: filters.customerId,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Find one conversation by ID
   */
  async findOne(id: number): Promise<Conversation> {
    const conversation = await this.conversationsRepo.findOne({
      where: { id },
      relations: ["customer", "messages"],
      order: {
        messages: {
          created_at: "ASC",
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  /**
   * Find conversation by session ID
   */
  async findBySessionId(sessionId: string): Promise<Conversation> {
    const conversation = await this.conversationsRepo.findOne({
      where: { session_id: sessionId },
      relations: ["customer", "messages"],
      order: {
        messages: {
          created_at: "ASC",
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(
        `Conversation with session ID ${sessionId} not found`,
      );
    }

    return conversation;
  }

  /**
   * Add a message to a conversation
   *
   * CRITICAL FIX v5: This method uses direct SQL queries to avoid TypeORM's
   * cascade behavior which was resetting conversation_id to NULL.
   */
  async addMessage(
    conversationId: number,
    data: {
      content: string;
      sender: "bot" | "human" | "customer" | "agent";
      metadata?: any;
    },
  ): Promise<Message> {
    this.logger.log(`[FIX v5] addMessage called for conversation ${conversationId}`);

    // Verify conversation exists
    const conversation = await this.findOne(conversationId);

    // Map sender to MessageRole
    const roleMap = {
      bot: "bot" as const,
      human: "agent" as const,
      agent: "agent" as const,
      customer: "user" as const,
    };

    const role = roleMap[data.sender];

    try {
      // STEP 1: Insert message using QueryBuilder (bypasses TypeORM relation handling)
      const result = await this.messagesRepo
        .createQueryBuilder()
        .insert()
        .into(Message)
        .values({
          conversation_id: conversationId,
          content: data.content,
          role: role as any,
          type: "text" as any,
          metadata: data.metadata,
        })
        .returning("*")
        .execute();

      const saved = result.raw[0] as Message;
      this.logger.log(`[FIX v5] Message inserted - ID: ${saved.id}, conversation_id: ${saved.conversation_id}`);

      // STEP 2: Update conversation stats using DIRECT SQL (avoids cascade: true issue)
      // Using conversationsRepo.save() triggers cascade which resets conversation_id to NULL
      const botIncrement = data.sender === "bot" ? 1 : 0;
      const humanIncrement = data.sender === "human" ? 1 : 0;

      await this.dataSource.query(
        `UPDATE conversations
         SET message_count = message_count + 1,
             bot_messages = bot_messages + $1,
             human_messages = human_messages + $2,
             last_activity = NOW()
         WHERE id = $3`,
        [botIncrement, humanIncrement, conversationId]
      );

      this.logger.log(
        `[FIX v5] Message added to conversation ${conversation.session_id} by ${data.sender}`,
      );

      return saved;
    } catch (error) {
      this.logger.error(`[FIX v5] ERROR in addMessage: ${error.message}`);
      this.logger.error(`[FIX v5] Stack: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Update conversation status
   */
  async updateStatus(
    id: number,
    status: ConversationStatus,
  ): Promise<Conversation> {
    const conversation = await this.findOne(id);
    conversation.status = status;
    conversation.last_activity = new Date();

    const updated = await this.conversationsRepo.save(conversation);

    this.logger.log(
      `Conversation ${conversation.session_id} status updated to ${status}`,
    );

    return updated;
  }

  /**
   * Escalate conversation to human agent
   */
  async escalate(id: number, agentId: string): Promise<Conversation> {
    const conversation = await this.findOne(id);
    conversation.status = ConversationStatus.ESCALATED;
    conversation.agent_id = agentId;
    conversation.last_activity = new Date();

    const escalated = await this.conversationsRepo.save(conversation);

    this.logger.warn(
      `Conversation ${conversation.session_id} escalated to agent ${agentId}`,
    );

    return escalated;
  }

  /**
   * Resolve conversation
   */
  async resolve(
    id: number,
    satisfactionScore?: number,
    feedback?: string,
  ): Promise<Conversation> {
    const conversation = await this.findOne(id);
    conversation.status = ConversationStatus.RESOLVED;
    conversation.last_activity = new Date();

    if (satisfactionScore) {
      if (satisfactionScore < 1 || satisfactionScore > 5) {
        throw new BadRequestException(
          "Satisfaction score must be between 1 and 5",
        );
      }
      conversation.satisfaction_score = satisfactionScore;
    }

    if (feedback) {
      conversation.feedback = feedback;
    }

    const resolved = await this.conversationsRepo.save(conversation);

    this.logger.log(
      `Conversation ${conversation.session_id} resolved with score ${satisfactionScore || "N/A"}`,
    );

    return resolved;
  }

  /**
   * Close conversation
   */
  async close(id: number): Promise<Conversation> {
    const conversation = await this.findOne(id);
    conversation.status = ConversationStatus.CLOSED;
    conversation.last_activity = new Date();

    const closed = await this.conversationsRepo.save(conversation);

    this.logger.log(`Conversation ${conversation.session_id} closed`);

    return closed;
  }

  /**
   * Update conversation context (for AI state management)
   */
  async updateContext(id: number, context: any): Promise<Conversation> {
    const conversation = await this.findOne(id);
    conversation.context = {
      ...conversation.context,
      ...context,
    };
    conversation.last_activity = new Date();

    return this.conversationsRepo.save(conversation);
  }

  /**
   * Get active conversations
   */
  async getActiveConversations(): Promise<Conversation[]> {
    return this.conversationsRepo.find({
      where: {
        status: ConversationStatus.ACTIVE,
      },
      relations: ["customer", "messages"],
      order: {
        last_activity: "DESC",
      },
    });
  }

  /**
   * Get escalated conversations (need human attention)
   */
  async getEscalatedConversations(): Promise<Conversation[]> {
    return this.conversationsRepo.find({
      where: {
        status: ConversationStatus.ESCALATED,
      },
      relations: ["customer", "messages"],
      order: {
        last_activity: "DESC",
      },
    });
  }

  /**
   * Get stale conversations (no activity in last 30 minutes)
   */
  async getStaleConversations(): Promise<Conversation[]> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60000);

    return this.conversationsRepo.find({
      where: {
        status: ConversationStatus.ACTIVE,
        last_activity: LessThan(thirtyMinutesAgo),
      },
      relations: ["customer"],
      order: {
        last_activity: "ASC",
      },
    });
  }

  /**
   * Auto-close stale conversations
   */
  async autoCloseStaleConversations(): Promise<number> {
    const staleConversations = await this.getStaleConversations();

    for (const conversation of staleConversations) {
      conversation.status = ConversationStatus.CLOSED;
      await this.conversationsRepo.save(conversation);

      this.logger.log(
        `Auto-closed stale conversation ${conversation.session_id}`,
      );
    }

    return staleConversations.length;
  }

  /**
   * Get conversation statistics
   */
  async getStatistics(): Promise<{
    total: number;
    active: number;
    resolved: number;
    closed: number;
    escalated: number;
    avgMessagesPerConversation: number;
    avgBotMessages: number;
    avgHumanMessages: number;
    avgSatisfactionScore: number;
    byChannel: {
      whatsapp: number;
      webWidget: number;
      phone: number;
    };
  }> {
    const [
      total,
      active,
      resolved,
      closed,
      escalated,
      whatsapp,
      webWidget,
      phone,
    ] = await Promise.all([
      this.conversationsRepo.count(),
      this.conversationsRepo.count({
        where: { status: ConversationStatus.ACTIVE },
      }),
      this.conversationsRepo.count({
        where: { status: ConversationStatus.RESOLVED },
      }),
      this.conversationsRepo.count({
        where: { status: ConversationStatus.CLOSED },
      }),
      this.conversationsRepo.count({
        where: { status: ConversationStatus.ESCALATED },
      }),
      this.conversationsRepo.count({
        where: { channel: ConversationChannel.WHATSAPP },
      }),
      this.conversationsRepo.count({
        where: { channel: ConversationChannel.WEB_WIDGET },
      }),
      this.conversationsRepo.count({
        where: { channel: ConversationChannel.PHONE },
      }),
    ]);

    const allConversations = await this.conversationsRepo.find();

    const avgMessagesPerConversation =
      allConversations.reduce((sum, c) => sum + c.message_count, 0) /
        (total || 1);
    const avgBotMessages =
      allConversations.reduce((sum, c) => sum + c.bot_messages, 0) /
        (total || 1);
    const avgHumanMessages =
      allConversations.reduce((sum, c) => sum + c.human_messages, 0) /
        (total || 1);

    const satisfactionScores = allConversations
      .filter((c) => c.satisfaction_score != null)
      .map((c) => c.satisfaction_score as number);
    const avgSatisfactionScore =
      satisfactionScores.length > 0
        ? satisfactionScores.reduce((sum, score) => sum! + score!, 0) /
          satisfactionScores.length
        : 0;

    return {
      total,
      active,
      resolved,
      closed,
      escalated,
      avgMessagesPerConversation: Math.round(avgMessagesPerConversation * 10) / 10,
      avgBotMessages: Math.round(avgBotMessages * 10) / 10,
      avgHumanMessages: Math.round(avgHumanMessages * 10) / 10,
      avgSatisfactionScore: Math.round(avgSatisfactionScore * 10) / 10,
      byChannel: {
        whatsapp,
        webWidget,
        phone,
      },
    };
  }

  /**
   * Update conversation (flexible update for multiple fields)
   */
  async update(
    id: number,
    updateDto: {
      status?: string;
      agent_id?: string;
      mode?: string;
      metadata?: any;
    },
  ): Promise<Conversation> {
    const conversation = await this.conversationsRepo.findOne({
      where: { id },
      relations: ["customer", "messages"],
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found`);
    }

    // Update status if provided
    if (updateDto.status) {
      conversation.status = updateDto.status as ConversationStatus;
    }

    // Update mode if provided (auto, manual, hybrid)
    if (updateDto.mode) {
      conversation.mode = updateDto.mode as ConversationMode;
      this.logger.log(`Conversation ${id} mode changed to ${updateDto.mode}`);

      // If switching to manual, log that agent will handle responses
      if (updateDto.mode === ConversationMode.MANUAL) {
        this.logger.log(`Conversation ${id} now requires human agent responses`);
      }
    }

    // Update agent_id if provided (including empty string to unassign)
    if (updateDto.agent_id !== undefined) {
      conversation.agent_id = updateDto.agent_id || undefined;

      // If agent is assigned and mode is auto, switch to hybrid
      if (updateDto.agent_id && conversation.mode === ConversationMode.AUTO) {
        conversation.mode = ConversationMode.HYBRID;
        this.logger.log(`Conversation ${id} mode auto-switched to HYBRID due to agent assignment`);
      }
    }

    // Merge metadata if provided
    if (updateDto.metadata) {
      conversation.metadata = {
        ...(conversation.metadata || {}),
        ...updateDto.metadata,
      };
    }

    // Update last activity
    conversation.last_activity = new Date();

    const updated = await this.conversationsRepo.save(conversation);

    this.logger.log(
      `Conversation ${conversation.session_id} updated - Status: ${conversation.status}, Agent: ${conversation.agent_id || "none"}`,
    );

    return updated;
  }

  /**
   * Delete conversation (soft wrapper for remove method)
   */
  async delete(id: number): Promise<void> {
    return this.remove(id);
  }

  /**
   * Delete conversation (hard delete - admin only)
   */
  async remove(id: number): Promise<void> {
    const conversation = await this.findOne(id);
    await this.conversationsRepo.remove(conversation);

    this.logger.warn(
      `Conversation ${conversation.session_id} permanently deleted`,
    );
  }

  /**
   * Update message delivery status based on WhatsApp webhook status updates
   */
  async updateMessageDeliveryStatus(
    whatsappMessageId: string,
    status: 'sent' | 'delivered' | 'read' | 'failed',
    timestamp?: Date,
  ): Promise<Message | null> {
    // Find message by WhatsApp message ID stored in metadata
    const message = await this.messagesRepo
      .createQueryBuilder('message')
      .where("message.metadata->>'whatsapp_message_id' = :messageId", {
        messageId: whatsappMessageId,
      })
      .getOne();

    if (!message) {
      this.logger.debug(`Message with WhatsApp ID ${whatsappMessageId} not found`);
      return null;
    }

    // Map WhatsApp status to our enum
    const statusMap: Record<string, string> = {
      sent: 'sent',
      delivered: 'delivered',
      read: 'read',
      failed: 'failed',
    };

    const deliveryStatus = statusMap[status] || 'pending';
    const now = timestamp || new Date();

    // Update using query builder to avoid TypeORM cascade issues
    await this.messagesRepo
      .createQueryBuilder()
      .update(Message)
      .set({
        delivery_status: deliveryStatus as any,
        is_delivered: status === 'delivered' || status === 'read',
        is_read: status === 'read',
        delivered_at: status === 'delivered' ? now : message.delivered_at,
        read_at: status === 'read' ? now : message.read_at,
      })
      .where('id = :id', { id: message.id })
      .execute();

    this.logger.log(
      `Message ${message.id} delivery status updated to ${status}`,
    );

    // Return updated message
    return this.messagesRepo.findOne({ where: { id: message.id } });
  }

  /**
   * Get messages by delivery status
   */
  async getMessagesByDeliveryStatus(
    conversationId: number,
    status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed',
  ): Promise<Message[]> {
    return this.messagesRepo.find({
      where: {
        conversation_id: conversationId,
        delivery_status: status as any,
      },
      order: {
        created_at: 'ASC',
      },
    });
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CONV-${timestamp}-${random}`;
  }
}