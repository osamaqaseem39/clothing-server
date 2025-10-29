import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsMongoId, Min, IsIn } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Product variant ID', required: false })
  @IsOptional()
  @IsMongoId()
  variantId?: string;

  @ApiProperty({ description: 'Initial stock quantity', example: 100 })
  @IsNumber()
  @Min(0)
  currentStock: number;

  @ApiProperty({ description: 'Reorder point', example: 10 })
  @IsNumber()
  @Min(0)
  reorderPoint: number;

  @ApiProperty({ description: 'Reorder quantity', example: 50 })
  @IsNumber()
  @Min(0)
  reorderQuantity: number;

  @ApiProperty({ description: 'Maximum stock level', example: 500, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxStock?: number;

  @ApiProperty({ description: 'Cost price per unit', example: 25.50 })
  @IsNumber()
  @Min(0)
  costPrice: number;

  @ApiProperty({ description: 'Selling price per unit', example: 49.99 })
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @ApiProperty({ description: 'Warehouse location', example: 'main', required: false })
  @IsOptional()
  @IsString()
  warehouse?: string;

  @ApiProperty({ description: 'Available stock quantity (calculated if not provided)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableStock?: number;

  @ApiProperty({ description: 'Reserved stock quantity (defaults to 0)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reservedStock?: number;

  @ApiProperty({ description: 'Stock status', enum: ['in_stock', 'low_stock', 'out_of_stock', 'discontinued'], required: false })
  @IsOptional()
  @IsString()
  @IsIn(['in_stock', 'low_stock', 'out_of_stock', 'discontinued'])
  status?: string;
}
