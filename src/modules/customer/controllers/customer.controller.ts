import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Customer } from '../schemas/customer.schema';
import { PaginatedResult } from '../../../common/interfaces/base.interface';

@ApiTags('Customers')
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    type: Customer,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - customer with same email already exists',
  })
  @ApiBody({ type: CreateCustomerDto })
  async create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return await this.customerService.createCustomer(createCustomerDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer' })
  @ApiResponse({
    status: 201,
    description: 'Customer registered successfully',
    type: Customer,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - customer with same email already exists',
  })
  @ApiBody({ type: CreateCustomerDto })
  async register(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return await this.customerService.createCustomer(createCustomerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: Customer,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid credentials',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Customer email',
        },
        password: {
          type: 'string',
          description: 'Customer password',
        },
      },
      required: ['email', 'password'],
    },
  })
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ): Promise<Customer> {
    return await this.customerService.authenticate(email, password);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Customers retrieved successfully',
    type: [Customer],
  })
  @ApiQuery({ type: PaginationDto })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<Customer>> {
    return await this.customerService.findAll(paginationDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers by name' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [Customer],
  })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  async search(@Query('firstName') firstName?: string, @Query('lastName') lastName?: string): Promise<Customer[]> {
    if (!firstName && !lastName) {
      throw new Error('At least one name parameter is required');
    }
    return await this.customerService.findByName(firstName || '', lastName || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer retrieved successfully',
    type: Customer,
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  async findOne(@Param('id') id: string): Promise<Customer> {
    return await this.customerService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update customer' })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: Customer,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - customer with same email already exists',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiBody({ type: UpdateCustomerDto })
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    return await this.customerService.updateCustomer(id, updateCustomerDto);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Update customer password' })
  @ApiResponse({
    status: 200,
    description: 'Password updated successfully',
    type: Customer,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid current password',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        currentPassword: {
          type: 'string',
          description: 'Current password',
        },
        newPassword: {
          type: 'string',
          description: 'New password',
        },
      },
      required: ['currentPassword', 'newPassword'],
    },
  })
  async updatePassword(
    @Param('id') id: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    await this.customerService.updatePassword(id, currentPassword, newPassword);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete customer' })
  @ApiResponse({
    status: 204,
    description: 'Customer deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
  })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.customerService.delete(id);
  }
} 