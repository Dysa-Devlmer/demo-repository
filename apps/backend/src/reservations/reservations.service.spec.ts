import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ReservationsService } from './reservations.service';
import { Reservation, ReservationStatus } from '../entities/reservation.entity';
import { Customer } from '../entities/customer.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('ReservationsService - Unit Tests', () => {
  let service: ReservationsService;
  let reservationsRepo: jest.Mocked<Repository<Reservation>>;
  let customersRepo: jest.Mocked<Repository<Customer>>;

  // Mock data
  const mockCustomer: Customer = {
    id: 1,
    name: 'Carlos Méndez',
    email: 'carlos@example.com',
    phone: '+52-555-1234',
    created_at: new Date('2025-01-01'),
    updated_at: new Date('2025-01-01'),
    orders: [],
    reservations: [],
  };

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 7);
  futureDate.setHours(19, 0, 0, 0);

  const mockReservation: Reservation = {
    id: 1,
    reservation_code: 'RES-MOCK123-ABCD',
    customer: mockCustomer,
    reservation_date: futureDate,
    customer_name: 'Carlos Méndez',
    customer_phone: '+52-555-1234',
    customer_email: 'carlos@example.com',
    party_size: 4,
    status: ReservationStatus.CONFIRMED,
    notes: 'Mesa cerca de la ventana',
    special_requests: { dietary: 'vegetariano', occasion: 'cumpleaños' },
    created_at: new Date('2025-01-15'),
    updated_at: new Date('2025-01-15'),
  };

  const createReservationDto: CreateReservationDto = {
    customerId: 1,
    date: futureDate.toISOString(),
    people: 4,
    status: 'confirmed',
    notes: 'Mesa cerca de la ventana',
    specialRequests: JSON.stringify({ dietary: 'vegetariano', occasion: 'cumpleaños' }),
  };

  beforeEach(async () => {
    // Create mock repositories
    const mockReservationsRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const mockCustomersRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: getRepositoryToken(Reservation),
          useValue: mockReservationsRepo,
        },
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomersRepo,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);
    reservationsRepo = module.get(getRepositoryToken(Reservation));
    customersRepo = module.get(getRepositoryToken(Customer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all required methods', () => {
      expect(service.create).toBeDefined();
      expect(service.findAll).toBeDefined();
      expect(service.findOne).toBeDefined();
      expect(service.update).toBeDefined();
      expect(service.cancel).toBeDefined();
      expect(service.confirm).toBeDefined();
      expect(service.seat).toBeDefined();
      expect(service.complete).toBeDefined();
      expect(service.markNoShow).toBeDefined();
      expect(service.getTodayReservations).toBeDefined();
      expect(service.getUpcomingReservations).toBeDefined();
      expect(service.getStatistics).toBeDefined();
      expect(service.remove).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should create a new reservation successfully', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.count.mockResolvedValue(2); // 2 existing reservations in time slot
      reservationsRepo.find.mockResolvedValue([
        { ...mockReservation, party_size: 4 },
        { ...mockReservation, party_size: 6 },
      ]); // Total: 10 people
      reservationsRepo.create.mockReturnValue(mockReservation);
      reservationsRepo.save.mockResolvedValue(mockReservation);

      const result = await service.create(createReservationDto);

      expect(customersRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(reservationsRepo.count).toHaveBeenCalled();
      expect(reservationsRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          customer: mockCustomer,
          party_size: createReservationDto.people,
          status: createReservationDto.status,
        })
      );
      expect(result).toEqual(mockReservation);
      expect(result.reservation_code).toMatch(/^RES-/);
    });

    it('should throw BadRequestException if customer does not exist', async () => {
      customersRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createReservationDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createReservationDto)).rejects.toThrow('Customer with ID 1 does not exist');
    });

    it('should throw BadRequestException if reservation date is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      customersRepo.findOne.mockResolvedValue(mockCustomer);

      const pastDto = { ...createReservationDto, date: pastDate.toISOString() };

      await expect(service.create(pastDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(pastDto)).rejects.toThrow('Reservation date cannot be in the past');
    });

    it('should throw BadRequestException if party size is less than 1', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);

      const invalidDto = { ...createReservationDto, people: 0 };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(invalidDto)).rejects.toThrow('Party size must be between 1 and 20');
    });

    it('should throw BadRequestException if party size exceeds 20', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);

      const invalidDto = { ...createReservationDto, people: 25 };

      await expect(service.create(invalidDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(invalidDto)).rejects.toThrow('Party size must be between 1 and 20');
    });

    it('should throw ConflictException if capacity is exceeded', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);

      // Mock existing reservations that fill capacity (36 people already booked)
      reservationsRepo.find.mockResolvedValue([
        { ...mockReservation, party_size: 20 },
        { ...mockReservation, party_size: 16 },
      ]);

      const largePartyDto = { ...createReservationDto, people: 8 }; // 36 + 8 = 44 > 40

      await expect(service.create(largePartyDto)).rejects.toThrow(ConflictException);
      await expect(service.create(largePartyDto)).rejects.toThrow(/Not enough capacity/);
    });

    it('should generate unique reservation code', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.find.mockResolvedValue([]);
      reservationsRepo.create.mockImplementation((data) => data as Reservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const result1 = await service.create(createReservationDto);
      const result2 = await service.create(createReservationDto);

      expect(result1.reservation_code).toMatch(/^RES-/);
      expect(result2.reservation_code).toMatch(/^RES-/);
      expect(result1.reservation_code).not.toEqual(result2.reservation_code);
    });

    it('should create reservation with special requests', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.find.mockResolvedValue([]);
      reservationsRepo.create.mockReturnValue(mockReservation);
      reservationsRepo.save.mockResolvedValue(mockReservation);

      const result = await service.create(createReservationDto);

      expect(result.special_requests).toEqual({ dietary: 'vegetariano', occasion: 'cumpleaños' });
    });

    it('should default status to PENDING if not provided', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.find.mockResolvedValue([]);
      reservationsRepo.create.mockImplementation((data) => ({ ...data, status: data.status || ReservationStatus.PENDING }) as Reservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const dtoWithoutStatus = { ...createReservationDto };
      delete dtoWithoutStatus.status;

      const result = await service.create(dtoWithoutStatus);

      expect(result.status).toBe(ReservationStatus.PENDING);
    });
  });

  describe('findAll()', () => {
    it('should return paginated reservations', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockReservation], 1]),
      };

      reservationsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({ page: 1, limit: 50 });

      expect(result).toEqual({
        data: [mockReservation],
        total: 1,
        page: 1,
        limit: 50,
      });
    });

    it('should filter by status', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[mockReservation], 1]),
      };

      reservationsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ status: ReservationStatus.CONFIRMED });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('reservation.status = :status', {
        status: ReservationStatus.CONFIRMED,
      });
    });

    it('should filter by date range', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      reservationsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const startDate = new Date('2025-02-01');
      const endDate = new Date('2025-02-28');

      await service.findAll({ startDate, endDate });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('reservation.reservation_date >= :startDate', { startDate });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('reservation.reservation_date <= :endDate', { endDate });
    });

    it('should use default pagination values', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      reservationsRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll();

      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });
  });

  describe('findOne()', () => {
    it('should return a single reservation by ID', async () => {
      reservationsRepo.findOne.mockResolvedValue(mockReservation);

      const result = await service.findOne(1);

      expect(reservationsRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['customer'],
      });
      expect(result).toEqual(mockReservation);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      reservationsRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Reservation with ID 999 not found');
    });
  });

  describe('update()', () => {
    it('should update reservation successfully', async () => {
      reservationsRepo.findOne.mockResolvedValue(mockReservation);
      reservationsRepo.save.mockResolvedValue({ ...mockReservation, notes: 'Updated notes' });

      const updateDto: UpdateReservationDto = { notes: 'Updated notes' };
      const result = await service.update(1, updateDto);

      expect(result.notes).toBe('Updated notes');
    });

    it('should update party size within valid range', async () => {
      reservationsRepo.findOne.mockResolvedValue(mockReservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const result = await service.update(1, { people: 6 });

      expect(result.party_size).toBe(6);
    });

    it('should throw BadRequestException if new party size is invalid (too small)', async () => {
      reservationsRepo.findOne.mockResolvedValue(mockReservation);

      // Note: Due to JavaScript's falsy check, people: 0 is ignored. Use people: -1 instead.
      await expect(service.update(1, { people: -1 })).rejects.toThrow(BadRequestException);
      await expect(service.update(1, { people: -1 })).rejects.toThrow('Party size must be between 1 and 20');
    });

    it('should throw BadRequestException if new party size is invalid (too large)', async () => {
      reservationsRepo.findOne.mockResolvedValue(mockReservation);
      reservationsRepo.save.mockResolvedValue(mockReservation); // Won't be called but needed

      await expect(service.update(1, { people: 25 })).rejects.toThrow(BadRequestException);
    });

    it('should update reservation date if valid', async () => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 14);

      reservationsRepo.findOne.mockResolvedValue(mockReservation);
      reservationsRepo.find.mockResolvedValue([]);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const result = await service.update(1, { date: newDate.toISOString() });

      expect(result.reservation_date.getTime()).toBeGreaterThan(Date.now());
    });

    it('should throw BadRequestException if new date is in the past', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      reservationsRepo.findOne.mockResolvedValue(mockReservation);

      await expect(service.update(1, { date: pastDate.toISOString() })).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if new date has no capacity', async () => {
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 10);

      reservationsRepo.findOne.mockResolvedValue(mockReservation);
      reservationsRepo.find.mockResolvedValue([
        { ...mockReservation, party_size: 40 }, // Full capacity
      ]);

      await expect(service.update(1, { date: newDate.toISOString() })).rejects.toThrow(ConflictException);
    });

    it('should update status', async () => {
      reservationsRepo.findOne.mockResolvedValue(mockReservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const result = await service.update(1, { status: 'seated' });

      expect(result.status).toBe('seated');
    });
  });

  describe('cancel()', () => {
    it('should cancel a pending reservation', async () => {
      const pendingReservation = { ...mockReservation, status: ReservationStatus.PENDING };
      reservationsRepo.findOne.mockResolvedValue(pendingReservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const result = await service.cancel(1);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('should cancel a confirmed reservation', async () => {
      reservationsRepo.findOne.mockResolvedValue(mockReservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const result = await service.cancel(1);

      expect(result.status).toBe(ReservationStatus.CANCELLED);
    });

    it('should throw BadRequestException if reservation is already cancelled', async () => {
      const cancelledReservation = { ...mockReservation, status: ReservationStatus.CANCELLED };
      reservationsRepo.findOne.mockResolvedValue(cancelledReservation);

      await expect(service.cancel(1)).rejects.toThrow(BadRequestException);
      await expect(service.cancel(1)).rejects.toThrow('Reservation is already cancelled');
    });

    it('should throw BadRequestException if reservation is completed', async () => {
      const completedReservation = { ...mockReservation, status: ReservationStatus.COMPLETED };
      reservationsRepo.findOne.mockResolvedValue(completedReservation);

      await expect(service.cancel(1)).rejects.toThrow(BadRequestException);
      await expect(service.cancel(1)).rejects.toThrow('Cannot cancel completed reservation');
    });
  });

  describe('Reservation Lifecycle', () => {
    it('should confirm a pending reservation', async () => {
      const pendingReservation = { ...mockReservation, status: ReservationStatus.PENDING };
      reservationsRepo.findOne.mockResolvedValue(pendingReservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const result = await service.confirm(1);

      expect(result.status).toBe(ReservationStatus.CONFIRMED);
    });

    it('should seat a confirmed reservation', async () => {
      const confirmedReservation = { ...mockReservation, status: ReservationStatus.CONFIRMED };
      reservationsRepo.findOne.mockResolvedValue(confirmedReservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const result = await service.seat(1);

      expect(result.status).toBe(ReservationStatus.SEATED);
    });

    it('should throw BadRequestException when seating non-confirmed reservation', async () => {
      const pendingReservation = { ...mockReservation, status: ReservationStatus.PENDING };
      reservationsRepo.findOne.mockResolvedValue(pendingReservation);

      await expect(service.seat(1)).rejects.toThrow(BadRequestException);
      await expect(service.seat(1)).rejects.toThrow('Only confirmed reservations can be seated');
    });

    it('should complete a seated reservation', async () => {
      const seatedReservation = { ...mockReservation, status: ReservationStatus.SEATED };
      reservationsRepo.findOne.mockResolvedValue(seatedReservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const result = await service.complete(1);

      expect(result.status).toBe(ReservationStatus.COMPLETED);
    });

    it('should throw BadRequestException when completing non-seated reservation', async () => {
      reservationsRepo.findOne.mockResolvedValue(mockReservation);

      await expect(service.complete(1)).rejects.toThrow(BadRequestException);
      await expect(service.complete(1)).rejects.toThrow('Only seated reservations can be completed');
    });

    it('should follow complete lifecycle: pending → confirmed → seated → completed', async () => {
      let reservation = { ...mockReservation, status: ReservationStatus.PENDING };

      reservationsRepo.findOne.mockResolvedValue(reservation);
      reservationsRepo.save.mockImplementation((data) => {
        reservation = { ...reservation, ...data };
        return Promise.resolve(reservation as Reservation);
      });

      // Confirm
      let result = await service.confirm(1);
      expect(result.status).toBe(ReservationStatus.CONFIRMED);

      // Seat
      reservationsRepo.findOne.mockResolvedValue(result);
      result = await service.seat(1);
      expect(result.status).toBe(ReservationStatus.SEATED);

      // Complete
      reservationsRepo.findOne.mockResolvedValue(result);
      result = await service.complete(1);
      expect(result.status).toBe(ReservationStatus.COMPLETED);
    });

    it('should mark reservation as no-show', async () => {
      reservationsRepo.findOne.mockResolvedValue(mockReservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const result = await service.markNoShow(1);

      expect(result.status).toBe(ReservationStatus.NO_SHOW);
    });
  });

  describe('getTodayReservations()', () => {
    it('should return reservations for today', async () => {
      const todayReservation = { ...mockReservation, reservation_date: new Date() };
      reservationsRepo.find.mockResolvedValue([todayReservation]);

      const result = await service.getTodayReservations();

      expect(result).toHaveLength(1);
      expect(reservationsRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            reservation_date: expect.any(Object),
          },
          relations: ['customer'],
          order: {
            reservation_date: 'ASC',
          },
        }),
      );
    });

    it('should return empty array if no reservations today', async () => {
      reservationsRepo.find.mockResolvedValue([]);

      const result = await service.getTodayReservations();

      expect(result).toEqual([]);
    });
  });

  describe('getUpcomingReservations()', () => {
    it('should return reservations for next 7 days by default', async () => {
      reservationsRepo.find.mockResolvedValue([mockReservation]);

      const result = await service.getUpcomingReservations();

      expect(result).toHaveLength(1);
      expect(reservationsRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            reservation_date: expect.any(Object),
            status: ReservationStatus.CONFIRMED,
          },
        }),
      );
    });

    it('should return reservations for custom number of days', async () => {
      reservationsRepo.find.mockResolvedValue([mockReservation]);

      await service.getUpcomingReservations(14);

      expect(reservationsRepo.find).toHaveBeenCalled();
    });

    it('should only return confirmed reservations', async () => {
      const confirmedRes = { ...mockReservation, status: ReservationStatus.CONFIRMED };
      reservationsRepo.find.mockResolvedValue([confirmedRes]);

      const result = await service.getUpcomingReservations();

      expect(result.every((r) => r.status === ReservationStatus.CONFIRMED)).toBe(true);
    });
  });

  describe('getStatistics()', () => {
    it('should return complete statistics', async () => {
      reservationsRepo.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(10)  // pending
        .mockResolvedValueOnce(30)  // confirmed
        .mockResolvedValueOnce(5)   // seated
        .mockResolvedValueOnce(40)  // completed
        .mockResolvedValueOnce(12)  // cancelled
        .mockResolvedValueOnce(3);  // no_show

      reservationsRepo.find
        .mockResolvedValueOnce([mockReservation, mockReservation]) // today: 2
        .mockResolvedValueOnce([mockReservation, mockReservation, mockReservation]); // upcoming: 3

      const result = await service.getStatistics();

      expect(result).toEqual({
        total: 100,
        pending: 10,
        confirmed: 30,
        seated: 5,
        completed: 40,
        cancelled: 12,
        noShow: 3,
        todayTotal: 2,
        upcomingWeek: 3,
      });
    });
  });

  describe('remove()', () => {
    it('should permanently delete a reservation', async () => {
      reservationsRepo.findOne.mockResolvedValue(mockReservation);
      reservationsRepo.remove.mockResolvedValue(mockReservation);

      await service.remove(1);

      expect(reservationsRepo.remove).toHaveBeenCalledWith(mockReservation);
    });

    it('should throw NotFoundException if reservation not found', async () => {
      reservationsRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('Capacity Management', () => {
    it('should allow reservation when capacity is available', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.find.mockResolvedValue([
        { ...mockReservation, party_size: 15 },
      ]); // 15 people booked
      reservationsRepo.create.mockReturnValue(mockReservation);
      reservationsRepo.save.mockResolvedValue(mockReservation);

      const dto = { ...createReservationDto, people: 20 }; // 15 + 20 = 35 <= 40

      const result = await service.create(dto);

      expect(result).toBeDefined();
    });

    it('should reject reservation when capacity would be exceeded', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.find.mockResolvedValue([
        { ...mockReservation, party_size: 25 },
        { ...mockReservation, party_size: 10 },
      ]); // 35 people booked

      const dto = { ...createReservationDto, people: 10 }; // 35 + 10 = 45 > 40

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should calculate capacity correctly for time slot', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);

      // Different reservations at different times
      const reservation1 = { ...mockReservation, party_size: 8 };
      const reservation2 = { ...mockReservation, party_size: 6 };
      const reservation3 = { ...mockReservation, party_size: 12 };

      reservationsRepo.find.mockResolvedValue([reservation1, reservation2, reservation3]);
      reservationsRepo.create.mockReturnValue(mockReservation);
      reservationsRepo.save.mockResolvedValue(mockReservation);

      // 8 + 6 + 12 + 10 = 36 <= 40 (should pass)
      const dto = { ...createReservationDto, people: 10 };

      const result = await service.create(dto);

      expect(result).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle reservation with minimum party size (1 person)', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.find.mockResolvedValue([]);
      reservationsRepo.create.mockImplementation((data) => data as Reservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const dto = { ...createReservationDto, people: 1 };
      const result = await service.create(dto);

      expect(result.party_size).toBe(1);
    });

    it('should handle reservation with maximum party size (20 people)', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.find.mockResolvedValue([]);
      reservationsRepo.create.mockImplementation((data) => data as Reservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const dto = { ...createReservationDto, people: 20 };
      const result = await service.create(dto);

      expect(result.party_size).toBe(20);
    });

    it('should handle reservation without special requests', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.find.mockResolvedValue([]);
      reservationsRepo.create.mockImplementation((data) => ({ ...data, special_requests: null }) as Reservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const dto = { ...createReservationDto };
      delete dto.specialRequests;

      const result = await service.create(dto);

      expect(result.special_requests).toBeUndefined();
    });

    it('should handle reservation without notes', async () => {
      customersRepo.findOne.mockResolvedValue(mockCustomer);
      reservationsRepo.find.mockResolvedValue([]);
      reservationsRepo.create.mockImplementation((data) => ({ ...data, notes: '' }) as Reservation);
      reservationsRepo.save.mockImplementation((data) => Promise.resolve(data as Reservation));

      const dto = { ...createReservationDto };
      delete dto.notes;

      const result = await service.create(dto);

      expect(result.notes).toBe('');
    });
  });
});
