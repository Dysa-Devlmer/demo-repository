import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Delete,
  Patch,
  Put,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, UpdateUserRolesDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequireRoles, ROLES } from '../auth/decorators/roles.decorator';
import { RequirePermissions, PERMISSIONS } from '../auth/decorators/permissions.decorator';
import { SerializeUserInterceptor } from '../common/interceptors/serialize-user.interceptor';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@UseInterceptors(SerializeUserInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@Request() req) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.usersService.findById(userId);
  }

  @Patch('me')
  async updateCurrentUser(
    @Request() req,
    @Body() body: { firstName?: string; lastName?: string; phone?: string }
  ) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.usersService.updateProfile(userId, body);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: 'Upload user avatar',
    description:
      'Upload a new avatar image for the authenticated user. Accepts JPG, PNG, GIF. Max size: 5MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Avatar image file',
    schema: {
      type: 'object',
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'Avatar image file (JPG, PNG, GIF, max 5MB)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    schema: {
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        avatarUrl: { type: 'string', description: 'URL of the uploaded avatar' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  async uploadAvatar(@Request() req, @UploadedFile() file: Express.Multer.File) {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in request');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPG, PNG, GIF, and WebP are allowed');
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Guardar archivo físicamente
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');

    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generar nombre único para el archivo
    const fileName = `${userId}_${Date.now()}_${file.originalname}`;
    const filePath = path.join(uploadDir, fileName);

    // Guardar archivo
    fs.writeFileSync(filePath, file.buffer);

    // URL para acceder al avatar
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Actualizar base de datos
    await this.usersService.updateAvatar(userId, avatarUrl);

    return {
      success: true,
      message: 'Avatar subido exitosamente',
      data: {
        avatarUrl,
      },
    };
  }

  @Get()
  @RequirePermissions(PERMISSIONS.USERS_READ)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @RequirePermissions(PERMISSIONS.USERS_READ)
  async findById(@Param('id') id: number) {
    return this.usersService.findById(id);
  }

  @Post()
  @RequirePermissions(PERMISSIONS.USERS_CREATE)
  async create(@Body() body: { email: string; password: string; role?: 'user' | 'admin' }) {
    return this.usersService.create(body.email, body.password, body.role);
  }

  @Patch(':id/role')
  @RequirePermissions(PERMISSIONS.USERS_UPDATE)
  async updateRole(@Param('id') id: number, @Body() body: { role: 'user' | 'admin' }) {
    return this.usersService.updateRole(id, body.role);
  }

  @Put(':id')
  @RequirePermissions(PERMISSIONS.USERS_UPDATE)
  @ApiOperation({
    summary: 'Update user information',
    description: 'Update user profile information including name, email, phone, and status',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid data' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Put(':id/roles')
  @RequirePermissions(PERMISSIONS.USERS_UPDATE)
  @ApiOperation({
    summary: 'Update user roles',
    description: 'Assign or update roles for a specific user',
  })
  @ApiResponse({ status: 200, description: 'User roles updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid role IDs' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateRoles(@Param('id') id: number, @Body() updateUserRolesDto: UpdateUserRolesDto) {
    return this.usersService.updateUserRoles(id, updateUserRolesDto.roleIds || []);
  }

  @Delete(':id')
  @RequirePermissions(PERMISSIONS.USERS_DELETE)
  async delete(@Param('id') id: number) {
    return this.usersService.delete(id);
  }
}
