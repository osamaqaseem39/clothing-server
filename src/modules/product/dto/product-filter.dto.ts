import { IsOptional, IsString, IsArray, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ProductFilterDto {
  // Basic filters
  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Category IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Brand IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  brands?: string[];

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Product status' })
  @IsOptional()
  @IsString()
  status?: string;

  // Pakistani Clothing Specific Filters
  @ApiPropertyOptional({ description: 'Fabric types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fabrics?: string[];

  @ApiPropertyOptional({ description: 'Collections' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  collections?: string[];

  @ApiPropertyOptional({ description: 'Occasions' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  occasions?: string[];

  @ApiPropertyOptional({ description: 'Seasons' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seasons?: string[];

  @ApiPropertyOptional({ description: 'Designers' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  designers?: string[];

  @ApiPropertyOptional({ description: 'Handwork types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  handwork?: string[];

  @ApiPropertyOptional({ description: 'Color families' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colorFamilies?: string[];

  @ApiPropertyOptional({ description: 'Pattern types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  patterns?: string[];

  @ApiPropertyOptional({ description: 'Sleeve lengths' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sleeveLengths?: string[];

  @ApiPropertyOptional({ description: 'Neckline styles' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  necklines?: string[];

  @ApiPropertyOptional({ description: 'Lengths' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lengths?: string[];

  @ApiPropertyOptional({ description: 'Fit types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fits?: string[];

  @ApiPropertyOptional({ description: 'Age groups' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ageGroups?: string[];

  @ApiPropertyOptional({ description: 'Body types' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bodyTypes?: string[];

  @ApiPropertyOptional({ description: 'Available sizes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

  @ApiPropertyOptional({ description: 'Limited edition items only' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isLimitedEdition?: boolean;

  @ApiPropertyOptional({ description: 'Custom made items only' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isCustomMade?: boolean;

  // Pagination
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // Sorting
  @ApiPropertyOptional({ description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ description: 'Sort order', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}