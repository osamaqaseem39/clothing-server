import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { BaseService } from '@/common/services/base.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductDocument, StockStatus } from '../schemas/product.schema';
import { ProductImage, ProductImageDocument } from '../schemas/product-image.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { PaginationOptions, PaginatedResult } from '@/common/interfaces/base.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ProductService extends BaseService<ProductDocument> {
  constructor(
    private readonly productRepository: ProductRepository,
    @InjectModel(ProductImage.name) private readonly productImageModel: Model<ProductImageDocument>,
  ) {
    super(productRepository);
  }

  async createProduct(createProductDto: CreateProductDto): Promise<ProductDocument> {
    // Check if product with same slug or SKU already exists
    const existingSlug = await this.productRepository.findBySlug(createProductDto.slug);
    if (existingSlug) {
      throw new ConflictException(`Product with slug '${createProductDto.slug}' already exists`);
    }

    const existingSku = await this.productRepository.findBySku(createProductDto.sku);
    if (existingSku) {
      throw new ConflictException(`Product with SKU '${createProductDto.sku}' already exists`);
    }

    // Validate sale price is less than regular price
    if (createProductDto.salePrice && createProductDto.salePrice >= createProductDto.price) {
      throw new BadRequestException('Sale price must be less than regular price');
    }

    // Auto-update stock status based on quantity
    if (createProductDto.manageStock) {
      if (createProductDto.stockQuantity > 0) {
        createProductDto.stockStatus = StockStatus.INSTOCK;
      } else if (createProductDto.allowBackorders) {
        createProductDto.stockStatus = StockStatus.ONBACKORDER;
      } else {
        createProductDto.stockStatus = StockStatus.OUTOFSTOCK;
      }
    }

    // Handle image creation if provided
    let imageIds: string[] = [];
    if (createProductDto.images && createProductDto.images.length > 0) {
      const imageDocuments = await Promise.all(
        createProductDto.images.map(async (imageData) => {
          const image = new this.productImageModel(imageData);
          return await image.save();
        })
      );
      imageIds = imageDocuments.map(img => img._id.toString());
    }

    // Create product data with image IDs
    const productData = {
      ...createProductDto,
      images: imageIds,
    };

    return await this.productRepository.create(productData);
  }

  async updateProduct(id: string, updateProductDto: UpdateProductDto): Promise<ProductDocument> {
    // Check if product exists
    await this.findById(id);

    // If updating slug, check for conflicts
    if (updateProductDto.slug) {
      const existingSlug = await this.productRepository.findBySlug(updateProductDto.slug);
      if (existingSlug && existingSlug._id.toString() !== id) {
        throw new ConflictException(`Product with slug '${updateProductDto.slug}' already exists`);
      }
    }

    // If updating SKU, check for conflicts
    if (updateProductDto.sku) {
      const existingSku = await this.productRepository.findBySku(updateProductDto.sku);
      if (existingSku && existingSku._id.toString() !== id) {
        throw new ConflictException(`Product with SKU '${updateProductDto.sku}' already exists`);
      }
    }

    // Validate sale price
    if (updateProductDto.salePrice !== undefined) {
      const currentProduct = await this.findById(id);
      const price = updateProductDto.price || currentProduct.price;
      if (updateProductDto.salePrice >= price) {
        throw new BadRequestException('Sale price must be less than regular price');
      }
    }

    // Auto-update stock status if stock quantity is being updated
    if (updateProductDto.stockQuantity !== undefined && updateProductDto.manageStock !== false) {
      if (updateProductDto.stockQuantity > 0) {
        updateProductDto.stockStatus = StockStatus.INSTOCK;
      } else if (updateProductDto.allowBackorders) {
        updateProductDto.stockStatus = StockStatus.ONBACKORDER;
      } else {
        updateProductDto.stockStatus = StockStatus.OUTOFSTOCK;
      }
    }

    // Handle image updates if provided
    let imageIds: string[] | undefined;
    if (updateProductDto.images && updateProductDto.images.length > 0) {
      const imageDocuments = await Promise.all(
        updateProductDto.images.map(async (imageData) => {
          const image = new this.productImageModel(imageData);
          return await image.save();
        })
      );
      imageIds = imageDocuments.map(img => img._id.toString());
    }

    // Create update data with image IDs if provided
    const updateData = {
      ...updateProductDto,
      ...(imageIds && { images: imageIds }),
    };

    return await this.productRepository.update(id, updateData);
  }

  async findBySlug(slug: string): Promise<ProductDocument> {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new Error(`Product with slug '${slug}' not found`);
    }
    return product;
  }

  async findByCategory(categoryId: string, options?: PaginationOptions): Promise<PaginatedResult<ProductDocument>> {
    return await this.productRepository.findByCategory(categoryId, options);
  }

  async findByBrand(brandId: string, options?: PaginationOptions): Promise<PaginatedResult<ProductDocument>> {
    return await this.productRepository.findByBrand(brandId, options);
  }

  async searchProducts(query: string, options?: PaginationOptions): Promise<PaginatedResult<ProductDocument>> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters long');
    }
    return await this.productRepository.searchProducts(query, options);
  }

  async findPublishedProducts(options?: PaginationOptions): Promise<PaginatedResult<ProductDocument>> {
    return await this.productRepository.findPublishedProducts(options);
  }

  async updateStock(id: string, quantity: number): Promise<ProductDocument> {
    const product = await this.findById(id);
    
    if (!product.manageStock) {
      throw new BadRequestException('Stock management is not enabled for this product');
    }

    const newQuantity = product.stockQuantity + quantity;
    let stockStatus = product.stockStatus;

    if (newQuantity > 0) {
      stockStatus = StockStatus.INSTOCK;
    } else if (product.allowBackorders) {
      stockStatus = StockStatus.ONBACKORDER;
    } else {
      stockStatus = StockStatus.OUTOFSTOCK;
    }

    return await this.productRepository.update(id, {
      stockQuantity: Math.max(0, newQuantity),
      stockStatus,
    });
  }
} 