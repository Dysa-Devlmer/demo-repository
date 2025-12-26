import { Controller, Get, UseGuards, Query, Param, Put, Body, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequireRoles, ROLES } from '../auth/decorators/roles.decorator';
import { User } from '../auth/decorators/user.decorator';
import { AuditMiddleware, AuditEvent } from '../common/middleware/audit.middleware';
import { AuditReviewService, AuditStatistics } from '../common/services/audit-review.service';
import { AuditAction, AuditSeverity } from '../common/entities/audit-log.entity';
import { SecurityAlertsService } from './services/security-alerts.service';
import { AlertConfig, AlertPriority } from './services/security-alerts.service';
import { LogArchivingService, ArchiveConfig } from './services/log-archiving.service';
import { ComplianceReport, ComplianceReportsService } from './services/compliance-reports.service';
import type { AuditLogFilter } from '../common/services/audit-review.service';

type SecurityMetrics = {
  totalRequests: number;
  riskLevels: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  topIPs: Array<{ ip: string; count: number }>;
  averageResponseTime: number;
  securityFlags: Record<string, number>;
};

@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(ROLES.ADMIN)
export class SecurityController {
  constructor(
    private readonly auditMiddleware: AuditMiddleware,
    private readonly auditReviewService: AuditReviewService,
    private readonly securityAlertsService: SecurityAlertsService,
    private readonly logArchivingService: LogArchivingService,
    private readonly complianceReportsService: ComplianceReportsService
  ) {}

  @Get('dashboard')
  getSecurityDashboard() {
    const metrics = this.toSecurityMetrics(this.auditMiddleware.getSecurityMetrics());
    const recentEvents = this.auditMiddleware.getAuditEvents(50);

    return {
      status: 'operational',
      metrics,
      recentEvents: recentEvents.filter(
        (event) => event.riskLevel === 'HIGH' || event.riskLevel === 'CRITICAL'
      ),
      alerts: this.generateSecurityAlerts(metrics, recentEvents),
    };
  }

  @Get('events')
  getAuditEvents(@Query('limit') limit?: string, @Query('riskLevel') riskLevel?: string) {
    const events = this.auditMiddleware.getAuditEvents(toNumber(limit, 100) ?? 100);

    if (riskLevel) {
      return events.filter((event) => event.riskLevel === riskLevel);
    }

    return events;
  }

  @Get('metrics')
  getSecurityMetrics() {
    return this.toSecurityMetrics(this.auditMiddleware.getSecurityMetrics());
  }

  @Get('health')
  getSecurityHealth() {
    const metrics = this.toSecurityMetrics(this.auditMiddleware.getSecurityMetrics());
    const score = this.calculateSecurityScore(metrics);

    return {
      score,
      status: score >= 90 ? 'excellent' : score >= 70 ? 'good' : 'needs_attention',
      recommendations: this.getSecurityRecommendations(score, metrics),
    };
  }

  private generateSecurityAlerts(
    metrics: SecurityMetrics,
    events: AuditEvent[]
  ): Array<{
    type: string;
    severity: string;
    message: string;
    timestamp: string;
  }> {
    const alerts: Array<{
      type: string;
      severity: string;
      message: string;
      timestamp: string;
    }> = [];

    // Check for high-risk events in last hour
    const lastHour = Date.now() - 60 * 60 * 1000;
    const recentHighRisk = events.filter(
      (e) =>
        (e.riskLevel === 'HIGH' || e.riskLevel === 'CRITICAL') &&
        new Date(e.timestamp).getTime() > lastHour
    );

    if (recentHighRisk.length > 5) {
      alerts.push({
        type: 'HIGH_RISK_ACTIVITY',
        severity: 'CRITICAL',
        message: `${recentHighRisk.length} high-risk security events detected in the last hour`,
        timestamp: new Date().toISOString(),
      });
    }

    // Check for unusual activity patterns
    if (metrics.riskLevels.critical > 0) {
      alerts.push({
        type: 'CRITICAL_THREATS',
        severity: 'CRITICAL',
        message: `${metrics.riskLevels.critical} critical security threats detected`,
        timestamp: new Date().toISOString(),
      });
    }

    // Check for failed authentication attempts
    const authFailures = metrics.securityFlags.AUTHENTICATION_FAILURE || 0;
    if (authFailures > 10) {
      alerts.push({
        type: 'AUTH_BRUTE_FORCE',
        severity: 'HIGH',
        message: `Possible brute force attack: ${authFailures} authentication failures`,
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }

  private calculateSecurityScore(metrics: SecurityMetrics): number {
    let score = 100;

    // Deduct points for high-risk events
    score -= metrics.riskLevels.critical * 20;
    score -= metrics.riskLevels.high * 10;
    score -= metrics.riskLevels.medium * 2;

    // Deduct points for security flags
    const flagPenalties: Record<string, number> = {
      SQL_INJECTION_ATTEMPT: 15,
      XSS_ATTEMPT: 10,
      PATH_TRAVERSAL_ATTEMPT: 8,
      AUTHENTICATION_FAILURE: 2,
      RATE_LIMIT_EXCEEDED: 1,
    };

    Object.entries(metrics.securityFlags).forEach(([flag, count]) => {
      const penalty = flagPenalties[flag] ?? 1;
      score -= count * penalty;
    });

    return Math.max(0, Math.min(100, score));
  }

  private getSecurityRecommendations(score: number, metrics: SecurityMetrics): string[] {
    const recommendations: string[] = [];

    if (score < 70) {
      recommendations.push('Immediate security review required');
      recommendations.push('Consider implementing additional WAF rules');
    }

    if (metrics.riskLevels.critical > 0) {
      recommendations.push('Investigate and block sources of critical threats');
    }

    if (metrics.securityFlags.SQL_INJECTION_ATTEMPT > 0) {
      recommendations.push('Review and strengthen SQL injection protection');
    }

    if (metrics.securityFlags.AUTHENTICATION_FAILURE > 20) {
      recommendations.push('Implement stronger account lockout policies');
    }

    if (recommendations.length === 0) {
      recommendations.push('Security posture is excellent');
      recommendations.push('Continue monitoring for emerging threats');
    }

    return recommendations;
  }

  // ============================================================================
  // NEW AUDIT REVIEW ENDPOINTS
  // ============================================================================

  @Get('audit')
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('userEmail') userEmail?: string,
    @Query('action') action?: string,
    @Query('severity') severity?: string,
    @Query('method') method?: string,
    @Query('endpoint') endpoint?: string,
    @Query('ip') ip?: string,
    @Query('success') success?: string,
    @Query('isCritical') isCritical?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const filter: AuditLogFilter = {};

    const parsedUserId = toNumber(userId);
    if (parsedUserId !== undefined) filter.userId = parsedUserId;
    if (userEmail) filter.userEmail = userEmail;
    const actionValue = toAuditAction(action);
    if (actionValue) filter.action = actionValue;
    const severityValue = toAuditSeverity(severity);
    if (severityValue) filter.severity = severityValue;
    if (method) filter.method = method;
    if (endpoint) filter.endpoint = endpoint;
    if (ip) filter.ip = ip;
    const successValue = toBoolean(success);
    if (successValue !== undefined) filter.success = successValue;
    const criticalValue = toBoolean(isCritical);
    if (criticalValue !== undefined) filter.isCritical = criticalValue;
    if (startDate) filter.startDate = new Date(startDate);
    if (endDate) filter.endDate = new Date(endDate);
    const limitValue = toNumber(limit);
    if (limitValue !== undefined) filter.limit = limitValue;
    const offsetValue = toNumber(offset);
    if (offsetValue !== undefined) filter.offset = offsetValue;

    const result = await this.auditReviewService.findAuditLogs(filter);

    return {
      success: true,
      data: result.logs,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Get('audit/statistics')
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
  async getAuditStatistics(
    @Query('period') period: 'today' | 'yesterday' | 'week' | 'month' | 'custom' = 'today',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    let stats: AuditStatistics;

    if (period === 'custom' && startDate && endDate) {
      stats = await this.auditReviewService.getStatistics(
        'custom',
        new Date(startDate),
        new Date(endDate)
      );
    } else {
      stats = await this.auditReviewService.getStatistics(period);
    }

    return {
      success: true,
      data: stats,
    };
  }

  @Get('audit/unreviewed')
  @RequireRoles(ROLES.ADMIN)
  async getUnreviewedLogs(@Query('severity') severity?: string) {
    const logs = await this.auditReviewService.getUnreviewedLogs(toAuditSeverity(severity));

    return {
      success: true,
      data: logs,
      count: logs.length,
    };
  }

  @Put('audit/:id/review')
  @RequireRoles(ROLES.ADMIN)
  async markLogAsReviewed(
    @Param('id') id: string,
    @User() user: Record<string, unknown> | undefined,
    @Body('notes') notes?: string
  ) {
    const reviewerId = toNumber(user?.id) ?? 0;
    await this.auditReviewService.markAsReviewed(parseInt(id), reviewerId, notes);

    return {
      success: true,
      message: 'Audit log marked as reviewed',
    };
  }

  @Get('audit/export')
  @RequireRoles(ROLES.ADMIN)
  async exportAuditLogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('severity') severity?: string
  ) {
    const filter: AuditLogFilter = {};

    if (startDate) filter.startDate = new Date(startDate);
    if (endDate) filter.endDate = new Date(endDate);
    const exportSeverity = toAuditSeverity(severity);
    if (exportSeverity) filter.severity = exportSeverity;

    const csv = await this.auditReviewService.exportToCSV(filter);

    return {
      success: true,
      data: csv,
      contentType: 'text/csv',
    };
  }

  @Get('audit/forensic')
  @RequireRoles(ROLES.ADMIN)
  async generateForensicReport(
    @Query('targetUser') targetUser?: string,
    @Query('targetIP') targetIP?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const report = await this.auditReviewService.generateForensicReport(
      targetUser,
      targetIP,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );

    return {
      success: true,
      data: report,
    };
  }

  @Get('threats')
  @RequireRoles(ROLES.ADMIN)
  async detectThreats() {
    const threats = await this.auditReviewService.findAuditLogs({
      isSuspicious: true,
      limit: 100,
      orderBy: 'createdAt',
      orderDirection: 'DESC',
    });

    return {
      success: true,
      data: threats.logs,
      count: threats.total,
      severity: threats.total > 0 ? 'HIGH' : 'LOW',
    };
  }

  // ============================================================================
  // SECURITY ALERTS ENDPOINTS
  // ============================================================================

  @Get('alerts/config')
  @RequireRoles(ROLES.ADMIN)
  getAlertsConfig() {
    return {
      success: true,
      data: this.securityAlertsService.getConfig(),
    };
  }

  @Put('alerts/config')
  @RequireRoles(ROLES.ADMIN)
  updateAlertsConfig(@Body() config: Partial<AlertConfig>) {
    this.securityAlertsService.updateConfig(config);

    return {
      success: true,
      message: 'Alert configuration updated successfully',
      data: this.securityAlertsService.getConfig(),
    };
  }

  @Get('alerts/recent')
  @RequireRoles(ROLES.ADMIN)
  getRecentAlerts(@Query('limit') limit?: string) {
    const alerts = this.securityAlertsService.getRecentAlerts(toNumber(limit, 100) ?? 100);

    return {
      success: true,
      data: alerts,
      count: alerts.length,
    };
  }

  @Get('alerts/statistics')
  @RequireRoles(ROLES.ADMIN)
  getAlertsStatistics() {
    return {
      success: true,
      data: this.securityAlertsService.getStatistics(),
    };
  }

  @Post('alerts/test')
  @RequireRoles(ROLES.ADMIN)
  async sendTestAlert(@Body() body: { priority?: string; type?: string }) {
    const priority = toAlertPriority(body.priority) ?? AlertPriority.MEDIUM;
    const result = await this.securityAlertsService.sendAlert({
      type: body.type || 'TEST_ALERT',
      priority,
      title: 'Test Security Alert',
      description: 'This is a test alert to verify the security alert system is working correctly.',
      severity: AuditSeverity.MEDIUM,
      source: 'Security Dashboard',
      metadata: { test: true, timestamp: new Date() },
      recommendedActions: [
        'This is a test alert - no action required',
        'Verify email delivery',
        'Check alert configuration',
      ],
    });

    return {
      success: result,
      message: result ? 'Test alert sent successfully' : 'Failed to send test alert - check logs',
    };
  }

  // ============================================================================
  // LOG ARCHIVING ENDPOINTS
  // ============================================================================

  @Get('archives')
  @RequireRoles(ROLES.ADMIN)
  getArchives() {
    const archives = this.logArchivingService.getArchives();

    return {
      success: true,
      data: archives,
      count: archives.length,
    };
  }

  @Get('archives/statistics')
  @RequireRoles(ROLES.ADMIN)
  getArchiveStatistics() {
    const stats = this.logArchivingService.getArchiveStatistics();

    return {
      success: true,
      data: stats,
    };
  }

  @Get('archives/config')
  @RequireRoles(ROLES.ADMIN)
  getArchiveConfig() {
    return {
      success: true,
      data: this.logArchivingService.getConfig(),
    };
  }

  @Put('archives/config')
  @RequireRoles(ROLES.ADMIN)
  updateArchiveConfig(@Body() config: Partial<ArchiveConfig>) {
    this.logArchivingService.updateConfig(config);

    return {
      success: true,
      message: 'Archive configuration updated successfully',
      data: this.logArchivingService.getConfig(),
    };
  }

  @Post('archives/run')
  @RequireRoles(ROLES.ADMIN)
  async runArchiving() {
    const result = await this.logArchivingService.archiveOldLogs();

    return {
      success: true,
      message: `Archived ${result.archivedCount} logs, deleted ${result.deletedCount} logs, created ${result.filesCreated} files`,
      data: result,
    };
  }

  @Get('archives/:filename')
  @RequireRoles(ROLES.ADMIN)
  async restoreArchive(@Param('filename') filename: string) {
    const logs = await this.logArchivingService.restoreFromArchive(filename);

    return {
      success: true,
      data: logs,
      count: logs.length,
    };
  }

  @Get('archives/search/:term')
  @RequireRoles(ROLES.ADMIN)
  async searchArchives(
    @Param('term') term: string,
    @Query('maxResults') maxResults?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    const result = await this.logArchivingService.searchArchives(term, {
      maxResults: maxResults ? parseInt(maxResults) : undefined,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    });

    return {
      success: true,
      data: result.results,
      searchedArchives: result.searchedArchives,
      count: result.results.length,
    };
  }

  // ============================================================================
  // COMPLIANCE REPORTS ENDPOINTS
  // ============================================================================

  @Get('compliance/reports')
  @RequireRoles(ROLES.ADMIN)
  async listComplianceReports() {
    const reports = await this.complianceReportsService.getAllReports();

    return {
      success: true,
      data: reports,
      count: reports.length,
    };
  }

  @Get('compliance/reports/:filename')
  @RequireRoles(ROLES.ADMIN)
  async getComplianceReport(@Param('filename') filename: string) {
    const report = await this.complianceReportsService.getReport(filename);

    if (!report) {
      return {
        success: false,
        message: 'Report not found',
      };
    }

    return {
      success: true,
      data: report,
    };
  }

  @Post('compliance/generate/:standard')
  @RequireRoles(ROLES.ADMIN)
  async generateComplianceReport(
    @Param('standard') standard: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    // Default to last 90 days if not specified
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);

    let report: ComplianceReport;

    switch (standard.toUpperCase()) {
      case 'SOC2':
        report = await this.complianceReportsService.generateSOC2Report(start, end);
        break;
      case 'ISO27001':
        report = await this.complianceReportsService.generateISO27001Report(start, end);
        break;
      case 'GDPR':
        report = await this.complianceReportsService.generateGDPRReport(start, end);
        break;
      default:
        return {
          success: false,
          message: `Unknown compliance standard: ${standard}. Supported: SOC2, ISO27001, GDPR`,
        };
    }

    return {
      success: true,
      message: `${standard} compliance report generated successfully`,
      data: report,
    };
  }

  @Get('compliance/reports/:filename/html')
  @RequireRoles(ROLES.ADMIN)
  async getComplianceReportHTML(@Param('filename') filename: string) {
    const report = await this.complianceReportsService.getReport(filename);

    if (!report) {
      return {
        success: false,
        message: 'Report not found',
      };
    }

    const html = this.complianceReportsService.generateHTMLReport(report);

    return {
      success: true,
      data: html,
      contentType: 'text/html',
    };
  }

  private toSecurityMetrics(input: unknown): SecurityMetrics {
    const empty: SecurityMetrics = {
      totalRequests: 0,
      riskLevels: { low: 0, medium: 0, high: 0, critical: 0 },
      topIPs: [],
      averageResponseTime: 0,
      securityFlags: {},
    };

    if (!input || typeof input !== 'object') {
      return empty;
    }

    const raw = input as Partial<Record<keyof SecurityMetrics, unknown>>;
    const riskLevels = (
      raw.riskLevels && typeof raw.riskLevels === 'object' ? raw.riskLevels : {}
    ) as Record<string, unknown>;
    const flags = (
      raw.securityFlags && typeof raw.securityFlags === 'object' ? raw.securityFlags : {}
    ) as Record<string, unknown>;

    const normalizedFlags: Record<string, number> = {};
    for (const [key, value] of Object.entries(flags)) {
      normalizedFlags[key] = toNumber(value, 0) ?? 0;
    }

    return {
      totalRequests: toNumber(raw.totalRequests, 0) ?? 0,
      riskLevels: {
        low: toNumber(riskLevels.low, 0) ?? 0,
        medium: toNumber(riskLevels.medium, 0) ?? 0,
        high: toNumber(riskLevels.high, 0) ?? 0,
        critical: toNumber(riskLevels.critical, 0) ?? 0,
      },
      topIPs: Array.isArray(raw.topIPs) ? raw.topIPs.filter(isTopIpEntry) : [],
      averageResponseTime: toNumber(raw.averageResponseTime, 0) ?? 0,
      securityFlags: normalizedFlags,
    };
  }
}

function toNumber(value: unknown, fallback?: number): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function toBoolean(value: string | undefined): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function toAuditSeverity(value?: string): AuditSeverity | undefined {
  if (!value) return undefined;
  return (Object.values(AuditSeverity) as string[]).includes(value)
    ? (value as AuditSeverity)
    : undefined;
}

function toAuditAction(value?: string): AuditAction | undefined {
  if (!value) return undefined;
  return (Object.values(AuditAction) as string[]).includes(value)
    ? (value as AuditAction)
    : undefined;
}

function toAlertPriority(value?: string): AlertPriority | undefined {
  if (!value) return undefined;
  return (Object.values(AlertPriority) as string[]).includes(value)
    ? (value as AlertPriority)
    : undefined;
}

function isTopIpEntry(entry: unknown): entry is { ip: string; count: number } {
  if (!entry || typeof entry !== 'object') return false;
  const obj = entry as { ip?: unknown; count?: unknown };
  return typeof obj.ip === 'string' && typeof obj.count === 'number';
}
