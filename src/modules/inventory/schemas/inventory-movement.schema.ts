import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type InventoryMovementDocument = InventoryMovement & Document;

@Schema({ timestamps: true })
export class InventoryMovement {
  @ApiProperty({ description: 'Movement ID' })
  _id: string;

  @ApiProperty({ description: 'Inventory ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Inventory', required: true })
  inventoryId: string;

  @ApiProperty({ description: 'Movement type' })
  @Prop({ 
    enum: ['purchase', 'sale', 'return', 'adjustment', 'transfer', 'damage', 'expired'],
    required: true 
  })
  type: string;

  @ApiProperty({ description: 'Quantity moved' })
  @Prop({ required: true })
  quantity: number;

  @ApiProperty({ description: 'Previous stock level' })
  @Prop({ required: true, min: 0 })
  previousStock: number;

  @ApiProperty({ description: 'New stock level' })
  @Prop({ required: true, min: 0 })
  newStock: number;

  @ApiProperty({ description: 'Reference ID (order, purchase, etc.)' })
  @Prop()
  referenceId?: string;

  @ApiProperty({ description: 'Reference type' })
  @Prop()
  referenceType?: string;

  @ApiProperty({ description: 'Movement notes' })
  @Prop()
  notes?: string;

  @ApiProperty({ description: 'User who made the movement' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Customer' })
  userId?: string;

  @ApiProperty({ description: 'Cost per unit' })
  @Prop({ min: 0 })
  unitCost?: number;

  @ApiProperty({ description: 'Total cost' })
  @Prop({ min: 0 })
  totalCost?: number;

  @ApiProperty({ description: 'Warehouse from' })
  @Prop()
  fromWarehouse?: string;

  @ApiProperty({ description: 'Warehouse to' })
  @Prop()
  toWarehouse?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);

// Indexes
InventoryMovementSchema.index({ inventoryId: 1, createdAt: -1 });
InventoryMovementSchema.index({ type: 1 });
InventoryMovementSchema.index({ referenceId: 1, referenceType: 1 });
InventoryMovementSchema.index({ userId: 1 });
