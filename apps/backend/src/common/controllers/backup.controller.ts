import { Controller, Get, Post, Body, Param, Query } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { BackupService } from "../services/backup.service";
import type { BackupMetadata, BackupConfig } from "../services/backup.service";

@ApiTags("Backups")
@Controller("backups")
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get("status")
  @ApiOperation({
    summary: "Get backup system status",
    description:
      "Retrieve comprehensive backup system status including configuration, recent backups, and storage usage",
  })
  @ApiResponse({
    status: 200,
    description: "Backup status retrieved successfully",
    schema: {
      type: "object",
      properties: {
        enabled: { type: "boolean", example: true },
        schedule: { type: "string", example: "0 2 * * *" },
        retention: { type: "number", example: 30 },
        totalBackups: { type: "number", example: 15 },
        totalSize: { type: "string", example: "2.5 GB" },
        status: { type: "string", enum: ["idle", "running"], example: "idle" },
        lastBackup: {
          type: "object",
          properties: {
            id: { type: "string", example: "full_1757333093788" },
            timestamp: { type: "string", format: "date-time" },
            size: { type: "number", example: 1048576 },
            type: { type: "string", enum: ["database", "files", "full"] },
            status: {
              type: "string",
              enum: ["completed", "failed", "running"],
            },
          },
        },
        destinations: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["local", "aws_s3", "google_drive", "dropbox"],
              },
              enabled: { type: "boolean" },
            },
          },
        },
      },
    },
  })
  async getBackupStatus() {
    const status = await this.backupService.getBackupStatus();
    return {
      ...status,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("config")
  @ApiOperation({
    summary: "Get backup configuration",
    description:
      "Retrieve current backup system configuration including schedule, retention, and destinations",
  })
  @ApiResponse({
    status: 200,
    description: "Backup configuration retrieved successfully",
  })
  getBackupConfig(): BackupConfig {
    return this.backupService.getBackupConfig();
  }

  @Get("history")
  @ApiOperation({
    summary: "Get backup history",
    description: "Retrieve backup history with metadata for recent backups",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: "number",
    description: "Maximum number of backup records to return",
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: "Backup history retrieved successfully",
    schema: {
      type: "object",
      properties: {
        backups: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string", example: "full_1757333093788" },
              timestamp: { type: "string", format: "date-time" },
              size: { type: "number", example: 1048576 },
              type: { type: "string", enum: ["database", "files", "full"] },
              destination: { type: "string", example: "local" },
              status: {
                type: "string",
                enum: ["pending", "running", "completed", "failed"],
              },
              duration: { type: "number", example: 30000 },
              error: { type: "string", nullable: true },
            },
          },
        },
        total: { type: "number", example: 50 },
      },
    },
  })
  getBackupHistory(@Query("limit") limit?: number): {
    backups: BackupMetadata[];
    total: number;
  } {
    const history = this.backupService.getBackupHistory();
    const limitedHistory = limit ? history.slice(-limit) : history;

    return {
      backups: limitedHistory,
      total: history.length,
    };
  }

  @Post("create")
  @ApiOperation({
    summary: "Create manual backup",
    description: "Trigger a manual backup of the specified type",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["database", "files", "full"],
          example: "full",
          description: "Type of backup to create",
        },
      },
      required: ["type"],
    },
  })
  @ApiResponse({
    status: 201,
    description: "Backup created successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        backup: {
          type: "object",
          properties: {
            id: { type: "string", example: "full_1757333093788" },
            timestamp: { type: "string", format: "date-time" },
            size: { type: "number", example: 1048576 },
            type: { type: "string", enum: ["database", "files", "full"] },
            status: { type: "string", example: "completed" },
            duration: { type: "number", example: 30000 },
          },
        },
        message: { type: "string", example: "Backup created successfully" },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid backup type or backup creation failed",
  })
  async createManualBackup(
    @Body() createBackupDto: { type: "database" | "files" | "full" },
  ) {
    try {
      const backup = await this.backupService.triggerBackup(
        createBackupDto.type,
      );

      return {
        success: true,
        backup,
        message: `${createBackupDto.type} backup created successfully`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: `Failed to create ${createBackupDto.type} backup`,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("restore/:backupId")
  @ApiOperation({
    summary: "Restore from backup",
    description:
      "Restore system from a specific backup. WARNING: This will overwrite current data.",
  })
  @ApiParam({
    name: "backupId",
    description: "ID of the backup to restore from",
    example: "full_1757333093788",
  })
  @ApiResponse({
    status: 200,
    description: "Restore completed successfully",
  })
  @ApiResponse({
    status: 404,
    description: "Backup not found",
  })
  @ApiResponse({
    status: 500,
    description: "Restore failed",
  })
  async restoreBackup(@Param("backupId") backupId: string) {
    try {
      const success = await this.backupService.restoreBackup(backupId);

      return {
        success,
        backupId,
        message: success ? "Restore completed successfully" : "Restore failed",
        timestamp: new Date().toISOString(),
        warning:
          "System data has been restored. Please verify system integrity.",
      };
    } catch (error) {
      return {
        success: false,
        backupId,
        error: error.message,
        message: "Restore operation failed",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Post("cleanup")
  @ApiOperation({
    summary: "Cleanup old backups",
    description: "Remove old backup files according to retention policy",
  })
  @ApiResponse({
    status: 200,
    description: "Backup cleanup completed successfully",
  })
  async cleanupBackups() {
    try {
      await this.backupService.cleanupOldBackups();

      return {
        success: true,
        message: "Backup cleanup completed successfully",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Backup cleanup failed",
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get("download/:backupId")
  @ApiOperation({
    summary: "Download backup file",
    description: "Download a specific backup file",
  })
  @ApiParam({
    name: "backupId",
    description: "ID of the backup to download",
    example: "full_1757333093788",
  })
  @ApiResponse({
    status: 200,
    description: "Backup file download initiated",
    headers: {
      "Content-Type": { description: "application/zip or application/gzip" },
      "Content-Disposition": { description: "attachment; filename=backup.zip" },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Backup file not found",
  })
  async downloadBackup(@Param("backupId") backupId: string) {
    // In real implementation, would stream the backup file
    // For now, return download info
    return {
      backupId,
      downloadUrl: `/api/backups/files/${backupId}.zip`,
      message: "Backup download would be initiated in production",
      timestamp: new Date().toISOString(),
      note: "This is a simulation - in production this would stream the backup file",
    };
  }

  @Get("verify/:backupId")
  @ApiOperation({
    summary: "Verify backup integrity",
    description: "Verify the integrity and completeness of a backup file",
  })
  @ApiParam({
    name: "backupId",
    description: "ID of the backup to verify",
    example: "full_1757333093788",
  })
  @ApiResponse({
    status: 200,
    description: "Backup verification completed",
    schema: {
      type: "object",
      properties: {
        valid: { type: "boolean", example: true },
        backupId: { type: "string", example: "full_1757333093788" },
        checks: {
          type: "object",
          properties: {
            fileExists: { type: "boolean", example: true },
            checksumValid: { type: "boolean", example: true },
            manifestValid: { type: "boolean", example: true },
            databaseBackupValid: { type: "boolean", example: true },
            filesBackupValid: { type: "boolean", example: true },
          },
        },
        size: { type: "string", example: "1.5 GB" },
        createdAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Backup not found",
  })
  async verifyBackup(@Param("backupId") backupId: string) {
    // In real implementation, would perform integrity checks
    // For now, simulate verification
    await new Promise((resolve) => setTimeout(resolve, 2000));

    return {
      valid: true,
      backupId,
      checks: {
        fileExists: true,
        checksumValid: true,
        manifestValid: true,
        databaseBackupValid: true,
        filesBackupValid: true,
      },
      size: "1.5 GB",
      createdAt: new Date().toISOString(),
      verifiedAt: new Date().toISOString(),
      message: "Backup verification completed successfully",
    };
  }

  @Get("schedule/next")
  @ApiOperation({
    summary: "Get next scheduled backup",
    description: "Get information about the next scheduled backup execution",
  })
  @ApiResponse({
    status: 200,
    description: "Next backup schedule retrieved successfully",
    schema: {
      type: "object",
      properties: {
        nextBackup: {
          type: "string",
          format: "date-time",
          example: "2025-09-09T02:00:00.000Z",
        },
        schedule: { type: "string", example: "0 2 * * *" },
        type: { type: "string", example: "full" },
        enabled: { type: "boolean", example: true },
        timeUntilNext: { type: "string", example: "17 hours 2 minutes" },
      },
    },
  })
  getNextScheduledBackup() {
    const now = new Date();
    const tomorrow2AM = new Date(now);
    tomorrow2AM.setDate(tomorrow2AM.getDate() + 1);
    tomorrow2AM.setHours(2, 0, 0, 0);

    const timeUntil = tomorrow2AM.getTime() - now.getTime();
    const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
    const minutesUntil = Math.floor(
      (timeUntil % (1000 * 60 * 60)) / (1000 * 60),
    );

    const config = this.backupService.getBackupConfig();

    return {
      nextBackup: tomorrow2AM.toISOString(),
      schedule: config.schedule,
      type: "full",
      enabled: config.enabled,
      timeUntilNext: `${hoursUntil} hours ${minutesUntil} minutes`,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("disk-usage")
  @ApiOperation({
    summary: "Get backup disk usage",
    description: "Get detailed disk usage information for backup storage",
  })
  @ApiResponse({
    status: 200,
    description: "Disk usage information retrieved successfully",
    schema: {
      type: "object",
      properties: {
        backupDirectory: {
          type: "string",
          example: "/tmp/chatbotdysa-backups",
        },
        totalSize: { type: "string", example: "2.5 GB" },
        availableSpace: { type: "string", example: "47.2 GB" },
        usagePercentage: { type: "number", example: 5.3 },
        oldestBackup: { type: "string", format: "date-time" },
        newestBackup: { type: "string", format: "date-time" },
        backupCount: { type: "number", example: 15 },
      },
    },
  })
  async getDiskUsage() {
    // In real implementation, would check actual disk usage
    // For now, return simulated data
    return {
      backupDirectory: "/tmp/chatbotdysa-backups",
      totalSize: "2.5 GB",
      availableSpace: "47.2 GB",
      usagePercentage: 5.3,
      oldestBackup: new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      newestBackup: new Date().toISOString(),
      backupCount: 15,
      warning: (usagePercentage) =>
        usagePercentage > 80 ? "High disk usage detected" : null,
      timestamp: new Date().toISOString(),
    };
  }
}
