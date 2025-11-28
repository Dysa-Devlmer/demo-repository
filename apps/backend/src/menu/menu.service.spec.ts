import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuItem, MenuCategory, DietaryType } from '../entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

describe('MenuService - Unit Tests', () => {
  let service: MenuService;
  let menuRepo: Repository<MenuItem>;

  const mockMenuItem: Partial<MenuItem> = {
    id: 1,
    name: 'Paella Valenciana',
    description: 'Arroz con pollo, conejo y verduras del día',
    price: 18.50,
    category: MenuCategory.MAIN_COURSE,
    dietary_type: DietaryType.REGULAR,
    image: 'https://example.com/paella.jpg',
    ingredients: ['arroz', 'pollo', 'conejo', 'verduras'],
    allergens: ['gluten'],
    preparationTime: 30,
    available: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockMenuItem2: Partial<MenuItem> = {
    id: 2,
    name: 'Ensalada César',
    description: 'Lechuga romana, crutones, parmesano',
    price: 9.50,
    category: MenuCategory.APPETIZER,
    dietary_type: DietaryType.VEGETARIAN,
    image: 'https://example.com/ensalada.jpg',
    ingredients: ['lechuga', 'crutones', 'parmesano', 'aderezo'],
    allergens: ['gluten', 'lácteos'],
    preparationTime: 10,
    available: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getRepositoryToken(MenuItem),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
    menuRepo = module.get<Repository<MenuItem>>(getRepositoryToken(MenuItem));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have menu repository injected', () => {
      expect(menuRepo).toBeDefined();
    });
  });

  describe('create', () => {
    const createMenuItemDto: CreateMenuItemDto = {
      name: 'Paella Valenciana',
      description: 'Arroz con pollo, conejo y verduras del día',
      price: 18.50,
      category: MenuCategory.MAIN_COURSE,
      dietary_type: DietaryType.REGULAR,
      image: 'https://example.com/paella.jpg',
      ingredients: ['arroz', 'pollo', 'conejo', 'verduras'],
      allergens: ['gluten'],
      preparationTime: 30,
      available: true,
    };

    it('should create a menu item successfully', async () => {
      jest.spyOn(menuRepo, 'create').mockReturnValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(mockMenuItem as MenuItem);

      const result = await service.create(createMenuItemDto);

      expect(result).toEqual(mockMenuItem);
      expect(menuRepo.create).toHaveBeenCalledWith(createMenuItemDto);
      expect(menuRepo.save).toHaveBeenCalledWith(mockMenuItem);
    });

    it('should create main course item', async () => {
      jest.spyOn(menuRepo, 'create').mockReturnValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(mockMenuItem as MenuItem);

      const result = await service.create(createMenuItemDto);

      expect(result.category).toBe(MenuCategory.MAIN_COURSE);
    });

    it('should create appetizer item', async () => {
      const appetizerDto = { ...createMenuItemDto, category: MenuCategory.APPETIZER };
      const appetizerItem = { ...mockMenuItem, category: MenuCategory.APPETIZER };

      jest.spyOn(menuRepo, 'create').mockReturnValue(appetizerItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(appetizerItem as MenuItem);

      const result = await service.create(appetizerDto);

      expect(result.category).toBe(MenuCategory.APPETIZER);
    });

    it('should create dessert item', async () => {
      const dessertDto = { ...createMenuItemDto, category: MenuCategory.DESSERT };
      const dessertItem = { ...mockMenuItem, category: MenuCategory.DESSERT };

      jest.spyOn(menuRepo, 'create').mockReturnValue(dessertItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(dessertItem as MenuItem);

      const result = await service.create(dessertDto);

      expect(result.category).toBe(MenuCategory.DESSERT);
    });

    it('should create beverage item', async () => {
      const beverageDto = { ...createMenuItemDto, category: MenuCategory.BEVERAGE };
      const beverageItem = { ...mockMenuItem, category: MenuCategory.BEVERAGE };

      jest.spyOn(menuRepo, 'create').mockReturnValue(beverageItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(beverageItem as MenuItem);

      const result = await service.create(beverageDto);

      expect(result.category).toBe(MenuCategory.BEVERAGE);
    });

    it('should create vegetarian item', async () => {
      const vegDto = { ...createMenuItemDto, dietary_type: DietaryType.VEGETARIAN };
      const vegItem = { ...mockMenuItem, dietary_type: DietaryType.VEGETARIAN };

      jest.spyOn(menuRepo, 'create').mockReturnValue(vegItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(vegItem as MenuItem);

      const result = await service.create(vegDto);

      expect(result.dietary_type).toBe(DietaryType.VEGETARIAN);
    });

    it('should create vegan item', async () => {
      const veganDto = { ...createMenuItemDto, dietary_type: DietaryType.VEGAN };
      const veganItem = { ...mockMenuItem, dietary_type: DietaryType.VEGAN };

      jest.spyOn(menuRepo, 'create').mockReturnValue(veganItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(veganItem as MenuItem);

      const result = await service.create(veganDto);

      expect(result.dietary_type).toBe(DietaryType.VEGAN);
    });

    it('should create gluten-free item', async () => {
      const gfDto = { ...createMenuItemDto, dietary_type: DietaryType.GLUTEN_FREE };
      const gfItem = { ...mockMenuItem, dietary_type: DietaryType.GLUTEN_FREE };

      jest.spyOn(menuRepo, 'create').mockReturnValue(gfItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(gfItem as MenuItem);

      const result = await service.create(gfDto);

      expect(result.dietary_type).toBe(DietaryType.GLUTEN_FREE);
    });

    it('should create keto item', async () => {
      const ketoDto = { ...createMenuItemDto, dietary_type: DietaryType.KETO };
      const ketoItem = { ...mockMenuItem, dietary_type: DietaryType.KETO };

      jest.spyOn(menuRepo, 'create').mockReturnValue(ketoItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(ketoItem as MenuItem);

      const result = await service.create(ketoDto);

      expect(result.dietary_type).toBe(DietaryType.KETO);
    });

    it('should handle ingredients array', async () => {
      jest.spyOn(menuRepo, 'create').mockReturnValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(mockMenuItem as MenuItem);

      const result = await service.create(createMenuItemDto);

      expect(result.ingredients).toEqual(['arroz', 'pollo', 'conejo', 'verduras']);
    });

    it('should handle allergens array', async () => {
      jest.spyOn(menuRepo, 'create').mockReturnValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(mockMenuItem as MenuItem);

      const result = await service.create(createMenuItemDto);

      expect(result.allergens).toEqual(['gluten']);
    });

    it('should set preparation time', async () => {
      jest.spyOn(menuRepo, 'create').mockReturnValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(mockMenuItem as MenuItem);

      const result = await service.create(createMenuItemDto);

      expect(result.preparationTime).toBe(30);
    });

    it('should set available flag', async () => {
      jest.spyOn(menuRepo, 'create').mockReturnValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(mockMenuItem as MenuItem);

      const result = await service.create(createMenuItemDto);

      expect(result.available).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should return all menu items', async () => {
      const mockItems = [mockMenuItem, mockMenuItem2];
      jest.spyOn(menuRepo, 'find').mockResolvedValue(mockItems as MenuItem[]);

      const result = await service.findAll();

      expect(result).toEqual(mockItems);
      expect(result).toHaveLength(2);
      expect(menuRepo.find).toHaveBeenCalled();
    });

    it('should return empty array when no items', async () => {
      jest.spyOn(menuRepo, 'find').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return items with different categories', async () => {
      const mockItems = [mockMenuItem, mockMenuItem2];
      jest.spyOn(menuRepo, 'find').mockResolvedValue(mockItems as MenuItem[]);

      const result = await service.findAll();

      expect(result[0].category).toBe(MenuCategory.MAIN_COURSE);
      expect(result[1].category).toBe(MenuCategory.APPETIZER);
    });
  });

  describe('findOne', () => {
    it('should return menu item by id', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);

      const result = await service.findOne(1);

      expect(result).toEqual(mockMenuItem);
      expect(menuRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when item not found', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException('Menu item with ID 999 not found'),
      );
    });

    it('should return item with all properties', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);

      const result = await service.findOne(1);

      expect(result.name).toBe('Paella Valenciana');
      expect(result.price).toBe(18.50);
      expect(result.category).toBe(MenuCategory.MAIN_COURSE);
      expect(result.available).toBe(true);
    });
  });

  describe('update', () => {
    const updateMenuItemDto: UpdateMenuItemDto = {
      name: 'Paella Valenciana Premium',
      price: 22.00,
      description: 'Paella con mariscos frescos',
      available: true,
    };

    it('should update menu item successfully', async () => {
      const updatedItem = { ...mockMenuItem, ...updateMenuItemDto };
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(updatedItem as MenuItem);

      const result = await service.update(1, updateMenuItemDto);

      expect(result.name).toBe('Paella Valenciana Premium');
      expect(result.price).toBe(22.00);
      expect(menuRepo.save).toHaveBeenCalled();
    });

    it('should update name', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...mockMenuItem,
        name: 'Nuevo Nombre',
      } as MenuItem);

      const result = await service.update(1, { name: 'Nuevo Nombre' });

      expect(result.name).toBe('Nuevo Nombre');
    });

    it('should update price', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...mockMenuItem,
        price: 25.00,
      } as MenuItem);

      const result = await service.update(1, { price: 25.00 });

      expect(result.price).toBe(25.00);
    });

    it('should update description', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...mockMenuItem,
        description: 'Nueva descripción',
      } as MenuItem);

      const result = await service.update(1, { description: 'Nueva descripción' });

      expect(result.description).toBe('Nueva descripción');
    });

    it('should update category', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...mockMenuItem,
        category: MenuCategory.SPECIAL,
      } as MenuItem);

      const result = await service.update(1, { category: MenuCategory.SPECIAL });

      expect(result.category).toBe(MenuCategory.SPECIAL);
    });

    it('should update dietary type', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...mockMenuItem,
        dietary_type: DietaryType.VEGAN,
      } as MenuItem);

      const result = await service.update(1, { dietary_type: DietaryType.VEGAN });

      expect(result.dietary_type).toBe(DietaryType.VEGAN);
    });

    it('should update availability to false', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...mockMenuItem,
        available: false,
      } as MenuItem);

      const result = await service.update(1, { available: false });

      expect(result.available).toBe(false);
    });

    it('should update availability to true', async () => {
      const unavailableItem = { ...mockMenuItem, available: false };
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(unavailableItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...unavailableItem,
        available: true,
      } as MenuItem);

      const result = await service.update(1, { available: true });

      expect(result.available).toBe(true);
    });

    it('should update ingredients', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...mockMenuItem,
        ingredients: ['arroz', 'mariscos', 'verduras'],
      } as MenuItem);

      const result = await service.update(1, {
        ingredients: ['arroz', 'mariscos', 'verduras'],
      });

      expect(result.ingredients).toEqual(['arroz', 'mariscos', 'verduras']);
    });

    it('should update allergens', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...mockMenuItem,
        allergens: ['mariscos', 'gluten'],
      } as MenuItem);

      const result = await service.update(1, { allergens: ['mariscos', 'gluten'] });

      expect(result.allergens).toEqual(['mariscos', 'gluten']);
    });

    it('should update preparation time', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...mockMenuItem,
        preparationTime: 45,
      } as MenuItem);

      const result = await service.update(1, { preparationTime: 45 });

      expect(result.preparationTime).toBe(45);
    });

    it('should update multiple fields at once', async () => {
      const multiUpdateDto: UpdateMenuItemDto = {
        name: 'Paella de Mariscos',
        price: 28.50,
        description: 'Con langostinos, mejillones y calamares',
        available: true,
      };

      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue({
        ...mockMenuItem,
        ...multiUpdateDto,
      } as MenuItem);

      const result = await service.update(1, multiUpdateDto);

      expect(result.name).toBe('Paella de Mariscos');
      expect(result.price).toBe(28.50);
      expect(result.description).toBe('Con langostinos, mejillones y calamares');
    });

    it('should throw NotFoundException when item not found', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(null);

      await expect(service.update(999, updateMenuItemDto)).rejects.toThrow(
        new NotFoundException('Menu item with ID 999 not found'),
      );
    });
  });

  describe('remove', () => {
    it('should remove menu item successfully', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(mockMenuItem as MenuItem);
      jest.spyOn(menuRepo, 'remove').mockResolvedValue(mockMenuItem as MenuItem);

      await service.remove(1);

      expect(menuRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(menuRepo.remove).toHaveBeenCalledWith(mockMenuItem);
    });

    it('should throw NotFoundException when item not found', async () => {
      jest.spyOn(menuRepo, 'findOne').mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException('Menu item with ID 999 not found'),
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle item with minimal data', async () => {
      const minimalItem: Partial<MenuItem> = {
        id: 3,
        name: 'Agua',
        price: 1.50,
        category: MenuCategory.BEVERAGE,
        dietary_type: DietaryType.REGULAR,
        available: true,
      };

      const minimalDto: CreateMenuItemDto = {
        name: 'Agua',
        price: 1.50,
        category: MenuCategory.BEVERAGE,
        dietary_type: DietaryType.REGULAR,
        available: true,
      };

      jest.spyOn(menuRepo, 'create').mockReturnValue(minimalItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(minimalItem as MenuItem);

      const result = await service.create(minimalDto);

      expect(result.name).toBe('Agua');
      expect(result.price).toBe(1.50);
    });

    it('should handle item with many allergens', async () => {
      const allergyItem: Partial<MenuItem> = {
        ...mockMenuItem,
        allergens: ['gluten', 'lácteos', 'huevo', 'nueces', 'mariscos'],
      };

      jest.spyOn(menuRepo, 'create').mockReturnValue(allergyItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(allergyItem as MenuItem);

      const result = await service.create({
        ...mockMenuItem,
        allergens: ['gluten', 'lácteos', 'huevo', 'nueces', 'mariscos'],
      } as CreateMenuItemDto);

      expect(result.allergens).toHaveLength(5);
    });

    it('should handle very high preparation time', async () => {
      const slowItem: Partial<MenuItem> = {
        ...mockMenuItem,
        preparationTime: 120, // 2 hours
      };

      jest.spyOn(menuRepo, 'create').mockReturnValue(slowItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(slowItem as MenuItem);

      const result = await service.create({
        ...mockMenuItem,
        preparationTime: 120,
      } as CreateMenuItemDto);

      expect(result.preparationTime).toBe(120);
    });

    it('should handle decimal prices with cents', async () => {
      const decimalItem: Partial<MenuItem> = {
        ...mockMenuItem,
        price: 12.99,
      };

      jest.spyOn(menuRepo, 'create').mockReturnValue(decimalItem as MenuItem);
      jest.spyOn(menuRepo, 'save').mockResolvedValue(decimalItem as MenuItem);

      const result = await service.create({
        ...mockMenuItem,
        price: 12.99,
      } as CreateMenuItemDto);

      expect(result.price).toBe(12.99);
    });
  });
});
