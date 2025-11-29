import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, LessThan, MoreThan } from "typeorm";
import { Reservation, ReservationStatus } from "../entities/reservation.entity";
import { Customer } from "../entities/customer.entity";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";

@Injectable()
export class ReservationsService {
  private readonly logger = new Logger(ReservationsService.name);

  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepo: Repository<Reservation>,
    @InjectRepository(Customer)
    private readonly customersRepo: Repository<Customer>,
  ) {}

  /**
   * Create a new reservation with advanced validation and conflict detection
   */
  async create(dto: CreateReservationDto): Promise<Reservation> {
    // Validate customer exists
    const customer = await this.customersRepo.findOne({
      where: { id: dto.customerId },
    });
    if (!customer) {
      throw new BadRequestException(
        `Customer with ID ${dto.customerId} does not exist`,
      );
    }

    // Validate reservation date is not in the past
    // Parse the date string directly (YYYY-MM-DD format)
    const [year, month, day] = dto.date.split('-').map(Number);
    const reservationDateOnly = new Date(year, month - 1, day); // month is 0-indexed

    // Get today's date at midnight in local timezone
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Allow reservations for today and future dates
    if (reservationDateOnly.getTime() < todayDateOnly.getTime()) {
      throw new BadRequestException("Reservation date cannot be in the past");
    }

    // Validate party size
    if (dto.people < 1 || dto.people > 20) {
      throw new BadRequestException("Party size must be between 1 and 20");
    }

    // Use the date-only timestamp for storage and comparisons
    const reservationDate = reservationDateOnly;

    // Check for conflicts (same time slot +/- 30 minutes)
    const timeSlotStart = new Date(reservationDate.getTime() - 30 * 60000);
    const timeSlotEnd = new Date(reservationDate.getTime() + 30 * 60000);

    const conflictingReservations = await this.reservationsRepo.count({
      where: {
        reservation_date: Between(timeSlotStart, timeSlotEnd),
        status: ReservationStatus.CONFIRMED,
      },
    });

    // Calculate capacity (assuming max 40 people can be seated at once)
    const currentCapacity = await this.getCurrentCapacity(reservationDate);
    if (currentCapacity + dto.people > 40) {
      throw new ConflictException(
        `Not enough capacity for ${dto.people} people at this time. Current capacity: ${currentCapacity}/40`,
      );
    }

    // Generate unique reservation code
    const reservationCode = this.generateReservationCode();

    const reservation = new Reservation();
    reservation.customer = customer;
    reservation.reservation_code = reservationCode;
    reservation.reservation_date = reservationDate;
    reservation.customer_name = customer.name;
    reservation.customer_phone = customer.phone || "";
    reservation.customer_email = customer.email;
    reservation.party_size = dto.people;
    reservation.time = dto.time || undefined;
    reservation.section = dto.section || undefined;
    reservation.table_number = dto.table_number || undefined;
    reservation.occasion = dto.occasion || undefined;
    reservation.status = dto.status ?? ReservationStatus.PENDING;
    reservation.notes = dto.notes || "";
    reservation.special_requests = dto.special_requests || undefined;

    const saved = await this.reservationsRepo.save(reservation);

    this.logger.log(
      `Reservation ${reservationCode} created for ${customer.name} - ${dto.people} people on ${reservationDate.toISOString().split('T')[0]}`,
    );

    return saved;
  }

  /**
   * Find all reservations with pagination and filtering
   */
  async findAll(filters?: {
    status?: ReservationStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ data: Reservation[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const queryBuilder = this.reservationsRepo
      .createQueryBuilder("reservation")
      .leftJoinAndSelect("reservation.customer", "customer")
      .orderBy("reservation.reservation_date", "DESC");

    if (filters?.status) {
      queryBuilder.andWhere("reservation.status = :status", {
        status: filters.status,
      });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere("reservation.reservation_date >= :startDate", {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere("reservation.reservation_date <= :endDate", {
        endDate: filters.endDate,
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Find one reservation by ID
   */
  async findOne(id: number): Promise<Reservation> {
    const reservation = await this.reservationsRepo.findOne({
      where: { id },
      relations: ["customer"],
    });
    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }
    return reservation;
  }

  /**
   * Update reservation with validation
   */
  async update(id: number, dto: UpdateReservationDto): Promise<Reservation> {
    const reservation = await this.findOne(id);

    // If updating date, validate conflicts
    if (dto.date) {
      // Parse the new date
      const [year, month, day] = dto.date.split('-').map(Number);
      const newDateOnly = new Date(year, month - 1, day);

      // Get current reservation date at midnight
      const currentResDate = new Date(reservation.reservation_date);
      const currentDateOnly = new Date(currentResDate.getFullYear(), currentResDate.getMonth(), currentResDate.getDate());

      // Only validate and check capacity if the date is actually changing
      if (newDateOnly.getTime() !== currentDateOnly.getTime()) {
        // Get today's date at midnight
        const today = new Date();
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Only reject if new date is in the past (not today)
        if (newDateOnly.getTime() < todayDateOnly.getTime()) {
          throw new BadRequestException("Reservation date cannot be in the past");
        }

        const capacity = await this.getCurrentCapacity(newDateOnly);
        const partySize = dto.people || reservation.party_size;
        if (capacity + partySize > 40) {
          throw new ConflictException("Not enough capacity at this time");
        }

        reservation.reservation_date = newDateOnly;
      }
    }

    if (dto.people) {
      if (dto.people < 1 || dto.people > 20) {
        throw new BadRequestException("Party size must be between 1 and 20");
      }
      reservation.party_size = dto.people;
    }

    if (dto.status) {
      reservation.status = dto.status;
    }

    if (dto.notes !== undefined) {
      reservation.notes = dto.notes;
    }

    if (dto.special_requests !== undefined) {
      reservation.special_requests = dto.special_requests;
    }

    if (dto.time !== undefined) {
      reservation.time = dto.time;
    }

    if (dto.section !== undefined) {
      reservation.section = dto.section;
    }

    if (dto.table_number !== undefined) {
      reservation.table_number = dto.table_number;
    }

    if (dto.occasion !== undefined) {
      reservation.occasion = dto.occasion;
    }

    const updated = await this.reservationsRepo.save(reservation);

    this.logger.log(
      `Reservation ${reservation.reservation_code} updated - Status: ${updated.status}`,
    );

    return updated;
  }

  /**
   * Cancel reservation (soft delete)
   */
  async cancel(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status === ReservationStatus.COMPLETED) {
      throw new BadRequestException("Cannot cancel completed reservation");
    }

    if (reservation.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException("Reservation is already cancelled");
    }

    reservation.status = ReservationStatus.CANCELLED;
    const cancelled = await this.reservationsRepo.save(reservation);

    this.logger.log(`Reservation ${reservation.reservation_code} cancelled`);

    return cancelled;
  }

  /**
   * Mark as no-show
   */
  async markNoShow(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);
    reservation.status = ReservationStatus.NO_SHOW;
    return this.reservationsRepo.save(reservation);
  }

  /**
   * Confirm reservation
   */
  async confirm(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);
    reservation.status = ReservationStatus.CONFIRMED;

    this.logger.log(`Reservation ${reservation.reservation_code} confirmed`);

    return this.reservationsRepo.save(reservation);
  }

  /**
   * Seat customers (mark as seated)
   */
  async seat(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException(
        "Only confirmed reservations can be seated",
      );
    }

    reservation.status = ReservationStatus.SEATED;
    return this.reservationsRepo.save(reservation);
  }

  /**
   * Complete reservation
   */
  async complete(id: number): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.SEATED) {
      throw new BadRequestException("Only seated reservations can be completed");
    }

    reservation.status = ReservationStatus.COMPLETED;
    return this.reservationsRepo.save(reservation);
  }

  /**
   * Get today's reservations
   */
  async getTodayReservations(): Promise<Reservation[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.reservationsRepo.find({
      where: {
        reservation_date: Between(startOfDay, endOfDay),
      },
      relations: ["customer"],
      order: {
        reservation_date: "ASC",
      },
    });
  }

  /**
   * Get upcoming reservations
   */
  async getUpcomingReservations(days: number = 7): Promise<Reservation[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.reservationsRepo.find({
      where: {
        reservation_date: Between(now, futureDate),
        status: ReservationStatus.CONFIRMED,
      },
      relations: ["customer"],
      order: {
        reservation_date: "ASC",
      },
    });
  }

  /**
   * Get statistics
   */
  async getStatistics(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    seated: number;
    completed: number;
    cancelled: number;
    noShow: number;
    todayTotal: number;
    upcomingWeek: number;
  }> {
    const [total, pending, confirmed, seated, completed, cancelled, noShow] = await Promise.all([
      this.reservationsRepo.count(),
      this.reservationsRepo.count({ where: { status: ReservationStatus.PENDING } }),
      this.reservationsRepo.count({ where: { status: ReservationStatus.CONFIRMED } }),
      this.reservationsRepo.count({ where: { status: ReservationStatus.SEATED } }),
      this.reservationsRepo.count({ where: { status: ReservationStatus.COMPLETED } }),
      this.reservationsRepo.count({ where: { status: ReservationStatus.CANCELLED } }),
      this.reservationsRepo.count({ where: { status: ReservationStatus.NO_SHOW } }),
    ]);

    const todayReservations = await this.getTodayReservations();
    const upcomingReservations = await this.getUpcomingReservations(7);

    return {
      total,
      pending,
      confirmed,
      seated,
      completed,
      cancelled,
      noShow,
      todayTotal: todayReservations.length,
      upcomingWeek: upcomingReservations.length,
    };
  }

  /**
   * Update reservation status (generic method for frontend)
   */
  async updateStatus(id: number, newStatus: ReservationStatus): Promise<Reservation> {
    const reservation = await this.findOne(id);

    // Validate status transition
    const validStatuses = Object.values(ReservationStatus);
    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestException(`Invalid status: ${newStatus}`);
    }

    reservation.status = newStatus;
    const updated = await this.reservationsRepo.save(reservation);

    this.logger.log(
      `Reservation ${reservation.reservation_code} status updated to ${newStatus}`,
    );

    return updated;
  }

  /**
   * Hard delete reservation (admin only)
   */
  async remove(id: number): Promise<void> {
    const reservation = await this.findOne(id);
    await this.reservationsRepo.remove(reservation);

    this.logger.warn(`Reservation ${reservation.reservation_code} permanently deleted`);
  }

  /**
   * Generate unique reservation code
   */
  private generateReservationCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `RES-${timestamp}-${random}`;
  }

  /**
   * Calculate current capacity for a given time
   */
  private async getCurrentCapacity(dateTime: Date): Promise<number> {
    const timeSlotStart = new Date(dateTime.getTime() - 30 * 60000);
    const timeSlotEnd = new Date(dateTime.getTime() + 30 * 60000);

    const reservations = await this.reservationsRepo.find({
      where: {
        reservation_date: Between(timeSlotStart, timeSlotEnd),
        status: ReservationStatus.CONFIRMED,
      },
    });

    return reservations.reduce((sum, res) => sum + res.party_size, 0);
  }
}
