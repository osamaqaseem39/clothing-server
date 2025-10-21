import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsEnum, Min } from 'class-validator';

export class AdjustStockDto {
  @ApiProperty({ description: 'Quantity to adjust (positive for increase, negative for decrease)', example: 10 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ 
    description: 'Adjustment type',
    enum: ['purchase', 'sale', 'return', 'adjustment', 'damage', 'expired'],
    example: 'adjustment'
  })
  @IsEnum(['purchase', 'sale', 'return', 'adjustment', 'damage', 'expired'])
  type: string;

  @ApiProperty({ description: 'Reference ID (order, purchase, etc.)', required: false })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiProperty({ description: 'Reference type', required: false })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiProperty({ description: 'Adjustment notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Cost per unit', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  unitCost?: number;
}
