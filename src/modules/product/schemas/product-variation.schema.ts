import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductVariationDocument = ProductVariation & Document;

export enum VariationStockStatus {
  INSTOCK = 'instock',
  OUTOFSTOCK = 'outofstock',
}

@Schema({ timestamps: true })
export class ProductVariation {
  @ApiProperty({ description: 'Variation ID' })
  _id: string;

  @ApiProperty({ description: 'Parent product ID' })
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  productId: string;

  @ApiProperty({ description: 'Variation SKU' })
  @Prop({ trim: true })
  sku?: string;

  @ApiProperty({ description: 'Variation price' })
  @Prop({ required: true, min: 0 })
  price: number;

  @ApiProperty({ description: 'Variation sale price' })
  @Prop({ min: 0 })
  salePrice?: number;

  @ApiProperty({ description: 'Stock quantity' })
  @Prop({ required: true, min: 0, default: 0 })
  stockQuantity: number;

  @ApiProperty({ enum: VariationStockStatus, description: 'Stock status' })
  @Prop({ required: true, enum: VariationStockStatus, default: VariationStockStatus.OUTOFSTOCK })
  stockStatus: VariationStockStatus;

  @ApiProperty({ description: 'Variation attributes' })
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'ProductAttribute' })
  attributes: string[];

  @ApiProperty({ description: 'Variation image' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ProductImage' })
  image?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const ProductVariationSchema = SchemaFactory.createForClass(ProductVariation);

// Indexes
ProductVariationSchema.index({ productId: 1 });
ProductVariationSchema.index({ sku: 1 });
ProductVariationSchema.index({ stockStatus: 1 }); 