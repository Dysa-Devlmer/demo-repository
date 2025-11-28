import { Injectable, Logger } from '@nestjs/common';

export interface DemoSession {
  id: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  clientInfo: {
    ip: string;
    userAgent: string;
    location?: string;
  };
  usage: {
    apiCalls: number;
    lastActivity: Date;
    features: string[];
  };
}

@Injectable()
export class DemoService {
  private readonly logger = new Logger(DemoService.name);
  private demoSessions = new Map<string, DemoSession>();

  // Demo configuration - Enterprise grade
  private readonly DEMO_DURATION_MINUTES = 30; // 30 minutes demo
  private readonly MAX_API_CALLS = 1000; // Generous limit for demo
  private readonly WARNING_TIME_MINUTES = 5; // Warning 5 minutes before expiry

  /**
   * Start a new demo session
   */
  startDemoSession(clientIp: string, userAgent: string): DemoSession {
    const sessionId = this.generateSessionId();
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + this.DEMO_DURATION_MINUTES * 60 * 1000);

    const session: DemoSession = {
      id: sessionId,
      startTime,
      endTime,
      isActive: true,
      clientInfo: {
        ip: clientIp,
        userAgent,
      },
      usage: {
        apiCalls: 0,
        lastActivity: startTime,
        features: [],
      },
    };

    this.demoSessions.set(sessionId, session);

    this.logger.log(`🎭 New demo session started: ${sessionId} for IP: ${clientIp}`);
    this.logger.log(`⏰ Demo will expire at: ${endTime.toISOString()}`);

    return session;
  }

  /**
   * Get demo session status
   */
  getDemoStatus(sessionId: string): {
    isValid: boolean;
    timeRemaining?: number;
    warningLevel?: 'none' | 'warning' | 'critical';
    message?: string;
    session?: DemoSession;
  } {
    const session = this.demoSessions.get(sessionId);

    if (!session) {
      return {
        isValid: false,
        message: 'Demo session not found. Please start a new demo.',
      };
    }

    const now = new Date();
    const timeRemaining = session.endTime.getTime() - now.getTime();
    const minutesRemaining = Math.floor(timeRemaining / (1000 * 60));

    if (timeRemaining <= 0) {
      session.isActive = false;
      return {
        isValid: false,
        timeRemaining: 0,
        warningLevel: 'critical',
        message: 'Demo session has expired. Contact sales for full access.',
      };
    }

    let warningLevel: 'none' | 'warning' | 'critical' = 'none';
    let message = `Demo active. ${minutesRemaining} minutes remaining.`;

    if (minutesRemaining <= this.WARNING_TIME_MINUTES) {
      warningLevel = 'warning';
      message = `⚠️ Demo expires in ${minutesRemaining} minutes. Contact sales for full version.`;
    }

    if (minutesRemaining <= 2) {
      warningLevel = 'critical';
      message = `🚨 Demo expires in ${minutesRemaining} minutes! Data will be reset.`;
    }

    return {
      isValid: true,
      timeRemaining: minutesRemaining,
      warningLevel,
      message,
      session,
    };
  }

  /**
   * Track API usage for demo session
   */
  trackDemoUsage(sessionId: string, feature: string): boolean {
    const session = this.demoSessions.get(sessionId);

    if (!session || !session.isActive) {
      return false;
    }

    session.usage.apiCalls++;
    session.usage.lastActivity = new Date();

    if (!session.usage.features.includes(feature)) {
      session.usage.features.push(feature);
    }

    // Check if demo is still valid
    const status = this.getDemoStatus(sessionId);
    return status.isValid;
  }

  /**
   * Get all active demo sessions (for admin monitoring)
   */
  getActiveDemoSessions(): DemoSession[] {
    const now = new Date();
    return Array.from(this.demoSessions.values())
      .filter(session => session.isActive && session.endTime > now);
  }

  /**
   * Force end demo session
   */
  endDemoSession(sessionId: string): boolean {
    const session = this.demoSessions.get(sessionId);

    if (session) {
      session.isActive = false;
      this.logger.log(`🎭 Demo session ended: ${sessionId}`);
      return true;
    }

    return false;
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    const now = new Date();
    let cleaned = 0;

    for (const [sessionId, session] of this.demoSessions.entries()) {
      if (session.endTime < now) {
        this.demoSessions.delete(sessionId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`🧹 Cleaned up ${cleaned} expired demo sessions`);
    }

    return cleaned;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `demo_${timestamp}_${randomStr}`;
  }

  /**
   * Get demo statistics for dashboard
   */
  getDemoStatistics() {
    const activeSessions = this.getActiveDemoSessions();
    const totalSessions = this.demoSessions.size;

    return {
      activeSessions: activeSessions.length,
      totalSessions,
      averageUsage: this.calculateAverageUsage(),
      topFeatures: this.getTopUsedFeatures(),
      timestamp: new Date().toISOString(),
    };
  }

  private calculateAverageUsage(): number {
    const sessions = Array.from(this.demoSessions.values());
    if (sessions.length === 0) return 0;

    const totalCalls = sessions.reduce((sum, session) => sum + session.usage.apiCalls, 0);
    return Math.round(totalCalls / sessions.length);
  }

  private getTopUsedFeatures(): string[] {
    const featureCounts = new Map<string, number>();

    for (const session of this.demoSessions.values()) {
      for (const feature of session.usage.features) {
        featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1);
      }
    }

    return Array.from(featureCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([feature]) => feature);
  }
}