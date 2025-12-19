import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Setting, SettingStatus, SettingCategory } from '../../entities/setting.entity';
import { SettingHistory, SettingChangeAction } from '../../entities/setting-history.entity';

@Injectable()
export class SettingsEnterpriseService {
  private readonly logger = new Logger(SettingsEnterpriseService.name);

  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepo: Repository<Setting>,
    @InjectRepository(SettingHistory)
    private readonly historyRepo: Repository<SettingHistory>
  ) {}

  /**
   * CREATE - Create new setting
   */
  async create(data: {
    key: string;
    value: string;
    category: SettingCategory;
    description?: string;
    isSensitive?: boolean;
    isRequired?: boolean;
    validationRules?: any;
    changedBy?: string;
  }): Promise<Setting> {
    // Check if key already exists
    const existing = await this.settingsRepo.findOne({
      where: { key: data.key },
    });

    if (existing) {
      throw new BadRequestException(`Setting with key '${data.key}' already exists`);
    }

    const setting = this.settingsRepo.create({
      key: data.key,
      value: data.value,
      category: data.category,
      description: data.description,
      status: SettingStatus.ACTIVE,
      is_sensitive: data.isSensitive || false,
      is_required: data.isRequired || false,
      validation_rules: data.validationRules,
      metadata: {
        changed_by: data.changedBy || 'system',
        environment: process.env.NODE_ENV as any,
      },
    });

    const saved = await this.settingsRepo.save(setting);

    // Create history record
    await this.createHistoryRecord({
      setting_id: saved.id,
      action: SettingChangeAction.CREATED,
      new_value: data.isSensitive ? '[REDACTED]' : data.value,
      changed_by: data.changedBy || 'system',
      reason: 'Initial creation',
    });

    this.logger.log(`Setting '${data.key}' created by ${data.changedBy || 'system'}`);

    return saved;
  }

  /**
   * READ - Get all settings with pagination and filtering
   */
  async findAll(filters?: {
    category?: SettingCategory;
    status?: SettingStatus;
    isSensitive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Setting[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 100;
    const skip = (page - 1) * limit;

    const queryBuilder = this.settingsRepo
      .createQueryBuilder('setting')
      .orderBy('setting.category', 'ASC')
      .addOrderBy('setting.key', 'ASC');

    if (filters?.category) {
      queryBuilder.andWhere('setting.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('setting.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.isSensitive !== undefined) {
      queryBuilder.andWhere('setting.is_sensitive = :isSensitive', {
        isSensitive: filters.isSensitive,
      });
    }

    const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    // Mask sensitive values
    const maskedData = data.map((setting) => ({
      ...setting,
      value: setting.is_sensitive ? this.maskValue(setting.value) : setting.value,
    }));

    return {
      data: maskedData,
      total,
      page,
      limit,
    };
  }

  /**
   * READ - Get setting by key
   */
  async findByKey(key: string, unmask: boolean = false): Promise<Setting> {
    const setting = await this.settingsRepo.findOne({ where: { key } });

    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }

    if (setting.is_sensitive && !unmask) {
      return {
        ...setting,
        value: this.maskValue(setting.value),
      };
    }

    return setting;
  }

  /**
   * READ - Get settings by category
   */
  async findByCategory(category: SettingCategory): Promise<Setting[]> {
    const settings = await this.settingsRepo.find({
      where: { category, status: SettingStatus.ACTIVE },
    });

    return settings.map((setting) => ({
      ...setting,
      value: setting.is_sensitive ? this.maskValue(setting.value) : setting.value,
    }));
  }

  /**
   * UPDATE - Update setting value
   */
  async update(
    key: string,
    data: {
      value?: string;
      description?: string;
      status?: SettingStatus;
      changedBy?: string;
      reason?: string;
    }
  ): Promise<Setting> {
    const setting = await this.settingsRepo.findOne({ where: { key } });

    if (!setting) {
      throw new NotFoundException(`Setting with key '${key}' not found`);
    }

    const oldValue = setting.value;
    const changes: string[] = [];

    if (data.value !== undefined && data.value !== setting.value) {
      // Validate if has rules
      if (setting.validation_rules) {
        this.validateValue(data.value, setting.validation_rules);
      }

      setting.value = data.value;
      changes.push(`value: ${oldValue} → ${data.value}`);

      // Create history record for value change
      await this.createHistoryRecord({
        setting_id: setting.id,
        action: SettingChangeAction.UPDATED,
        old_value: setting.is_sensitive ? '[REDACTED]' : oldValue,
        new_value: setting.is_sensitive ? '[REDACTED]' : data.value,
        changed_by: data.changedBy || 'system',
        reason: data.reason || 'Value updated',
      });
    }

    if (data.description !== undefined) {
      setting.description = data.description;
      changes.push('description updated');
    }

    if (data.status !== undefined && data.status !== setting.status) {
      const oldStatus = setting.status;
      setting.status = data.status;
      changes.push(`status: ${oldStatus} → ${data.status}`);

      // Create history record for status change
      const action =
        data.status === SettingStatus.ACTIVE
          ? SettingChangeAction.ACTIVATED
          : data.status === SettingStatus.ARCHIVED
            ? SettingChangeAction.ARCHIVED
            : SettingChangeAction.UPDATED;

      await this.createHistoryRecord({
        setting_id: setting.id,
        action,
        old_value: oldStatus,
        new_value: data.status,
        changed_by: data.changedBy || 'system',
        reason: data.reason || `Status changed to ${data.status}`,
      });
    }

    if (changes.length > 0) {
      setting.metadata = {
        ...setting.metadata,
        changed_by: data.changedBy || 'system',
        previous_value: oldValue,
      };

      const updated = await this.settingsRepo.save(setting);

      this.logger.log(
        `Setting '${key}' updated by ${data.changedBy || 'system'}: ${changes.join(', ')}`
      );

      return updated;
    }

    return setting;
  }

  /**
   * UPDATE - Activate setting
   */
  async activate(key: string, changedBy?: string): Promise<Setting> {
    return this.update(key, {
      status: SettingStatus.ACTIVE,
      changedBy,
      reason: 'Setting activated',
    });
  }

  /**
   * UPDATE - Archive setting
   */
  async archive(key: string, changedBy?: string, reason?: string): Promise<Setting> {
    return this.update(key, {
      status: SettingStatus.ARCHIVED,
      changedBy,
      reason: reason || 'Setting archived',
    });
  }

  /**
   * DELETE - Soft delete (archive)
   */
  async remove(key: string, changedBy?: string): Promise<void> {
    const setting = await this.findByKey(key, true);

    await this.createHistoryRecord({
      setting_id: setting.id,
      action: SettingChangeAction.DELETED,
      old_value: setting.is_sensitive ? '[REDACTED]' : setting.value,
      changed_by: changedBy || 'system',
      reason: 'Setting deleted',
    });

    await this.settingsRepo.remove(setting);

    this.logger.warn(`Setting '${key}' deleted by ${changedBy || 'system'}`);
  }

  /**
   * AGGREGATION - Get setting history
   */
  async getHistory(key: string, limit: number = 20): Promise<SettingHistory[]> {
    const setting = await this.findByKey(key, true);

    return this.historyRepo.find({
      where: { setting_id: setting.id },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * AGGREGATION - Get all changes by user
   */
  async getChangesByUser(changedBy: string, limit: number = 50): Promise<SettingHistory[]> {
    return this.historyRepo.find({
      where: { changed_by: changedBy },
      relations: ['setting'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * AGGREGATION - Get statistics
   */
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
    const [total, active, draft, archived, sensitive, required] = await Promise.all([
      this.settingsRepo.count(),
      this.settingsRepo.count({ where: { status: SettingStatus.ACTIVE } }),
      this.settingsRepo.count({ where: { status: SettingStatus.DRAFT } }),
      this.settingsRepo.count({ where: { status: SettingStatus.ARCHIVED } }),
      this.settingsRepo.count({ where: { is_sensitive: true } }),
      this.settingsRepo.count({ where: { is_required: true } }),
    ]);

    // Count by category
    const byCategory = {} as Record<SettingCategory, number>;
    for (const category of Object.values(SettingCategory)) {
      byCategory[category] = await this.settingsRepo.count({
        where: { category },
      });
    }

    // Recent changes (last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const recentChanges = await this.historyRepo.count({
      where: {
        created_at: MoreThan(yesterday) as any,
      },
    });

    return {
      total,
      active,
      draft,
      archived,
      sensitive,
      required,
      byCategory,
      recentChanges,
    };
  }

  /**
   * Bulk update settings
   */
  async bulkUpdate(
    updates: Array<{ key: string; value: string }>,
    changedBy?: string
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const update of updates) {
      try {
        await this.update(update.key, {
          value: update.value,
          changedBy,
          reason: 'Bulk update',
        });
        success++;
      } catch (error) {
        failed++;
        errors.push(`${update.key}: ${error.message}`);
      }
    }

    this.logger.log(`Bulk update completed: ${success} success, ${failed} failed`);

    return { success, failed, errors };
  }

  /**
   * Export all settings (for backup)
   */
  async exportSettings(): Promise<Setting[]> {
    const settings = await this.settingsRepo.find({
      where: { status: SettingStatus.ACTIVE },
    });

    // Mask sensitive values
    return settings.map((setting) => ({
      ...setting,
      value: setting.is_sensitive ? '[REDACTED]' : setting.value,
    }));
  }

  /**
   * Helper: Create history record
   */
  private async createHistoryRecord(data: {
    setting_id: number;
    action: SettingChangeAction;
    old_value?: string;
    new_value?: string;
    changed_by?: string;
    reason?: string;
  }): Promise<SettingHistory> {
    const history = this.historyRepo.create(data);
    return this.historyRepo.save(history);
  }

  /**
   * Helper: Mask sensitive value
   */
  private maskValue(value: string): string {
    if (!value || value.length < 8) {
      return '****';
    }
    return value.substring(0, 4) + '****' + value.substring(value.length - 4);
  }

  /**
   * Helper: Validate value against rules
   */
  private validateValue(value: string, rules: any): void {
    if (rules.type === 'email' && !this.isValidEmail(value)) {
      throw new BadRequestException('Invalid email format');
    }

    if (rules.type === 'url' && !this.isValidUrl(value)) {
      throw new BadRequestException('Invalid URL format');
    }

    if (rules.min && value.length < rules.min) {
      throw new BadRequestException(`Value must be at least ${rules.min} characters`);
    }

    if (rules.max && value.length > rules.max) {
      throw new BadRequestException(`Value must be at most ${rules.max} characters`);
    }

    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      throw new BadRequestException(`Value does not match required pattern`);
    }

    if (rules.options && !rules.options.includes(value)) {
      throw new BadRequestException(`Value must be one of: ${rules.options.join(', ')}`);
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
