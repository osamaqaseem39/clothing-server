import { Injectable, ConflictException, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { BaseService } from '../../../common/services/base.service';
import { ProductRepository } from '../repositories/product.repository';
import { ProductDocument, StockStatus } from '../schemas/product.schema';
import { ProductImage, ProductImageDocument } from '../schemas/product-image.schema';
import { ProductVariation, ProductVariationDocument } from '../schemas/product-variation.schema';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductFilterDto } from '../dto/product-filter.dto';
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
      const stockStatus = updateProductDto?.stockStatus !== undefined
        ? updateProductDto.stockStatus
        : product.stockStatus;

      const costPrice = updateProductDto?.originalPrice !== undefined
        ? updateProductDto.originalPrice
        : (product.originalPrice || 0);

      const sellingPrice = updateProductDto?.price !== undefined ? updateProductDto.price : product.price;

      // Check if product has size-wise inventory
      const hasSizes = product.availableSizes && product.availableSizes.length > 0;
      const sizeInventory = (updateProductDto as any)?.sizeInventory || [];

      if (hasSizes && sizeInventory && sizeInventory.length > 0) {
        // Handle size-wise inventory
        const existingInventory = await this.inventoryService.findByProduct(product._id.toString());
        
        // Process each size
        for (const sizeItem of sizeInventory) {
          const size = sizeItem.size;
          const stockQuantity = sizeItem.quantity || 0;
          
          // Find existing inventory record for this size
          const sizeInventoryRecord = existingInventory.find(inv => inv.size === size);
          
          if (sizeInventoryRecord) {
            // Update existing inventory record for this size
            await this.inventoryService.updateInventory(sizeInventoryRecord._id.toString(), {
              currentStock: stockQuantity,
              availableStock: stockQuantity - (sizeInventoryRecord.reservedStock || 0),
              sellingPrice: sellingPrice,
              costPrice: costPrice || sizeInventoryRecord.costPrice,
              status: this.mapStockStatusToInventoryStatus(stockStatus),
            });
          } else {
            // Create new inventory record for this size
            await this.inventoryService.createInventory({
              productId: product._id.toString(),
              size: size,
              currentStock: stockQuantity,
              availableStock: stockQuantity,
              reservedStock: 0,
              reorderPoint: Math.max(10, Math.floor(stockQuantity * 0.1)),
              reorderQuantity: Math.max(50, Math.floor(stockQuantity * 0.5)),
              costPrice: costPrice || 0,
              sellingPrice: sellingPrice,
              warehouse: 'main',
              status: this.mapStockStatusToInventoryStatus(stockStatus),
            });
          }
        }

        // Remove inventory records for sizes that are no longer in availableSizes
        const currentSizes = product.availableSizes || [];
        const inventoryToRemove = existingInventory.filter(inv => 
          inv.size && !currentSizes.includes(inv.size)
        );
        for (const inv of inventoryToRemove) {
          await this.inventoryService.deleteInventory(inv._id.toString());
        }
      } else {
        // Handle single inventory record (no sizes)
        const existingInventory = await this.inventoryService.findByProduct(product._id.toString());
        // Filter out size-specific inventory records
        const nonSizeInventory = existingInventory.filter(inv => !inv.size);
        const inventoryRecord = nonSizeInventory.length > 0 ? nonSizeInventory[0] : null;

        const stockQuantity = updateProductDto?.stockQuantity !== undefined 
          ? updateProductDto.stockQuantity 
          : product.stockQuantity;

        if (inventoryRecord) {
          // Update existing inventory record
          await this.inventoryService.updateInventory(inventoryRecord._id.toString(), {
            currentStock: stockQuantity,
            availableStock: stockQuantity - (inventoryRecord.reservedStock || 0),
            sellingPrice: sellingPrice,
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
            reorderPoint: Math.max(10, Math.floor(stockQuantity * 0.1)),
            reorderQuantity: Math.max(50, Math.floor(stockQuantity * 0.5)),
            costPrice: costPrice || 0,
            sellingPrice: sellingPrice,
            warehouse: 'main',
            status: this.mapStockStatusToInventoryStatus(stockStatus),
          });
        }

        // If product previously had sizes but now doesn't, remove size-specific inventory
        if (existingInventory.some(inv => inv.size)) {
          const sizeInventoryToRemove = existingInventory.filter(inv => inv.size);
          for (const inv of sizeInventoryToRemove) {
            await this.inventoryService.deleteInventory(inv._id.toString());
          }
        }
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

    // Auto-set isSale and originalPrice based on salePrice
    if (createProductDto.salePrice && createProductDto.salePrice > 0 && createProductDto.salePrice < createProductDto.price) {
      createProductDto.isSale = true;
      // Set originalPrice to the regular price if not already set or if it's less than the regular price
      if (!createProductDto.originalPrice || createProductDto.originalPrice < createProductDto.price) {
        createProductDto.originalPrice = createProductDto.price;
      }
    } else if (!createProductDto.salePrice || createProductDto.salePrice === 0) {
      // If no sale price, ensure isSale is false
      createProductDto.isSale = false;
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

    // Auto-set inStock based on stockStatus and stockQuantity
    if (createProductDto.manageStock) {
      createProductDto.inStock = createProductDto.stockStatus === StockStatus.INSTOCK && 
                                  (createProductDto.stockQuantity > 0 || createProductDto.allowBackorders);
    } else {
      // If not managing stock, default to in stock
      createProductDto.inStock = true;
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

    // Ensure SEO fields have defaults if seo object is provided
    let seoData: any = undefined;
    if (createProductDto.seo) {
      seoData = {
        ...createProductDto.seo,
        noIndex: createProductDto.seo.noIndex ?? false,
        noFollow: createProductDto.seo.noFollow ?? false,
      };
    }

    // Create product data with image IDs
    const { seo: _, ...restCreateDto } = createProductDto;
    const productData: any = {
      ...restCreateDto,
      images: imageIds,
      ...(seoData && { seo: seoData }),
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

    // Validate sale price and auto-set isSale and originalPrice
    const currentProduct = await this.findById(id);
    const price = updateProductDto.price !== undefined ? updateProductDto.price : currentProduct.price;
    
    if (updateProductDto.salePrice !== undefined) {
      if (updateProductDto.salePrice >= price) {
        throw new BadRequestException('Sale price must be less than regular price');
      }
      
      // Auto-set isSale and originalPrice based on salePrice
      if (updateProductDto.salePrice > 0 && updateProductDto.salePrice < price) {
        updateProductDto.isSale = true;
        // Set originalPrice to the regular price if not already set or if it's less than the regular price
        const currentOriginalPrice = updateProductDto.originalPrice !== undefined 
          ? updateProductDto.originalPrice 
          : currentProduct.originalPrice;
        if (!currentOriginalPrice || currentOriginalPrice < price) {
          updateProductDto.originalPrice = price;
        }
      } else if (updateProductDto.salePrice === 0 || updateProductDto.salePrice === null) {
        // If sale price is removed, set isSale to false
        updateProductDto.isSale = false;
      }
    } else if (updateProductDto.price !== undefined) {
      // If price is updated but salePrice is not, check if salePrice still makes sense
      const currentSalePrice = currentProduct.salePrice;
      if (currentSalePrice && currentSalePrice > 0 && currentSalePrice < price) {
        // Sale price is still valid, ensure isSale is true
        updateProductDto.isSale = true;
        // Update originalPrice if needed
        const currentOriginalPrice = updateProductDto.originalPrice !== undefined 
          ? updateProductDto.originalPrice 
          : currentProduct.originalPrice;
        if (!currentOriginalPrice || currentOriginalPrice < price) {
          updateProductDto.originalPrice = price;
        }
      } else if (currentSalePrice && currentSalePrice >= price) {
        // Sale price is no longer valid, remove it
        updateProductDto.isSale = false;
      }
    }

    // Auto-update stock status if stock quantity is being updated
    const manageStock = updateProductDto.manageStock !== undefined 
      ? updateProductDto.manageStock 
      : currentProduct.manageStock;
    const allowBackorders = updateProductDto.allowBackorders !== undefined 
      ? updateProductDto.allowBackorders 
      : currentProduct.allowBackorders;
    
    if (updateProductDto.stockQuantity !== undefined && manageStock) {
      if (updateProductDto.stockQuantity > 0) {
        updateProductDto.stockStatus = StockStatus.INSTOCK;
      } else if (allowBackorders) {
        updateProductDto.stockStatus = StockStatus.ONBACKORDER;
      } else {
        updateProductDto.stockStatus = StockStatus.OUTOFSTOCK;
      }
    }

    // Auto-set inStock based on stockStatus and stockQuantity
    const stockStatus = updateProductDto.stockStatus !== undefined 
      ? updateProductDto.stockStatus 
      : currentProduct.stockStatus;
    const stockQuantity = updateProductDto.stockQuantity !== undefined 
      ? updateProductDto.stockQuantity 
      : currentProduct.stockQuantity;
    
    if (manageStock) {
      updateProductDto.inStock = stockStatus === StockStatus.INSTOCK && 
                                  (stockQuantity > 0 || allowBackorders);
    } else {
      // If not managing stock, default to in stock
      updateProductDto.inStock = true;
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

    // Ensure SEO fields have defaults if seo object is provided
    let seoData: any = undefined;
    if (updateProductDto.seo) {
      seoData = {
        ...updateProductDto.seo,
        noIndex: updateProductDto.seo.noIndex ?? false,
        noFollow: updateProductDto.seo.noFollow ?? false,
      };
    }

    // Create update data with image IDs if provided
    const { seo: _, ...restUpdateDto } = updateProductDto;
    const updateData: any = {
      ...restUpdateDto,
      ...(imageIds && { images: imageIds }),
      ...(seoData && { seo: seoData }),
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
    try {
      const product = await this.productRepository.findBySlug(slug);
      if (!product) {
        throw new NotFoundException(`Product with slug '${slug}' not found`);
      }
      return product;
    } catch (error) {
      // If it's already a NestJS HTTP exception, re-throw it
      if (error instanceof NotFoundException || error.status) {
        throw error;
      }
      // Otherwise, log and wrap in NotFoundException
      console.error(`Error finding product by slug '${slug}':`, error);
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }
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

  async findAllWithFilters(filterDto: ProductFilterDto): Promise<PaginatedResult<ProductDocument>> {
    return await this.productRepository.findAllWithFilters(filterDto);
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