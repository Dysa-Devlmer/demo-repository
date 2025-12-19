import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuditLog } from '../../common/entities/audit-log.entity';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as zlib from 'zlib';
import { promisify } from 'util';

const gzip = promisify(zlib.gzip);
const gunzip = promisify(zlib.gunzip);

export interface ArchiveConfig {
  enabled: boolean;
  retentionDays: number;
  archivePath: string;
  compressionEnabled: boolean;
  batchSize: number;
  deleteAfterArchive: boolean;
}

export interface ArchiveMetadata {
  filename: string;
  createdAt: Date;
  recordCount: number;
  fileSize: number;
  compressed: boolean;
  dateRange: {
    from: Date;
    to: Date;
  };
}

@Injectable()
export class LogArchivingService {
  private readonly logger = new Logger(LogArchivingService.name);

  private config: ArchiveConfig = {
    enabled: true,
    retentionDays: 90, // Archive logs older than 90 days
    archivePath: path.join(process.cwd(), 'storage', 'audit-archives'),
    compressionEnabled: true,
    batchSize: 10000,
    deleteAfterArchive: true,
  };

  private archiveIndex: Map<string, ArchiveMetadata> = new Map();
  private isArchiving: boolean = false;

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>
  ) {
    this.initializeArchiveDirectory();
    this.loadArchiveIndex();
  }

  /**
   * Initialize archive directory structure
   */
  private async initializeArchiveDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.config.archivePath, { recursive: true });
      await fs.mkdir(path.join(this.config.archivePath, 'metadata'), { recursive: true });
      this.logger.log(`Archive directory initialized: ${this.config.archivePath}`);
    } catch (error) {
      this.logger.error('Failed to initialize archive directory:', error.message);
    }
  }

  /**
   * Load archive index from metadata files
   */
  private async loadArchiveIndex(): Promise<void> {
    try {
      const metadataPath = path.join(this.config.archivePath, 'metadata');
      const files = await fs.readdir(metadataPath);

      for (const file of files) {
        if (file.endsWith('.meta.json')) {
          const content = await fs.readFile(path.join(metadataPath, file), 'utf-8');
          const metadata: ArchiveMetadata = JSON.parse(content);
          this.archiveIndex.set(metadata.filename, metadata);
        }
      }

      this.logger.log(`Loaded ${this.archiveIndex.size} archive metadata entries`);
    } catch (error) {
      this.logger.warn('Failed to load archive index:', error.message);
    }
  }

  /**
   * Automatic archiving job - runs daily at 2 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async automaticArchive(): Promise<void> {
    if (!this.config.enabled) {
      this.logger.debug('Automatic archiving is disabled');
      return;
    }

    if (this.isArchiving) {
      this.logger.warn('Archiving already in progress, skipping');
      return;
    }

    try {
      this.isArchiving = true;
      this.logger.log('Starting automatic log archiving...');

      const result = await this.archiveOldLogs();

      this.logger.log(
        `Automatic archiving completed: ${result.archivedCount} logs archived, ` +
          `${result.deletedCount} logs deleted, ${result.filesCreated} files created`
      );
    } catch (error) {
      this.logger.error('Automatic archiving failed:', error.message);
    } finally {
      this.isArchiving = false;
    }
  }

  /**
   * Archive logs older than retention period
   */
  async archiveOldLogs(): Promise<{
    archivedCount: number;
    deletedCount: number;
    filesCreated: number;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);

    this.logger.log(`Archiving logs older than ${cutoffDate.toISOString()}`);

    let totalArchived = 0;
    let totalDeleted = 0;
    let filesCreated = 0;
    let hasMore = true;

    while (hasMore) {
      // Fetch batch of old logs
      const oldLogs = await this.auditLogRepository.find({
        where: {
          createdAt: LessThan(cutoffDate),
        },
        take: this.config.batchSize,
        order: {
          createdAt: 'ASC',
        },
      });

      if (oldLogs.length === 0) {
        hasMore = false;
        break;
      }

      // Create archive file for this batch
      const archiveFile = await this.createArchiveFile(oldLogs);
      filesCreated++;
      totalArchived += oldLogs.length;

      // Delete archived logs if configured
      if (this.config.deleteAfterArchive) {
        const logIds = oldLogs.map((log) => log.id);
        await this.auditLogRepository.delete(logIds);
        totalDeleted += oldLogs.length;
      }

      this.logger.log(`Archived batch: ${oldLogs.length} logs to ${archiveFile}`);

      // Continue if batch was full (might be more logs)
      hasMore = oldLogs.length === this.config.batchSize;
    }

    return {
      archivedCount: totalArchived,
      deletedCount: totalDeleted,
      filesCreated,
    };
  }

  /**
   * Create archive file from logs
   */
  private async createArchiveFile(logs: AuditLog[]): Promise<string> {
    if (logs.length === 0) {
      throw new Error('Cannot create archive from empty log array');
    }

    const dateRange = {
      from: logs[0].createdAt,
      to: logs[logs.length - 1].createdAt,
    };

    // Generate filename
    const filename = `audit_logs_${this.formatDateForFilename(dateRange.from)}_to_${this.formatDateForFilename(dateRange.to)}.json`;
    const filepath = path.join(this.config.archivePath, filename);

    // Convert logs to JSON
    const jsonData = JSON.stringify(logs, null, 2);
    let finalData: Buffer = Buffer.from(jsonData);
    let actualFilename = filename;

    // Compress if enabled
    if (this.config.compressionEnabled) {
      finalData = Buffer.from(await gzip(finalData));
      actualFilename = `${filename}.gz`;
    }

    // Write to file
    await fs.writeFile(path.join(this.config.archivePath, actualFilename), finalData);

    // Create metadata
    const metadata: ArchiveMetadata = {
      filename: actualFilename,
      createdAt: new Date(),
      recordCount: logs.length,
      fileSize: finalData.length,
      compressed: this.config.compressionEnabled,
      dateRange,
    };

    // Save metadata
    await this.saveArchiveMetadata(metadata);

    // Update index
    this.archiveIndex.set(actualFilename, metadata);

    return actualFilename;
  }

  /**
   * Save archive metadata to file
   */
  private async saveArchiveMetadata(metadata: ArchiveMetadata): Promise<void> {
    const metadataFile = `${metadata.filename}.meta.json`;
    const metadataPath = path.join(this.config.archivePath, 'metadata', metadataFile);

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  /**
   * Restore logs from archive file
   */
  async restoreFromArchive(filename: string): Promise<AuditLog[]> {
    const filepath = path.join(this.config.archivePath, filename);
    const metadata = this.archiveIndex.get(filename);

    if (!metadata) {
      throw new Error(`Archive metadata not found for ${filename}`);
    }

    try {
      // Read file
      let fileData = await fs.readFile(filepath);

      // Decompress if needed
      if (metadata.compressed) {
        fileData = await gunzip(fileData);
      }

      // Parse JSON
      const logs: AuditLog[] = JSON.parse(fileData.toString());

      this.logger.log(`Restored ${logs.length} logs from ${filename}`);

      return logs;
    } catch (error) {
      this.logger.error(`Failed to restore from archive ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all archive files
   */
  async getArchives(): Promise<ArchiveMetadata[]> {
    return Array.from(this.archiveIndex.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get archive statistics
   */
  async getArchiveStatistics(): Promise<{
    totalArchives: number;
    totalRecords: number;
    totalSize: number;
    oldestArchive: Date | null;
    newestArchive: Date | null;
    compressionRatio: number;
  }> {
    const archives = Array.from(this.archiveIndex.values());

    const totalRecords = archives.reduce((sum, a) => sum + a.recordCount, 0);
    const totalSize = archives.reduce((sum, a) => sum + a.fileSize, 0);

    const oldestArchive =
      archives.length > 0
        ? archives.reduce(
            (oldest, a) => (a.createdAt < oldest ? a.createdAt : oldest),
            archives[0].createdAt
          )
        : null;

    const newestArchive =
      archives.length > 0
        ? archives.reduce(
            (newest, a) => (a.createdAt > newest ? a.createdAt : newest),
            archives[0].createdAt
          )
        : null;

    // Estimate compression ratio (actual size vs estimated uncompressed)
    const estimatedUncompressed = totalRecords * 1000; // ~1KB per log estimate
    const compressionRatio = estimatedUncompressed > 0 ? totalSize / estimatedUncompressed : 0;

    return {
      totalArchives: archives.length,
      totalRecords,
      totalSize,
      oldestArchive,
      newestArchive,
      compressionRatio,
    };
  }

  /**
   * Delete archive file
   */
  async deleteArchive(filename: string): Promise<void> {
    const filepath = path.join(this.config.archivePath, filename);
    const metadataFile = `${filename}.meta.json`;
    const metadataPath = path.join(this.config.archivePath, 'metadata', metadataFile);

    try {
      // Delete archive file
      await fs.unlink(filepath);

      // Delete metadata file
      await fs.unlink(metadataPath);

      // Remove from index
      this.archiveIndex.delete(filename);

      this.logger.log(`Deleted archive: ${filename}`);
    } catch (error) {
      this.logger.error(`Failed to delete archive ${filename}:`, error.message);
      throw error;
    }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<ArchiveConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.log('Archive configuration updated:', updates);
  }

  /**
   * Get current configuration
   */
  getConfig(): ArchiveConfig {
    return { ...this.config };
  }

  /**
   * Format date for filename
   */
  private formatDateForFilename(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  /**
   * Clean up old archives (older than 1 year)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanupOldArchives(): Promise<void> {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const archives = Array.from(this.archiveIndex.values());
    let deletedCount = 0;

    for (const archive of archives) {
      if (archive.createdAt < oneYearAgo) {
        try {
          await this.deleteArchive(archive.filename);
          deletedCount++;
        } catch (error) {
          this.logger.error(`Failed to delete old archive ${archive.filename}:`, error.message);
        }
      }
    }

    if (deletedCount > 0) {
      this.logger.log(`Cleaned up ${deletedCount} old archives (older than 1 year)`);
    }
  }

  /**
   * Search in archived logs
   */
  async searchArchives(
    searchTerm: string,
    options?: {
      maxResults?: number;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<{
    results: Array<{ log: AuditLog; archiveFile: string }>;
    searchedArchives: number;
  }> {
    const maxResults = options?.maxResults || 100;
    const results: Array<{ log: AuditLog; archiveFile: string }> = [];
    let searchedArchives = 0;

    // Filter archives by date range if specified
    let archives = Array.from(this.archiveIndex.values());
    if (options?.dateFrom || options?.dateTo) {
      archives = archives.filter((a) => {
        if (options.dateFrom && a.dateRange.to < options.dateFrom) return false;
        if (options.dateTo && a.dateRange.from > options.dateTo) return false;
        return true;
      });
    }

    // Search in each archive
    for (const archive of archives) {
      if (results.length >= maxResults) break;

      try {
        const logs = await this.restoreFromArchive(archive.filename);
        searchedArchives++;

        for (const log of logs) {
          if (results.length >= maxResults) break;

          // Search in relevant fields
          const searchableText = JSON.stringify({
            action: log.action,
            userEmail: log.userEmail,
            endpoint: log.endpoint,
            ip: log.ip,
            metadata: log.metadata,
          }).toLowerCase();

          if (searchableText.includes(searchTerm.toLowerCase())) {
            results.push({
              log,
              archiveFile: archive.filename,
            });
          }
        }
      } catch (error) {
        this.logger.error(`Error searching archive ${archive.filename}:`, error.message);
      }
    }

    return {
      results,
      searchedArchives,
    };
  }
}
