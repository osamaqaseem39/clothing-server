import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { Admin, AdminDocument } from '../schemas/admin.schema';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
    private jwtService: JwtService,
  ) {}

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const { email, password, ...rest } = createAdminDto;

    // Check if admin with email already exists
    const existingAdmin = await this.adminModel.findOne({ email });
    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = new this.adminModel({
      ...rest,
      email,
      password: hashedPassword,
    });

    return await admin.save();
  }

  async authenticate(email: string, password: string): Promise<{ user: Admin; token: string }> {
    // Find admin by email
    const admin = await this.adminModel.findOne({ email });
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if admin is active
    if (!admin.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Generate JWT token
    const payload = {
      sub: admin._id,
      email: admin.email,
      role: admin.role,
    };

    const token = this.jwtService.sign(payload);

    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;

    return {
      user: adminResponse,
      token,
    };
  }

  async findById(id: string): Promise<Admin> {
    const admin = await this.adminModel.findById(id).select('-password');
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async findByEmail(email: string): Promise<Admin> {
    const admin = await this.adminModel.findOne({ email }).select('-password');
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
    return admin;
  }

  async updatePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const admin = await this.adminModel.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    admin.password = hashedNewPassword;
    admin.passwordChangedAt = new Date();
    await admin.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const admin = await this.adminModel.findOne({ email });
    if (!admin) {
      // Don't reveal if email exists or not
      return;
    }

    // Generate reset token
    const resetToken = this.generateRandomToken();
    admin.passwordResetToken = resetToken;
    admin.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await admin.save();

    // TODO: Send email with reset token
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const admin = await this.adminModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    admin.password = hashedPassword;
    admin.passwordChangedAt = new Date();
    admin.passwordResetToken = undefined;
    admin.passwordResetExpires = undefined;
    await admin.save();
  }

  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
} 