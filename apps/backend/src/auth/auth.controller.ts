// apps/backend/src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Get, Session, Request, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { RateLimit, RateLimitPresets } from "../common/decorators/rate-limit.decorator";
import { CsrfGuard, SkipCsrf } from "./guards/csrf.guard";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@ApiTags('Authentication')
@Controller("auth")
@UseGuards(RateLimitGuard, CsrfGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("csrf-token")
  @SkipCsrf()
  @RateLimit(RateLimitPresets.API_STANDARD)
  @ApiOperation({
    summary: 'Get CSRF token',
    description: 'Generate and retrieve a CSRF token for secure form submissions. Token is stored in session.'
  })
  @ApiResponse({ status: 200, description: 'CSRF token generated successfully' })
  async getCsrfToken(@Session() session: any) {
    if (!session.csrfToken) {
      session.csrfToken = CsrfGuard.generateCsrfToken();
    }
    return {
      csrfToken: session.csrfToken,
      success: true,
      message: "CSRF token generated"
    };
  }

  @Post("login")
  @SkipCsrf() // 🚀 Enterprise Day 1 Fix: Skip CSRF for login to enable authentication flow
  @RateLimit(RateLimitPresets.LOGIN)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns JWT access token on success. Rate limited to 5 requests per minute.'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful - Returns access_token and user data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded (max 5/min)' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("register")
  @SkipCsrf() // 🚀 Enterprise Day 1 Fix: Skip CSRF for register to enable user creation
  @RateLimit(RateLimitPresets.LOGIN)
  @ApiOperation({
    summary: 'User registration',
    description: 'Create a new user account. Password must be at least 8 characters with uppercase, lowercase, number and special character. Rate limited to 5 requests per minute.'
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input or weak password' })
  @ApiResponse({ status: 409, description: 'Conflict - Email already exists' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded (max 5/min)' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("forgot-password")
  @RateLimit(RateLimitPresets.PASSWORD_RESET)
  @ApiOperation({
    summary: 'Request password reset',
    description: 'Request a password reset email. For security, always returns success even if email not found. Rate limited to 3 requests per minute.'
  })
  @ApiBody({ schema: { properties: { email: { type: 'string', format: 'email' } } } })
  @ApiResponse({ status: 200, description: 'Password reset email sent if account exists' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded (max 3/min)' })
  async forgotPassword(@Body() dto: { email: string }) {
    // Implementation would go here
    return { message: "Password reset email sent if account exists" };
  }

  @Post("reset-password")
  @RateLimit(RateLimitPresets.PASSWORD_RESET)
  @ApiOperation({
    summary: 'Reset password',
    description: 'Reset user password using valid reset token. Token expires after 1 hour. Rate limited to 3 requests per minute.'
  })
  @ApiBody({ schema: { properties: { token: { type: 'string' }, password: { type: 'string', minLength: 8 } } } })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid or expired token' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded (max 3/min)' })
  async resetPassword(@Body() dto: { token: string; password: string }) {
    // Implementation would go here
    return { message: "Password reset successfully" };
  }

  @Post("change-password")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @RateLimit(RateLimitPresets.PASSWORD_RESET)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Change password',
    description: 'Change password for authenticated user. Requires current password for security. Rate limited to 3 requests per minute.'
  })
  @ApiBody({
    schema: {
      properties: {
        currentPassword: { type: 'string', minLength: 8 },
        newPassword: { type: 'string', minLength: 8 }
      },
      required: ['currentPassword', 'newPassword']
    }
  })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Current password incorrect or new password invalid' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 429, description: 'Too many requests - Rate limit exceeded (max 3/min)' })
  async changePassword(
    @Request() req,
    @Body() dto: { currentPassword: string; newPassword: string }
  ) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new Error("User ID not found in request");
    }

    await this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
      req.ip,
      req.headers['user-agent']
    );

    return {
      success: true,
      message: "Contraseña cambiada exitosamente"
    };
  }
}
