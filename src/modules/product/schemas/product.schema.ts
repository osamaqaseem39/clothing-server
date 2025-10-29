import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ProductDocument = Product & Document;

export enum ProductType {
  SIMPLE = 'simple',
  VARIABLE = 'variable',
  GROUPED = 'grouped',
  EXTERNAL = 'external',
}

export enum StockStatus {
  INSTOCK = 'instock',
  OUTOFSTOCK = 'outofstock',
  ONBACKORDER = 'onbackorder',
}

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true })
export class Product {
  @ApiProperty({ description: 'Product ID' })
  _id: string;

  @ApiProperty({ description: 'Product name' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'SEO friendly unique URL slug' })
  @Prop({ required: true, unique: true, trim: true })
  slug: string;

  @ApiProperty({ description: 'Product description' })
  @Prop({ required: true })
  description: string;

  @ApiProperty({ description: 'Short product description' })
  @Prop({ required: true })
  shortDescription: string;

  @ApiProperty({ description: 'Stock Keeping Unit' })
  @Prop({ required: true, unique: true, trim: true })
  sku: string;

  @ApiProperty({ enum: ProductType, description: 'Product type' })
  @Prop({ required: true, enum: ProductType, default: ProductType.SIMPLE })
  type: ProductType;

  @ApiProperty({ description: 'Product price' })
  @Prop({ required: true, min: 0 })
  price: number;

  @ApiProperty({ description: 'Sale price (optional)' })
  @Prop({ min: 0 })
  salePrice?: number;

  @ApiProperty({ description: 'Currency code' })
  @Prop({ required: true, default: 'PKR' })
  currency: string;

  @ApiProperty({ description: 'Stock quantity' })
  @Prop({ required: true, min: 0, default: 0 })
  stockQuantity: number;

  @ApiProperty({ enum: StockStatus, description: 'Stock status' })
  @Prop({ required: true, enum: StockStatus, default: StockStatus.OUTOFSTOCK })
  stockStatus: StockStatus;

  @ApiProperty({ description: 'Product weight' })
  @Prop({ min: 0 })
  weight?: number;

  @ApiProperty({ description: 'Product dimensions' })
  @Prop({
    type: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
  })
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @ApiProperty({ description: 'Whether to manage stock' })
  @Prop({ default: true })
  manageStock: boolean;

  @ApiProperty({ description: 'Whether to allow backorders' })
  @Prop({ default: false })
  allowBackorders: boolean;

  @ApiProperty({ enum: ProductStatus, description: 'Product status' })
  @Prop({ required: true, enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @ApiProperty({ description: 'Category IDs' })
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Category' })
  categories: string[];

  @ApiProperty({ description: 'Tag IDs' })
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Tag' })
  tags: string[];

  @ApiProperty({ description: 'Brand ID' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Brand' })
  brand?: string;

  @ApiProperty({ description: 'Product attributes as array of attribute IDs' })
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Attribute', default: [] })
  attributes: string[];

  @ApiProperty({ description: 'Product variations' })
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'ProductVariation' })
  variations?: string[];

  @ApiProperty({ description: 'Product images' })
  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'ProductImage' })
  images: string[];

  // Pakistani Clothing Specific Fields
  @ApiProperty({ description: 'Fabric type (e.g., Cotton, Silk, Lawn, Chiffon)' })
  @Prop({ type: String, trim: true })
  fabric?: string;

  @ApiProperty({ description: 'Collection name (e.g., Summer 2024, Eid Collection)' })
  @Prop({ type: String, trim: true })
  collectionName?: string;

  @ApiProperty({ description: 'Occasion type (e.g., Formal, Casual, Wedding, Party)' })
  @Prop({ type: String, trim: true })
  occasion?: string;

  @ApiProperty({ description: 'Season (e.g., Summer, Winter, All Season)' })
  @Prop({ type: String, trim: true })
  season?: string;

  @ApiProperty({ description: 'Care instructions' })
  @Prop({ type: String })
  careInstructions?: string;

  @ApiProperty({ description: 'Model measurements for size reference' })
  @Prop({
    type: {
      height: { type: String },
      bust: { type: String },
      waist: { type: String },
      hips: { type: String },
    },
  })
  modelMeasurements?: {
    height: string;
    bust: string;
    waist: string;
    hips: string;
  };

  @ApiProperty({ description: 'Designer/Design House name' })
  @Prop({ type: String, trim: true })
  designer?: string;

  @ApiProperty({ description: 'Handwork details (e.g., Embroidery, Zari, Sequins)' })
  @Prop({ type: [String] })
  handwork?: string[];

  @ApiProperty({ description: 'Color family (e.g., Pastels, Brights, Neutrals)' })
  @Prop({ type: String, trim: true })
  colorFamily?: string;

  @ApiProperty({ description: 'Pattern type (e.g., Solid, Floral, Geometric, Abstract)' })
  @Prop({ type: String, trim: true })
  pattern?: string;

  @ApiProperty({ description: 'Sleeve length (e.g., Sleeveless, Short, 3/4, Long)' })
  @Prop({ type: String, trim: true })
  sleeveLength?: string;

  @ApiProperty({ description: 'Neckline style (e.g., Round, V-neck, Boat, High)' })
  @Prop({ type: String, trim: true })
  neckline?: string;

  @ApiProperty({ description: 'Length (e.g., Short, Medium, Long, Floor Length)' })
  @Prop({ type: String, trim: true })
  length?: string;

  @ApiProperty({ description: 'Fit type (e.g., Loose, Fitted, Semi-fitted, Oversized)' })
  @Prop({ type: String, trim: true })
  fit?: string;

  @ApiProperty({ description: 'Age group (e.g., Young Adult, Adult, Mature)' })
  @Prop({ type: String, trim: true })
  ageGroup?: string;

  @ApiProperty({ description: 'Body type suitability' })
  @Prop({ type: [String] })
  bodyType?: string[];

  @ApiProperty({ description: 'Is this a limited edition item' })
  @Prop({ default: false })
  isLimitedEdition?: boolean;

  @ApiProperty({ description: 'Is this a custom made item' })
  @Prop({ default: false })
  isCustomMade?: boolean;

  @ApiProperty({ description: 'Estimated delivery time for custom items (in days)' })
  @Prop({ min: 0 })
  customDeliveryDays?: number;

  @ApiProperty({ description: 'Size chart ID for this product' })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'SizeChart' })
  sizeChart?: string;

  @ApiProperty({ description: 'Size chart image URL (direct)' })
  @Prop({ type: String })
  sizeChartImageUrl?: string;

  @ApiProperty({ description: 'Available sizes for this product' })
  @Prop({ type: [String] })
  availableSizes?: string[];

  // UI-specific fields
  @ApiProperty({ description: 'Original price before sale' })
  @Prop({ min: 0 })
  originalPrice?: number;

  @ApiProperty({ description: 'Product rating (0-5)' })
  @Prop({ min: 0, max: 5 })
  rating?: number;

  @ApiProperty({ description: 'Number of reviews' })
  @Prop({ min: 0 })
  reviews?: number;

  @ApiProperty({ description: 'Is this a new product' })
  @Prop({ default: false })
  isNew?: boolean;

  @ApiProperty({ description: 'Is this product on sale' })
  @Prop({ default: false })
  isSale?: boolean;

  @ApiProperty({ description: 'Product features list' })
  @Prop({ type: [String], default: [] })
  features?: string[];

  @ApiProperty({ description: 'Available colors with images' })
  @Prop({
    type: [{
      colorId: { type: MongooseSchema.Types.ObjectId, ref: 'Color', required: true },
      imageUrl: { type: String },
    }],
    default: [],
  })
  colors?: Array<{
    colorId: string;
    imageUrl?: string;
  }>;

  @ApiProperty({ description: 'Stock availability status' })
  @Prop({ default: true })
  inStock?: boolean;

  @ApiProperty({ description: 'Stock count for display' })
  @Prop({ min: 0 })
  stockCount?: number;

  @ApiProperty({ description: 'Product weight for shipping' })
  @Prop({ min: 0 })
  shippingWeight?: number;

  @ApiProperty({ description: 'Product dimensions for shipping' })
  @Prop({
    type: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
  })
  shippingDimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @ApiProperty({ description: 'Product is active' })
  @Prop({ default: true })
  isActive?: boolean;

  @ApiProperty({ description: 'SEO data' })
  @Prop({
    type: {
      title: { type: String },
      description: { type: String },
      keywords: { type: [String] },
      slug: { type: String },
      canonicalUrl: { type: String },
      ogImage: { type: String },
      noIndex: { type: Boolean, default: false },
      noFollow: { type: Boolean, default: false },
    },
  })
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    slug?: string;
    canonicalUrl?: string;
    ogImage?: string;
    noIndex: boolean;
    noFollow: boolean;
  };

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes for better performance
ProductSchema.index({ brand: 1 });
ProductSchema.index({ categories: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ createdAt: -1 });

// Pakistani Clothing Specific Indexes
ProductSchema.index({ fabric: 1 });
ProductSchema.index({ collectionName: 1 });
ProductSchema.index({ occasion: 1 });
ProductSchema.index({ season: 1 });
ProductSchema.index({ designer: 1 });
ProductSchema.index({ handwork: 1 });
ProductSchema.index({ colorFamily: 1 });
ProductSchema.index({ pattern: 1 });
ProductSchema.index({ sleeveLength: 1 });
ProductSchema.index({ neckline: 1 });
ProductSchema.index({ length: 1 });
ProductSchema.index({ fit: 1 });
ProductSchema.index({ ageGroup: 1 });
ProductSchema.index({ bodyType: 1 });
ProductSchema.index({ isLimitedEdition: 1 });
ProductSchema.index({ isCustomMade: 1 });
ProductSchema.index({ sizeChart: 1 });
ProductSchema.index({ availableSizes: 1 });

// UI-specific indexes
ProductSchema.index({ originalPrice: 1 });
ProductSchema.index({ rating: 1 });
ProductSchema.index({ reviews: 1 });
ProductSchema.index({ isNew: 1 });
ProductSchema.index({ isSale: 1 });
ProductSchema.index({ features: 1 });
ProductSchema.index({ colors: 1 });
ProductSchema.index({ inStock: 1 });
ProductSchema.index({ stockCount: 1 });
ProductSchema.index({ isActive: 1 });
ProductSchema.index({ attributes: 1 }); 