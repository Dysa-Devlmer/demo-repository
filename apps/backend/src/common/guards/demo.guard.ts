import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { DemoService } from '../../demo/demo.service';

@Injectable()
export class DemoGuard implements CanActivate {
  private readonly logger = new Logger(DemoGuard.name);

  constructor(private readonly demoService: DemoService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Get demo token from header or query
    const demoToken =
      (request.headers['x-demo-token'] as string) ||
      (request.query.demoToken as string) ||
      request.headers['authorization']?.replace('Demo ', '');

    // Skip demo check for public endpoints and auth
    const isPublicEndpoint = this.isPublicEndpoint(request.path);
    if (isPublicEndpoint) {
      return true;
    }

    // If no demo token and not in demo mode, allow (normal operation)
    if (!demoToken) {
      return true;
    }

    // Validate demo session
    const demoStatus = this.demoService.getDemoStatus(demoToken);

    if (!demoStatus.isValid) {
      this.logger.warn(`🎭 Demo session expired or invalid: ${demoToken}`);
      throw new ForbiddenException({
        error: 'Demo Expired',
        message: demoStatus.message || 'Demo session has expired',
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
    this.demoService.trackDemoUsage(demoToken, endpoint);

    // Add demo info to request for controllers to use
    (request as any).demoSession = demoStatus.session;
    (request as any).demoStatus = demoStatus;

    // Log demo activity
    if (demoStatus.warningLevel === 'warning' || demoStatus.warningLevel === 'critical') {
      this.logger.warn(`🎭 Demo session ${demoToken}: ${demoStatus.message}`);
    }

    return true;
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
    // Extract meaningful endpoint name for tracking
    const pathSegments = path.split('/').filter((segment) => segment);

    if (pathSegments.length >= 2) {
      return `${method.toLowerCase()}_${pathSegments[1]}_${pathSegments[2] || 'index'}`;
    }

    return `${method.toLowerCase()}_${pathSegments[0] || 'root'}`;
  }
}
