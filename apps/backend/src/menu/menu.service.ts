import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MenuItem } from "../entities/menu-item.entity";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuRepo: Repository<MenuItem>,
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
    return items.map(item => ({
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
    const item = await this.findOne(id);
    Object.assign(item, dto);
    return this.menuRepo.save(item);
  }

  async toggleAvailability(id: number): Promise<MenuItem> {
    const item = await this.findOne(id);
    item.available = !item.available;
    return this.menuRepo.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
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
