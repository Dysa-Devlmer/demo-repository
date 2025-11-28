import { SetMetadata } from "@nestjs/common";

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  blockDurationMs?: number; // How long to block after limit exceeded
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata("rateLimit", options);

// Common rate limit presets for enterprise use
export const RateLimitPresets = {
  // Authentication endpoints - stricter limits
  LOGIN: {
    windowMs: process.env.NODE_ENV === 'development' ? 60 * 1000 : 15 * 60 * 1000, // Dev: 1 min, Prod: 15 min
    maxRequests: process.env.NODE_ENV === 'development' ? 50 : 5, // Dev: 50 attempts, Prod: 5 attempts
    blockDurationMs: process.env.NODE_ENV === 'development' ? 5 * 1000 : 30 * 60 * 1000, // Dev: 5 sec block, Prod: 30 min block
  },

  // Password reset - very strict
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // Only 3 password reset attempts per hour
    blockDurationMs: 60 * 60 * 1000, // Block for 1 hour
  },

  // API endpoints - moderate limits
  API_STRICT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute (1 per second)
  },

  API_STANDARD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },

  API_MODERATE: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120, // 120 requests per minute (2 per second)
  },

  API_RELAXED: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 300, // 300 requests per minute (5 per second)
  },

  // File operations - stricter due to resource usage
  FILE_UPLOAD: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 uploads per minute
    blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
  },

  // Export operations - very limited
  EXPORT: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10, // 10 exports per hour
  },

  // Bulk operations - heavily limited
  BULK_OPERATION: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 bulk operations per hour
  },

  // Real-time endpoints - high frequency allowed
  REALTIME: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 600, // 600 requests per minute (10 per second)
  },

  // Public endpoints - moderate protection
  PUBLIC: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
  },
};
