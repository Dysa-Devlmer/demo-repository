import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";

@Controller("roles")
@UseGuards(JwtAuthGuard)
export class RolesController {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  @Get()
  async findAll() {
    const roles = await this.roleRepository.find({
      relations: ["permissions"],
    });

    return {
      success: true,
      data: roles,
      timestamp: new Date().toISOString(),
      path: "/api/roles",
    };
  }
}

@Controller("permissions")
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  @Get()
  async findAll() {
    const permissions = await this.permissionRepository.find();

    return {
      success: true,
      data: permissions,
      timestamp: new Date().toISOString(),
      path: "/api/permissions",
    };
  }
}
