/**
 * Audit Review Service
 * ChatBotDysa Enterprise
 *
 * Servicio avanzado de revisión de logs de auditoría con capacidades de análisis forense
 * eslint-disable rules are used for TypeORM query results with dynamic grouping
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-case-declarations */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AuditLog, AuditSeverity, AuditAction } from '../entities/audit-log.entity';

export interface AuditLogFilter {
  userId?: number;
  userEmail?: string;
  action?: AuditAction | AuditAction[];
  severity?: AuditSeverity | AuditSeverity[];
  method?: string | string[];
  endpoint?: string;
  ip?: string;
  success?: boolean;
  isCritical?: boolean;
  isSuspicious?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'severity' | 'duration';
  orderDirection?: 'ASC' | 'DESC';
}

export interface AuditStatistics {
  period: string;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  criticalEvents: number;
  suspiciousEvents: number;
  uniqueUsers: number;
  uniqueIPs: number;
  errorRate: number;
  avgDuration: number;
  topActions: Array<{ action: string; count: number }>;
  topUsers: Array<{ email: string; count: number }>;
  topIPs: Array<{ ip: string; count: number }>;
  topEndpoints: Array<{ endpoint: string; count: number }>;
  eventsByHour: Array<{ hour: number; count: number }>;
  eventsBySeverity: Array<{ severity: string; count: number }>;
}

export interface ForensicReport {
  investigationId: string;
  startDate: Date;
  endDate: Date;
  targetUser?: string;
  targetIP?: string;
  timeline: Array<{
    timestamp: Date;
    action: string;
    endpoint: string;
    severity: string;
    success: boolean;
    details: any;
  }>;
  anomalies: Array<{
    type: string;
    description: string;
    severity: string;
    timestamp: Date;
    evidence: any;
  }>;
  summary: {
    totalEvents: number;
    suspiciousEvents: number;
    criticalActions: number;
    ipAddresses: string[];
    accessedResources: string[];
  };
}

@Injectable()
export class AuditReviewService {
  private readonly logger = new Logger(AuditReviewService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>
  ) {}

  /**
   * Buscar logs de auditoría con filtros avanzados
   */
  async findAuditLogs(filter: AuditLogFilter): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    // Aplicar filtros
    if (filter.userId) {
      queryBuilder.andWhere('audit.userId = :userId', {
        userId: filter.userId,
      });
    }

    if (filter.userEmail) {
      queryBuilder.andWhere('audit.userEmail LIKE :userEmail', {
        userEmail: `%${filter.userEmail}%`,
      });
    }

    if (filter.action) {
      if (Array.isArray(filter.action)) {
        queryBuilder.andWhere('audit.action IN (:...actions)', {
          actions: filter.action,
        });
      } else {
        queryBuilder.andWhere('audit.action = :action', {
          action: filter.action,
        });
      }
    }

    if (filter.severity) {
      if (Array.isArray(filter.severity)) {
        queryBuilder.andWhere('audit.severity IN (:...severities)', {
          severities: filter.severity,
        });
      } else {
        queryBuilder.andWhere('audit.severity = :severity', {
          severity: filter.severity,
        });
      }
    }

    if (filter.method) {
      if (Array.isArray(filter.method)) {
        queryBuilder.andWhere('audit.method IN (:...methods)', {
          methods: filter.method,
        });
      } else {
        queryBuilder.andWhere('audit.method = :method', {
          method: filter.method,
        });
      }
    }

    if (filter.endpoint) {
      queryBuilder.andWhere('audit.endpoint LIKE :endpoint', {
        endpoint: `%${filter.endpoint}%`,
      });
    }

    if (filter.ip) {
      queryBuilder.andWhere('audit.ip = :ip', { ip: filter.ip });
    }

    if (filter.success !== undefined) {
      queryBuilder.andWhere('audit.success = :success', {
        success: filter.success,
      });
    }

    if (filter.isCritical !== undefined) {
      queryBuilder.andWhere('audit.isCritical = :isCritical', {
        isCritical: filter.isCritical,
      });
    }

    if (filter.isSuspicious !== undefined) {
      queryBuilder.andWhere('audit.isSuspicious = :isSuspicious', {
        isSuspicious: filter.isSuspicious,
      });
    }

    if (filter.startDate && filter.endDate) {
      queryBuilder.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filter.startDate,
        endDate: filter.endDate,
      });
    } else if (filter.startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', {
        startDate: filter.startDate,
      });
    } else if (filter.endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', {
        endDate: filter.endDate,
      });
    }

    // Ordenamiento
    const orderBy = filter.orderBy || 'createdAt';
    const orderDirection = filter.orderDirection || 'DESC';
    queryBuilder.orderBy(`audit.${orderBy}`, orderDirection);

    // Paginación
    const limit = filter.limit || 100;
    const offset = filter.offset || 0;

    // Ejecutar query
    const [logs, total] = await queryBuilder.skip(offset).take(limit).getManyAndCount();

    this.logger.log(`Audit logs queried: ${logs.length} of ${total} total results`);

    return {
      logs,
      total,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    };
  }

  /**
   * Obtener estadísticas de auditoría para un período
   */
  async getStatistics(
    period: 'today' | 'yesterday' | 'week' | 'month' | 'custom',
    customStart?: Date,
    customEnd?: Date
  ): Promise<AuditStatistics> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
        endDate = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          23,
          59,
          59
        );
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'custom':
        if (!customStart || !customEnd) {
          throw new Error('Custom period requires start and end dates');
        }
        startDate = customStart;
        endDate = customEnd;
        break;
    }

    // Total events
    const totalEvents = await this.auditLogRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    // Successful events
    const successfulEvents = await this.auditLogRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
        success: true,
      },
    });

    // Failed events
    const failedEvents = totalEvents - successfulEvents;

    // Critical events
    const criticalEvents = await this.auditLogRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
        isCritical: true,
      },
    });

    // Suspicious events
    const suspiciousEvents = await this.auditLogRepository.count({
      where: {
        createdAt: Between(startDate, endDate),
        isSuspicious: true,
      },
    });

    // Unique users
    const uniqueUsersResult = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('COUNT(DISTINCT audit.userId)', 'count')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('audit.userId IS NOT NULL')
      .getRawOne();

    const uniqueUsers = parseInt(uniqueUsersResult?.count || '0');

    // Unique IPs
    const uniqueIPsResult = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('COUNT(DISTINCT audit.ip)', 'count')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    const uniqueIPs = parseInt(uniqueIPsResult?.count || '0');

    // Average duration
    const avgDurationResult = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('AVG(audit.duration)', 'avg')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    const avgDuration = Math.round(parseFloat(avgDurationResult?.avg || '0'));

    // Top actions
    const topActions = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Top users
    const topUsers = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.userEmail', 'email')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('audit.userEmail IS NOT NULL')
      .groupBy('audit.userEmail')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Top IPs
    const topIPs = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.ip', 'ip')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('audit.ip')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Top endpoints
    const topEndpoints = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.endpoint', 'endpoint')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('audit.endpoint')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    // Events by hour
    const eventsByHour = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('EXTRACT(HOUR FROM audit.createdAt)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    // Events by severity
    const eventsBySeverity = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .where('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('audit.severity')
      .orderBy('count', 'DESC')
      .getRawMany();

    const errorRate = totalEvents > 0 ? (failedEvents / totalEvents) * 100 : 0;

    return {
      period:
        period === 'custom' ? `${startDate.toISOString()} to ${endDate.toISOString()}` : period,
      totalEvents,
      successfulEvents,
      failedEvents,
      criticalEvents,
      suspiciousEvents,
      uniqueUsers,
      uniqueIPs,
      errorRate: Math.round(errorRate * 100) / 100,
      avgDuration,
      topActions: topActions.map((a) => ({
        action: a.action,
        count: parseInt(a.count),
      })),
      topUsers: topUsers.map((u) => ({
        email: u.email || 'Anonymous',
        count: parseInt(u.count),
      })),
      topIPs: topIPs.map((i) => ({
        ip: i.ip,
        count: parseInt(i.count),
      })),
      topEndpoints: topEndpoints.map((e) => ({
        endpoint: e.endpoint,
        count: parseInt(e.count),
      })),
      eventsByHour: eventsByHour.map((e) => ({
        hour: parseInt(e.hour),
        count: parseInt(e.count),
      })),
      eventsBySeverity: eventsBySeverity.map((e) => ({
        severity: e.severity,
        count: parseInt(e.count),
      })),
    };
  }

  /**
   * Generar reporte forense para investigación
   */
  async generateForensicReport(
    targetUser?: string,
    targetIP?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ForensicReport> {
    const investigationId = `INV-${Date.now()}`;
    const start = startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate || new Date();

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    queryBuilder.where('audit.createdAt BETWEEN :start AND :end', {
      start,
      end,
    });

    if (targetUser) {
      queryBuilder.andWhere('audit.userEmail = :userEmail', {
        userEmail: targetUser,
      });
    }

    if (targetIP) {
      queryBuilder.andWhere('audit.ip = :ip', { ip: targetIP });
    }

    queryBuilder.orderBy('audit.createdAt', 'ASC');

    const events = await queryBuilder.getMany();

    // Build timeline
    const timeline = events.map((event) => ({
      timestamp: event.createdAt,
      action: event.action,
      endpoint: event.endpoint,
      severity: event.severity,
      success: event.success,
      details: {
        method: event.method,
        responseStatus: event.responseStatus,
        duration: event.duration,
        requestBody: event.requestBody,
      },
    }));

    // Detect anomalies
    const anomalies: Array<{
      type: string;
      description: string;
      severity: string;
      timestamp: Date;
      evidence: any[];
    }> = [];

    // Anomaly 1: Multiple failed logins
    const failedLogins = events.filter((e) => e.action === AuditAction.FAILED_LOGIN);
    if (failedLogins.length >= 5) {
      anomalies.push({
        type: 'MULTIPLE_FAILED_LOGINS',
        description: `${failedLogins.length} failed login attempts detected`,
        severity: 'HIGH',
        timestamp: failedLogins[failedLogins.length - 1].createdAt,
        evidence: failedLogins.slice(-5),
      });
    }

    // Anomaly 2: Critical actions
    const criticalActions = events.filter((e) => e.isCritical);
    if (criticalActions.length > 0) {
      anomalies.push({
        type: 'CRITICAL_ACTIONS',
        description: `${criticalActions.length} critical actions performed`,
        severity: 'HIGH',
        timestamp: criticalActions[0].createdAt,
        evidence: criticalActions,
      });
    }

    // Anomaly 3: Suspicious activity
    const suspiciousEvents = events.filter((e) => e.isSuspicious);
    if (suspiciousEvents.length > 0) {
      anomalies.push({
        type: 'SUSPICIOUS_ACTIVITY',
        description: `${suspiciousEvents.length} suspicious events detected`,
        severity: 'MEDIUM',
        timestamp: suspiciousEvents[0].createdAt,
        evidence: suspiciousEvents,
      });
    }

    // Anomaly 4: Unusual time access
    const nightAccess = events.filter((e) => {
      const hour = e.createdAt.getHours();
      return hour >= 0 && hour <= 5; // Between midnight and 5 AM
    });
    if (nightAccess.length >= 10) {
      anomalies.push({
        type: 'UNUSUAL_TIME_ACCESS',
        description: `${nightAccess.length} accesses during unusual hours (00:00-05:00)`,
        severity: 'MEDIUM',
        timestamp: nightAccess[0].createdAt,
        evidence: nightAccess.slice(0, 10),
      });
    }

    // Summary
    const uniqueIPs = [...new Set(events.map((e) => e.ip))];
    const accessedResources = [...new Set(events.map((e) => e.endpoint))];

    return {
      investigationId,
      startDate: start,
      endDate: end,
      targetUser,
      targetIP,
      timeline,
      anomalies,
      summary: {
        totalEvents: events.length,
        suspiciousEvents: suspiciousEvents.length,
        criticalActions: criticalActions.length,
        ipAddresses: uniqueIPs,
        accessedResources,
      },
    };
  }

  /**
   * Marcar log como revisado
   */
  async markAsReviewed(logId: number, reviewedBy: number, notes?: string): Promise<void> {
    await this.auditLogRepository.update(logId, {
      reviewed: true,
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes: notes,
    });

    this.logger.log(`Audit log ${logId} marked as reviewed by user ${reviewedBy}`);
  }

  /**
   * Obtener logs no revisados
   */
  async getUnreviewedLogs(severity?: AuditSeverity): Promise<AuditLog[]> {
    const where: any = { reviewed: false };

    if (severity) {
      where.severity = severity;
    }

    return this.auditLogRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
      take: 100,
    });
  }

  /**
   * Exportar logs a CSV para compliance
   */
  async exportToCSV(filter: AuditLogFilter): Promise<string> {
    const { logs } = await this.findAuditLogs({ ...filter, limit: 10000 });

    const headers = [
      'ID',
      'Timestamp',
      'User Email',
      'Role',
      'Action',
      'Method',
      'Endpoint',
      'IP',
      'Status',
      'Duration (ms)',
      'Success',
      'Severity',
    ];

    const rows = logs.map((log) => [
      log.id,
      log.createdAt.toISOString(),
      log.userEmail || 'Anonymous',
      log.role || 'N/A',
      log.action,
      log.method,
      log.endpoint,
      log.ip,
      log.responseStatus,
      log.duration,
      log.success ? 'Yes' : 'No',
      log.severity,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    this.logger.log(`Exported ${logs.length} audit logs to CSV`);

    return csv;
  }
}
