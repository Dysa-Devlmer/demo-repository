import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CsrfGuard, SkipCsrf } from '../guards/csrf.guard';

@ApiTags('Security')
@Controller('auth/csrf')
@UseGuards(CsrfGuard)
export class CsrfController {
  @Get('token')
  @SkipCsrf() // ✅ ahora sí funciona
  @ApiOperation({ summary: 'Get CSRF token for secure form submissions' })
  @ApiResponse({
    status: 200,
    description: 'CSRF token generated successfully',
    schema: {
      type: 'object',
      properties: {
        csrfToken: { type: 'string' },
        sessionId: { type: 'string' },
      },
    },
  })
  getCsrfToken(@Req() request: Request, @Res() response: Response) {
    // 🚀 Enterprise: Ensure session exists
    if (!request.session) {
      return response.status(500).json({
        error: 'Session not configured',
        message: 'Server session configuration required',
      });
    }

    // 🚀 Enterprise: Generate new CSRF token
    const csrfToken = CsrfGuard.generateCsrfToken();
    request.session.csrfToken = csrfToken;

    // 🚀 Enterprise: Set CSRF cookie for client-side access
    response.cookie('XSRF-TOKEN', csrfToken, {
      httpOnly: false, // Accessible to JavaScript for form submissions
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return response.json({
      csrfToken,
      sessionId: request.sessionID,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify CSRF token validity' })
  @ApiResponse({
    status: 200,
    description: 'CSRF token verification result',
  })
  verifyCsrfToken(@Req() request: Request) {
    const sessionToken = request.session?.csrfToken;
    const headerToken = request.headers['x-csrf-token'] as string;

    return {
      valid: !!(sessionToken && headerToken && sessionToken === headerToken),
      sessionExists: !!request.session,
      tokenExists: !!sessionToken,
      headerTokenExists: !!headerToken,
    };
  }
}
