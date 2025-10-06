import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Payment {
  @ApiProperty({ description: 'Payment ID' })
  _id: string;

  @ApiProperty({ description: 'Order ID' })
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  orderId: string;

  @ApiProperty({ description: 'Payment method' })
  @Prop({ required: true })
  method: string;

  @ApiProperty({ description: 'Transaction ID from payment provider' })
  @Prop()
  transactionId?: string;

  @ApiProperty({ description: 'Payment amount' })
  @Prop({ required: true, min: 0 })
  amount: number;

  @ApiProperty({ enum: PaymentStatus, description: 'Payment status' })
  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment metadata' })
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ transactionId: 1 });
PaymentSchema.index({ createdAt: -1 }); 