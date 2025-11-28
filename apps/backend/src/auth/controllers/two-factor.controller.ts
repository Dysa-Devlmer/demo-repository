import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { TwoFactorService } from '../services/two-factor.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { User } from '../decorators/user.decorator';
import { User as UserEntity } from '../entities/user.entity';

@ApiTags('Two-Factor Authentication')
@ApiBearerAuth()
@Controller('auth/2fa')
@UseGuards(AuthGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Post('enable')
  @ApiOperation({
    summary: 'Enable 2FA',
    description:
      'Initialize 2FA for the authenticated user. Returns secret, QR code URL, and backup codes. User must save backup codes securely as they are shown only once.',
  })
  @ApiResponse({
    status: 201,
    description: '2FA initialized successfully. Returns setup data.',
    schema: {
      properties: {
        secret: { type: 'string', description: 'Base32 encoded secret for manual entry' },
        qrCodeUrl: {
          type: 'string',
          description: 'otpauth:// URL for QR code generation',
        },
        backupCodes: {
          type: 'array',
          items: { type: 'string' },
          description: '8 backup codes - SAVE THESE SECURELY',
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - 2FA already enabled' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async enable2FA(@User() user: UserEntity) {
    return this.twoFactorService.enable2FA(user.id);
  }

  @Post('verify-setup')
  @ApiOperation({
    summary: 'Verify and activate 2FA',
    description:
      'Verify the 2FA setup by providing a valid TOTP code from the authenticator app. This activates 2FA for the account.',
  })
  @ApiBody({
    schema: {
      properties: {
        token: {
          type: 'string',
          description: '6-digit TOTP code from authenticator app',
          pattern: '^[0-9]{6}$',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '2FA verified and activated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid token or 2FA not initialized',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @HttpCode(HttpStatus.OK)
  async verifySetup(@User() user: UserEntity, @Body('token') token: string) {
    const isValid = await this.twoFactorService.verify2FASetup(user.id, token);

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid 2FA code',
      };
    }

    return {
      success: true,
      message: '2FA enabled successfully',
    };
  }

  @Post('verify')
  @ApiOperation({
    summary: 'Verify 2FA code during login',
    description:
      'Verify a 2FA code during the login process. Accepts either TOTP codes from authenticator app or backup codes.',
  })
  @ApiBody({
    schema: {
      properties: {
        token: {
          type: 'string',
          description: '6-digit TOTP code or backup code (XXXX-XXXX format)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '2FA code verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid token',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - 2FA not enabled or invalid token' })
  @HttpCode(HttpStatus.OK)
  async verify2FA(@User() user: UserEntity, @Body('token') token: string) {
    const isValid = await this.twoFactorService.verify2FALogin(user.id, token);

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid 2FA code',
      };
    }

    return {
      success: true,
      message: '2FA verified successfully',
    };
  }

  @Delete('disable')
  @ApiOperation({
    summary: 'Disable 2FA',
    description:
      'Disable 2FA for the authenticated user. Requires password confirmation for security. This removes all 2FA settings including backup codes.',
  })
  @ApiBody({
    schema: {
      properties: {
        password: {
          type: 'string',
          description: 'User password for confirmation',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '2FA disabled successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid password or 2FA not enabled',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @HttpCode(HttpStatus.OK)
  async disable2FA(@User() user: UserEntity, @Body('password') password: string) {
    const disabled = await this.twoFactorService.disable2FA(user.id, password);

    if (!disabled) {
      return {
        success: false,
        message: 'Failed to disable 2FA',
      };
    }

    return {
      success: true,
      message: '2FA disabled successfully',
    };
  }

  @Post('backup-codes/regenerate')
  @ApiOperation({
    summary: 'Regenerate backup codes',
    description:
      'Generate a new set of 8 backup codes. Old backup codes will be invalidated. Save the new codes securely as they are shown only once.',
  })
  @ApiResponse({
    status: 200,
    description: 'Backup codes regenerated successfully',
    schema: {
      properties: {
        backupCodes: {
          type: 'array',
          items: { type: 'string' },
          description: '8 new backup codes - SAVE THESE SECURELY',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - 2FA not enabled',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async regenerateBackupCodes(@User() user: UserEntity) {
    const backupCodes = await this.twoFactorService.regenerateBackupCodes(user.id);

    return {
      success: true,
      message: 'Backup codes regenerated successfully',
      backupCodes,
    };
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get 2FA status',
    description: 'Check if 2FA is enabled for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: '2FA status retrieved successfully',
    schema: {
      properties: {
        enabled: { type: 'boolean' },
        backupCodesCount: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async get2FAStatus(@User() user: UserEntity) {
    return {
      enabled: user.isTwoFactorEnabled,
      backupCodesCount: user.twoFactorBackupCodes?.length || 0,
    };
  }
}
