import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DiscountType } from '../schemas/coupon.schema';

export class CreateCouponDto {
  @ApiProperty({ description: 'Coupon code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Coupon description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType, description: 'Discount type' })
  @IsEnum(DiscountType)
  discountType: DiscountType;

  @ApiProperty({ description: 'Discount amount', minimum: 0 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Usage limit', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ description: 'Expiry date' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ description: 'Minimum spend amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumSpend?: number;

  @ApiPropertyOptional({ description: 'Maximum spend amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumSpend?: number;

  @ApiPropertyOptional({ description: 'Whether coupon can be used individually', default: true })
  @IsOptional()
  @IsBoolean()
  individualUse?: boolean;

  @ApiPropertyOptional({ description: 'Product IDs this coupon applies to' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  productIds?: string[];

  @ApiPropertyOptional({ description: 'Product IDs excluded from this coupon' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  excludedProductIds?: string[];
} 