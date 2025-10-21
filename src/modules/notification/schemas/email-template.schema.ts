import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type EmailTemplateDocument = EmailTemplate & Document;

@Schema({ timestamps: true })
export class EmailTemplate {
  @ApiProperty({ description: 'Template ID' })
  _id: string;

  @ApiProperty({ description: 'Template name' })
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Template subject' })
  @Prop({ required: true, trim: true })
  subject: string;

  @ApiProperty({ description: 'Template HTML content' })
  @Prop({ required: true })
  htmlContent: string;

  @ApiProperty({ description: 'Template text content' })
  @Prop()
  textContent?: string;

  @ApiProperty({ description: 'Template variables' })
  @Prop({ type: [String] })
  variables?: string[];

  @ApiProperty({ description: 'Template category' })
  @Prop({ 
    enum: ['order', 'payment', 'shipping', 'marketing', 'system'],
    required: true 
  })
  category: string;

  @ApiProperty({ description: 'Whether template is active' })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Template description' })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const EmailTemplateSchema = SchemaFactory.createForClass(EmailTemplate);

// Indexes
EmailTemplateSchema.index({ name: 1 });
EmailTemplateSchema.index({ category: 1 });
EmailTemplateSchema.index({ isActive: 1 });
