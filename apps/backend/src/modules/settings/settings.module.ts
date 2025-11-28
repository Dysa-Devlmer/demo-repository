import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";
import { SettingsEnterpriseService } from "./settings-enterprise.service";
import { SettingsEnterpriseController } from "./settings-enterprise.controller";
import { WhatsAppModule } from "../whatsapp/whatsapp.module";
import { Setting } from "../../entities/setting.entity";
import { SettingHistory } from "../../entities/setting-history.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Setting, SettingHistory]),
    WhatsAppModule,
  ],
  controllers: [SettingsController, SettingsEnterpriseController],
  providers: [SettingsService, SettingsEnterpriseService],
  exports: [SettingsService, SettingsEnterpriseService],
})
export class SettingsModule {}
