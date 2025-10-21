import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    description: 'New order status',
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    example: 'processing'
  })
  @IsEnum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'])
  status: string;

  @ApiProperty({ description: 'Status update notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Tracking number', required: false })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiProperty({ description: 'Shipping carrier', required: false })
  @IsOptional()
  @IsString()
  carrier?: string;
}

export class AddOrderNoteDto {
  @ApiProperty({ description: 'Note content' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Note type', enum: ['internal', 'customer'], default: 'internal' })
  @IsEnum(['internal', 'customer'])
  type: string;

  @ApiProperty({ description: 'Is note visible to customer', default: false })
  isVisibleToCustomer: boolean;
}

export class SplitOrderDto {
  @ApiProperty({ description: 'Items to split into new order', type: [String] })
  @IsArray()
  @IsString({ each: true })
  itemIds: string[];

  @ApiProperty({ description: 'Reason for splitting order' })
  @IsString()
  reason: string;
}
