import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

// Simple in-memory demo sessions (for production, use Redis or database)
const demoSessions = new Map<
  string,
  {
    id: string;
    startTime: Date;
    endTime: Date;
    clientInfo: { ip: string; userAgent: string };
    usage: { endpoints: string[]; requestCount: number };
  }
>();

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Check if endpoint is public (skip authentication)
    if (this.isPublicEndpoint(request.path)) {
      return true;
    }

    // Debug logging
    this.logger.log(`🔍 Checking auth for ${request.path}`);
    this.logger.log(`🔍 Auth header: ${request.headers['authorization']}`);
    this.logger.log(`🔍 X-Demo-Session header: ${request.headers['x-demo-session']}`);
    this.logger.log(`🔍 x-demo-token header: ${request.headers['x-demo-token']}`);
    this.logger.log(`🔍 Demo sessions in memory: ${demoSessions.size}`);

    // Try demo authentication first
    const demoToken = this.extractDemoToken(request);
    this.logger.log(`🔍 Demo token extracted: ${demoToken}`);
    if (demoToken) {
      return this.validateDemoToken(request, demoToken);
    }

    // Try JWT authentication
    const jwtToken = this.extractJwtToken(request);
    this.logger.log(`🔍 JWT token: ${jwtToken ? 'found' : 'not found'}`);
    if (jwtToken) {
      return await this.validateJwtToken(request, jwtToken);
    }

    // No valid token found
    this.logger.warn(`🚫 No valid authentication token found for ${request.path}`);
    throw new UnauthorizedException({
      error: 'Authentication Required',
      message: 'Valid JWT token or demo token required',
      code: 'NO_TOKEN',
    });
  }

  private extractDemoToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Demo ')) {
      return authHeader.substring(5);
    }
    return (
      (request.headers['x-demo-token'] as string) ||
      (request.headers['x-demo-session'] as string) ||
      (request.query.demoToken as string) ||
      null
    );
  }

  private extractJwtToken(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  private validateDemoToken(request: Request, demoToken: string): boolean {
    const session = demoSessions.get(demoToken);

    if (!session || new Date() > session.endTime) {
      this.logger.warn(`🎭 Demo session expired or invalid: ${demoToken}`);
      throw new UnauthorizedException({
        error: 'Demo Expired',
        message: 'Demo session has expired',
        code: 'DEMO_EXPIRED',
        actions: [
          'Contact sales for full access',
          'Start a new demo session',
          'Schedule enterprise consultation',
        ],
        salesContact: {
          email: 'sales@chatbotdysa.com',
          phone: '+1-800-CHATBOT',
        },
      });
    }

    // Track demo usage
    const endpoint = this.getEndpointName(request.path, request.method);
    session.usage.endpoints.push(endpoint);
    session.usage.requestCount++;

    // Add demo info to request
    (request as any).demoSession = session;
    (request as any).user = {
      id: 1,
      email: 'demo@restaurant.com',
      roles: ['admin'],
      permissions: ['*'], // Demo has all permissions
      isDemoUser: true,
    };

    this.logger.log(`🎭 Demo authentication successful for ${endpoint}`);
    return true;
  }

  private async validateJwtToken(request: Request, token: string): Promise<boolean> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      (request as any).user = payload;

      this.logger.log(`🔑 JWT authentication successful for user ${payload.sub}`);
      return true;
    } catch (error) {
      this.logger.warn(`🚫 JWT token validation failed: ${error.message}`);
      throw new UnauthorizedException({
        error: 'Invalid Token',
        message: 'JWT token is invalid or expired',
        code: 'INVALID_TOKEN',
      });
    }
  }

  private isPublicEndpoint(path: string): boolean {
    const publicPaths = [
      '/health',
      '/api/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/csrf',
      '/api/demo/start',
      '/api/demo/status',
    ];

    return publicPaths.some((publicPath) => path.startsWith(publicPath));
  }

  private getEndpointName(path: string, method: string): string {
    const pathSegments = path.split('/').filter((segment) => segment);

    if (pathSegments.length >= 2) {
      return `${method.toLowerCase()}_${pathSegments[1]}_${pathSegments[2] || 'index'}`;
    }

    return `${method.toLowerCase()}_${pathSegments[0] || 'root'}`;
  }
}

// Export utility function to add demo sessions (for demo controller)
export const addDemoSession = (sessionId: string, clientIp: string, userAgent: string) => {
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // 30 minutes

  demoSessions.set(sessionId, {
    id: sessionId,
    startTime,
    endTime,
    clientInfo: { ip: clientIp, userAgent },
    usage: { endpoints: [], requestCount: 0 },
  });

  return { sessionId, startTime, endTime };
};
