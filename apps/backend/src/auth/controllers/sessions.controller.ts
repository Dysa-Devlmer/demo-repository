import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SessionsService } from '../services/sessions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Sessions Management')
@ApiBearerAuth()
@Controller('auth/sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all active sessions',
    description:
      'Get all active sessions for the authenticated user. Shows device info, browser, OS, IP, location, and last active time.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sessions retrieved successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              device: { type: 'string', example: 'Desktop' },
              browser: { type: 'string', example: 'Chrome' },
              os: { type: 'string', example: 'macOS' },
              ip: { type: 'string', example: '192.168.1.1' },
              location: { type: 'string', example: 'San Francisco, CA' },
              lastActive: { type: 'string', format: 'date-time' },
              isCurrent: { type: 'boolean' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async getSessions(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }

    const currentToken = req.headers.authorization?.replace('Bearer ', '');
    const sessions = await this.sessionsService.getUserSessions(userId, currentToken);

    // Return mock data if no sessions found (for demo purposes)
    if (sessions.length === 0) {
      const mockSessions = [
        {
          id: 'session_current',
          device: 'Desktop',
          browser: 'Chrome',
          os: 'macOS',
          ip: '192.168.1.1',
          location: 'Local',
          lastActive: new Date(),
          isCurrent: true,
        },
        {
          id: 'session_mobile',
          device: 'Mobile',
          browser: 'Safari',
          os: 'iOS',
          ip: '192.168.1.2',
          location: 'Local',
          lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isCurrent: false,
        },
      ];

      return {
        success: true,
        data: mockSessions,
        message: 'Demo sessions (sessions service not fully integrated)',
      };
    }

    return {
      success: true,
      data: sessions,
    };
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke a specific session',
    description:
      'Revoke/logout a specific session by its ID. The session will be immediately invalidated.',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'The ID of the session to revoke',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Session revoked successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid session ID' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({
    status: 404,
    description: 'Not found - Session not found or belongs to another user',
  })
  async revokeSession(@Request() req, @Param('sessionId') sessionId: string) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }

    const revoked = await this.sessionsService.revokeSession(userId, sessionId);

    if (!revoked) {
      return {
        success: false,
        message: 'Session not found or already revoked',
      };
    }

    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
    };
  }

  @Post('revoke-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Revoke all other sessions',
    description:
      'Revoke all active sessions except the current one. Useful for security when device is lost or compromised.',
  })
  @ApiResponse({
    status: 200,
    description: 'All other sessions revoked successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        revokedCount: {
          type: 'number',
          description: 'Number of sessions that were revoked',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async revokeAllOtherSessions(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }

    const currentToken = req.headers.authorization?.replace('Bearer ', '');
    if (!currentToken) {
      throw new BadRequestException('Current token not found');
    }

    const revokedCount = await this.sessionsService.revokeAllOtherSessions(
      userId,
      currentToken
    );

    return {
      success: true,
      message: `${revokedCount} sesión(es) cerrada(s) exitosamente`,
      revokedCount,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get session statistics',
    description: 'Get statistics about active sessions for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Session stats retrieved successfully',
    schema: {
      properties: {
        activeSessions: { type: 'number' },
        totalSessions: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async getSessionStats(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }

    const userSessionsCount = this.sessionsService.getUserSessionsCount(userId);
    const totalSessionsCount = this.sessionsService.getTotalSessionsCount();

    return {
      success: true,
      data: {
        activeSessions: userSessionsCount,
        totalSessions: totalSessionsCount,
      },
    };
  }
}
