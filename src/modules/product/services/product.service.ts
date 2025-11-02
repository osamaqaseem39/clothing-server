import { Injectable, ConflictException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { BaseService } from '../../../common/services/base.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductDocument, StockStatus } from '../schemas/product.schema';
import { ProductImage, ProductImageDocument } from '../schemas/product-image.schema';
import { ProductVariation, ProductVariationDocument } from '../schemas/product-variation.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { PaginationOptions, PaginatedResult } from '../../../common/interfaces/base.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InventoryService } from '../../inventory/services/inventory.service';

@Injectable()
export class ProductService extends BaseService<ProductDocument> {
  constructor(
    private readonly productRepository: ProductRepository,
    @InjectModel(ProductImage.name) private readonly productImageModel: Model<ProductImageDocument>,
    @InjectModel(ProductVariation.name) private readonly productVariationModel: Model<ProductVariationDocument>,
    @Inject(forwardRef(() => InventoryService)) private readonly inventoryService: InventoryService,
  ) {
    super(productRepository);
  }

  // Helper function to map Product StockStatus to Inventory status
  private mapStockStatusToInventoryStatus(stockStatus: StockStatus): string {
    switch (stockStatus) {
      case StockStatus.INSTOCK:
        return 'in_stock';
      case StockStatus.OUTOFSTOCK:
        return 'out_of_stock';
      case StockStatus.ONBACKORDER:
        return 'in_stock'; // Treat backorders as in_stock with special handling
      default:
        return 'in_stock';
    }
  }

  // Helper function to sync product inventory to inventory module
  private async syncToInventory(product: ProductDocument, updateProductDto?: UpdateProductDto): Promise<void> {
    if (!product.manageStock) {
      return; // Don't sync if stock management is disabled
    }

    try {
      // Find existing inventory record for this product
      const existingInventory = await this.inventoryService.findByProduct(product._id.toString());
      const inventoryRecord = existingInventory.length > 0 ? existingInventory[0] : null;

      const stockQuantity = updateProductDto?.stockQuantity !== undefined 
        ? updateProductDto.stockQuantity 
        : product.stockQuantity;
      
      const stockStatus = updateProductDto?.stockStatus !== undefined
        ? updateProductDto.stockStatus
        : product.stockStatus;

      const costPrice = updateProductDto?.originalPrice !== undefined
        ? updateProductDto.originalPrice
        : (product.originalPrice || 0);

      if (inventoryRecord) {
        // Update existing inventory record
        await this.inventoryService.updateInventory(inventoryRecord._id.toString(), {
          currentStock: stockQuantity,
          availableStock: stockQuantity - (inventoryRecord.reservedStock || 0),
          sellingPrice: updateProductDto?.price !== undefined ? updateProductDto.price : product.price,
          costPrice: costPrice || inventoryRecord.costPrice,
          status: this.mapStockStatusToInventoryStatus(stockStatus),
        });
      } else {
        // Create new inventory record
        await this.inventoryService.createInventory({
          productId: product._id.toString(),
          currentStock: stockQuantity,
          availableStock: stockQuantity,
          reservedStock: 0,
          reorderPoint: Math.max(10, Math.floor(stockQuantity * 0.1)), // Default to 10% of stock or 10 minimum
          reorderQuantity: Math.max(50, Math.floor(stockQuantity * 0.5)), // Default to 50% of stock or 50 minimum
          costPrice: costPrice || 0,
          sellingPrice: product.price,
          warehouse: 'main',
          status: this.mapStockStatusToInventoryStatus(stockStatus),
        });
      }
    } catch (error) {
      // Log error but don't fail product creation/update
      console.error('Error syncing product to inventory:', error);
    }
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

    // Extract variations if provided
    const variationsData = createProductDto.variations || [];
    delete createProductDto.variations;

    // Create product data with image IDs
    const productData = {
      ...createProductDto,
      images: imageIds,
    };

    const product = await this.productRepository.create(productData);

    // Create variations if provided (WooCommerce-style: create base product, then add variations)
    let variationIds: string[] = [];
    if (variationsData && variationsData.length > 0) {
      const variationDocuments = await Promise.all(
        variationsData.map(async (variationData) => {
          // Handle variation images if provided
          let variationImageIds: string[] = [];
          if (variationData.images && variationData.images.length > 0) {
            const variationImageDocuments = await Promise.all(
              variationData.images.map(async (imageData) => {
                const image = new this.productImageModel(imageData);
                return await image.save();
              })
            );
            variationImageIds = variationImageDocuments.map(img => img._id.toString());
          }

          const variation = new this.productVariationModel({
            productId: product._id,
            sku: variationData.sku,
            price: variationData.price,
            salePrice: variationData.comparePrice || variationData.salePrice,
            stockQuantity: variationData.stockQuantity || 0,
            stockStatus: variationData.stockStatus || 'outofstock',
            attributes: variationData.attributes || [],
            images: variationImageIds,
          });
          return await variation.save();
        })
      );
      variationIds = variationDocuments.map(v => v._id.toString());
    }

    // Update product with variation IDs
    if (variationIds.length > 0) {
      const updatedProduct = await this.productRepository.update(product._id.toString(), { variations: variationIds });
      // Sync to inventory after product creation
      await this.syncToInventory(updatedProduct);
      // Return populated product
      const populated = await this.productRepository.findById(updatedProduct._id.toString());
      return populated as any;
    }

    // Sync to inventory after product creation
    await this.syncToInventory(product);
    const populated = await this.productRepository.findById(product._id.toString());
    return populated as any;
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

    // Extract variations if provided
    const variationsData = updateProductDto.variations || [];
    delete updateProductDto.variations;

    // Create update data with image IDs if provided
    const updateData = {
      ...updateProductDto,
      ...(imageIds && { images: imageIds }),
    };

    // Update the base product
    const updatedProduct = await this.productRepository.update(id, updateData);

    // Handle variations if provided
    if (variationsData && variationsData.length > 0) {
      // Delete existing variations for this product (optional, depending on requirements)
      // await this.productVariationModel.deleteMany({ productId: id });

      // Create new variations
      const variationDocuments = await Promise.all(
        variationsData.map(async (variationData) => {
          // Handle variation images if provided
          let variationImageIds: string[] = [];
          if (variationData.images && variationData.images.length > 0) {
            const variationImageDocuments = await Promise.all(
              variationData.images.map(async (imageData) => {
                const image = new this.productImageModel(imageData);
                return await image.save();
              })
            );
            variationImageIds = variationImageDocuments.map(img => img._id.toString());
          }

          // If variation has an ID, update it, otherwise create new
          if (variationData._id) {
            return await this.productVariationModel.findByIdAndUpdate(
              variationData._id,
              {
                ...variationData,
                productId: id,
                images: variationImageIds.length > 0 ? variationImageIds : undefined,
              },
              { new: true }
            );
          } else {
            const variation = new this.productVariationModel({
              productId: id,
              sku: variationData.sku,
              price: variationData.price,
              salePrice: variationData.comparePrice || variationData.salePrice,
              stockQuantity: variationData.stockQuantity || 0,
              stockStatus: variationData.stockStatus || 'outofstock',
              attributes: variationData.attributes || [],
              images: variationImageIds,
            });
            return await variation.save();
          }
        })
      );
      
      const variationIds = variationDocuments.map(v => v._id.toString());
      
      // Update product with variation IDs
      const finalProduct = await this.productRepository.update(id, { variations: variationIds });
      // Sync to inventory after product update
      await this.syncToInventory(finalProduct, updateProductDto);
      const populatedFinal = await this.productRepository.findById(finalProduct._id.toString());
      return populatedFinal as any;
    }

    // Sync to inventory after product update (if inventory-related fields changed)
    if (updateProductDto.stockQuantity !== undefined || 
        updateProductDto.stockStatus !== undefined || 
        updateProductDto.price !== undefined ||
        updateProductDto.originalPrice !== undefined) {
      await this.syncToInventory(updatedProduct, updateProductDto);
    }
    const populatedUpdated = await this.productRepository.findById(updatedProduct._id.toString());
    return populatedUpdated as any;
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

    const updatedProduct = await this.productRepository.update(id, {
      stockQuantity: Math.max(0, newQuantity),
      stockStatus,
    });

    // Sync to inventory
    await this.syncToInventory(updatedProduct, {
      stockQuantity: Math.max(0, newQuantity),
      stockStatus,
    });

    return updatedProduct;
  }

  // Public method to sync inventory data to product (used by InventoryService)
  async syncInventoryToProduct(productId: string, inventoryData: {
    stockQuantity: number;
    stockStatus: StockStatus;
    price?: number;
    originalPrice?: number;
  }): Promise<ProductDocument> {
    const updateData: any = {
      stockQuantity: inventoryData.stockQuantity,
      stockStatus: inventoryData.stockStatus,
    };

    if (inventoryData.price !== undefined) {
      updateData.price = inventoryData.price;
    }

    if (inventoryData.originalPrice !== undefined) {
      updateData.originalPrice = inventoryData.originalPrice;
    }

    return await this.productRepository.update(productId, updateData);
  }

  async getFilterOptions(): Promise<{
    categories: Array<{ _id: string; name: string; slug: string }>;
    brands: Array<{ _id: string; name: string; slug: string }>;
    sizes: string[];
    colors: string[];
    priceRange: { min: number; max: number };
  }> {
    return await this.productRepository.getFilterOptions();
  }
} 