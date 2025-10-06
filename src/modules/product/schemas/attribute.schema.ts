import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AttributeDocument = Attribute & Document;

export enum AttributeType {
  SELECT = 'select',
  TEXT = 'text',
  NUMBER = 'number',
}

@Schema({ timestamps: true })
export class Attribute {
  @ApiProperty({ description: 'Attribute ID' })
  _id: string;

  @ApiProperty({ description: 'Attribute name' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'SEO friendly unique URL slug' })
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @ApiProperty({ enum: AttributeType, description: 'Attribute type' })
  @Prop({ required: true, enum: AttributeType, default: AttributeType.SELECT })
  type: AttributeType;

  @ApiProperty({ description: 'Attribute values' })
  @Prop({ type: [String], default: [] })
  values: string[];

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const AttributeSchema = SchemaFactory.createForClass(Attribute);

// Indexes 