import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true })
export class Brand {
  @ApiProperty({ description: 'Brand ID' })
  _id: string;

  @ApiProperty({ description: 'Brand name' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'SEO friendly unique URL slug' })
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @ApiProperty({ description: 'Brand description' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Brand logo URL' })
  @Prop()
  logo?: string;

  @ApiProperty({ description: 'Brand website URL' })
  @Prop()
  website?: string;

  @ApiProperty({ description: 'Brand country of origin' })
  @Prop()
  country?: string;

  @ApiProperty({ description: 'Brand founded year' })
  @Prop({ min: 1800, max: new Date().getFullYear() })
  foundedYear?: number;

  @ApiProperty({ description: 'Whether brand is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Brand sort order' })
  @Prop({ default: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'Brand metadata' })
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);

// Indexes
BrandSchema.index({ name: 1 });
BrandSchema.index({ isActive: 1 });
BrandSchema.index({ sortOrder: 1 });
BrandSchema.index({ country: 1 }); 