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
import { NotificationService } from '../services/notification.service';
import { EmailService } from '../services/email.service';
import { Notification } from '../schemas/notification.schema';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly emailService: EmailService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully',
    type: Notification,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', description: 'User ID' },
        type: { type: 'string', description: 'Notification type' },
        title: { type: 'string', description: 'Notification title' },
        message: { type: 'string', description: 'Notification message' },
        data: { type: 'object', description: 'Additional data' },
      },
      required: ['userId', 'type', 'title', 'message'],
    },
  })
  async create(@Body() notificationData: any): Promise<Notification> {
    return await this.notificationService.createNotification(notificationData);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get notifications by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    type: [Notification],
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async findByUserId(@Param('userId') userId: string): Promise<Notification[]> {
    return await this.notificationService.findByUserId(userId);
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({ summary: 'Get unread notification count for user' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', description: 'Number of unread notifications' },
      },
    },
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async getUnreadCount(@Param('userId') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
    type: Notification,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return await this.notificationService.markAsRead(id);
  }

  @Patch('user/:userId/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for user' })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read successfully',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async markAllAsRead(@Param('userId') userId: string): Promise<void> {
    await this.notificationService.markAllAsRead(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
    type: Notification,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async findOne(@Param('id') id: string): Promise<Notification> {
    return await this.notificationService.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({
    status: 204,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.notificationService.delete(id);
  }

  @Post('email/send')
  @ApiOperation({ summary: 'Send email notification' })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email' },
        subject: { type: 'string', description: 'Email subject' },
        content: { type: 'string', description: 'Email content' },
      },
      required: ['to', 'subject', 'content'],
    },
  })
  async sendEmail(
    @Body('to') to: string,
    @Body('subject') subject: string,
    @Body('content') content: string,
  ): Promise<{ success: boolean }> {
    const success = await this.emailService.sendEmail(to, subject, content);
    return { success };
  }

  @Post('email/template')
  @ApiOperation({ summary: 'Send email using template' })
  @ApiResponse({
    status: 200,
    description: 'Email sent successfully',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        to: { type: 'string', description: 'Recipient email' },
        templateName: { type: 'string', description: 'Template name' },
        variables: { type: 'object', description: 'Template variables' },
      },
      required: ['to', 'templateName'],
    },
  })
  async sendTemplateEmail(
    @Body('to') to: string,
    @Body('templateName') templateName: string,
    @Body('variables') variables: any = {},
  ): Promise<{ success: boolean }> {
    const success = await this.emailService.sendTemplateEmail(to, templateName, variables);
    return { success };
  }
}
