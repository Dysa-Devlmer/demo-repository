import { Injectable, NotFoundException, ConflictException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Customer, CustomerSource } from "../entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    // Verificar si ya existe un cliente con el mismo email
    if (dto.email) {
      const existingCustomer = await this.customerRepo.findOne({
        where: { email: dto.email },
      });
      if (existingCustomer) {
        throw new ConflictException(
          `Ya existe un cliente con el email ${dto.email}`
        );
      }
    }

    try {
      const customer = new Customer();
      customer.name = dto.name;
      customer.email = dto.email;
      customer.phone = dto.phone;
      customer.whatsapp_phone = dto.whatsapp_phone;
      customer.address = dto.address;
      customer.source = dto.source || CustomerSource.ADMIN;
      customer.preferences = dto.preferences as any;
      customer.metadata = dto.metadata;
      customer.is_active = dto.is_active !== false;

      return await this.customerRepo.save(customer);
    } catch (error) {
      // Manejar otros errores de base de datos
      if (error.code === '23505') { // Código de error de PostgreSQL para violación de unique constraint
        throw new ConflictException('Ya existe un cliente con estos datos');
      }
      throw new BadRequestException(`Error al crear cliente: ${error.message}`);
    }
  }

  async findAll(): Promise<Customer[]> {
    return await this.customerRepo.find({
      relations: ["reservations"], // relaciones reales
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepo.findOne({
      where: { id },
      relations: ["reservations"],
    });
    if (!customer)
      throw new NotFoundException(`Customer with ID ${id} not found`);
    return customer;
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, dto);
    return this.customerRepo.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepo.remove(customer);
  }

  /**
   * Find or create customer by WhatsApp phone number
   */
  async findOrCreateByWhatsApp(whatsappPhone: string): Promise<Customer> {
    // Normalize phone number (remove spaces, etc)
    const normalizedPhone = whatsappPhone.replace(/\s+/g, '');

    // Try to find existing customer by WhatsApp phone
    let customer = await this.customerRepo.findOne({
      where: { whatsapp_phone: normalizedPhone },
    });

    if (customer) {
      return customer;
    }

    // Also check regular phone field
    customer = await this.customerRepo.findOne({
      where: { phone: normalizedPhone },
    });

    if (customer) {
      // Update whatsapp_phone if not set
      if (!customer.whatsapp_phone) {
        customer.whatsapp_phone = normalizedPhone;
        await this.customerRepo.save(customer);
      }
      return customer;
    }

    // Create new customer
    const newCustomer = new Customer();
    newCustomer.name = `WhatsApp ${normalizedPhone.slice(-4)}`;
    newCustomer.phone = normalizedPhone;
    newCustomer.whatsapp_phone = normalizedPhone;
    newCustomer.source = CustomerSource.WHATSAPP;
    newCustomer.is_active = true;

    return await this.customerRepo.save(newCustomer);
  }

  async exportToCSV(): Promise<string> {
    const customers = await this.customerRepo.find({
      relations: ["reservations"],
    });

    // CSV Headers
    const headers = [
      "ID",
      "Nombre",
      "Email",
      "Teléfono",
      "WhatsApp",
      "Dirección",
      "Origen",
      "Total Reservas",
      "Activo",
      "Fecha Creación",
    ];

    // CSV Rows
    const rows = customers.map((customer) => [
      customer.id,
      customer.name,
      customer.email || "",
      customer.phone || "",
      customer.whatsapp_phone || "",
      customer.address || "",
      customer.source || "",
      customer.reservations?.length || 0,
      customer.is_active ? "Sí" : "No",
      customer.created_at?.toISOString() || "",
    ]);

    // Build CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  }
}
