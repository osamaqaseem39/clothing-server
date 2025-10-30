import { IsString, IsNumber, IsOptional, IsEnum, IsArray, IsBoolean, Min, IsUrl, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType, StockStatus, ProductStatus } from '../schemas/product.schema';
import { Type } from 'class-transformer';

class ProductColorDto {
  @ApiProperty({ description: 'Color ID reference', type: String })
  @IsString()
  colorId: string;

  @ApiPropertyOptional({ description: 'Optional image URL for this color', type: String })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'SEO friendly unique URL slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Product description' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Short product description' })
  @IsString()
  shortDescription: string;

  @ApiProperty({ description: 'Stock Keeping Unit' })
  @IsString()
  sku: string;

  @ApiProperty({ enum: ProductType, description: 'Product type' })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiProperty({ description: 'Product price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ description: 'Sale price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  salePrice?: number;

  @ApiPropertyOptional({ description: 'Currency code', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Stock quantity' })
  @IsNumber()
  @Min(0)
  stockQuantity: number;

  @ApiProperty({ enum: StockStatus, description: 'Stock status' })
  @IsEnum(StockStatus)
  stockStatus: StockStatus;

  @ApiPropertyOptional({ description: 'Product weight' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional({ description: 'Product dimensions' })
  @IsOptional()
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @ApiPropertyOptional({ description: 'Whether to manage stock', default: true })
  @IsOptional()
  @IsBoolean()
  manageStock?: boolean;

  @ApiPropertyOptional({ description: 'Whether to allow backorders', default: false })
  @IsOptional()
  @IsBoolean()
  allowBackorders?: boolean;

  @ApiProperty({ enum: ProductStatus, description: 'Product status' })
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @ApiPropertyOptional({ description: 'Category IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];

  @ApiPropertyOptional({ description: 'Tag IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Brand ID' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'Product attributes' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attributes?: string[];

  @ApiPropertyOptional({ description: 'Product images' })
  @IsOptional()
  @IsArray()
  images?: {
    url: string;
    altText?: string;
    position: number;
  }[];

  @ApiPropertyOptional({
    description: 'Available colors with optional images',
    type: [ProductColorDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductColorDto)
  colors?: ProductColorDto[];

  @ApiPropertyOptional({ description: 'Product variations' })
  @IsOptional()
  @IsArray()
  variations?: any[]; // Will be processed to create separate ProductVariation documents

  // Pakistani Clothing Specific Fields
  @ApiPropertyOptional({ description: 'Fabric type (e.g., Cotton, Silk, Lawn, Chiffon)' })
  @IsOptional()
  @IsString()
  fabric?: string;

  @ApiPropertyOptional({ description: 'Collection name (e.g., Summer 2024, Eid Collection)' })
  @IsOptional()
  @IsString()
  collectionName?: string;

  @ApiPropertyOptional({ description: 'Occasion type (e.g., Formal, Casual, Wedding, Party)' })
  @IsOptional()
  @IsString()
  occasion?: string;

  @ApiPropertyOptional({ description: 'Season (e.g., Summer, Winter, All Season)' })
  @IsOptional()
  @IsString()
  season?: string;

  @ApiPropertyOptional({ description: 'Care instructions' })
  @IsOptional()
  @IsString()
  careInstructions?: string;

  @ApiPropertyOptional({ description: 'Model measurements for size reference' })
  @IsOptional()
  modelMeasurements?: {
    height: string;
    bust: string;
    waist: string;
    hips: string;
  };

  @ApiPropertyOptional({ description: 'Designer/Design House name' })
  @IsOptional()
  @IsString()
  designer?: string;

  @ApiPropertyOptional({ description: 'Handwork details (e.g., Embroidery, Zari, Sequins)' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  handwork?: string[];

  @ApiPropertyOptional({ description: 'Color family (e.g., Pastels, Brights, Neutrals)' })
  @IsOptional()
  @IsString()
  colorFamily?: string;

  @ApiPropertyOptional({ description: 'Pattern type (e.g., Solid, Floral, Geometric, Abstract)' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({ description: 'Sleeve length (e.g., Sleeveless, Short, 3/4, Long)' })
  @IsOptional()
  @IsString()
  sleeveLength?: string;

  @ApiPropertyOptional({ description: 'Neckline style (e.g., Round, V-neck, Boat, High)' })
  @IsOptional()
  @IsString()
  neckline?: string;

  @ApiPropertyOptional({ description: 'Length (e.g., Short, Medium, Long, Floor Length)' })
  @IsOptional()
  @IsString()
  length?: string;

  @ApiPropertyOptional({ description: 'Fit type (e.g., Loose, Fitted, Semi-fitted, Oversized)' })
  @IsOptional()
  @IsString()
  fit?: string;

  @ApiPropertyOptional({ description: 'Age group (e.g., Young Adult, Adult, Mature)' })
  @IsOptional()
  @IsString()
  ageGroup?: string;

  @ApiPropertyOptional({ description: 'Body type suitability' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bodyType?: string[];

  @ApiPropertyOptional({ description: 'Is this a limited edition item', default: false })
  @IsOptional()
  @IsBoolean()
  isLimitedEdition?: boolean;

  @ApiPropertyOptional({ description: 'Is this a custom made item', default: false })
  @IsOptional()
  @IsBoolean()
  isCustomMade?: boolean;

  @ApiPropertyOptional({ description: 'Estimated delivery time for custom items (in days)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customDeliveryDays?: number;

  @ApiPropertyOptional({ description: 'Size chart ID for this product' })
  @IsOptional()
  @IsString()
  sizeChart?: string;

  @ApiPropertyOptional({ description: 'Available sizes for this product' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableSizes?: string[];

  @ApiPropertyOptional({ description: 'Original/cost price (used for inventory cost calculation)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;
} 