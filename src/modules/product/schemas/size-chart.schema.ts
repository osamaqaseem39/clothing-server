import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SizeChartDocument = SizeChart & Document;

export enum SizeType {
  NUMERIC = 'numeric',
  ALPHABETIC = 'alphabetic',
  CUSTOM = 'custom',
}

@Schema({ timestamps: true })
export class SizeChart {
  @ApiProperty({ description: 'Size chart ID' })
  _id: string;

  @ApiProperty({ description: 'Size chart name' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Size chart description' })
  @Prop()
  description?: string;

  @ApiProperty({ enum: SizeType, description: 'Size type' })
  @Prop({ required: true, enum: SizeType, default: SizeType.NUMERIC })
  sizeType: SizeType;

  @ApiProperty({ description: 'Size measurements' })
  @Prop({
    type: [{
      size: { type: String, required: true },
      measurements: {
        bust: { type: String },
        waist: { type: String },
        hips: { type: String },
        shoulder: { type: String },
        sleeveLength: { type: String },
        length: { type: String },
        custom: { type: Map, of: String }
      }
    }],
    default: []
  })
  sizes: Array<{
    size: string;
    measurements: {
      bust?: string;
      waist?: string;
      hips?: string;
      shoulder?: string;
      sleeveLength?: string;
      length?: string;
      custom?: Map<string, string>;
    };
  }>;

  @ApiProperty({ description: 'Size chart image URL' })
  @Prop()
  imageUrl?: string;

  @ApiProperty({ description: 'Size chart image alt text' })
  @Prop()
  imageAltText?: string;

  @ApiProperty({ description: 'Is this size chart active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const SizeChartSchema = SchemaFactory.createForClass(SizeChart);

// Indexes
SizeChartSchema.index({ name: 1 });
SizeChartSchema.index({ sizeType: 1 });
SizeChartSchema.index({ isActive: 1 });