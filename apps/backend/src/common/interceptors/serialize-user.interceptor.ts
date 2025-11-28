import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../auth/entities/user.entity';

/**
 * Interceptor to serialize User entities, adding snake_case aliases
 * for frontend compatibility
 */
@Injectable()
export class SerializeUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (!data) return data;

        // Transform single user
        if (data instanceof User) {
          return this.transformUser(data);
        }

        // Transform array of users
        if (Array.isArray(data)) {
          return data.map((item) =>
            item instanceof User ? this.transformUser(item) : item
          );
        }

        // Transform nested user in object
        if (typeof data === 'object') {
          return this.transformNestedUsers(data);
        }

        return data;
      })
    );
  }

  private transformUser(user: User): any {
    const transformed = { ...user };

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

  private transformNestedUsers(obj: any): any {
    const transformed = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (obj[key] instanceof User) {
        transformed[key] = this.transformUser(obj[key]);
      } else if (Array.isArray(obj[key])) {
        transformed[key] = obj[key].map((item: any) =>
          item instanceof User ? this.transformUser(item) : this.transformNestedUsers(item)
        );
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        transformed[key] = this.transformNestedUsers(obj[key]);
      } else {
        transformed[key] = obj[key];
      }
    }

    return transformed;
  }
}
