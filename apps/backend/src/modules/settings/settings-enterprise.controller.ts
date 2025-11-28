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
  Logger,
} from "@nestjs/common";
import { SettingsEnterpriseService } from "./settings-enterprise.service";
import {
  Setting,
  SettingStatus,
  SettingCategory,
} from "../../entities/setting.entity";
import { SettingHistory } from "../../entities/setting-history.entity";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../auth/guards/permissions.guard";
import { RequirePermissions } from "../../auth/decorators/permissions.decorator";

@Controller("settings/enterprise")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettingsEnterpriseController {
  private readonly logger = new Logger(SettingsEnterpriseController.name);

  constructor(
    private readonly settingsEnterpriseService: SettingsEnterpriseService,
  ) {}

  /**
   * CREATE - Create new setting
   * POST /api/settings/enterprise
   */
  @Post()
  @RequirePermissions("settings.update")
  async create(
    @Body()
    data: {
      key: string;
      value: string;
      category: SettingCategory;
      description?: string;
      isSensitive?: boolean;
      isRequired?: boolean;
      validationRules?: any;
      changedBy?: string;
    },
  ): Promise<Setting> {
    this.logger.log(`Creating new setting: ${data.key}`);
    return this.settingsEnterpriseService.create(data);
  }

  /**
   * READ - Get all settings with pagination and filters
   * GET /api/settings/enterprise
   */
  @Get()
  @RequirePermissions("settings.read")
  async findAll(
    @Query("category") category?: SettingCategory,
    @Query("status") status?: SettingStatus,
    @Query("isSensitive") isSensitive?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ): Promise<{
    data: Setting[];
    total: number;
    page: number;
    limit: number;
  }> {
    const filters: any = {};

    if (category) filters.category = category;
    if (status) filters.status = status;
    if (isSensitive !== undefined)
      filters.isSensitive = isSensitive === "true";
    if (page) filters.page = parseInt(page);
    if (limit) filters.limit = parseInt(limit);

    return this.settingsEnterpriseService.findAll(filters);
  }

  /**
   * READ - Get setting by key
   * GET /api/settings/enterprise/:key
   */
  @Get(":key")
  @RequirePermissions("settings.read")
  async findByKey(
    @Param("key") key: string,
    @Query("unmask") unmask?: string,
  ): Promise<Setting> {
    const shouldUnmask = unmask === "true";
    return this.settingsEnterpriseService.findByKey(key, shouldUnmask);
  }

  /**
   * READ - Get settings by category
   * GET /api/settings/enterprise/category/:category
   */
  @Get("category/:category")
  @RequirePermissions("settings.read")
  async findByCategory(
    @Param("category") category: SettingCategory,
  ): Promise<Setting[]> {
    return this.settingsEnterpriseService.findByCategory(category);
  }

  /**
   * UPDATE - Update setting
   * PUT /api/settings/enterprise/:key
   */
  @Put(":key")
  @RequirePermissions("settings.update")
  async update(
    @Param("key") key: string,
    @Body()
    data: {
      value?: string;
      description?: string;
      status?: SettingStatus;
      changedBy?: string;
      reason?: string;
    },
  ): Promise<Setting> {
    this.logger.log(`Updating setting: ${key}`);
    return this.settingsEnterpriseService.update(key, data);
  }

  /**
   * UPDATE - Activate setting
   * POST /api/settings/enterprise/:key/activate
   */
  @Post(":key/activate")
  @RequirePermissions("settings.update")
  async activate(
    @Param("key") key: string,
    @Body("changedBy") changedBy?: string,
  ): Promise<Setting> {
    this.logger.log(`Activating setting: ${key}`);
    return this.settingsEnterpriseService.activate(key, changedBy);
  }

  /**
   * UPDATE - Archive setting
   * POST /api/settings/enterprise/:key/archive
   */
  @Post(":key/archive")
  @RequirePermissions("settings.update")
  async archive(
    @Param("key") key: string,
    @Body("changedBy") changedBy?: string,
    @Body("reason") reason?: string,
  ): Promise<Setting> {
    this.logger.log(`Archiving setting: ${key}`);
    return this.settingsEnterpriseService.archive(key, changedBy, reason);
  }

  /**
   * AGGREGATION - Get setting history
   * GET /api/settings/enterprise/:key/history
   */
  @Get(":key/history")
  @RequirePermissions("settings.read")
  async getHistory(
    @Param("key") key: string,
    @Query("limit") limit?: string,
  ): Promise<SettingHistory[]> {
    const historyLimit = limit ? parseInt(limit) : 20;
    return this.settingsEnterpriseService.getHistory(key, historyLimit);
  }

  /**
   * AGGREGATION - Get changes by user
   * GET /api/settings/enterprise/changes/:changedBy
   */
  @Get("changes/:changedBy")
  @RequirePermissions("settings.read")
  async getChangesByUser(
    @Param("changedBy") changedBy: string,
    @Query("limit") limit?: string,
  ): Promise<SettingHistory[]> {
    const historyLimit = limit ? parseInt(limit) : 50;
    return this.settingsEnterpriseService.getChangesByUser(
      changedBy,
      historyLimit,
    );
  }

  /**
   * AGGREGATION - Get statistics
   * GET /api/settings/enterprise/stats/summary
   */
  @Get("stats/summary")
  @RequirePermissions("settings.read")
  async getStatistics(): Promise<{
    total: number;
    active: number;
    draft: number;
    archived: number;
    sensitive: number;
    required: number;
    byCategory: Record<SettingCategory, number>;
    recentChanges: number;
  }> {
    return this.settingsEnterpriseService.getStatistics();
  }

  /**
   * BULK - Bulk update settings
   * POST /api/settings/enterprise/bulk-update
   */
  @Post("bulk-update")
  @RequirePermissions("settings.update")
  async bulkUpdate(
    @Body()
    data: {
      updates: Array<{ key: string; value: string }>;
      changedBy?: string;
    },
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    this.logger.log(`Bulk updating ${data.updates.length} settings`);
    return this.settingsEnterpriseService.bulkUpdate(
      data.updates,
      data.changedBy,
    );
  }

  /**
   * EXPORT - Export all settings
   * GET /api/settings/enterprise/export
   */
  @Get("export/all")
  @RequirePermissions("settings.read")
  async exportSettings(): Promise<Setting[]> {
    this.logger.log("Exporting all settings");
    return this.settingsEnterpriseService.exportSettings();
  }

  /**
   * DELETE - Soft delete setting
   * DELETE /api/settings/enterprise/:key
   */
  @Delete(":key")
  @RequirePermissions("settings.update")
  async remove(
    @Param("key") key: string,
    @Body("changedBy") changedBy?: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.warn(`Deleting setting: ${key}`);
    await this.settingsEnterpriseService.remove(key, changedBy);
    return {
      success: true,
      message: `Setting '${key}' deleted successfully`,
    };
  }
}
