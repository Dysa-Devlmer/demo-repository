// apps/backend/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { AuditLog, AuditAction, AuditSeverity } from '../common/entities/audit-log.entity';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface LoginRequest {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface LoginResponse {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  permissions: string[];
}

export interface JwtPayload {
  sub: number;
  email: string;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
    private readonly jwtService: JwtService
  ) {}

  // Legacy method for backward compatibility
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Credenciales inválidas');
  }

  // Legacy login method for backward compatibility
  async login(dto: LoginDto) {
    const loginRequest: LoginRequest = {
      email: dto.email,
      password: dto.password,
    };
    return await this.enterpriseLogin(loginRequest);
  }

  async enterpriseLogin(loginRequest: LoginRequest): Promise<LoginResponse> {
    const { email, password, ipAddress, userAgent } = loginRequest;

    // Find user
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      await this.logAuditEvent(AuditAction.FAILED_LOGIN, 'User', null, {
        email,
        reason: 'User not found',
        ipAddress,
        userAgent,
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Check account status
    if (user.status !== UserStatus.ACTIVE) {
      await this.logAuditEvent(AuditAction.FAILED_LOGIN, 'User', user.id, {
        reason: `Account status: ${user.status}`,
        ipAddress,
        userAgent,
      });
      throw new ForbiddenException('Cuenta inactiva o suspendida');
    }

    // Check account lockout
    if (user.isAccountLocked()) {
      await this.logAuditEvent(AuditAction.FAILED_LOGIN, 'User', user.id, {
        reason: 'Account locked',
        ipAddress,
        userAgent,
      });
      throw new ForbiddenException('Cuenta bloqueada temporalmente');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.handleFailedLogin(user, ipAddress, userAgent);
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Reset failed attempts on successful login
    await this.handleSuccessfulLogin(user, ipAddress, userAgent);

    // Generate tokens
    const permissions = this.extractPermissions(user);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map((role) => role.name) || [],
      permissions,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

    // Log successful login
    await this.logAuditEvent(AuditAction.LOGIN, 'User', user.id, {
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
        roles: user.roles || [],
      },
      accessToken,
      refreshToken,
      expiresIn: 3600,
      permissions,
    };
  }

  async register(dto: RegisterDto) {
    const exists = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (exists) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    await this.userRepository.save(user);

    await this.logAuditEvent(AuditAction.CREATE, 'User', user.id, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return { message: 'Usuario registrado exitosamente' };
  }

  async validateUserFromPayload(payload: JwtPayload): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return user;
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles', 'roles.permissions'],
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Usuario inválido');
      }

      const permissions = this.extractPermissions(user);
      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.roles?.map((role) => role.name) || [],
        permissions,
      };

      const accessToken = this.jwtService.sign(newPayload, { expiresIn: '1h' });

      return {
        accessToken,
        expiresIn: 3600,
      };
    } catch (error) {
      throw new UnauthorizedException('Token de actualización inválido');
    }
  }

  async logout(userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAuditEvent(AuditAction.LOGOUT, 'User', userId, {
      ipAddress,
      userAgent,
    });
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    if (!this.isPasswordStrong(newPassword)) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales'
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await this.userRepository.update(userId, { password: hashedNewPassword });

    await this.logAuditEvent(AuditAction.UPDATE, 'User', userId, {
      ipAddress,
      userAgent,
    });
  }

  async forgotPassword(
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return { message: 'Si el correo existe, recibirás un enlace de recuperación' };
    }

    // Generate secure reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.userRepository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    });

    await this.logAuditEvent(AuditAction.UPDATE, 'User', user.id, {
      action: 'reset_requested',
      ipAddress,
      userAgent,
    });

    // TODO: Send email with reset link using SendGrid
    // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await this.emailService.sendPasswordResetEmail(user.email, resetUrl);

    return { message: 'Si el correo existe, recibirás un enlace de recuperación' };
  }

  async resetPassword(
    token: string,
    newPassword: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: MoreThan(new Date()),
      },
    });

    if (!user) {
      throw new BadRequestException('Token inválido o expirado');
    }

    if (!this.isPasswordStrong(newPassword)) {
      throw new BadRequestException(
        'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales'
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null as any,
      passwordResetExpires: null as any,
      failedLoginAttempts: 0,
      accountLockedUntil: null as any,
    });

    await this.logAuditEvent(AuditAction.UPDATE, 'User', user.id, {
      method: 'reset',
      ipAddress,
      userAgent,
    });

    return { message: 'Contraseña actualizada exitosamente' };
  }

  private isPasswordStrong(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    );
  }

  private async handleFailedLogin(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const updatedAttempts = user.failedLoginAttempts + 1;
    const updateData: Partial<User> = { failedLoginAttempts: updatedAttempts };

    if (updatedAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      updateData.accountLockedUntil = new Date(Date.now() + this.LOCKOUT_DURATION);
    }

    await this.userRepository.update(user.id, updateData);

    await this.logAuditEvent(AuditAction.FAILED_LOGIN, 'User', user.id, {
      reason: 'Invalid password',
      failedAttempts: updatedAttempts,
      ipAddress,
      userAgent,
    });
  }

  private async handleSuccessfulLogin(
    user: User,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.userRepository.update(user.id, {
      failedLoginAttempts: 0,
      accountLockedUntil: null as any,
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
    });
  }

  private extractPermissions(user: User): string[] {
    const permissions = new Set<string>();

    user.roles?.forEach((role) => {
      role.permissions?.forEach((permission) => {
        permissions.add(permission.name);
      });
    });

    return Array.from(permissions);
  }

  private async logAuditEvent(
    action: AuditAction,
    resource: string,
    resourceId: number | null,
    metadata?: any,
    userId?: number
  ): Promise<void> {
    try {
      const actionMap: Record<string, AuditAction> = {
        login: AuditAction.LOGIN,
        logout: AuditAction.LOGOUT,
        login_failed: AuditAction.FAILED_LOGIN,
        user_created: AuditAction.CREATE,
        password_changed: AuditAction.UPDATE,
      };
      const normalizedAction = actionMap[String(action)] ?? action;

      const auditLog = this.auditRepository.create({
        action: normalizedAction,
        resource,
        resourceId: resourceId?.toString(),
        userId,
        ip: metadata?.ipAddress ?? metadata?.ip,
        userAgent: metadata?.userAgent,
        metadata,
        severity: this.getAuditSeverity(action),
      });

      await this.auditRepository.save(auditLog);
    } catch (error) {
      // Don't throw errors for audit logging failures
      console.error('Failed to log audit event:', error);
    }
  }

  private getAuditSeverity(action: AuditAction): AuditSeverity {
    switch (action) {
      case AuditAction.FAILED_LOGIN:
      case AuditAction.UPDATE:
        return AuditSeverity.MEDIUM;
      case AuditAction.DELETE:
      case AuditAction.DATA_EXPORT:
      case AuditAction.BULK_OPERATION:
        return AuditSeverity.HIGH;
      default:
        return AuditSeverity.LOW;
    }
  }
}
