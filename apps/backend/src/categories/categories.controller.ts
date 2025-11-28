import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * POST /api/categories
   * Crea una nueva categoría
   * Requiere: menu.create o categories.create
   */
  @Post()
  @RequirePermissions('menu.create', 'categories.create')
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoriesService.create(createCategoryDto);
  }

  /**
   * GET /api/categories
   * Obtiene todas las categorías activas
   * Requiere: menu.read o categories.read
   */
  @Get()
  @RequirePermissions('menu.read', 'categories.read')
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const includeInactiveFlag = includeInactive === 'true';
    return await this.categoriesService.findAll(includeInactiveFlag);
  }

  /**
   * GET /api/categories/:id
   * Obtiene una categoría por ID
   * Requiere: menu.read o categories.read
   */
  @Get(':id')
  @RequirePermissions('menu.read', 'categories.read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.findOne(id);
  }

  /**
   * GET /api/categories/slug/:slug
   * Obtiene una categoría por slug
   * Requiere: menu.read o categories.read
   */
  @Get('slug/:slug')
  @RequirePermissions('menu.read', 'categories.read')
  async findBySlug(@Param('slug') slug: string) {
    return await this.categoriesService.findBySlug(slug);
  }

  /**
   * PUT /api/categories/:id
   * Actualiza una categoría (reemplazo completo)
   * Requiere: menu.update o categories.update
   */
  @Put(':id')
  @RequirePermissions('menu.update', 'categories.update')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * PATCH /api/categories/:id
   * Actualiza parcialmente una categoría
   * Requiere: menu.update o categories.update
   */
  @Patch(':id')
  @RequirePermissions('menu.update', 'categories.update')
  async partialUpdate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * DELETE /api/categories/:id
   * Elimina una categoría (soft delete si tiene items asociados)
   * Requiere: menu.delete o categories.delete
   */
  @Delete(':id')
  @RequirePermissions('menu.delete', 'categories.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.categoriesService.remove(id);
  }

  /**
   * POST /api/categories/:id/toggle
   * Activa/Desactiva una categoría
   * Requiere: menu.update o categories.update
   */
  @Post(':id/toggle')
  @RequirePermissions('menu.update', 'categories.update')
  async toggleActive(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.toggleActive(id);
  }

  /**
   * PATCH /api/categories/reorder
   * Actualiza el orden de visualización de múltiples categorías
   * Requiere: menu.update o categories.manage
   */
  @Patch('reorder')
  @RequirePermissions('menu.update', 'categories.manage')
  async updateDisplayOrder(
    @Body() orderUpdates: Array<{ id: number; display_order: number }>,
  ) {
    return await this.categoriesService.updateDisplayOrder(orderUpdates);
  }
}
