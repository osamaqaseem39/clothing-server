import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DeliveryChargeDocument = DeliveryCharge & Document;

@Schema({ timestamps: true })
export class DeliveryCharge {
  @ApiProperty({ description: 'Delivery charge ID' })
  _id: string;

  @ApiProperty({ description: 'Location name (e.g., City, State, Region)' })
  @Prop({ required: true, trim: true })
  locationName: string;

  @ApiProperty({ description: 'Location type: country, state, city, or postal_code' })
  @Prop({ required: true, enum: ['country', 'state', 'city', 'postal_code'] })
  locationType: 'country' | 'state' | 'city' | 'postal_code';

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)' })
  @Prop({ required: true, trim: true })
  country: string;

  @ApiProperty({ description: 'State/Province code or name' })
  @Prop({ trim: true })
  state?: string;

  @ApiProperty({ description: 'City name' })
  @Prop({ trim: true })
  city?: string;

  @ApiProperty({ description: 'Postal/ZIP code' })
  @Prop({ trim: true })
  postalCode?: string;

  @ApiProperty({ description: 'Base delivery charge' })
  @Prop({ required: true, min: 0 })
  baseCharge: number;

  @ApiProperty({ description: 'Additional charge per kg (optional)' })
  @Prop({ min: 0, default: 0 })
  chargePerKg?: number;

  @ApiProperty({ description: 'Additional charge per item (optional)' })
  @Prop({ min: 0, default: 0 })
  chargePerItem?: number;

  @ApiProperty({ description: 'Free shipping threshold (optional)' })
  @Prop({ min: 0 })
  freeShippingThreshold?: number;

  @ApiProperty({ description: 'Minimum order amount for this charge to apply' })
  @Prop({ min: 0, default: 0 })
  minimumOrderAmount?: number;

  @ApiProperty({ description: 'Maximum order amount for this charge to apply' })
  @Prop({ min: 0 })
  maximumOrderAmount?: number;

  @ApiProperty({ description: 'Whether this delivery charge is enabled' })
  @Prop({ default: true })
  enabled: boolean;

  @ApiProperty({ description: 'Priority for matching (higher priority = checked first)' })
  @Prop({ default: 0 })
  priority: number;

  @ApiProperty({ description: 'Estimated delivery days' })
  @Prop({ min: 1 })
  estimatedDeliveryDays?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const DeliveryChargeSchema = SchemaFactory.createForClass(DeliveryCharge);

// Indexes for efficient querying
DeliveryChargeSchema.index({ country: 1, state: 1, city: 1 });
DeliveryChargeSchema.index({ country: 1, state: 1 });
DeliveryChargeSchema.index({ country: 1 });
DeliveryChargeSchema.index({ postalCode: 1 });
DeliveryChargeSchema.index({ enabled: 1, priority: -1 });
DeliveryChargeSchema.index({ locationType: 1 });

