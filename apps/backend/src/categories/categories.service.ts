import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>
  ) {}

  /**
   * Crea una nueva categoría
   */
  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    // Verificar que no exista una categoría con el mismo nombre o slug
    const existingByName = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name },
    });

    if (existingByName) {
      throw new ConflictException(
        `Ya existe una categoría con el nombre "${createCategoryDto.name}"`
      );
    }

    const existingBySlug = await this.categoryRepository.findOne({
      where: { slug: createCategoryDto.slug },
    });

    if (existingBySlug) {
      throw new ConflictException(
        `Ya existe una categoría con el slug "${createCategoryDto.slug}"`
      );
    }

    const category = this.categoryRepository.create(createCategoryDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * Obtiene todas las categorías (incluyendo inactivas si se especifica)
   */
  async findAll(includeInactive: boolean = false): Promise<Category[]> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.menu_items', 'menu_items')
      .orderBy('category.display_order', 'ASC');

    if (!includeInactive) {
      query.where('category.is_active = :isActive', { isActive: true });
    }

    return await query.getMany();
  }

  /**
   * Obtiene una categoría por ID
   */
  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['menu_items'],
    });

    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    return category;
  }

  /**
   * Obtiene una categoría por slug
   */
  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['menu_items'],
    });

    if (!category) {
      throw new NotFoundException(`Categoría con slug "${slug}" no encontrada`);
    }

    return category;
  }

  /**
   * Actualiza una categoría
   */
  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);

    // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existingByName = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name },
      });

      if (existingByName && existingByName.id !== id) {
        throw new ConflictException(
          `Ya existe una categoría con el nombre "${updateCategoryDto.name}"`
        );
      }
    }

    // Si se está actualizando el slug, verificar que no exista otro con ese slug
    if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
      const existingBySlug = await this.categoryRepository.findOne({
        where: { slug: updateCategoryDto.slug },
      });

      if (existingBySlug && existingBySlug.id !== id) {
        throw new ConflictException(
          `Ya existe una categoría con el slug "${updateCategoryDto.slug}"`
        );
      }
    }

    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  /**
   * Elimina una categoría (soft delete - marca como inactiva)
   */
  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);

    // Verificar si la categoría tiene items del menú asociados
    const itemCount = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.menu_items', 'menu_items')
      .where('category.id = :id', { id })
      .select('COUNT(menu_items.id)', 'count')
      .getRawOne();

    if (itemCount && parseInt(itemCount.count) > 0) {
      // Si tiene items, solo marcar como inactiva (soft delete)
      category.is_active = false;
      await this.categoryRepository.save(category);
    } else {
      // Si no tiene items, eliminar permanentemente
      await this.categoryRepository.remove(category);
    }
  }

  /**
   * Elimina permanentemente una categoría (hard delete)
   * ADVERTENCIA: Esto establecerá category_id en NULL para todos los items asociados
   */
  async hardDelete(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }

  /**
   * Activa/Desactiva una categoría
   */
  async toggleActive(id: number): Promise<Category> {
    const category = await this.findOne(id);
    category.is_active = !category.is_active;
    return await this.categoryRepository.save(category);
  }

  /**
   * Actualiza el orden de visualización de múltiples categorías
   */
  async updateDisplayOrder(
    orderUpdates: Array<{ id: number; display_order: number }>
  ): Promise<Category[]> {
    const categories = await Promise.all(
      orderUpdates.map(async (update) => {
        const category = await this.findOne(update.id);
        category.display_order = update.display_order;
        return await this.categoryRepository.save(category);
      })
    );

    return categories;
  }
}
