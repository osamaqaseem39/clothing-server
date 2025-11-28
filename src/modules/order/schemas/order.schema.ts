import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class OrderItem {
  @ApiProperty({ description: 'Product ID' })
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  productId: string;

  @ApiProperty({ description: 'Product variation ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ProductVariation' })
  variationId?: string;

  @ApiProperty({ description: 'Product name' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Product SKU' })
  @Prop()
  sku?: string;

  @ApiProperty({ description: 'Quantity ordered' })
  @Prop({ required: true, min: 1 })
  quantity: number;

  @ApiProperty({ description: 'Price per unit' })
  @Prop({ required: true, min: 0 })
  price: number;

  @ApiProperty({ description: 'Subtotal before tax/discount' })
  @Prop({ required: true, min: 0 })
  subtotal: number;

  @ApiProperty({ description: 'Total after tax/discount' })
  @Prop({ required: true, min: 0 })
  total: number;
}

@Schema({ timestamps: true })
export class Order {
  @ApiProperty({ description: 'Order ID' })
  _id: string;

  @ApiProperty({ description: 'Customer ID (optional for guest checkout)' })
  @Prop({ required: false, type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId?: string;

  @ApiProperty({ enum: OrderStatus, description: 'Order status' })
  @Prop({ required: true, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty({ description: 'Payment method' })
  @Prop({ required: true })
  paymentMethod: string;

  @ApiProperty({ enum: PaymentStatus, description: 'Payment status' })
  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.UNPAID })
  paymentStatus: PaymentStatus;

  @ApiProperty({ description: 'Order total' })
  @Prop({ required: true, min: 0 })
  total: number;

  @ApiProperty({ description: 'Subtotal' })
  @Prop({ required: true, min: 0 })
  subtotal: number;

  @ApiProperty({ description: 'Discount total' })
  @Prop({ required: true, min: 0, default: 0 })
  discountTotal: number;

  @ApiProperty({ description: 'Shipping total' })
  @Prop({ required: true, min: 0, default: 0 })
  shippingTotal: number;

  @ApiProperty({ description: 'Tax total' })
  @Prop({ required: true, min: 0, default: 0 })
  taxTotal: number;

  @ApiProperty({ description: 'Currency' })
  @Prop({ required: true, default: 'PKR' })
  currency: string;

  @ApiProperty({ description: 'Billing address' })
  @Prop({
    type: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      company: { type: String, trim: true },
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    required: true,
  })
  billingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };

  @ApiProperty({ description: 'Shipping address' })
  @Prop({
    type: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      company: { type: String, trim: true },
      addressLine1: { type: String, required: true, trim: true },
      addressLine2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    required: true,
  })
  shippingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };

  @ApiProperty({ description: 'Order items' })
  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @ApiProperty({ description: 'Tracking ID for order shipment' })
  @Prop({ unique: true, sparse: true, trim: true })
  trackingId?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'items.productId': 1 });
OrderSchema.index({ trackingId: 1 }); 