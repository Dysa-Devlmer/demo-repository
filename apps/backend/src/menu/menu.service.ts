import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from '../entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepo: Repository<MenuItem>
  ) {}

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const item = this.menuRepo.create(dto);
    return this.menuRepo.save(item);
  }

  async findAll(): Promise<any[]> {
    // Cargar relación con categorías reales
    const items = await this.menuRepo.find({
      relations: ['category_ref'],
    });

    // Transformar datos para usar nombres reales de categorías
    return items.map((item) => ({
      ...item,
      category: item.category_ref?.name || item.category || 'Sin categoría',
    }));
  }

  async findOne(id: number): Promise<any> {
    // Cargar relación con categorías reales
    const item = await this.menuRepo.findOne({
      where: { id },
      relations: ['category_ref'],
    });

    if (!item) throw new NotFoundException(`Menu item with ID ${id} not found`);

    // Transformar datos para usar nombre real de categoría
    return {
      ...item,
      category: item.category_ref?.name || item.category || 'Sin categoría',
    };
  }

  async update(id: number, dto: UpdateMenuItemDto): Promise<MenuItem> {
    // Obtener el item original de la base de datos (sin transformar)
    const item = await this.menuRepo.findOne({
      where: { id },
      relations: ['category_ref'],
    });

    if (!item) throw new NotFoundException(`Menu item with ID ${id} not found`);

    // Crear una copia del DTO sin el campo 'category' si no es un valor válido del enum
    // Esto evita sobrescribir el enum con nombres transformados (ej: "Entradas")
    const safeDto = { ...dto };

    // Valores válidos del enum MenuCategory
    const validCategories = ['appetizer', 'main_course', 'dessert', 'beverage', 'special'];

    // Si category no es un valor válido del enum, removerlo del DTO
    if (safeDto.category && !validCategories.includes(safeDto.category as string)) {
      delete safeDto.category;
    }

    Object.assign(item, safeDto);
    return this.menuRepo.save(item);
  }

  async toggleAvailability(id: number): Promise<MenuItem> {
    // Obtener item directamente del repo (sin transformar) para evitar problemas con el enum
    const item = await this.menuRepo.findOne({
      where: { id },
    });

    if (!item) throw new NotFoundException(`Menu item with ID ${id} not found`);

    item.available = !item.available;
    return this.menuRepo.save(item);
  }

  async remove(id: number): Promise<void> {
    // Obtener item directamente del repo para evitar problemas con datos transformados
    const item = await this.menuRepo.findOne({
      where: { id },
    });

    if (!item) throw new NotFoundException(`Menu item with ID ${id} not found`);

    // Hard delete por ahora (TODO: cambiar a soft delete después de migración)
    await this.menuRepo.remove(item);
  }

  // TODO: Implementar después de la migración de soft delete
  // async restore(id: number): Promise<MenuItem> {
  //   const item = await this.menuRepo.findOne({
  //     where: { id },
  //     withDeleted: true
  //   });
  //   if (!item) throw new NotFoundException(`Menu item with ID ${id} not found`);
  //   return this.menuRepo.recover(item);
  // }
}
