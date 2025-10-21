import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomerService } from '../../customer/services/customer.service';
import { RegisterDto } from '../dto/register.dto';
import { Customer } from '../../customer/schemas/customer.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly customerService: CustomerService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if customer already exists
    const existingCustomer = await this.customerService.findByEmail(registerDto.email);
    if (existingCustomer) {
      throw new ConflictException('Customer with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create customer
    const customerData = {
      ...registerDto,
      password: hashedPassword,
      isActive: true,
      emailVerified: false,
    };

    const customer = await this.customerService.createCustomer(customerData);

    // Generate tokens
    const tokens = await this.generateTokens(customer);

    return {
      user: {
        _id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        isActive: customer.isActive,
        emailVerified: customer.emailVerified,
        createdAt: customer.createdAt,
      },
      ...tokens,
    };
  }

  async validateCustomer(email: string, password: string): Promise<Customer> {
    const customer = await this.customerService.findByEmail(email);
    if (!customer) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!customer.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return customer;
  }

  async login(customer: Customer) {
    const tokens = await this.generateTokens(customer);

    // Update last login
    await this.customerService.updateCustomer(customer._id, {
      lastLoginAt: new Date(),
    });

    return {
      user: {
        _id: customer._id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        isActive: customer.isActive,
        emailVerified: customer.emailVerified,
        lastLoginAt: customer.lastLoginAt,
      },
      ...tokens,
    };
  }

  async getProfile(customerId: string) {
    const customer = await this.customerService.findById(customerId);
    if (!customer) {
      throw new UnauthorizedException('Customer not found');
    }

    return {
      _id: customer._id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      dateOfBirth: customer.dateOfBirth,
      isActive: customer.isActive,
      emailVerified: customer.emailVerified,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async refreshToken(customer: any) {
    const fullCustomer = await this.customerService.findById(customer.sub);
    if (!fullCustomer) {
      throw new UnauthorizedException('Customer not found');
    }

    return await this.generateTokens(fullCustomer);
  }

  async logout(customerId: string) {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    return { success: true };
  }

  async forgotPassword(email: string) {
    const customer = await this.customerService.findByEmail(email);
    if (!customer) {
      // Don't reveal if email exists or not
      return;
    }

    // Generate reset token (in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.customerService.updateCustomer(customer._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetTokenExpiry,
    });

    // TODO: Send email with reset link
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  async resetPassword(token: string, newPassword: string) {
    const customer = await this.customerService.findByResetToken(token);
    if (!customer || customer.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.customerService.updateCustomer(customer._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  private async generateTokens(customer: Customer) {
    const payload = {
      sub: customer._id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
    };
  }
}
