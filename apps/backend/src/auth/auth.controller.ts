// apps/backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Session,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { RateLimit, RateLimitPresets } from '../common/decorators/rate-limit.decorator';
import { CsrfGuard, SkipCsrf } from './guards/csrf.guard';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
@UseGuards(RateLimitGuard, CsrfGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('csrf-token')
  @SkipCsrf()
  @RateLimit(RateLimitPresets.API_STANDARD)
  @ApiOperation({
    summary: 'Get CSRF token',
    description:
      'Generate and retrieve a CSRF token for secure form submissions. Token is stored in session.',
  })
  @ApiResponse({ status: 200, description: 'CSRF token generated successfully' })
  getCsrfToken(@Session() session: unknown) {
    const csrfToken = ensureCsrfToken(session);
    return {
      csrfToken,
      success: true,
      message: 'CSRF token generated',
    };
  }

  @Post('login')
  @SkipCsrf() // 🚀 Enterprise Day 1 Fix: Skip CSRF for login to enable authentication flow
  @RateLimit(RateLimitPresets.LOGIN)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password. Returns JWT access token on success. Rate limited to 5 requests per minute.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful - Returns access_token and user data',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded (max 5/min)' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('register')
  @SkipCsrf() // 🚀 Enterprise Day 1 Fix: Skip CSRF for register to enable user creation
  @RateLimit(RateLimitPresets.LOGIN)
  @ApiOperation({
    summary: 'User registration',
    description:
      'Create a new user account. Password must be at least 8 characters with uppercase, lowercase, number and special character. Rate limited to 5 requests per minute.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input or weak password' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded (max 5/min)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('forgot-password')
  @SkipCsrf()
  @RateLimit(RateLimitPresets.PASSWORD_RESET)
  @ApiOperation({
    summary: 'Request password reset',
    description:
      'Request a password reset email. For security, always returns success even if email not found. Rate limited to 3 requests per minute.',
  })
  @ApiBody({ schema: { properties: { email: { type: 'string', format: 'email' } } } })
  @ApiResponse({ status: 200, description: 'Password reset email sent if account exists' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded (max 3/min)' })
  async forgotPassword(@Body() dto: { email: string }, @Request() req: ExpressRequest) {
    return this.authService.forgotPassword(dto.email, getClientIp(req), getUserAgent(req));
  }

  @Post('reset-password')
  @SkipCsrf()
  @RateLimit(RateLimitPresets.PASSWORD_RESET)
  @ApiOperation({
    summary: 'Reset password',
    description:
      'Reset user password using valid reset token. Token expires after 1 hour. Rate limited to 3 requests per minute.',
  })
  @ApiBody({
    schema: {
      properties: { token: { type: 'string' }, password: { type: 'string', minLength: 8 } },
    },
  })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid or expired token' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded (max 3/min)' })
  async resetPassword(
    @Body() dto: { token: string; password: string },
    @Request() req: ExpressRequest
  ) {
    return this.authService.resetPassword(
      dto.token,
      dto.password,
      getClientIp(req),
      getUserAgent(req)
    );
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RateLimit(RateLimitPresets.PASSWORD_RESET)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password',
    description:
      'Change password for authenticated user. Requires current password for security. Rate limited to 3 requests per minute.',
  })
  @ApiBody({
    schema: {
      properties: {
        currentPassword: { type: 'string', minLength: 8 },
        newPassword: { type: 'string', minLength: 8 },
      },
      required: ['currentPassword', 'newPassword'],
    },
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Current password incorrect or new password invalid',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded (max 3/min)' })
  async changePassword(
    @Request() req: ExpressRequest,
    @Body() dto: { currentPassword: string; newPassword: string }
  ) {
    const userId = getUserId(req);
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    await this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
      getClientIp(req),
      getUserAgent(req)
    );

    return {
      success: true,
      message: 'Contraseña cambiada exitosamente',
    };
  }
}

function ensureCsrfToken(session: unknown): string {
  if (session && typeof session === 'object') {
    const record = session as Record<string, unknown>;
    if (typeof record.csrfToken !== 'string') {
      record.csrfToken = CsrfGuard.generateCsrfToken();
    }
    return record.csrfToken as string;
  }
  return CsrfGuard.generateCsrfToken();
}

function getClientIp(req: ExpressRequest): string | undefined {
  return typeof req.ip === 'string' ? req.ip : undefined;
}

function getUserAgent(req: ExpressRequest): string | undefined {
  const header = req.headers['user-agent'];
  return typeof header === 'string' ? header : undefined;
}

function getUserId(req: ExpressRequest): number | undefined {
  const user = (req as { user?: { sub?: number | string; id?: number | string } }).user;
  const raw = user?.sub ?? user?.id;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string' && raw.trim() !== '') {
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
}
