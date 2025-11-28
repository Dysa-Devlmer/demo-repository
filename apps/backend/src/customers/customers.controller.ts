import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Res,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from "@nestjs/swagger";
import { AuthGuard } from "../common/guards/auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RequireRoles, ROLES } from "../auth/decorators/roles.decorator";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";

@ApiTags('Customers')
@ApiBearerAuth()
@Controller("customers")
@UseGuards(AuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Create new customer',
    description: 'Create a new customer record in the system. Requires admin, manager or staff role.'
  })
  @ApiBody({ type: CreateCustomerDto })
  @ApiResponse({ status: 201, description: 'Customer created successfully', type: CreateCustomerDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  @Get()
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Get all customers',
    description: 'Retrieve a list of all customers in the system. Requires admin, manager or staff role.'
  })
  @ApiResponse({ status: 200, description: 'List of customers retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  findAll() {
    return this.customersService.findAll();
  }

  @Get("export")
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Export customers to CSV',
    description: 'Export all customers data to a CSV file. Requires admin, manager or staff role.'
  })
  @ApiResponse({ status: 200, description: 'CSV file generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  async exportCustomers(@Res() res: any) {
    const csv = await this.customersService.exportToCSV();
    const filename = `customers_export_${new Date().toISOString().split('T')[0]}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get(":id")
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Get customer by ID',
    description: 'Retrieve detailed information about a specific customer. Requires admin, manager or staff role.'
  })
  @ApiParam({ name: 'id', description: 'Customer ID', type: Number })
  @ApiResponse({ status: 200, description: 'Customer details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.customersService.findOne(id);
  }

  @Put(":id")
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF)
  @ApiOperation({
    summary: 'Update customer',
    description: 'Update an existing customer record. Requires admin, manager or staff role.'
  })
  @ApiParam({ name: 'id', description: 'Customer ID', type: Number })
  @ApiBody({ type: UpdateCustomerDto })
  @ApiResponse({ status: 200, description: 'Customer updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, dto);
  }

  @Delete(":id")
  @RequireRoles(ROLES.ADMIN, ROLES.MANAGER)
  @ApiOperation({
    summary: 'Delete customer',
    description: 'Permanently delete a customer from the system. Requires admin or manager role. This action cannot be undone.'
  })
  @ApiParam({ name: 'id', description: 'Customer ID', type: Number })
  @ApiResponse({ status: 200, description: 'Customer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @ApiResponse({ status: 403, description: 'Forbidden - Requires admin or manager role' })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.customersService.remove(id);
  }
}
