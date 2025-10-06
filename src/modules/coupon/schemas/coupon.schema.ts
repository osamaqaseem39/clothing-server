import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CouponDocument = Coupon & Document;

export enum DiscountType {
  FIXED_CART = 'fixed_cart',
  PERCENT = 'percent',
  FIXED_PRODUCT = 'fixed_product',
}

@Schema({ timestamps: true })
export class Coupon {
  @ApiProperty({ description: 'Coupon ID' })
  _id: string;

  @ApiProperty({ description: 'Coupon code' })
  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  code: string;

  @ApiProperty({ description: 'Coupon description' })
  @Prop()
  description?: string;

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  @Prop({ required: true, enum: DiscountType })
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount amount' })
  @Prop({ required: true, min: 0 })
  amount: number;

  @ApiProperty({ description: 'Usage limit' })
  @Prop({ min: 1 })
  usageLimit?: number;

  @ApiProperty({ description: 'Current usage count' })
  @Prop({ required: true, min: 0, default: 0 })
  usageCount: number;

  @ApiProperty({ description: 'Expiry date' })
  @Prop()
  expiryDate?: Date;

  @ApiProperty({ description: 'Minimum spend amount' })
  @Prop({ min: 0 })
  minimumSpend?: number;

  @ApiProperty({ description: 'Maximum spend amount' })
  @Prop({ min: 0 })
  maximumSpend?: number;

  @ApiProperty({ description: 'Whether coupon can be used individually' })
  @Prop({ default: true })
  individualUse: boolean;

  @ApiProperty({ description: 'Product IDs this coupon applies to' })
  @Prop({ type: [String] })
  productIds?: string[];

  @ApiProperty({ description: 'Product IDs excluded from this coupon' })
  @Prop({ type: [String] })
  excludedProductIds?: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

// Indexes
CouponSchema.index({ expiryDate: 1 });
CouponSchema.index({ usageCount: 1 });
CouponSchema.index({ minimumSpend: 1 }); 