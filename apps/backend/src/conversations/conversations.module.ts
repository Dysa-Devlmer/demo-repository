import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { Customer } from '../entities/customer.entity';
import { CommonModule } from '../common/common.module';
import { AiModule } from '../modules/ai/ai.module';
import { WhatsAppModule } from '../modules/whatsapp/whatsapp.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, Customer]),
    CommonModule,
    AiModule,
    WhatsAppModule
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}