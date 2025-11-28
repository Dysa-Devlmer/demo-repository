import { SetMetadata } from "@nestjs/common";

export const RequireRoles = (...roles: string[]) => SetMetadata("roles", roles);

// Common role constants for easy reuse
// ✅ Updated to match database roles (seeded via SQL)
export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  STAFF: "staff",
  USER: "user",
};
