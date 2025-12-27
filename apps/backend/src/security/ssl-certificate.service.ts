import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { WinstonLogger } from '../common/logger/winston.logger';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as crypto from 'crypto';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export interface SSLCertificate {
  id: string;
  domain: string;
  certificatePath: string;
  privateKeyPath: string;
  chainPath?: string;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
  status: 'valid' | 'expired' | 'expiring' | 'invalid';
  autoRenew: boolean;
  created: Date;
  lastChecked: Date;
}

export interface SSLConfig {
  enabled: boolean;
  autoRenew: boolean;
  renewBeforeDays: number;
  certDir: string;
  domains: string[];
  email: string;
  acmeServer: string;
  keySize: number;
  algorithm: string;
  cipherSuite: string[];
  protocols: string[];
}

@Injectable()
export class SSLCertificateService implements OnModuleDestroy {
  private readonly logger = new WinstonLogger();
  private certificates: Map<string, SSLCertificate> = new Map();
  private config: SSLConfig;
  private renewalInterval?: NodeJS.Timeout;

  constructor() {
    this.config = {
      enabled: process.env.SSL_ENABLED === 'true',
      autoRenew: process.env.SSL_AUTO_RENEW !== 'false',
      renewBeforeDays: parseInt(process.env.SSL_RENEW_DAYS || '30', 10) || 30,
      certDir: process.env.SSL_CERT_DIR || '/etc/ssl/dysabot',
      domains: (process.env.SSL_DOMAINS || 'localhost').split(','),
      email: process.env.SSL_EMAIL || 'admin@dysabot.local',
      acmeServer: process.env.SSL_ACME_SERVER || 'https://acme-v02.api.letsencrypt.org/directory',
      keySize: parseInt(process.env.SSL_KEY_SIZE || '2048', 10) || 2048,
      algorithm: process.env.SSL_ALGORITHM || 'RSA',
      cipherSuite: [
        'ECDHE-RSA-AES256-GCM-SHA384',
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-SHA384',
        'ECDHE-RSA-AES128-SHA256',
        'ECDHE-RSA-AES256-SHA',
        'ECDHE-RSA-AES128-SHA',
      ],
      protocols: ['TLSv1.2', 'TLSv1.3'],
    };

    void this.initializeSSL();
  }

  private async initializeSSL() {
    try {
      if (!this.config.enabled) {
        this.logger.log('SSL/TLS is disabled', 'SSLCertificateService');
        return;
      }

      // Create certificate directory if it doesn't exist
      if (!fs.existsSync(this.config.certDir)) {
        fs.mkdirSync(this.config.certDir, { recursive: true });
      }

      // Load existing certificates
      await this.loadCertificates();

      // Check for certificates that need renewal
      if (this.config.autoRenew) {
        await this.checkRenewals();

        // Schedule periodic renewal checks (daily)
        this.renewalInterval = setInterval(
          () => {
            void this.checkRenewals();
          },
          24 * 60 * 60 * 1000
        );
        this.renewalInterval.unref?.();
      }

      this.logger.log('SSL/TLS certificate service initialized', 'SSLCertificateService', {
        enabled: this.config.enabled,
        autoRenew: this.config.autoRenew,
        domains: this.config.domains.length,
      });
    } catch (error) {
      const err = toError(error);
      this.logger.error(
        'Failed to initialize SSL certificate service',
        err.stack,
        'SSLCertificateService'
      );
    }
  }

  onModuleDestroy() {
    if (this.renewalInterval) {
      clearInterval(this.renewalInterval);
      this.renewalInterval = undefined;
    }
  }

  async createSelfSignedCertificate(domain: string): Promise<SSLCertificate> {
    try {
      const certId = `self_${domain}_${Date.now()}`;
      const keyPath = path.join(this.config.certDir, `${certId}.key`);
      const certPath = path.join(this.config.certDir, `${certId}.crt`);

      // Generate private key
      const keyCommand = `openssl genrsa -out ${keyPath} ${this.config.keySize}`;
      await execAsync(keyCommand);

      // Generate certificate
      const certCommand =
        `openssl req -new -x509 -key ${keyPath} -out ${certPath} -days 365 ` +
        `-subj "/C=CL/ST=Santiago/L=Santiago/O=DysaDev SpA/CN=${domain}"`;
      await execAsync(certCommand);

      const certificate = await this.loadCertificateInfo(certPath, keyPath);
      certificate.id = certId;
      certificate.domain = domain;
      certificate.autoRenew = false;

      this.certificates.set(certId, certificate);

      this.logger.log(
        `Self-signed certificate created for domain: ${domain}`,
        'SSLCertificateService',
        {
          certId,
          validTo: certificate.validTo,
        }
      );

      return certificate;
    } catch (error) {
      const err = toError(error);
      this.logger.error(
        `Failed to create self-signed certificate for ${domain}`,
        err.stack,
        'SSLCertificateService'
      );
      throw new Error(`Certificate creation failed: ${err.message}`);
    }
  }

  async requestLetsEncryptCertificate(domain: string): Promise<SSLCertificate> {
    try {
      // This is a simplified implementation
      // In production, you'd use ACME client like certbot or acme.js
      this.logger.log(
        `Requesting Let's Encrypt certificate for: ${domain}`,
        'SSLCertificateService'
      );

      const certId = `le_${domain}_${Date.now()}`;
      // For now, create self-signed as fallback
      // In production, implement proper ACME protocol
      const certificate = await this.createSelfSignedCertificate(domain);
      certificate.id = certId;
      certificate.issuer = "DysaBot Self-Signed (Let's Encrypt Placeholder)";
      certificate.autoRenew = true;

      this.logger.warn(
        `Using self-signed certificate as Let's Encrypt placeholder for: ${domain}`,
        'SSLCertificateService'
      );

      return certificate;
    } catch (error) {
      const err = toError(error);
      this.logger.error(
        `Failed to request Let's Encrypt certificate for ${domain}`,
        err.stack,
        'SSLCertificateService'
      );
      throw err;
    }
  }

  async loadCertificates(): Promise<void> {
    try {
      if (!fs.existsSync(this.config.certDir)) {
        return;
      }

      const files = fs.readdirSync(this.config.certDir);
      const certFiles = files.filter((f) => f.endsWith('.crt'));

      for (const certFile of certFiles) {
        try {
          const certPath = path.join(this.config.certDir, certFile);
          const keyFile = certFile.replace('.crt', '.key');
          const keyPath = path.join(this.config.certDir, keyFile);

          if (fs.existsSync(keyPath)) {
            const certificate = await this.loadCertificateInfo(certPath, keyPath);
            const certId = certFile.replace('.crt', '');
            certificate.id = certId;
            certificate.domain = certificate.subject.split('CN=')[1]?.split(',')[0] || 'unknown';

            this.certificates.set(certId, certificate);
          }
        } catch (error) {
          const err = toError(error);
          this.logger.warn(
            `Failed to load certificate: ${certFile} - ${err.message}`,
            'SSLCertificateService'
          );
        }
      }

      this.logger.log(`Loaded ${this.certificates.size} certificates`, 'SSLCertificateService');
    } catch (error) {
      const err = toError(error);
      this.logger.error('Failed to load certificates', err.stack, 'SSLCertificateService');
    }
  }

  private async loadCertificateInfo(certPath: string, keyPath: string): Promise<SSLCertificate> {
    try {
      const certContent = fs.readFileSync(certPath, 'utf8');
      const cert = crypto.X509Certificate
        ? toParsedCertificate(new crypto.X509Certificate(certContent))
        : await this.parseX509Certificate(certPath);

      const fingerprint = crypto.createHash('sha256').update(certContent).digest('hex');

      const validFrom = cert.validFrom ? new Date(cert.validFrom) : new Date();
      const validTo = cert.validTo ? new Date(cert.validTo) : new Date();
      const now = new Date();

      let status: 'valid' | 'expired' | 'expiring' | 'invalid' = 'valid';
      if (validTo < now) {
        status = 'expired';
      } else if (
        validTo.getTime() - now.getTime() <
        this.config.renewBeforeDays * 24 * 60 * 60 * 1000
      ) {
        status = 'expiring';
      }

      return {
        id: '',
        domain: '',
        certificatePath: certPath,
        privateKeyPath: keyPath,
        issuer: cert.issuer || 'Unknown',
        subject: cert.subject || 'Unknown',
        validFrom,
        validTo,
        fingerprint,
        status,
        autoRenew: false,
        created: fs.statSync(certPath).birthtime,
        lastChecked: new Date(),
      };
    } catch (error) {
      const err = toError(error);
      throw new Error(`Failed to load certificate info: ${err.message}`);
    }
  }

  private async parseX509Certificate(certPath: string): Promise<ParsedCertificate> {
    try {
      const command = `openssl x509 -in ${certPath} -text -noout`;
      const { stdout } = await execAsync(command);

      const validFromMatch = stdout.match(/Not Before:\s*(.*)/);
      const validToMatch = stdout.match(/Not After:\s*(.*)/);
      const subjectMatch = stdout.match(/Subject:\s*(.*)/);
      const issuerMatch = stdout.match(/Issuer:\s*(.*)/);

      return {
        validFrom: validFromMatch ? validFromMatch[1] : null,
        validTo: validToMatch ? validToMatch[1] : null,
        subject: subjectMatch ? subjectMatch[1] : 'Unknown',
        issuer: issuerMatch ? issuerMatch[1] : 'Unknown',
      };
    } catch (error) {
      const err = toError(error);
      throw new Error(`Failed to parse certificate: ${err.message}`);
    }
  }

  async checkRenewals(): Promise<void> {
    try {
      const expiring = Array.from(this.certificates.values()).filter(
        (cert) => cert.status === 'expiring' && cert.autoRenew
      );

      for (const cert of expiring) {
        this.logger.log(`Certificate expiring soon: ${cert.domain}`, 'SSLCertificateService', {
          domain: cert.domain,
          validTo: cert.validTo,
        });

        try {
          await this.renewCertificate(cert.id);
        } catch (error) {
          const err = toError(error);
          this.logger.error(
            `Failed to renew certificate: ${cert.domain}`,
            err.stack,
            'SSLCertificateService'
          );
        }
      }
    } catch (error) {
      const err = toError(error);
      this.logger.error('Failed to check certificate renewals', err.stack, 'SSLCertificateService');
    }
  }

  async renewCertificate(certId: string): Promise<SSLCertificate> {
    const cert = this.certificates.get(certId);
    if (!cert) {
      throw new Error(`Certificate not found: ${certId}`);
    }

    this.logger.log(`Renewing certificate: ${cert.domain}`, 'SSLCertificateService');

    try {
      // Create new certificate
      const newCert =
        cert.issuer.includes("Let's Encrypt") || cert.issuer.includes('ACME')
          ? await this.requestLetsEncryptCertificate(cert.domain)
          : await this.createSelfSignedCertificate(cert.domain);

      // Remove old certificate files
      try {
        fs.unlinkSync(cert.certificatePath);
        fs.unlinkSync(cert.privateKeyPath);
        if (cert.chainPath && fs.existsSync(cert.chainPath)) {
          fs.unlinkSync(cert.chainPath);
        }
      } catch (error) {
        const err = toError(error);
        this.logger.warn(
          `Failed to remove old certificate files for: ${cert.domain} - ${err.message}`,
          'SSLCertificateService'
        );
      }

      // Update certificate registry
      this.certificates.delete(certId);
      this.certificates.set(newCert.id, newCert);

      this.logger.log(`Certificate renewed successfully: ${cert.domain}`, 'SSLCertificateService', {
        oldCertId: certId,
        newCertId: newCert.id,
        validTo: newCert.validTo,
      });

      return newCert;
    } catch (error) {
      const err = toError(error);
      this.logger.error(
        `Certificate renewal failed: ${cert.domain}`,
        err.stack,
        'SSLCertificateService'
      );
      throw err;
    }
  }

  getHTTPSOptions(domain?: string): https.ServerOptions | null {
    try {
      if (!this.config.enabled) {
        return null;
      }

      // Find certificate for domain or use first available
      const cert = domain
        ? Array.from(this.certificates.values()).find((c) => c.domain === domain)
        : Array.from(this.certificates.values())[0];

      if (!cert || cert.status === 'expired') {
        return null;
      }

      return {
        key: fs.readFileSync(cert.privateKeyPath),
        cert: fs.readFileSync(cert.certificatePath),
        ...(cert.chainPath &&
          fs.existsSync(cert.chainPath) && {
            ca: fs.readFileSync(cert.chainPath),
          }),
        ciphers: this.config.cipherSuite.join(':'),
        secureProtocol: 'TLS_method',
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3',
        honorCipherOrder: true,
        ecdhCurve: 'prime256v1:secp384r1:secp521r1',
        dhparam: this.generateDHParams(),
      };
    } catch (error) {
      const err = toError(error);
      this.logger.error('Failed to get HTTPS options', err.stack, 'SSLCertificateService');
      return null;
    }
  }

  private generateDHParams(): Buffer | undefined {
    try {
      const dhParamsPath = path.join(this.config.certDir, 'dhparams.pem');

      if (!fs.existsSync(dhParamsPath)) {
        // Generate DH params asynchronously
        void this.generateDHParamsAsync(dhParamsPath);
        return undefined;
      }

      return fs.readFileSync(dhParamsPath);
    } catch (error) {
      const err = toError(error);
      this.logger.warn(`Failed to load DH params - ${err.message}`, 'SSLCertificateService');
      return undefined;
    }
  }

  private async generateDHParamsAsync(dhParamsPath: string): Promise<void> {
    try {
      this.logger.log(
        'Generating DH parameters (this may take a while)...',
        'SSLCertificateService'
      );
      const command = `openssl dhparam -out ${dhParamsPath} 2048`;
      await execAsync(command);
      this.logger.log('DH parameters generated successfully', 'SSLCertificateService');
    } catch (error) {
      const err = toError(error);
      this.logger.error('Failed to generate DH parameters', err.stack, 'SSLCertificateService');
    }
  }

  getCertificates(): SSLCertificate[] {
    return Array.from(this.certificates.values());
  }

  getCertificate(id: string): SSLCertificate | undefined {
    return this.certificates.get(id);
  }

  deleteCertificate(id: string): void {
    const cert = this.certificates.get(id);
    if (!cert) {
      throw new Error(`Certificate not found: ${id}`);
    }

    try {
      // Remove certificate files
      fs.unlinkSync(cert.certificatePath);
      fs.unlinkSync(cert.privateKeyPath);
      if (cert.chainPath && fs.existsSync(cert.chainPath)) {
        fs.unlinkSync(cert.chainPath);
      }

      // Remove from registry
      this.certificates.delete(id);

      this.logger.log(`Certificate deleted: ${cert.domain}`, 'SSLCertificateService', {
        certId: id,
        domain: cert.domain,
      });
    } catch (error) {
      const err = toError(error);
      this.logger.error(`Failed to delete certificate: ${id}`, err.stack, 'SSLCertificateService');
      throw err;
    }
  }

  getSSLConfig(): SSLConfig {
    return { ...this.config };
  }

  async updateSSLConfig(newConfig: Partial<SSLConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };

    this.logger.log('SSL configuration updated', 'SSLCertificateService', {
      enabled: this.config.enabled,
      autoRenew: this.config.autoRenew,
      domains: this.config.domains.length,
    });

    // Reinitialize if configuration changed significantly
    if (newConfig.enabled !== undefined || newConfig.domains !== undefined) {
      await this.initializeSSL();
    }
  }
}

type ParsedCertificate = {
  validFrom: string | null;
  validTo: string | null;
  subject: string;
  issuer: string;
};

function toParsedCertificate(cert: crypto.X509Certificate): ParsedCertificate {
  return {
    validFrom: cert.validFrom || null,
    validTo: cert.validTo || null,
    subject: cert.subject || 'Unknown',
    issuer: cert.issuer || 'Unknown',
  };
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(typeof error === 'string' ? error : 'Unknown error');
}
