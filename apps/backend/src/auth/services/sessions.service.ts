import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface UserSession {
  id: string;
  userId: number;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: Date;
  createdAt: Date;
  isCurrent: boolean;
}

@Injectable()
export class SessionsService {
  // In-memory session storage
  // En producción real, esto debería estar en Redis o base de datos
  private sessions: Map<string, UserSession> = new Map();

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Create a new session
   */
  createSession(
    userId: number,
    token: string,
    userAgent?: string,
    ip?: string
  ): UserSession {
    const sessionId = this.generateSessionId();
    const { device, browser, os } = this.parseUserAgent(userAgent || '');

    const session: UserSession = {
      id: sessionId,
      userId,
      device,
      browser,
      os,
      ip: ip || 'Unknown',
      location: this.getLocationFromIP(ip),
      lastActive: new Date(),
      createdAt: new Date(),
      isCurrent: false,
    };

    // Store with token as key for easy lookup
    this.sessions.set(token, session);

    return session;
  }

  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: number, currentToken?: string): Promise<UserSession[]> {
    const userSessions: UserSession[] = [];

    this.sessions.forEach((session, token) => {
      if (session.userId === userId) {
        const sessionCopy = { ...session };
        if (currentToken && token === currentToken) {
          sessionCopy.isCurrent = true;
        }
        userSessions.push(sessionCopy);
      }
    });

    // Sort by last active (most recent first)
    return userSessions.sort((a, b) =>
      b.lastActive.getTime() - a.lastActive.getTime()
    );
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(userId: number, sessionId: string): Promise<boolean> {
    let found = false;

    this.sessions.forEach((session, token) => {
      if (session.userId === userId && session.id === sessionId) {
        this.sessions.delete(token);
        found = true;
      }
    });

    return found;
  }

  /**
   * Revoke all sessions except current
   */
  async revokeAllOtherSessions(
    userId: number,
    currentToken: string
  ): Promise<number> {
    let revokedCount = 0;

    const tokensToDelete: string[] = [];

    this.sessions.forEach((session, token) => {
      if (session.userId === userId && token !== currentToken) {
        tokensToDelete.push(token);
        revokedCount++;
      }
    });

    tokensToDelete.forEach(token => this.sessions.delete(token));

    return revokedCount;
  }

  /**
   * Update session last active time
   */
  updateSessionActivity(token: string): void {
    const session = this.sessions.get(token);
    if (session) {
      session.lastActive = new Date();
      this.sessions.set(token, session);
    }
  }

  /**
   * Clean up expired sessions (older than 7 days)
   */
  cleanupExpiredSessions(): number {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let cleanedCount = 0;

    const tokensToDelete: string[] = [];

    this.sessions.forEach((session, token) => {
      if (session.lastActive < sevenDaysAgo) {
        tokensToDelete.push(token);
        cleanedCount++;
      }
    });

    tokensToDelete.forEach(token => this.sessions.delete(token));

    return cleanedCount;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Parse user agent string
   */
  private parseUserAgent(userAgent: string): {
    device: string;
    browser: string;
    os: string;
  } {
    const ua = userAgent.toLowerCase();

    // Detect device
    let device = 'Desktop';
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      device = 'Mobile';
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      device = 'Tablet';
    }

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = 'Chrome';
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = 'Safari';
    } else if (ua.includes('firefox')) {
      browser = 'Firefox';
    } else if (ua.includes('edg')) {
      browser = 'Edge';
    } else if (ua.includes('opera') || ua.includes('opr')) {
      browser = 'Opera';
    }

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('windows')) {
      os = 'Windows';
    } else if (ua.includes('mac')) {
      os = 'macOS';
    } else if (ua.includes('linux')) {
      os = 'Linux';
    } else if (ua.includes('android')) {
      os = 'Android';
    } else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) {
      os = 'iOS';
    }

    return { device, browser, os };
  }

  /**
   * Get approximate location from IP
   * En producción real, usar servicio de geolocalización
   */
  private getLocationFromIP(ip?: string): string {
    if (!ip || ip === '::1' || ip === '127.0.0.1') {
      return 'Local';
    }
    // En producción, integrar con servicio de geolocalización como MaxMind
    return 'Unknown Location';
  }

  /**
   * Get total sessions count
   */
  getTotalSessionsCount(): number {
    return this.sessions.size;
  }

  /**
   * Get active sessions count for user
   */
  getUserSessionsCount(userId: number): number {
    let count = 0;
    this.sessions.forEach((session) => {
      if (session.userId === userId) {
        count++;
      }
    });
    return count;
  }
}
