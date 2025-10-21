import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @ApiProperty({ description: 'Notification ID' })
  _id: string;

  @ApiProperty({ description: 'Recipient user ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })
  userId: string;

  @ApiProperty({ description: 'Notification title' })
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  @Prop({ required: true, trim: true, maxlength: 1000 })
  message: string;

  @ApiProperty({ description: 'Notification type' })
  @Prop({ 
    enum: ['order_update', 'payment_confirmation', 'shipping_update', 'promotion', 'system'],
    required: true 
  })
  type: string;

  @ApiProperty({ description: 'Notification channel' })
  @Prop({ 
    enum: ['email', 'sms', 'push', 'in_app'],
    required: true 
  })
  channel: string;

  @ApiProperty({ description: 'Related entity ID' })
  @Prop()
  entityId?: string;

  @ApiProperty({ description: 'Related entity type' })
  @Prop()
  entityType?: string;

  @ApiProperty({ description: 'Whether notification is read' })
  @Prop({ default: false })
  isRead: boolean;

  @ApiProperty({ description: 'Whether notification is sent' })
  @Prop({ default: false })
  isSent: boolean;

  @ApiProperty({ description: 'Scheduled send time' })
  @Prop()
  scheduledFor?: Date;

  @ApiProperty({ description: 'Sent timestamp' })
  @Prop()
  sentAt?: Date;

  @ApiProperty({ description: 'Read timestamp' })
  @Prop()
  readAt?: Date;

  @ApiProperty({ description: 'Notification priority' })
  @Prop({ 
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  })
  priority: string;

  @ApiProperty({ description: 'Additional data' })
  @Prop({ type: Object })
  data?: any;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ channel: 1 });
NotificationSchema.index({ isSent: 1, scheduledFor: 1 });
NotificationSchema.index({ createdAt: -1 });
