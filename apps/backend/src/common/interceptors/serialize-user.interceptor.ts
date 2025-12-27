import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../auth/entities/user.entity';

/**
 * Interceptor to serialize User entities, adding snake_case aliases
 * for frontend compatibility
 */
@Injectable()
export class SerializeUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (!data) return data;

        // Transform single user
        if (data instanceof User) {
          return this.transformUser(data);
        }

        // Transform array of users
        if (Array.isArray(data)) {
          return data.map((item): unknown =>
            item instanceof User ? this.transformUser(item) : this.transformNestedUsers(item)
          );
        }

        // Transform nested user in object
        if (isPlainObject(data) || Array.isArray(data)) {
          return this.transformNestedUsers(data);
        }

        return data;
      })
    );
  }

  private transformUser(user: User): Record<string, unknown> {
    const transformed: Record<string, unknown> = { ...user };

    // Remove sensitive fields before returning user data
    delete transformed.password;
    delete transformed.passwordResetToken;
    delete transformed.passwordResetExpires;
    delete transformed.emailVerificationToken;
    delete transformed.twoFactorSecret;
    delete transformed.twoFactorBackupCodes;

    // Add snake_case aliases
    if (user.firstName) {
      transformed['first_name'] = user.firstName;
    }
    if (user.lastName) {
      transformed['last_name'] = user.lastName;
    }
    if (user.createdAt) {
      transformed['created_at'] = user.createdAt;
    }
    if (user.updatedAt) {
      transformed['updated_at'] = user.updatedAt;
    }
    if (user.firstName && user.lastName) {
      transformed['fullName'] = `${user.firstName} ${user.lastName}`;
      transformed['full_name'] = `${user.firstName} ${user.lastName}`;
    }

    return transformed;
  }

  private transformNestedUsers(obj: unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map((item) => {
        if (item instanceof User) {
          return this.transformUser(item);
        }

        return this.transformNestedUsers(item);
      });
    }

    if (!isPlainObject(obj)) {
      return obj;
    }

    const transformed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value instanceof User) {
        transformed[key] = this.transformUser(value);
      } else {
        transformed[key] = this.transformNestedUsers(value);
      }
    }

    return transformed;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return Object.getPrototypeOf(value) === Object.prototype;
}
