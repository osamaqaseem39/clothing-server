import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @ApiProperty({ description: 'Category ID' })
  _id: string;

  @ApiProperty({ description: 'Category name' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'SEO friendly unique URL slug' })
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @ApiProperty({ description: 'Category description' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Parent category ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  parentId?: string;

  @ApiProperty({ description: 'Category image URL' })
  @Prop()
  image?: string;

  @ApiProperty({ description: 'Category icon' })
  @Prop()
  icon?: string;

  @ApiProperty({ description: 'Category color for UI' })
  @Prop()
  color?: string;

  @ApiProperty({ description: 'Whether category is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Sort order for display' })
  @Prop({ default: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'SEO meta title' })
  @Prop()
  metaTitle?: string;

  @ApiProperty({ description: 'SEO meta description' })
  @Prop()
  metaDescription?: string;

  @ApiProperty({ description: 'SEO meta keywords' })
  @Prop()
  metaKeywords?: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ parentId: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });
CategorySchema.index({ sortOrder: 1 });
CategorySchema.index({ name: 'text', description: 'text' });
