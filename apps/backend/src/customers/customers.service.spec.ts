import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CustomersService - Unit Tests', () => {
  let service: CustomersService;
  let repository: Repository<Customer>;

  const mockCustomer: Partial<Customer> = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    preferences: { language: 'es', notifications: true },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
    repository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return array of customers', async () => {
      const customers = [mockCustomer, { ...mockCustomer, id: 2, email: 'jane@example.com' }];
      mockRepository.find.mockResolvedValue(customers);

      const result = await service.findAll();

      expect(result).toEqual(customers);
      expect(mockRepository.find).toHaveBeenCalled();
    });

    it('should return empty array when no customers exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a customer by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCustomer);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['reservations'],
      });
    });

    it('should throw NotFoundException when customer not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new customer', async () => {
      const createDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+0987654321',
      };

      mockRepository.save.mockResolvedValue({ ...createDto, id: 2 });

      const result = await service.create(createDto);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(createDto.email);
    });
  });

  describe('update', () => {
    it('should update and return the customer', async () => {
      const updateDto = { name: 'John Updated' };
      const updatedCustomer = { ...mockCustomer, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockCustomer);
      mockRepository.save.mockResolvedValue(updatedCustomer);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['reservations']
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.name).toBe('John Updated');
    });

    it('should throw NotFoundException when updating non-existent customer', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a customer', async () => {
      mockRepository.findOne.mockResolvedValue(mockCustomer);
      mockRepository.remove.mockResolvedValue(mockCustomer);

      await service.remove(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['reservations']
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(mockCustomer);
    });

    it('should throw NotFoundException when deleting non-existent customer', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

});
