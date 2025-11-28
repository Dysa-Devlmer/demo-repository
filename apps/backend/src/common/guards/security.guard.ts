import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class SecurityGuard implements CanActivate {
  private readonly suspiciousPatterns = [
    // SQL Injection patterns
    /(\b(union|select|insert|delete|update|drop|create|alter|exec|execute)\b)/i,
    /('(''|[^'])*')/i,
    /(;|\||&|\$|\*|--)/,

    // XSS patterns
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,

    // Path traversal
    /\.\.\//g,
    /\.\.\\/g,

    // Command injection
    /(\||&|;|\$|\`)/,
    /(nc |netcat |wget |curl )/gi,

    // NoSQL injection
    /(\$where|\$ne|\$in|\$nin|\$gt|\$lt|\$gte|\$lte)/gi,
  ];

  private readonly blockedUserAgents = [
    /bot|crawler|spider|scraper/i,
    /postman|insomnia|curl|wget/i, // Block testing tools in production
    /sqlmap|havij|pangolin/i, // SQL injection tools
    /nikto|nessus|openvas/i, // Vulnerability scanners
  ];

  private readonly maxHeaderLength = 8192; // 8KB max header length
  private readonly maxHeaderCount = 50;
  private readonly maxUrlLength = 2048;
  private readonly maxBodySize = 10 * 1024 * 1024; // 10MB

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip security checks for health check endpoints
    if (request.path === "/health" || request.path === "/api/health") {
      return true;
    }

    // Check request size limits
    this.checkRequestLimits(request);

    // Check for suspicious patterns
    this.checkSuspiciousPatterns(request);

    // Check User-Agent
    this.checkUserAgent(request);

    // Check HTTP headers
    this.checkHeaders(request);

    // Check for common attack vectors
    this.checkAttackVectors(request);

    return true;
  }

  private checkRequestLimits(request: Request): void {
    // Check URL length
    if (request.url.length > this.maxUrlLength) {
      throw new BadRequestException("Request URL too long");
    }

    // Check header count
    const headerCount = Object.keys(request.headers).length;
    if (headerCount > this.maxHeaderCount) {
      throw new BadRequestException("Too many headers");
    }

    // Check header lengths
    for (const [key, value] of Object.entries(request.headers)) {
      const headerLength =
        key.length +
        (Array.isArray(value) ? value.join("").length : value?.length || 0);
      if (headerLength > this.maxHeaderLength) {
        throw new BadRequestException(`Header ${key} too long`);
      }
    }
  }

  private checkSuspiciousPatterns(request: Request): void {
    const toCheck = [
      request.url,
      request.path,
      ...Object.values(request.query || {}),
      ...Object.values(request.params || {}),
    ].filter((value) => typeof value === "string");

    for (const value of toCheck) {
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(value)) {
          throw new ForbiddenException(
            `Suspicious pattern detected: ${pattern}`,
          );
        }
      }
    }

    // Check body for POST/PUT requests
    if (request.body && typeof request.body === "object") {
      const bodyString = JSON.stringify(request.body);
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(bodyString)) {
          throw new ForbiddenException(
            `Suspicious pattern in request body: ${pattern}`,
          );
        }
      }
    }
  }

  private checkUserAgent(request: Request): void {
    const userAgent = request.get("user-agent") || "";

    // Check for blocked user agents (in production mode)
    if (process.env.NODE_ENV === "production") {
      for (const pattern of this.blockedUserAgents) {
        if (pattern.test(userAgent)) {
          throw new ForbiddenException("Blocked user agent");
        }
      }
    }

    // Check for suspicious characteristics
    if (userAgent.length > 500) {
      throw new BadRequestException("User agent too long");
    }

    if (!userAgent && process.env.NODE_ENV === "production") {
      throw new BadRequestException("User agent required");
    }
  }

  private checkHeaders(request: Request): void {
    const headers = request.headers;

    // Check for suspicious headers
    const suspiciousHeaders = ["x-forwarded-host", "x-original-host"];
    for (const header of suspiciousHeaders) {
      if (headers[header] && process.env.NODE_ENV === "production") {
        throw new ForbiddenException(`Suspicious header: ${header}`);
      }
    }

    // Check Content-Type for POST/PUT requests
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      const contentType = headers["content-type"];
      if (!contentType) {
        throw new BadRequestException("Content-Type header required");
      }

      // Only allow specific content types
      const allowedTypes = [
        "application/json",
        "application/x-www-form-urlencoded",
        "multipart/form-data",
        "text/plain",
      ];

      const isAllowed = allowedTypes.some((type) => contentType.includes(type));
      if (!isAllowed) {
        throw new BadRequestException(
          `Content-Type not allowed: ${contentType}`,
        );
      }
    }

    // Check for host header injection
    const host = headers.host;
    if (host && process.env.ALLOWED_HOSTS) {
      const allowedHosts = process.env.ALLOWED_HOSTS.split(",");
      if (!allowedHosts.includes(host)) {
        throw new ForbiddenException("Host not allowed");
      }
    }
  }

  private checkAttackVectors(request: Request): void {
    // Check for common path traversal attempts
    const suspiciousPaths = [
      "/etc/passwd",
      "/proc/version",
      "/.env",
      "/config.json",
      "/.git",
      "/admin",
      "/phpmyadmin",
      "/wp-admin",
      "/.well-known",
    ];

    for (const suspiciousPath of suspiciousPaths) {
      if (request.path.includes(suspiciousPath)) {
        throw new ForbiddenException(`Access to ${suspiciousPath} not allowed`);
      }
    }

    // Check for suspicious query parameters
    const suspiciousParams = [
      "eval",
      "exec",
      "system",
      "shell_exec",
      "passthru",
    ];
    for (const param of suspiciousParams) {
      if (request.query[param] !== undefined) {
        throw new ForbiddenException(`Suspicious parameter: ${param}`);
      }
    }

    // Check for null bytes (often used in path traversal)
    const urlDecoded = decodeURIComponent(request.url);
    if (urlDecoded.includes("\0") || urlDecoded.includes("%00")) {
      throw new ForbiddenException("Null byte detected");
    }
  }
}
