import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type InventoryDocument = Inventory & Document;

@Schema({ timestamps: true })
export class Inventory {
  @ApiProperty({ description: 'Inventory ID' })
  _id: string;

  @ApiProperty({ description: 'Product ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Product', required: true })
  productId: string;

  @ApiProperty({ description: 'Product variant ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'ProductVariant' })
  variantId?: string;

  @ApiProperty({ description: 'Product size (for size-wise inventory management)' })
  @Prop({ type: String, trim: true })
  size?: string;

  @ApiProperty({ description: 'Current stock quantity' })
  @Prop({ required: true, min: 0 })
  currentStock: number;

  @ApiProperty({ description: 'Reserved stock quantity' })
  @Prop({ default: 0, min: 0 })
  reservedStock: number;

  @ApiProperty({ description: 'Available stock quantity' })
  @Prop({ required: true, min: 0 })
  availableStock: number;

  @ApiProperty({ description: 'Reorder point' })
  @Prop({ required: true, min: 0 })
  reorderPoint: number;

  @ApiProperty({ description: 'Reorder quantity' })
  @Prop({ required: true, min: 0 })
  reorderQuantity: number;

  @ApiProperty({ description: 'Maximum stock level' })
  @Prop({ min: 0 })
  maxStock?: number;

  @ApiProperty({ description: 'Cost price per unit' })
  @Prop({ required: true, min: 0 })
  costPrice: number;

  @ApiProperty({ description: 'Selling price per unit' })
  @Prop({ required: true, min: 0 })
  sellingPrice: number;

  @ApiProperty({ description: 'Warehouse location' })
  @Prop({ default: 'main' })
  warehouse: string;

  @ApiProperty({ description: 'Stock status' })
  @Prop({ 
    enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'],
    default: 'in_stock'
  })
  status: string;

  @ApiProperty({ description: 'Last restocked date' })
  @Prop()
  lastRestocked?: Date;

  @ApiProperty({ description: 'Last sold date' })
  @Prop()
  lastSold?: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

// Indexes
InventorySchema.index({ productId: 1, variantId: 1 });
InventorySchema.index({ productId: 1, size: 1 });
InventorySchema.index({ warehouse: 1 });
InventorySchema.index({ status: 1 });
InventorySchema.index({ currentStock: 1 });
