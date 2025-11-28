import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TwilioService } from "./twilio.service";
import { TwilioController } from "./twilio.controller";
import { AiModule } from "../ai/ai.module";
import { WebSocketsModule } from "../websockets/websockets.module";
import { I18nModule } from "../../i18n/i18n.module";

@Module({
  imports: [ConfigModule, I18nModule, AiModule, WebSocketsModule],
  controllers: [TwilioController],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
