import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';
import { CreateAdminDto } from '../dto/create-admin.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Admin Authentication')
@Controller('auth')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new admin account' })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - admin with same email already exists',
  })
  @ApiBody({ type: CreateAdminDto })
  async register(@Body() createAdminDto: CreateAdminDto) {
    const result = await this.adminService.createAdmin(createAdminDto);
    return {
      success: true,
      data: {
        user: result,
        token: null, // Registration doesn't return a token, user needs to login
      },
      message: 'Admin created successfully',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
            isActive: { type: 'boolean' },
            lastLoginAt: { type: 'string', format: 'date-time' },
          },
        },
        token: { type: 'string' },
      },
    },
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
          description: 'Admin email',
        },
        password: {
          type: 'string',
          description: 'Admin password',
        },
      },
      required: ['email', 'password'],
    },
  })
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    const result = await this.adminService.authenticate(email, password);
    return {
      success: true,
      data: result,
      message: 'Login successful',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current admin profile' })
  @ApiResponse({
    status: 200,
    description: 'Admin profile retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
  async getProfile(@Request() req) {
    const result = await this.adminService.findById(req.user.sub);
    return {
      success: true,
      data: { user: result },
      message: 'Profile retrieved successfully',
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({
    status: 200,
    description: 'Password reset email sent (if email exists)',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Admin email',
        },
      },
      required: ['email'],
    },
  })
  async forgotPassword(@Body('email') email: string) {
    await this.adminService.forgotPassword(email);
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid or expired token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: {
          type: 'string',
          description: 'Password reset token',
        },
        password: {
          type: 'string',
          description: 'New password',
        },
      },
      required: ['token', 'password'],
    },
  })
  async resetPassword(
    @Body('token') token: string,
    @Body('password') password: string,
  ) {
    await this.adminService.resetPassword(token, password);
    return { message: 'Password reset successfully' };
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change admin password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid current password',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid token',
  })
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
  async changePassword(
    @Request() req,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    await this.adminService.updatePassword(req.user.sub, currentPassword, newPassword);
    return { message: 'Password changed successfully' };
  }
} 