import { IsString, IsNumber, IsOptional, IsMongoId, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  productId: string;

  @ApiPropertyOptional({ description: 'Product variation ID' })
  @IsOptional()
  @IsMongoId()
  variationId?: string;

  @ApiProperty({ description: 'Quantity to add', minimum: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
} 