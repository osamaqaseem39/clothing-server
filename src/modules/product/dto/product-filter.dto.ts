import { IsOptional, IsString, IsArray, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// Helper to transform query params to arrays (handles both single values and arrays)
const transformToArray = ({ value }) => {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value;
  return [value];
};

export class ProductFilterDto {
  // Basic filters
  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Category IDs', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Brand IDs', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
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
  @ApiPropertyOptional({ description: 'Fabric types', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  fabrics?: string[];

  @ApiPropertyOptional({ description: 'Collections', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  collectionNames?: string[];

  @ApiPropertyOptional({ description: 'Occasions', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  occasions?: string[];

  @ApiPropertyOptional({ description: 'Seasons', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  seasons?: string[];

  @ApiPropertyOptional({ description: 'Designers', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  designers?: string[];

  @ApiPropertyOptional({ description: 'Handwork types', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  handwork?: string[];

  @ApiPropertyOptional({ description: 'Color families', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  colorFamilies?: string[];

  @ApiPropertyOptional({ description: 'Pattern types', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  patterns?: string[];

  @ApiPropertyOptional({ description: 'Sleeve lengths', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  sleeveLengths?: string[];

  @ApiPropertyOptional({ description: 'Neckline styles', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  necklines?: string[];

  @ApiPropertyOptional({ description: 'Lengths', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  lengths?: string[];

  @ApiPropertyOptional({ description: 'Fit types', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  fits?: string[];

  @ApiPropertyOptional({ description: 'Age groups', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  ageGroups?: string[];

  @ApiPropertyOptional({ description: 'Body types', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
  @IsArray()
  @IsString({ each: true })
  bodyTypes?: string[];

  @ApiPropertyOptional({ description: 'Available sizes', type: [String] })
  @IsOptional()
  @Transform(transformToArray)
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