import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

export interface StoredFile {
  filename: string;
  path: string;
  url: string;
  size: number;
}

@Injectable()
export class ReportStorageService {
  private readonly logger = new Logger(ReportStorageService.name);
  private readonly storageDir: string;
  private readonly baseUrl: string;

  constructor(private readonly config: ConfigService) {
    // Storage directory
    this.storageDir = this.config.get<string>(
      'REPORTS_STORAGE_DIR',
      path.join(process.cwd(), 'storage', 'reports'),
    );

    // Base URL for accessing files
    this.baseUrl = this.config.get<string>(
      'REPORTS_BASE_URL',
      'http://localhost:8005/api/reports/files',
    );

    // Ensure storage directory exists
    this.ensureStorageDir();
  }

  /**
   * Ensure storage directory exists
   */
  private async ensureStorageDir(): Promise<void> {
    try {
      if (!fs.existsSync(this.storageDir)) {
        await mkdir(this.storageDir, { recursive: true });
        this.logger.log(`Created storage directory: ${this.storageDir}`);
      }
    } catch (error) {
      this.logger.error('Failed to create storage directory', error);
    }
  }

  /**
   * Store report file
   */
  async storeReport(
    reportId: number,
    format: string,
    buffer: Buffer,
  ): Promise<StoredFile> {
    const timestamp = Date.now();
    const filename = `report_${reportId}_${timestamp}.${format}`;
    const filePath = path.join(this.storageDir, filename);

    try {
      await writeFile(filePath, buffer);

      const stats = fs.statSync(filePath);

      this.logger.log(
        `Stored report file: ${filename} (${stats.size} bytes)`,
      );

      return {
        filename,
        path: filePath,
        url: `${this.baseUrl}/${filename}`,
        size: stats.size,
      };
    } catch (error) {
      this.logger.error(`Failed to store report file: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Retrieve report file
   */
  async retrieveReport(filename: string): Promise<Buffer> {
    const filePath = path.join(this.storageDir, filename);

    try {
      const buffer = await readFile(filePath);
      this.logger.log(`Retrieved report file: ${filename}`);
      return buffer;
    } catch (error) {
      this.logger.error(`Failed to retrieve report file: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Delete report file
   */
  async deleteReport(filename: string): Promise<void> {
    const filePath = path.join(this.storageDir, filename);

    try {
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
        this.logger.log(`Deleted report file: ${filename}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete report file: ${filename}`, error);
      throw error;
    }
  }

  /**
   * Check if file exists
   */
  fileExists(filename: string): boolean {
    const filePath = path.join(this.storageDir, filename);
    return fs.existsSync(filePath);
  }

  /**
   * Get file info
   */
  getFileInfo(filename: string): { size: number; created: Date } | null {
    const filePath = path.join(this.storageDir, filename);

    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        return {
          size: stats.size,
          created: stats.birthtime,
        };
      }
      return null;
    } catch (error) {
      this.logger.error(`Failed to get file info: ${filename}`, error);
      return null;
    }
  }

  /**
   * Clean up old files (older than N days)
   */
  async cleanupOldFiles(daysOld: number = 30): Promise<number> {
    try {
      const files = fs.readdirSync(this.storageDir);
      const now = Date.now();
      const maxAge = daysOld * 24 * 60 * 60 * 1000;
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.storageDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.birthtimeMs;

        if (age > maxAge) {
          await unlink(filePath);
          deletedCount++;
          this.logger.log(`Cleaned up old file: ${file}`);
        }
      }

      this.logger.log(
        `Cleanup completed: ${deletedCount} files deleted (older than ${daysOld} days)`,
      );
      return deletedCount;
    } catch (error) {
      this.logger.error('Failed to cleanup old files', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): {
    totalFiles: number;
    totalSize: number;
    directory: string;
  } {
    try {
      const files = fs.readdirSync(this.storageDir);
      let totalSize = 0;

      files.forEach((file) => {
        const filePath = path.join(this.storageDir, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      });

      return {
        totalFiles: files.length,
        totalSize,
        directory: this.storageDir,
      };
    } catch (error) {
      this.logger.error('Failed to get storage stats', error);
      return {
        totalFiles: 0,
        totalSize: 0,
        directory: this.storageDir,
      };
    }
  }
}
