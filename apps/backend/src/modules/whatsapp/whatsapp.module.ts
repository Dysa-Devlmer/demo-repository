import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { WhatsAppService } from "./whatsapp.service";
import { WhatsAppController } from "./whatsapp.controller";
import { BusinessHoursService } from "./business-hours.service";
import { AiModule } from "../ai/ai.module";
import { WebSocketsModule } from "../websockets/websockets.module";
import { I18nModule } from "../../i18n/i18n.module";
import { MenuModule } from "../../menu/menu.module";
import { CategoriesModule } from "../../categories/categories.module";
import { ReservationsModule } from "../../reservations/reservations.module";
import { OrdersModule } from "../../orders/orders.module";
import { ConversationsModule } from "../../conversations/conversations.module";
import { CustomersModule } from "../../customers/customers.module";

@Module({
  imports: [
    ConfigModule,
    I18nModule,
    AiModule,
    WebSocketsModule,
    MenuModule,
    CategoriesModule,
    ReservationsModule,
    OrdersModule,
    ConversationsModule,
    CustomersModule,
  ],
  controllers: [WhatsAppController],
  providers: [WhatsAppService, BusinessHoursService],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
