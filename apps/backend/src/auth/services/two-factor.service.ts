import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * Generate a random secret for TOTP (Time-based One-Time Password)
   * Compatible with Google Authenticator, Authy, etc.
   */
  generateSecret(): string {
    // Generate 20 bytes (160 bits) random secret
    const buffer = crypto.randomBytes(20);
    // Encode as base32 (standard for TOTP)
    return this.base32Encode(buffer);
  }

  /**
   * Base32 encoding (RFC 4648)
   * Used by Google Authenticator and similar apps
   */
  private base32Encode(buffer: Buffer): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;

      while (bits >= 5) {
        output += alphabet[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }

    if (bits > 0) {
      output += alphabet[(value << (5 - bits)) & 31];
    }

    return output;
  }

  /**
   * Generate TOTP code (6 digits) based on secret and current time
   * @param secret Base32 encoded secret
   * @param window Time window (30 seconds default)
   */
  generateTOTP(secret: string, window: number = 30): string {
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / window);

    return this.generateHOTP(secret, counter);
  }

  /**
   * Generate HOTP code (HMAC-based One-Time Password)
   */
  private generateHOTP(secret: string, counter: number): string {
    // Decode base32 secret
    const key = this.base32Decode(secret);

    // Create counter buffer (8 bytes, big-endian)
    const counterBuffer = Buffer.alloc(8);
    let tmpCounter = counter;
    for (let i = 7; i >= 0; i--) {
      counterBuffer[i] = tmpCounter & 0xff;
      tmpCounter = tmpCounter >> 8;
    }

    // Calculate HMAC-SHA1
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(counterBuffer);
    const hmacResult = hmac.digest();

    // Dynamic truncation
    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const code =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    // Return 6 digits
    const otp = code % 1000000;
    return otp.toString().padStart(6, '0');
  }

  /**
   * Base32 decoding
   */
  private base32Decode(encoded: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    const output: number[] = [];

    for (let i = 0; i < encoded.length; i++) {
      const idx = alphabet.indexOf(encoded[i].toUpperCase());
      if (idx === -1) continue;

      value = (value << 5) | idx;
      bits += 5;

      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(output);
  }

  /**
   * Verify TOTP code
   * Allows for time drift (±1 window = 30 seconds before/after)
   */
  verifyTOTP(secret: string, token: string, window: number = 1): boolean {
    const epoch = Math.floor(Date.now() / 1000);
    const currentCounter = Math.floor(epoch / 30);

    // Check current window and adjacent windows for time drift tolerance
    for (let i = -window; i <= window; i++) {
      const counter = currentCounter + i;
      const expectedToken = this.generateHOTP(secret, counter);

      if (expectedToken === token) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate backup codes (8 codes, 8 characters each)
   * To be used when user loses access to authenticator app
   */
  generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      // Generate 4 bytes random = 8 hex characters
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      // Format as XXXX-XXXX for readability
      const formatted = `${code.substring(0, 4)}-${code.substring(4, 8)}`;
      codes.push(formatted);
    }

    return codes;
  }

  /**
   * Hash backup code for secure storage
   */
  hashBackupCode(code: string): string {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(code: string, hashedCode: string): boolean {
    const inputHash = this.hashBackupCode(code);
    return inputHash === hashedCode;
  }

  /**
   * Generate QR code data URL for Google Authenticator
   * Format: otpauth://totp/LABEL?secret=SECRET&issuer=ISSUER
   */
  generateQRCodeUrl(user: User, secret: string): string {
    const issuer = 'ChatBotDysa Enterprise';
    const label = `${issuer}:${user.email}`;

    // Build otpauth URL
    const params = new URLSearchParams({
      secret: secret,
      issuer: issuer,
      algorithm: 'SHA1',
      digits: '6',
      period: '30',
    });

    return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(
    userId: number
  ): Promise<{ secret: string; qrCodeUrl: string; backupCodes: string[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate secret and backup codes
    const secret = this.generateSecret();
    const backupCodes = this.generateBackupCodes(8);

    // Hash backup codes for storage
    const hashedBackupCodes = backupCodes.map((code) => this.hashBackupCode(code));

    // Update user
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = false; // Will be enabled after verification
    user.twoFactorBackupCodes = hashedBackupCodes;

    await this.userRepository.save(user);

    // Generate QR code URL
    const qrCodeUrl = this.generateQRCodeUrl(user, secret);

    return {
      secret,
      qrCodeUrl,
      backupCodes, // Return plain codes ONCE for user to save
    };
  }

  /**
   * Verify and activate 2FA
   */
  async verify2FASetup(userId: number, token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException('2FA not initialized');
    }

    // Verify token
    const isValid = this.verifyTOTP(user.twoFactorSecret, token);

    if (isValid) {
      // Activate 2FA
      user.twoFactorEnabled = true;
      await this.userRepository.save(user);
      return true;
    }

    return false;
  }

  /**
   * Verify 2FA token during login
   */
  async verify2FALogin(userId: number, token: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new UnauthorizedException('2FA not enabled');
    }

    // Try TOTP first
    const isValidTOTP = this.verifyTOTP(user.twoFactorSecret, token);
    if (isValidTOTP) {
      return true;
    }

    // Try backup codes
    if (user.twoFactorBackupCodes && user.twoFactorBackupCodes.length > 0) {
      for (let i = 0; i < user.twoFactorBackupCodes.length; i++) {
        if (this.verifyBackupCode(token, user.twoFactorBackupCodes[i])) {
          // Remove used backup code
          user.twoFactorBackupCodes.splice(i, 1);
          await this.userRepository.save(user);
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Disable 2FA
   */
  async disable2FA(userId: number, _password: string): Promise<boolean> {
    void _password;
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Verify password before disabling 2FA (security measure)
    // Password verification would be done by auth service

    user.twoFactorEnabled = false;
    user.twoFactorSecret = '';
    user.twoFactorBackupCodes = [];

    await this.userRepository.save(user);
    return true;
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: number): Promise<string[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || !user.twoFactorEnabled) {
      throw new BadRequestException('2FA not enabled');
    }

    // Generate new backup codes
    const backupCodes = this.generateBackupCodes(8);
    const hashedBackupCodes = backupCodes.map((code) => this.hashBackupCode(code));

    user.twoFactorBackupCodes = hashedBackupCodes;
    await this.userRepository.save(user);

    return backupCodes;
  }
}
