import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true })
export class Tag {
  @ApiProperty({ description: 'Tag ID' })
  _id: string;

  @ApiProperty({ description: 'Tag name' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'SEO friendly unique URL slug' })
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

// Indexes 