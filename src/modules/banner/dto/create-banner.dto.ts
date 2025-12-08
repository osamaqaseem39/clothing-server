import { IsString, IsNumber, IsBoolean, IsOptional, IsEnum, IsUrl, IsDateString, Min, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class RequiredSizeDto {
  @ApiProperty({ description: 'Image width in pixels', example: 1920 })
  @IsNumber()
  @Min(1)
  width: number;

  @ApiProperty({ description: 'Image height in pixels', example: 800 })
  @IsNumber()
  @Min(1)
  height: number;
}

export class CreateBannerDto {
  @ApiProperty({ description: 'Banner title', example: 'Summer Collection 2024' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Banner subtitle', example: 'New Arrivals' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'Banner description', example: 'Discover our latest summer collection' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Banner image URL', example: 'https://example.com/banner.jpg' })
  @IsUrl()
  imageUrl: string;

  @ApiPropertyOptional({ description: 'Alt text for the banner image', example: 'Summer Collection Banner' })
  @IsOptional()
  @IsString()
  altText?: string;

  @ApiPropertyOptional({ description: 'Link URL when banner is clicked', example: '/shop?collection=summer' })
  @IsOptional()
  @IsString()
  linkUrl?: string;

  @ApiPropertyOptional({ description: 'Link text', example: 'Shop Now' })
  @IsOptional()
  @IsString()
  linkText?: string;

  @ApiPropertyOptional({ description: 'Display order (lower numbers appear first)', example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  displayOrder?: number;

  @ApiPropertyOptional({ description: 'Whether banner is enabled', example: true, default: true })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ 
    description: 'Banner position/type', 
    enum: ['hero', 'collection', 'promotional', 'sidebar'],
    example: 'hero',
    default: 'hero'
  })
  @IsOptional()
  @IsEnum(['hero', 'collection', 'promotional', 'sidebar'])
  position?: 'hero' | 'collection' | 'promotional' | 'sidebar';

  @ApiPropertyOptional({ description: 'Start date for banner display (ISO string)', example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for banner display (ISO string)', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    description: 'Required image dimensions (width x height in pixels)',
    example: { width: 1920, height: 800 },
    default: { width: 1920, height: 800 }
  })
  @ValidateNested()
  @Type(() => RequiredSizeDto)
  requiredSize: RequiredSizeDto;

  @ApiPropertyOptional({ description: 'Banner metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

