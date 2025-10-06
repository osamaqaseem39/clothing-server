import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductImageDocument = ProductImage & Document;

@Schema({ timestamps: true })
export class ProductImage {
  @ApiProperty({ description: 'Image ID' })
  _id: string;

  @ApiProperty({ description: 'Image URL' })
  @Prop({ required: true })
  url: string;

  @ApiProperty({ description: 'Alt text for accessibility' })
  @Prop()
  altText?: string;

  @ApiProperty({ description: 'Image position/order' })
  @Prop({ required: true, min: 0, default: 0 })
  position: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const ProductImageSchema = SchemaFactory.createForClass(ProductImage);

// Indexes
ProductImageSchema.index({ position: 1 }); 