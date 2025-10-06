import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CartDocument = Cart & Document;

@Schema({ timestamps: true })
export class CartItem {
  @ApiProperty({ description: 'Product ID' })
  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  productId: string;

  @ApiProperty({ description: 'Product variation ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ProductVariation' })
  variationId?: string;

  @ApiProperty({ description: 'Quantity' })
  @Prop({ required: true, min: 1 })
  quantity: number;

  @ApiProperty({ description: 'Price per unit' })
  @Prop({ required: true, min: 0 })
  price: number;
}

@Schema({ timestamps: true })
export class Cart {
  @ApiProperty({ description: 'Cart ID' })
  _id: string;

  @ApiProperty({ description: 'Customer ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  customerId?: string;

  @ApiProperty({ description: 'Session ID for guest carts' })
  @Prop({ required: true, unique: true })
  sessionId: string;

  @ApiProperty({ description: 'Cart items' })
  @Prop({ type: [CartItem], default: [] })
  items: CartItem[];

  @ApiProperty({ description: 'Cart total' })
  @Prop({ required: true, min: 0, default: 0 })
  total: number;

  @ApiProperty({ description: 'Currency' })
  @Prop({ required: true, default: 'USD' })
  currency: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Indexes
CartSchema.index({ customerId: 1 });
CartSchema.index({ createdAt: -1 }); 