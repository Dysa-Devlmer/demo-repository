import { Controller, Get, UseGuards, Query, Param, Put, Body, Post } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RequireRoles, ROLES } from "../auth/decorators/roles.decorator";
import { User } from "../auth/decorators/user.decorator";
import { AuditMiddleware, AuditEvent } from "../common/middleware/audit.middleware";
import { AuditReviewService } from "../common/services/audit-review.service";
import { SecurityAlertsService } from "./services/security-alerts.service";
import { LogArchivingService } from "./services/log-archiving.service";
import { ComplianceReportsService, ComplianceStandard } from "./services/compliance-reports.service";

@Controller("security")
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRoles(ROLES.ADMIN)
export class SecurityController {
  constructor(
    private readonly auditMiddleware: AuditMiddleware,
    private readonly auditReviewService: AuditReviewService,
    private readonly securityAlertsService: SecurityAlertsService,
    private readonly logArchivingService: LogArchivingService,
    private readonly complianceReportsService: ComplianceReportsService,
  ) {}

  @Get("dashboard")
  async getSecurityDashboard() {
    const metrics = this.auditMiddleware.getSecurityMetrics();
    const recentEvents = this.auditMiddleware.getAuditEvents(50);

    return {
      status: "operational",
      metrics,
      recentEvents: recentEvents.filter(event =>
        event.riskLevel === 'HIGH' || event.riskLevel === 'CRITICAL'
      ),
      alerts: this.generateSecurityAlerts(metrics, recentEvents),
    };
  }

  @Get("events")
  async getAuditEvents(
    @Query("limit") limit?: string,
    @Query("riskLevel") riskLevel?: string,
  ) {
    const events = this.auditMiddleware.getAuditEvents(
      limit ? parseInt(limit) : 100,
    );

    if (riskLevel) {
      return events.filter((event) => event.riskLevel === riskLevel);
    }

    return events;
  }

  @Get("metrics")
  async getSecurityMetrics() {
    return this.auditMiddleware.getSecurityMetrics();
  }

  @Get("health")
  async getSecurityHealth() {
    const metrics = this.auditMiddleware.getSecurityMetrics();
    const score = this.calculateSecurityScore(metrics);

    return {
      score,
      status: score >= 90 ? "excellent" : score >= 70 ? "good" : "needs_attention",
      recommendations: this.getSecurityRecommendations(score, metrics),
    };
  }

  private generateSecurityAlerts(metrics: any, events: AuditEvent[]): any[] {
    const alerts: any[] = [];

    // Check for high-risk events in last hour
    const lastHour = Date.now() - 60 * 60 * 1000;
    const recentHighRisk = events.filter(
      (e) =>
        (e.riskLevel === "HIGH" || e.riskLevel === "CRITICAL") &&
        new Date(e.timestamp).getTime() > lastHour,
    );

    if (recentHighRisk.length > 5) {
      alerts.push({
        type: "HIGH_RISK_ACTIVITY",
        severity: "CRITICAL",
        message: `${recentHighRisk.length} high-risk security events detected in the last hour`,
        timestamp: new Date().toISOString(),
      });
    }

    // Check for unusual activity patterns
    if (metrics.riskLevels.critical > 0) {
      alerts.push({
        type: "CRITICAL_THREATS",
        severity: "CRITICAL",
        message: `${metrics.riskLevels.critical} critical security threats detected`,
        timestamp: new Date().toISOString(),
      });
    }

    // Check for failed authentication attempts
    const authFailures = metrics.securityFlags.AUTHENTICATION_FAILURE || 0;
    if (authFailures > 10) {
      alerts.push({
        type: "AUTH_BRUTE_FORCE",
        severity: "HIGH",
        message: `Possible brute force attack: ${authFailures} authentication failures`,
        timestamp: new Date().toISOString(),
      });
    }

    return alerts;
  }

  private calculateSecurityScore(metrics: any): number {
    let score = 100;

    // Deduct points for high-risk events
    score -= metrics.riskLevels.critical * 20;
    score -= metrics.riskLevels.high * 10;
    score -= metrics.riskLevels.medium * 2;

    // Deduct points for security flags
    const flagPenalties = {
      SQL_INJECTION_ATTEMPT: 15,
      XSS_ATTEMPT: 10,
      PATH_TRAVERSAL_ATTEMPT: 8,
      AUTHENTICATION_FAILURE: 2,
      RATE_LIMIT_EXCEEDED: 1,
    };

    Object.entries(metrics.securityFlags).forEach(([flag, count]) => {
      const penalty = flagPenalties[flag] || 1;
      score -= (count as number) * penalty;
    });

    return Math.max(0, Math.min(100, score));
  }

  private getSecurityRecommendations(score: number, metrics: any): string[] {
    const recommendations: string[] = [];

    if (score < 70) {
      recommendations.push("Immediate security review required");
      recommendations.push("Consider implementing additional WAF rules");
    }

    if (metrics.riskLevels.critical > 0) {
      recommendations.push("Investigate and block sources of critical threats");
    }

    if (metrics.securityFlags.SQL_INJECTION_ATTEMPT > 0) {
      recommendations.push("Review and strengthen SQL injection protection");
    }

    if (metrics.securityFlags.AUTHENTICATION_FAILURE > 20) {
      recommendations.push("Implement stronger account lockout policies");
    }

    if (recommendations.length === 0) {
      recommendations.push("Security posture is excellent");
      recommendations.push("Continue monitoring for emerging threats");
    }

    return recommendations;
  }

  // ============================================================================
  // NEW AUDIT REVIEW ENDPOINTS
  // ============================================================================

  @Get("audit")
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
  async getAuditLogs(
    @Query("userId") userId?: string,
    @Query("userEmail") userEmail?: string,
    @Query("action") action?: string,
    @Query("severity") severity?: string,
    @Query("method") method?: string,
    @Query("endpoint") endpoint?: string,
    @Query("ip") ip?: string,
    @Query("success") success?: string,
    @Query("isCritical") isCritical?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    const filter: any = {};

    if (userId) filter.userId = parseInt(userId);
    if (userEmail) filter.userEmail = userEmail;
    if (action) filter.action = action;
    if (severity) filter.severity = severity;
    if (method) filter.method = method;
    if (endpoint) filter.endpoint = endpoint;
    if (ip) filter.ip = ip;
    if (success !== undefined) filter.success = success === 'true';
    if (isCritical !== undefined) filter.isCritical = isCritical === 'true';
    if (startDate) filter.startDate = new Date(startDate);
    if (endDate) filter.endDate = new Date(endDate);
    if (limit) filter.limit = parseInt(limit);
    if (offset) filter.offset = parseInt(offset);

    const result = await this.auditReviewService.findAuditLogs(filter);

    return {
      success: true,
      data: result.logs,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
    };
  }

  @Get("audit/statistics")
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
  async getAuditStatistics(
    @Query("period") period: 'today' | 'yesterday' | 'week' | 'month' | 'custom' = 'today',
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    let stats;

    if (period === 'custom' && startDate && endDate) {
      stats = await this.auditReviewService.getStatistics(
        'custom',
        new Date(startDate),
        new Date(endDate),
      );
    } else {
      stats = await this.auditReviewService.getStatistics(period);
    }

    return {
      success: true,
      data: stats,
    };
  }

  @Get("audit/unreviewed")
  @RequireRoles(ROLES.ADMIN)
  async getUnreviewedLogs(@Query("severity") severity?: string) {
    const logs = await this.auditReviewService.getUnreviewedLogs(severity as any);

    return {
      success: true,
      data: logs,
      count: logs.length,
    };
  }

  @Put("audit/:id/review")
  @RequireRoles(ROLES.ADMIN)
  async markLogAsReviewed(
    @Param("id") id: string,
    @User() user: any,
    @Body("notes") notes?: string,
  ) {
    await this.auditReviewService.markAsReviewed(
      parseInt(id),
      user.id,
      notes,
    );

    return {
      success: true,
      message: "Audit log marked as reviewed",
    };
  }

  @Get("audit/export")
  @RequireRoles(ROLES.ADMIN)
  async exportAuditLogs(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("severity") severity?: string,
  ) {
    const filter: any = {};

    if (startDate) filter.startDate = new Date(startDate);
    if (endDate) filter.endDate = new Date(endDate);
    if (severity) filter.severity = severity;

    const csv = await this.auditReviewService.exportToCSV(filter);

    return {
      success: true,
      data: csv,
      contentType: 'text/csv',
    };
  }

  @Get("audit/forensic")
  @RequireRoles(ROLES.ADMIN)
  async generateForensicReport(
    @Query("targetUser") targetUser?: string,
    @Query("targetIP") targetIP?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    const report = await this.auditReviewService.generateForensicReport(
      targetUser,
      targetIP,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );

    return {
      success: true,
      data: report,
    };
  }

  @Get("threats")
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

  @Get("alerts/config")
  @RequireRoles(ROLES.ADMIN)
  async getAlertsConfig() {
    return {
      success: true,
      data: this.securityAlertsService.getConfig(),
    };
  }

  @Put("alerts/config")
  @RequireRoles(ROLES.ADMIN)
  async updateAlertsConfig(@Body() config: any) {
    this.securityAlertsService.updateConfig(config);

    return {
      success: true,
      message: "Alert configuration updated successfully",
      data: this.securityAlertsService.getConfig(),
    };
  }

  @Get("alerts/recent")
  @RequireRoles(ROLES.ADMIN)
  async getRecentAlerts(@Query("limit") limit?: string) {
    const alerts = this.securityAlertsService.getRecentAlerts(
      limit ? parseInt(limit) : 100,
    );

    return {
      success: true,
      data: alerts,
      count: alerts.length,
    };
  }

  @Get("alerts/statistics")
  @RequireRoles(ROLES.ADMIN)
  async getAlertsStatistics() {
    return {
      success: true,
      data: this.securityAlertsService.getStatistics(),
    };
  }

  @Post("alerts/test")
  @RequireRoles(ROLES.ADMIN)
  async sendTestAlert(@Body() body: { priority?: string; type?: string }) {
    const result = await this.securityAlertsService.sendAlert({
      type: body.type || 'TEST_ALERT',
      priority: body.priority as any || 'MEDIUM',
      title: 'Test Security Alert',
      description: 'This is a test alert to verify the security alert system is working correctly.',
      severity: 'MEDIUM' as any,
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
      message: result
        ? 'Test alert sent successfully'
        : 'Failed to send test alert - check logs',
    };
  }

  // ============================================================================
  // LOG ARCHIVING ENDPOINTS
  // ============================================================================

  @Get("archives")
  @RequireRoles(ROLES.ADMIN)
  async getArchives() {
    const archives = await this.logArchivingService.getArchives();

    return {
      success: true,
      data: archives,
      count: archives.length,
    };
  }

  @Get("archives/statistics")
  @RequireRoles(ROLES.ADMIN)
  async getArchiveStatistics() {
    const stats = await this.logArchivingService.getArchiveStatistics();

    return {
      success: true,
      data: stats,
    };
  }

  @Get("archives/config")
  @RequireRoles(ROLES.ADMIN)
  async getArchiveConfig() {
    return {
      success: true,
      data: this.logArchivingService.getConfig(),
    };
  }

  @Put("archives/config")
  @RequireRoles(ROLES.ADMIN)
  async updateArchiveConfig(@Body() config: any) {
    this.logArchivingService.updateConfig(config);

    return {
      success: true,
      message: 'Archive configuration updated successfully',
      data: this.logArchivingService.getConfig(),
    };
  }

  @Post("archives/run")
  @RequireRoles(ROLES.ADMIN)
  async runArchiving() {
    const result = await this.logArchivingService.archiveOldLogs();

    return {
      success: true,
      message: `Archived ${result.archivedCount} logs, deleted ${result.deletedCount} logs, created ${result.filesCreated} files`,
      data: result,
    };
  }

  @Get("archives/:filename")
  @RequireRoles(ROLES.ADMIN)
  async restoreArchive(@Param("filename") filename: string) {
    const logs = await this.logArchivingService.restoreFromArchive(filename);

    return {
      success: true,
      data: logs,
      count: logs.length,
    };
  }

  @Get("archives/search/:term")
  @RequireRoles(ROLES.ADMIN)
  async searchArchives(
    @Param("term") term: string,
    @Query("maxResults") maxResults?: string,
    @Query("dateFrom") dateFrom?: string,
    @Query("dateTo") dateTo?: string,
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

  @Get("compliance/reports")
  @RequireRoles(ROLES.ADMIN)
  async listComplianceReports() {
    const reports = await this.complianceReportsService.getAllReports();

    return {
      success: true,
      data: reports,
      count: reports.length,
    };
  }

  @Get("compliance/reports/:filename")
  @RequireRoles(ROLES.ADMIN)
  async getComplianceReport(@Param("filename") filename: string) {
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

  @Post("compliance/generate/:standard")
  @RequireRoles(ROLES.ADMIN)
  async generateComplianceReport(
    @Param("standard") standard: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    // Default to last 90 days if not specified
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);

    let report;

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

  @Get("compliance/reports/:filename/html")
  @RequireRoles(ROLES.ADMIN)
  async getComplianceReportHTML(@Param("filename") filename: string) {
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
}