import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OllamaService } from './ollama.service';
import { HybridAIService } from './hybrid-ai.service';
import { LearningMemoryService } from './learning-memory.service';
import { CustomerMemoryService } from './customer-memory.service';
import { AiController } from './ai.controller';
import { CommonModule } from '../../common/common.module';
import { LearningExperience } from '../../entities/learning-experience.entity';
import { CustomerMemory } from './customer-memory.entity';

@Module({
  imports: [
    ConfigModule,
    CommonModule,
    TypeOrmModule.forFeature([LearningExperience, CustomerMemory]),
  ],
  controllers: [AiController],
  providers: [OllamaService, HybridAIService, LearningMemoryService, CustomerMemoryService],
  exports: [OllamaService, HybridAIService, LearningMemoryService, CustomerMemoryService],
})
export class AiModule {}
