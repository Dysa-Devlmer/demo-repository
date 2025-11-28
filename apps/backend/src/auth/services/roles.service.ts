import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "../entities/role.entity";
import {
  Permission,
  PermissionModule,
  PermissionAction,
} from "../entities/permission.entity";
import { User } from "../entities/user.entity";
import { ROLES } from "../decorators/roles.decorator";
import { PERMISSIONS } from "../decorators/permissions.decorator";

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    // Initialize default roles and permissions on startup
    await this.initializeDefaultRolesAndPermissions();
  }

  async initializeDefaultRolesAndPermissions(): Promise<void> {
    // Create default permissions if they don't exist
    await this.createDefaultPermissions();

    // Create default roles if they don't exist
    await this.createDefaultRoles();

    // Assign permissions to roles
    await this.assignPermissionsToRoles();
  }

  private async createDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      // Dashboard
      {
        name: PERMISSIONS.DASHBOARD_READ,
        displayName: "Ver Dashboard",
        module: PermissionModule.DASHBOARD,
        action: PermissionAction.READ,
      },

      // Customers
      {
        name: PERMISSIONS.CUSTOMERS_READ,
        displayName: "Ver Clientes",
        module: PermissionModule.CUSTOMERS,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.CUSTOMERS_CREATE,
        displayName: "Crear Clientes",
        module: PermissionModule.CUSTOMERS,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.CUSTOMERS_UPDATE,
        displayName: "Actualizar Clientes",
        module: PermissionModule.CUSTOMERS,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.CUSTOMERS_DELETE,
        displayName: "Eliminar Clientes",
        module: PermissionModule.CUSTOMERS,
        action: PermissionAction.DELETE,
      },
      {
        name: PERMISSIONS.CUSTOMERS_EXPORT,
        displayName: "Exportar Clientes",
        module: PermissionModule.CUSTOMERS,
        action: PermissionAction.EXPORT,
      },

      // Orders
      {
        name: PERMISSIONS.ORDERS_READ,
        displayName: "Ver Órdenes",
        module: PermissionModule.ORDERS,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.ORDERS_CREATE,
        displayName: "Crear Órdenes",
        module: PermissionModule.ORDERS,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.ORDERS_UPDATE,
        displayName: "Actualizar Órdenes",
        module: PermissionModule.ORDERS,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.ORDERS_DELETE,
        displayName: "Eliminar Órdenes",
        module: PermissionModule.ORDERS,
        action: PermissionAction.DELETE,
      },

      // Menu
      {
        name: PERMISSIONS.MENU_READ,
        displayName: "Ver Menú",
        module: PermissionModule.MENU,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.MENU_CREATE,
        displayName: "Crear Items Menú",
        module: PermissionModule.MENU,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.MENU_UPDATE,
        displayName: "Actualizar Menú",
        module: PermissionModule.MENU,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.MENU_DELETE,
        displayName: "Eliminar Items Menú",
        module: PermissionModule.MENU,
        action: PermissionAction.DELETE,
      },
      // TODO: Add MENU_MANAGE permission
      // {
      //   name: PERMISSIONS.MENU_MANAGE,
      //   displayName: "Gestionar Menú",
      //   module: PermissionModule.MENU,
      //   action: PermissionAction.MANAGE,
      // },

      // Reservations
      {
        name: PERMISSIONS.RESERVATIONS_READ,
        displayName: "Ver Reservas",
        module: PermissionModule.RESERVATIONS,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.RESERVATIONS_CREATE,
        displayName: "Crear Reservas",
        module: PermissionModule.RESERVATIONS,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.RESERVATIONS_UPDATE,
        displayName: "Actualizar Reservas",
        module: PermissionModule.RESERVATIONS,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.RESERVATIONS_DELETE,
        displayName: "Eliminar Reservas",
        module: PermissionModule.RESERVATIONS,
        action: PermissionAction.DELETE,
      },

      // Users & Roles
      {
        name: PERMISSIONS.USERS_READ,
        displayName: "Ver Usuarios",
        module: PermissionModule.USERS,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.USERS_CREATE,
        displayName: "Crear Usuarios",
        module: PermissionModule.USERS,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.USERS_UPDATE,
        displayName: "Actualizar Usuarios",
        module: PermissionModule.USERS,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.USERS_DELETE,
        displayName: "Eliminar Usuarios",
        module: PermissionModule.USERS,
        action: PermissionAction.DELETE,
      },

      {
        name: PERMISSIONS.ROLES_READ,
        displayName: "Ver Roles",
        module: PermissionModule.ROLES,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.ROLES_CREATE,
        displayName: "Crear Roles",
        module: PermissionModule.ROLES,
        action: PermissionAction.CREATE,
      },
      {
        name: PERMISSIONS.ROLES_UPDATE,
        displayName: "Actualizar Roles",
        module: PermissionModule.ROLES,
        action: PermissionAction.UPDATE,
      },
      {
        name: PERMISSIONS.ROLES_DELETE,
        displayName: "Eliminar Roles",
        module: PermissionModule.ROLES,
        action: PermissionAction.DELETE,
      },
      // TODO: Add ROLES_MANAGE permission
      // {
      //   name: PERMISSIONS.ROLES_MANAGE,
      //   displayName: "Gestionar Roles",
      //   module: PermissionModule.ROLES,
      //   action: PermissionAction.MANAGE,
      // },

      // Settings
      {
        name: PERMISSIONS.SETTINGS_READ,
        displayName: "Ver Configuración",
        module: PermissionModule.SETTINGS,
        action: PermissionAction.READ,
      },
      {
        name: PERMISSIONS.SETTINGS_UPDATE,
        displayName: "Actualizar Configuración",
        module: PermissionModule.SETTINGS,
        action: PermissionAction.UPDATE,
      },
      // TODO: Add SETTINGS_MANAGE permission
      // {
      //   name: PERMISSIONS.SETTINGS_MANAGE,
      //   displayName: "Gestionar Sistema",
      //   module: PermissionModule.SETTINGS,
      //   action: PermissionAction.MANAGE,
      // },

      // Audit
      {
        name: PERMISSIONS.AUDIT_READ,
        displayName: "Ver Auditoría",
        module: PermissionModule.AUDIT,
        action: PermissionAction.READ,
      },
      // TODO: Add AUDIT_EXPORT permission
      // {
      //   name: PERMISSIONS.AUDIT_EXPORT,
      //   displayName: "Exportar Auditoría",
      //   module: PermissionModule.AUDIT,
      //   action: PermissionAction.EXPORT,
      // },

      // System
      // TODO: Add SYSTEM_BACKUP and SYSTEM_RESTORE permissions
      // {
      //   name: PERMISSIONS.SYSTEM_BACKUP,
      //   displayName: "Crear Respaldos",
      //   module: PermissionModule.SYSTEM,
      //   action: PermissionAction.CREATE,
      // },
      // {
      //   name: PERMISSIONS.SYSTEM_RESTORE,
      //   displayName: "Restaurar Sistema",
      //   module: PermissionModule.SYSTEM,
      //   action: PermissionAction.UPDATE,
      // },
      {
        name: PERMISSIONS.SYSTEM_MANAGE,
        displayName: "Gestionar Sistema",
        module: PermissionModule.SYSTEM,
        action: PermissionAction.MANAGE,
      },
    ];

    for (const permissionData of defaultPermissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = this.permissionRepository.create({
          ...permissionData,
          isSystem: true,
        });
        await this.permissionRepository.save(permission);
      }
    }
  }

  private async createDefaultRoles(): Promise<void> {
    const defaultRoles = [
      // TODO: Add SUPER_ADMIN role
      // {
      //   name: ROLES.SUPER_ADMIN,
      //   displayName: "Super Administrador",
      //   description: "Acceso completo a todas las funcionalidades del sistema",
      //   isSystem: true,
      // },
      {
        name: ROLES.ADMIN,
        displayName: "Administrador",
        description: "Acceso administrativo con permisos limitados de sistema",
        isSystem: true,
      },
      {
        name: ROLES.MANAGER,
        displayName: "Gerente",
        description: "Gestión de operaciones del restaurante y reportes",
        isSystem: true,
      },
      {
        name: ROLES.STAFF,
        displayName: "Personal",
        description: "Acceso básico para operaciones diarias",
        isSystem: true,
      },
      {
        name: ROLES.USER,
        displayName: "Usuario",
        description: "Usuario final con acceso limitado",
        isSystem: true,
      },
      // TODO: Add EMPLOYEE role
      // {
      //   name: ROLES.EMPLOYEE,
      //   displayName: "Empleado",
      //   description: "Acceso básico para operaciones diarias",
      //   isSystem: true,
      // },
      // TODO: Add CUSTOMER_SERVICE role
      // {
      //   name: ROLES.CUSTOMER_SERVICE,
      //   displayName: "Atención al Cliente",
      //   description: "Gestión de clientes, reservas y órdenes",
      //   isSystem: true,
      // },
      // TODO: Add VIEWER role
      // {
      //   name: ROLES.VIEWER,
      //   displayName: "Solo Lectura",
      //   description: "Acceso de solo lectura para consultas y reportes",
      //   isSystem: true,
      // },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.roleRepository.create(roleData);
        await this.roleRepository.save(role);
      }
    }
  }

  private async assignPermissionsToRoles(): Promise<void> {
    // TODO: Uncomment when SUPER_ADMIN role is added
    // // Super Admin - All permissions
    // const superAdminRole = await this.roleRepository.findOne({
    //   where: { name: ROLES.SUPER_ADMIN },
    //   relations: ["permissions"],
    // });

    // if (superAdminRole) {
    //   const allPermissions = await this.permissionRepository.find();
    //   superAdminRole.permissions = allPermissions;
    //   await this.roleRepository.save(superAdminRole);
    // }

    // Admin - Most permissions except system-critical ones
    const adminRole = await this.roleRepository.findOne({
      where: { name: ROLES.ADMIN },
      relations: ["permissions"],
    });

    if (adminRole && adminRole.permissions.length === 0) {
      const adminPermissions = await this.permissionRepository.find({
        where: [
          { module: PermissionModule.DASHBOARD },
          { module: PermissionModule.CUSTOMERS },
          { module: PermissionModule.ORDERS },
          { module: PermissionModule.MENU },
          { module: PermissionModule.RESERVATIONS },
          { module: PermissionModule.CONVERSATIONS },
          { module: PermissionModule.USERS },
          { module: PermissionModule.ROLES },
          { module: PermissionModule.SETTINGS },
          { module: PermissionModule.AUDIT, action: PermissionAction.READ },
          { module: PermissionModule.REPORTS },
        ],
      });
      adminRole.permissions = adminPermissions;
      await this.roleRepository.save(adminRole);
    }

    // Manager - Business operations focused
    const managerRole = await this.roleRepository.findOne({
      where: { name: ROLES.MANAGER },
      relations: ["permissions"],
    });

    if (managerRole && managerRole.permissions.length === 0) {
      const managerPermissions = await this.permissionRepository.find({
        where: [
          { module: PermissionModule.DASHBOARD },
          { module: PermissionModule.CUSTOMERS },
          { module: PermissionModule.ORDERS },
          { module: PermissionModule.MENU },
          { module: PermissionModule.RESERVATIONS },
          { module: PermissionModule.REPORTS },
        ],
      });
      managerRole.permissions = managerPermissions;
      await this.roleRepository.save(managerRole);
    }

    // TODO: Uncomment when CUSTOMER_SERVICE role is added
    // // Customer Service - Customer focused
    // const customerServiceRole = await this.roleRepository.findOne({
    //   where: { name: ROLES.CUSTOMER_SERVICE },
    //   relations: ["permissions"],
    // });

    // if (customerServiceRole && customerServiceRole.permissions.length === 0) {
    //   const customerServicePermissions = await this.permissionRepository.find({
    //     where: [
    //       { name: PERMISSIONS.DASHBOARD_READ },
    //       { module: PermissionModule.CUSTOMERS },
    //       { module: PermissionModule.ORDERS, action: PermissionAction.READ },
    //       { module: PermissionModule.ORDERS, action: PermissionAction.CREATE },
    //       { module: PermissionModule.ORDERS, action: PermissionAction.UPDATE },
    //       { module: PermissionModule.RESERVATIONS },
    //       { module: PermissionModule.CONVERSATIONS },
    //     ],
    //   });
    //   customerServiceRole.permissions = customerServicePermissions;
    //   await this.roleRepository.save(customerServiceRole);
    // }

    // TODO: Uncomment when VIEWER role is added
    // // Viewer - Read-only access
    // const viewerRole = await this.roleRepository.findOne({
    //   where: { name: ROLES.VIEWER },
    //   relations: ["permissions"],
    // });

    // if (viewerRole && viewerRole.permissions.length === 0) {
    //   const viewerPermissions = await this.permissionRepository.find({
    //     where: { action: PermissionAction.READ },
    //   });
    //   viewerRole.permissions = viewerPermissions;
    //   await this.roleRepository.save(viewerRole);
    // }
  }

  async getAllRoles(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ["permissions"],
    });
  }

  async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      order: { module: "ASC", action: "ASC" },
    });
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["roles"],
    });

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException("Rol no encontrado");
    }

    if (!user.roles) {
      user.roles = [];
    }

    const hasRole = user.roles.some((r) => r.id === roleId);
    if (hasRole) {
      throw new BadRequestException("El usuario ya tiene este rol asignado");
    }

    user.roles.push(role);
    await this.userRepository.save(user);
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ["roles"],
    });

    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }

    user.roles = user.roles?.filter((role) => role.id !== roleId) || [];
    await this.userRepository.save(user);
  }
}
