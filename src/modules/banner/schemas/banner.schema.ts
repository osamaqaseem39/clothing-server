import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type BannerDocument = Banner & Document;

@Schema({ timestamps: true })
export class Banner {
  @ApiProperty({ description: 'Banner ID' })
  _id: string;

  @ApiProperty({ description: 'Banner title' })
  @Prop({ required: true, trim: true })
  title: string;

  @ApiProperty({ description: 'Banner subtitle' })
  @Prop({ trim: true })
  subtitle?: string;

  @ApiProperty({ description: 'Banner description' })
  @Prop({ trim: true })
  description?: string;

  @ApiProperty({ description: 'Banner image URL' })
  @Prop({ required: true, trim: true })
  imageUrl: string;

  @ApiProperty({ description: 'Alt text for the banner image' })
  @Prop({ trim: true })
  altText?: string;

  @ApiProperty({ description: 'Link URL when banner is clicked' })
  @Prop({ trim: true })
  linkUrl?: string;

  @ApiProperty({ description: 'Link text (e.g., "Shop Now", "Learn More")' })
  @Prop({ trim: true })
  linkText?: string;

  @ApiProperty({ description: 'Display order (lower numbers appear first)' })
  @Prop({ default: 0 })
  displayOrder: number;

  @ApiProperty({ description: 'Whether banner is enabled/active' })
  @Prop({ default: true })
  enabled: boolean;

  @ApiProperty({ description: 'Banner position/type (e.g., "hero", "collection", "promotional")' })
  @Prop({ enum: ['hero', 'collection', 'promotional', 'sidebar'], default: 'hero' })
  position: 'hero' | 'collection' | 'promotional' | 'sidebar';

  @ApiProperty({ description: 'Start date for banner display (optional)' })
  @Prop({ type: Date })
  startDate?: Date;

  @ApiProperty({ description: 'End date for banner display (optional)' })
  @Prop({ type: Date })
  endDate?: Date;

  @ApiProperty({ description: 'Required image dimensions (width x height in pixels)' })
  @Prop({ 
    type: {
      width: { type: Number, required: true },
      height: { type: Number, required: true }
    },
    default: { width: 1920, height: 800 }
  })
  requiredSize: {
    width: number;
    height: number;
  };

  @ApiProperty({ description: 'Banner metadata' })
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

// Indexes
BannerSchema.index({ enabled: 1, displayOrder: 1 });
BannerSchema.index({ position: 1, enabled: 1 });
BannerSchema.index({ startDate: 1, endDate: 1 });

