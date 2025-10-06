import { IsString, IsOptional, IsUrl, IsNumber, IsBoolean, Min, Max, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBrandDto {
  @ApiProperty({ description: 'Brand name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'SEO friendly unique URL slug' })
  @IsString()
  slug: string;

  @ApiPropertyOptional({ description: 'Brand description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Brand logo URL' })
  @IsOptional()
  @IsUrl()
  logo?: string;

  @ApiPropertyOptional({ description: 'Brand website URL' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ description: 'Brand country of origin' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Brand founded year', minimum: 1800, maximum: 2024 })
  @IsOptional()
  @IsNumber()
  @Min(1800)
  @Max(2024)
  foundedYear?: number;

  @ApiPropertyOptional({ description: 'Whether brand is active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Brand sort order', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Brand metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
} 