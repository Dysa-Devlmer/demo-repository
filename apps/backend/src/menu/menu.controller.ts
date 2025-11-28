import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { MenuService } from "./menu.service";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";
import { RateLimit, RateLimitPresets } from "../common/decorators/rate-limit.decorator";
import { CacheInterceptor } from "../common/interceptors/cache.interceptor";
import { CacheKey, InvalidateCache } from "../common/decorators/cache-key.decorator";
import { CacheKeyBuilder, CacheTTL } from "../config/cache.config";

@ApiTags("menu")
@ApiBearerAuth("JWT")
@Controller("menu")
@UseGuards(RateLimitGuard)
@UseInterceptors(CacheInterceptor)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @ApiOperation({ summary: "Crear nuevo item de menú" })
  @ApiResponse({ status: 201, description: "Item creado exitosamente" })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  @RateLimit(RateLimitPresets.API_STRICT)
  @InvalidateCache(CacheKeyBuilder.menuPattern())
  create(@Body() dto: CreateMenuItemDto) {
    return this.menuService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "Obtener todos los items del menú" })
  @ApiResponse({ status: 200, description: "Lista de items del menú (cached 30min)" })
  @RateLimit({
    windowMs: 60 * 1000, // 60 seconds
    maxRequests: 100, // 100 requests per minute (development mode)
    blockDurationMs: 5 * 1000, // Block for 5 seconds only
  })
  @CacheKey(CacheKeyBuilder.menu(), CacheTTL.MENU_ITEMS)
  findAll() {
    return this.menuService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener item de menú por ID" })
  @ApiResponse({ status: 200, description: "Item encontrado (cached 30min)" })
  @ApiResponse({ status: 404, description: "Item no encontrado" })
  @CacheKey((req) => CacheKeyBuilder.menu(req.params.id), CacheTTL.MENU_ITEMS)
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Actualizar item de menú (completo)" })
  @ApiResponse({ status: 200, description: "Item actualizado exitosamente" })
  @ApiResponse({ status: 404, description: "Item no encontrado" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  @InvalidateCache(CacheKeyBuilder.menuPattern())
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.update(id, dto);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Actualizar item de menú (parcial)" })
  @ApiResponse({ status: 200, description: "Item actualizado exitosamente" })
  @ApiResponse({ status: 404, description: "Item no encontrado" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  @InvalidateCache(CacheKeyBuilder.menuPattern())
  partialUpdate(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.menuService.update(id, dto);
  }

  @Patch(":id/toggle-availability")
  @ApiOperation({ summary: "Cambiar disponibilidad de un item" })
  @ApiResponse({ status: 200, description: "Disponibilidad actualizada" })
  @ApiResponse({ status: 404, description: "Item no encontrado" })
  @InvalidateCache(CacheKeyBuilder.menuPattern())
  toggleAvailability(@Param("id", ParseIntPipe) id: number) {
    return this.menuService.toggleAvailability(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar item de menú (soft delete)" })
  @ApiResponse({ status: 200, description: "Item eliminado exitosamente" })
  @ApiResponse({ status: 404, description: "Item no encontrado" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  @InvalidateCache(CacheKeyBuilder.menuPattern())
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.menuService.remove(id);
  }

  // TODO: Implementar después de la migración de soft delete
  // @Patch(":id/restore")
  // @ApiOperation({ summary: "Restaurar item de menú eliminado" })
  // @ApiResponse({ status: 200, description: "Item restaurado exitosamente" })
  // @ApiResponse({ status: 404, description: "Item no encontrado" })
  // @InvalidateCache(CacheKeyBuilder.menuPattern())
  // restore(@Param("id", ParseIntPipe) id: number) {
  //   return this.menuService.restore(id);
  // }
}
