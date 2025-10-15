import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../../common/services/base.service';
import { CustomerRepository } from '../repositories/customer.repository';
import { CustomerDocument } from '../schemas/customer.schema';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService extends BaseService<CustomerDocument> {
  constructor(private readonly customerRepository: CustomerRepository) {
    super(customerRepository);
  }

  async createCustomer(createCustomerDto: CreateCustomerDto): Promise<CustomerDocument> {
    // Check if customer with same email already exists
    const existingCustomer = await this.customerRepository.findByEmail(createCustomerDto.email);
    if (existingCustomer) {
      throw new ConflictException(`Customer with email '${createCustomerDto.email}' already exists`);
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createCustomerDto.password, saltRounds);

    // Create customer data without password
    const customerData = {
      ...createCustomerDto,
      passwordHash,
    };
    delete (customerData as any).password;

    return await this.customerRepository.create(customerData);
  }

  async updateCustomer(id: string, updateCustomerDto: UpdateCustomerDto): Promise<CustomerDocument> {
    // Check if customer exists
    await this.findById(id);

    // If updating email, check for conflicts
    if (updateCustomerDto.email) {
      const existingCustomer = await this.customerRepository.findByEmail(updateCustomerDto.email);
      if (existingCustomer && existingCustomer._id.toString() !== id) {
        throw new ConflictException(`Customer with email '${updateCustomerDto.email}' already exists`);
      }
    }

    return await this.customerRepository.update(id, updateCustomerDto);
  }

  async findByEmail(email: string): Promise<CustomerDocument> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      throw new Error(`Customer with email '${email}' not found`);
    }
    return customer;
  }

  async authenticate(email: string, password: string): Promise<CustomerDocument> {
    const customer = await this.customerRepository.findByEmail(email);
    if (!customer) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }

    return customer;
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const customer = await this.findById(id);
    
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, customer.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.customerRepository.update(id, { passwordHash: newPasswordHash });
  }

  async findByName(firstName: string, lastName: string): Promise<CustomerDocument[]> {
    return await this.customerRepository.findByName(firstName, lastName);
  }
} 