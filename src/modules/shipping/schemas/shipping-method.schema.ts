import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ShippingMethodDocument = ShippingMethod & Document;

export enum TaxStatus {
  TAXABLE = 'taxable',
  NONE = 'none',
}

@Schema({ timestamps: true })
export class ShippingMethod {
  @ApiProperty({ description: 'Shipping method ID' })
  _id: string;

  @ApiProperty({ description: 'Shipping method name' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Shipping method description' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Shipping cost' })
  @Prop({ required: true, min: 0 })
  cost: number;

  @ApiProperty({ enum: TaxStatus, description: 'Tax status' })
  @Prop({ required: true, enum: TaxStatus, default: TaxStatus.TAXABLE })
  taxStatus: TaxStatus;

  @ApiProperty({ description: 'Whether shipping method is enabled' })
  @Prop({ default: true })
  enabled: boolean;

  @ApiProperty({ description: 'Minimum order amount for this shipping method' })
  @Prop({ min: 0 })
  minimumOrderAmount?: number;

  @ApiProperty({ description: 'Maximum order amount for this shipping method' })
  @Prop({ min: 0 })
  maximumOrderAmount?: number;

  @ApiProperty({ description: 'Estimated delivery time in days' })
  @Prop({ min: 1 })
  estimatedDeliveryDays?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const ShippingMethodSchema = SchemaFactory.createForClass(ShippingMethod);

// Indexes
ShippingMethodSchema.index({ enabled: 1 });
ShippingMethodSchema.index({ cost: 1 });
ShippingMethodSchema.index({ name: 1 }); 