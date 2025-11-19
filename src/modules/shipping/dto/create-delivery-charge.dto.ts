import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeliveryChargeDto {
  @ApiProperty({ description: 'Location name (e.g., City, State, Region)' })
  @IsString()
  @IsNotEmpty()
  locationName: string;

  @ApiProperty({ 
    description: 'Location type: country, state, city, or postal_code',
    enum: ['country', 'state', 'city', 'postal_code']
  })
  @IsEnum(['country', 'state', 'city', 'postal_code'])
  locationType: 'country' | 'state' | 'city' | 'postal_code';

  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ description: 'State/Province code or name' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'City name' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Postal/ZIP code' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiProperty({ description: 'Base delivery charge', minimum: 0 })
  @IsNumber()
  @Min(0)
  baseCharge: number;

  @ApiPropertyOptional({ description: 'Additional charge per kg', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  chargePerKg?: number;

  @ApiPropertyOptional({ description: 'Additional charge per item', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  chargePerItem?: number;

  @ApiPropertyOptional({ description: 'Free shipping threshold', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  freeShippingThreshold?: number;

  @ApiPropertyOptional({ description: 'Minimum order amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum order amount', minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Whether this delivery charge is enabled', default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Priority for matching (higher priority = checked first)', default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ description: 'Estimated delivery days', minimum: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDeliveryDays?: number;
}

