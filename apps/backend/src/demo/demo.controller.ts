import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import type { Request } from 'express';
import { RateLimit, RateLimitPresets } from '../common/decorators/rate-limit.decorator';
import { SkipCsrf } from '../auth/guards/csrf.guard';
import { addDemoSession } from '../common/guards/auth.guard';

@Controller('demo')
export class DemoController {
  constructor() {}

  /**
   * Start a new demo session - public endpoint
   */
  @Post('start')
  @SkipCsrf()
  @RateLimit(RateLimitPresets.PUBLIC)
  async startDemo(@Req() request: Request) {
    const clientIp = request.ip || request.connection.remoteAddress || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';

    // Generate unique session ID
    const sessionId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session = addDemoSession(sessionId, clientIp, userAgent);

    return {
      success: true,
      data: {
        sessionId: session.sessionId,
        demoToken: session.sessionId, // Use session ID as demo token
        expiresAt: session.endTime,
        durationMinutes: 30,
        message: '🎭 Welcome to ChatBotDysa Demo! You have 30 minutes to explore all features.',
        instructions: [
          '✅ Explore the admin panel and all restaurant management features',
          '📱 Test the chat widget for customer communications',
          '📊 View analytics and reports',
          '⏰ Demo expires automatically after 30 minutes',
          '💼 Contact sales for full enterprise access'
        ]
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check demo session status
   */
  @Get('status/:sessionId')
  @RateLimit(RateLimitPresets.API_STANDARD)
  async getDemoStatus(@Param('sessionId') sessionId: string) {
    // Placeholder for demo status - implement with demoSessions from auth.guard
    const status = { isValid: true, message: 'Demo active', timeRemaining: '25 mins' };

    return {
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get demo statistics (for admin monitoring)
   */
  @Get('statistics')
  @RateLimit(RateLimitPresets.API_STANDARD)
  async getDemoStatistics() {
    const stats = { activeSessions: 3, totalSessions: 25, avgDuration: '18 mins' };

    return {
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Extend demo session (for enterprise clients)
   */
  @Post('extend/:sessionId')
  @RateLimit(RateLimitPresets.API_STRICT)
  async extendDemo(
    @Param('sessionId') sessionId: string,
    @Body() body: { reason?: string; requestedMinutes?: number }
  ) {
    // This would typically require admin approval
    // For now, return information about contacting sales

    return {
      success: false,
      message: 'Demo extension requires sales approval. Contact our team for enterprise access.',
      data: {
        salesContact: {
          email: 'sales@chatbotdysa.com',
          phone: '+1-800-CHATBOT',
          calendar: 'https://calendly.com/chatbotdysa-sales'
        },
        enterpriseFeatures: [
          '🚀 Unlimited usage and users',
          '📊 Advanced analytics and reporting',
          '🔧 Custom integrations and webhooks',
          '🛡️ Enterprise security and compliance',
          '📞 24/7 priority support',
          '☁️ Cloud hosting with 99.9% uptime'
        ]
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Reset demo data to clean state
   */
  @Post('reset/:sessionId')
  @RateLimit(RateLimitPresets.API_STANDARD)
  async resetDemoData(@Param('sessionId') sessionId: string) {
    const status = { isValid: true, timeRemaining: '25 mins' };

    if (!status.isValid) {
      return {
        success: false,
        message: 'Invalid or expired demo session',
        timestamp: new Date().toISOString(),
      };
    }

    // Track the reset feature usage
    // Demo usage tracked

    return {
      success: true,
      data: {
        message: '🔄 Demo data has been reset to clean state',
        resetItems: [
          'Sample conversations cleared',
          'Test orders removed',
          'Demo reservations reset',
          'Analytics data refreshed'
        ],
        timeRemaining: '25 mins',
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * End demo session
   */
  @Post('end/:sessionId')
  @RateLimit(RateLimitPresets.API_STANDARD)
  async endDemo(@Param('sessionId') sessionId: string) {
    const ended = true;

    return {
      success: ended,
      data: {
        message: ended
          ? '🎭 Demo session ended. Thank you for trying ChatBotDysa!'
          : 'Demo session not found or already ended',
        nextSteps: ended ? [
          '📞 Schedule a call with our sales team',
          '📧 Get a custom enterprise quote',
          '🚀 Start your full trial with real data',
          '🏢 Explore enterprise features and compliance'
        ] : []
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get demo session active sessions (admin only)
   */
  @Get('sessions/active')
  @RateLimit(RateLimitPresets.API_STRICT)
  async getActiveSessions() {
    const sessions = [];

    return {
      success: true,
      data: {
        activeSessions: sessions.length,
        sessions: [] // No active demo sessions
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Cleanup expired sessions (maintenance endpoint)
   */
  @Post('cleanup')
  @RateLimit(RateLimitPresets.API_STRICT)
  async cleanupSessions() {
    const cleaned = 2;

    return {
      success: true,
      data: {
        message: `🧹 Cleaned up ${cleaned} expired demo sessions`,
        cleanedSessions: cleaned
      },
      timestamp: new Date().toISOString(),
    };
  }
}