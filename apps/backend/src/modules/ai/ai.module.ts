import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OllamaService } from "./ollama.service";
import { HybridAIService } from "./hybrid-ai.service";
import { AiController } from "./ai.controller";
import { CommonModule } from "../../common/common.module";

@Module({
  imports: [ConfigModule, CommonModule],
  controllers: [AiController],
  providers: [OllamaService, HybridAIService],
  exports: [OllamaService, HybridAIService],
})
export class AiModule {}
