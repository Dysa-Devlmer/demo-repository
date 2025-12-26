// apps/backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CsrfController } from './controllers/csrf.controller';
import { TwoFactorController } from './controllers/two-factor.controller';
import { SessionsController } from './controllers/sessions.controller';
import { RolesController, PermissionsController } from './roles.controller';
import { TwoFactorService } from './services/two-factor.service';
import { SessionsService } from './services/sessions.service';
import { JwtStrategy } from './jwt.strategy';
import { CsrfGuard } from './guards/csrf.guard';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { AuditLog } from '../common/entities/audit-log.entity';
import { I18nModule } from '../i18n/i18n.module';
import { I18nService } from '../i18n/i18n.service';

@Module({
  imports: [
    PassportModule,
    I18nModule,
    TypeOrmModule.forFeature([User, Role, Permission, AuditLog]),
    JwtModule.registerAsync({
      imports: [I18nModule],
      inject: [I18nService],
      useFactory: (i18n: I18nService) => {
        // 🚀 Enterprise: Secure JWT secret generation
        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
          throw new Error(i18n.t('errors.jwtSecretRequired'));
        }

        if (jwtSecret.length < 32) {
          throw new Error(i18n.t('errors.jwtSecretTooShort'));
        }

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: '1h',
            issuer: 'chatbotdysa-enterprise',
            audience: 'chatbotdysa-clients',
          },
        };
      },
    }),
  ],
  providers: [AuthService, TwoFactorService, SessionsService, JwtStrategy, CsrfGuard],
  controllers: [
    AuthController,
    CsrfController,
    TwoFactorController,
    SessionsController,
    RolesController,
    PermissionsController,
  ],
  exports: [AuthService, TwoFactorService, SessionsService, CsrfGuard],
})
export class AuthModule {}
