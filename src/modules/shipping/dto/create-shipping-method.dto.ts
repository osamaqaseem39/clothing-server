import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShippingMethodDto {
  @ApiProperty({ description: 'Shipping method name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Shipping method description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Base shipping cost', minimum: 0 })
  @IsNumber()
  @Min(0)
  baseCost: number;

  @ApiPropertyOptional({ description: 'Additional cost per kg', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  additionalCostPerKg?: number;

  @ApiPropertyOptional({ description: 'Additional cost per item', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  additionalCostPerItem?: number;

  @ApiProperty({ description: 'Estimated delivery time in days', minimum: 1 })
  @IsNumber()
  @Min(1)
  estimatedDays: number;

  @ApiPropertyOptional({ description: 'Maximum weight limit in kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  @ApiPropertyOptional({ description: 'Minimum order amount for free shipping' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;

  @ApiPropertyOptional({ description: 'Countries where this method is available' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableCountries?: string[];

  @ApiPropertyOptional({ description: 'Regions where this method is available' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableRegions?: string[];

  @ApiPropertyOptional({ description: 'Whether this method is active', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Sort order for display', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
} 