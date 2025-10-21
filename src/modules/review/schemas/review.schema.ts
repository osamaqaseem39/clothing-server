import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @ApiProperty({ description: 'Review ID' })
  _id: string;

  @ApiProperty({ description: 'Product ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: string;

  @ApiProperty({ description: 'Customer ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer', required: true })
  customerId: string;

  @ApiProperty({ description: 'Order ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Order' })
  orderId?: string;

  @ApiProperty({ description: 'Rating (1-5 stars)' })
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @ApiProperty({ description: 'Review title' })
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @ApiProperty({ description: 'Review content' })
  @Prop({ required: true, trim: true, maxlength: 2000 })
  content: string;

  @ApiProperty({ description: 'Review images' })
  @Prop({ type: [String] })
  images?: string[];

  @ApiProperty({ description: 'Whether review is verified purchase' })
  @Prop({ default: false })
  isVerifiedPurchase: boolean;

  @ApiProperty({ description: 'Whether review is approved' })
  @Prop({ default: false })
  isApproved: boolean;

  @ApiProperty({ description: 'Helpful votes count' })
  @Prop({ default: 0 })
  helpfulVotes: number;

  @ApiProperty({ description: 'Not helpful votes count' })
  @Prop({ default: 0 })
  notHelpfulVotes: number;

  @ApiProperty({ description: 'Review response from merchant' })
  @Prop({
    type: {
      content: { type: String, required: true, trim: true, maxlength: 1000 },
      respondedAt: { type: Date, required: true },
      respondedBy: { type: MongooseSchema.Types.ObjectId, ref: 'Admin' },
    }
  })
  merchantResponse?: {
    content: string;
    respondedAt: Date;
    respondedBy: string;
  };

  @ApiProperty({ description: 'Review status' })
  @Prop({ 
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  })
  status: string;

  @ApiProperty({ description: 'Flag reason' })
  @Prop()
  flagReason?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes
ReviewSchema.index({ productId: 1, rating: 1 });
ReviewSchema.index({ customerId: 1 });
ReviewSchema.index({ isApproved: 1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ helpfulVotes: -1 });
