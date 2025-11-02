import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from '../schemas/inventory.schema';
import { InventoryMovement, InventoryMovementDocument } from '../schemas/inventory-movement.schema';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { TransferStockDto } from '../dto/transfer-stock.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { PaginatedResult } from '../../../common/interfaces/base.interface';
import { ProductService } from '../../product/services/product.service';
import { StockStatus } from '../../product/schemas/product.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(InventoryMovement.name) private movementModel: Model<InventoryMovementDocument>,
    @Inject(forwardRef(() => ProductService)) private productService: ProductService,
  ) {}

  // Helper function to map Inventory status to Product StockStatus
  private mapInventoryStatusToStockStatus(status: string): StockStatus {
    switch (status) {
      case 'in_stock':
        return StockStatus.INSTOCK;
      case 'out_of_stock':
        return StockStatus.OUTOFSTOCK;
      case 'low_stock':
        return StockStatus.INSTOCK; // Low stock is still in stock
      case 'discontinued':
        return StockStatus.OUTOFSTOCK;
      default:
        return StockStatus.INSTOCK;
    }
  }

  // Helper function to sync inventory changes back to product
  private async syncToProduct(inventory: Inventory): Promise<void> {
    try {
      // Get current product
      const product = await this.productService.findById(inventory.productId);
      
      if (!product.manageStock) {
        return; // Don't sync if stock management is disabled on product
      }

      // Update product with inventory data using the public sync method
      await this.productService.syncInventoryToProduct(inventory.productId, {
        stockQuantity: inventory.currentStock,
        stockStatus: this.mapInventoryStatusToStockStatus(inventory.status),
        price: inventory.sellingPrice,
        originalPrice: inventory.costPrice,
      });
    } catch (error) {
      // Log error but don't fail inventory update
      console.error('Error syncing inventory to product:', error);
    }
  }

  async createInventory(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    // Calculate availableStock if not provided
    const availableStock = createInventoryDto.currentStock - (createInventoryDto['reservedStock'] || 0);
    
    const inventory = new this.inventoryModel({
      ...createInventoryDto,
      availableStock,
    });
    const savedInventory = await inventory.save();

    // Sync to product
    await this.syncToProduct(savedInventory);

    return savedInventory;
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<any>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.inventoryModel
        .find()
        .skip(skip)
        .limit(limit)
        .populate({ path: 'productId', select: 'name sku images' })
        .exec(),
      this.inventoryModel.countDocuments(),
    ]);

    const data = docs.map((inv: any) => {
      const obj = inv.toObject ? inv.toObject() : inv;
      const product = obj.productId || {};
      const firstImage = Array.isArray(product.images) && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
        : undefined;
      return {
        ...obj,
        productName: obj.productName || product.name,
        sku: obj.sku || product.sku,
        productImage: obj.productImage || firstImage,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findLowStock(): Promise<any[]> {
    const docs = await this.inventoryModel
      .find({ $expr: { $lte: ['$currentStock', '$lowStockThreshold'] } })
      .populate({ path: 'productId', select: 'name sku images' })
      .exec();
    return docs.map((inv: any) => {
      const obj = inv.toObject ? inv.toObject() : inv;
      const product = obj.productId || {};
      const firstImage = Array.isArray(product.images) && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
        : undefined;
      return {
        ...obj,
        productName: obj.productName || product.name,
        sku: obj.sku || product.sku,
        productImage: obj.productImage || firstImage,
      };
    });
  }

  async findOutOfStock(): Promise<any[]> {
    const docs = await this.inventoryModel
      .find({ currentStock: 0 })
      .populate({ path: 'productId', select: 'name sku images' })
      .exec();
    return docs.map((inv: any) => {
      const obj = inv.toObject ? inv.toObject() : inv;
      const product = obj.productId || {};
      const firstImage = Array.isArray(product.images) && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
        : undefined;
      return {
        ...obj,
        productName: obj.productName || product.name,
        sku: obj.sku || product.sku,
        productImage: obj.productImage || firstImage,
      };
    });
  }

  async getInventoryStats() {
    const total = await this.inventoryModel.countDocuments();
    const lowStock = await this.inventoryModel.countDocuments({
      $expr: { $lte: ['$currentStock', '$lowStockThreshold'] }
    });
    const outOfStock = await this.inventoryModel.countDocuments({ currentStock: 0 });
    
    return {
      total,
      lowStock,
      outOfStock,
      inStock: total - outOfStock
    };
  }

  async findByProduct(productId: string, size?: string): Promise<any[]> {
    const query: any = { productId };
    if (size) {
      query.size = size;
    }
    const docs = await this.inventoryModel
      .find(query)
      .populate({ path: 'productId', select: 'name sku images' })
      .exec();
    return docs.map((inv: any) => {
      const obj = inv.toObject ? inv.toObject() : inv;
      const product = obj.productId || {};
      const firstImage = Array.isArray(product.images) && product.images.length > 0
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url)
        : undefined;
      return {
        ...obj,
        productName: obj.productName || product.name,
        sku: obj.sku || product.sku,
        productImage: obj.productImage || firstImage,
      };
    });
  }

  async updateInventory(id: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    const updatedInventory = await this.update(id, updateInventoryDto);
    
    // Sync to product if inventory-related fields were updated
    if (updateInventoryDto.currentStock !== undefined || 
        updateInventoryDto.status !== undefined ||
        updateInventoryDto.sellingPrice !== undefined ||
        updateInventoryDto.costPrice !== undefined) {
      await this.syncToProduct(updatedInventory);
    }

    return updatedInventory;
  }

  async adjustStock(id: string, adjustStockDto: AdjustStockDto): Promise<Inventory> {
    const inventory = await this.findById(id);
    if (!inventory) {
      throw new Error('Inventory not found');
    }

    const oldStock = inventory.currentStock;
    const newStock = oldStock + adjustStockDto.quantity;

    if (newStock < 0) {
      throw new Error('Insufficient stock for adjustment');
    }

    inventory.currentStock = newStock;
    inventory.availableStock = newStock - inventory.reservedStock;
    await this.inventoryModel.findByIdAndUpdate(id, { 
      currentStock: newStock,
      availableStock: newStock - inventory.reservedStock,
    });

    // Record movement
    await this.recordMovement({
      inventoryId: id,
      type: adjustStockDto.type,
      quantity: adjustStockDto.quantity,
      referenceId: adjustStockDto.referenceId,
      referenceType: adjustStockDto.referenceType,
      notes: adjustStockDto.notes
    });

    // Sync to product
    await this.syncToProduct(inventory);

    return inventory;
  }

  async transferStock(id: string, transferStockDto: TransferStockDto): Promise<{ from: Inventory; to: Inventory }> {
    const fromInventory = await this.findById(id);
    if (!fromInventory) {
      throw new Error('Source inventory not found');
    }

    // Find destination inventory by warehouse
    const toInventory = await this.inventoryModel.findOne({
      productId: fromInventory.productId,
      warehouse: transferStockDto.toWarehouse
    });
    
    if (!toInventory) {
      throw new Error('Destination inventory not found');
    }

    if (fromInventory.currentStock < transferStockDto.quantity) {
      throw new Error('Insufficient stock for transfer');
    }

    // Update stock
    const newFromStock = fromInventory.currentStock - transferStockDto.quantity;
    const newToStock = toInventory.currentStock + transferStockDto.quantity;

    await this.inventoryModel.findByIdAndUpdate(id, { 
      currentStock: newFromStock,
      availableStock: newFromStock - fromInventory.reservedStock,
    });
    await this.inventoryModel.findByIdAndUpdate(toInventory._id, { 
      currentStock: newToStock,
      availableStock: newToStock - toInventory.reservedStock,
    });

    // Update local objects for sync
    fromInventory.currentStock = newFromStock;
    fromInventory.availableStock = newFromStock - fromInventory.reservedStock;
    toInventory.currentStock = newToStock;
    toInventory.availableStock = newToStock - toInventory.reservedStock;

    // Record movements
    await this.recordMovement({
      inventoryId: id,
      type: 'OUT',
      quantity: -transferStockDto.quantity,
      referenceType: 'TRANSFER_OUT',
      notes: `Transferred to ${toInventory._id}: ${transferStockDto.notes || ''}`
    });

    await this.recordMovement({
      inventoryId: toInventory._id.toString(),
      type: 'IN',
      quantity: transferStockDto.quantity,
      referenceType: 'TRANSFER_IN',
      notes: `Transferred from ${id}: ${transferStockDto.notes || ''}`
    });

    // Sync both inventories to product (they should point to the same product)
    await this.syncToProduct(fromInventory);

    return { from: fromInventory, to: toInventory };
  }

  async getInventoryMovements(id: string) {
    return await this.movementModel.find({ inventoryId: id }).sort({ createdAt: -1 }).exec();
  }

  async deleteInventory(id: string): Promise<void> {
    const result = await this.inventoryModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Inventory not found');
    }
  }

  async findById(id: string): Promise<Inventory> {
    const inventory = await this.inventoryModel.findById(id);
    if (!inventory) {
      throw new Error('Inventory not found');
    }
    return inventory;
  }

  async update(id: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    // Calculate availableStock if currentStock is being updated
    if (updateInventoryDto.currentStock !== undefined) {
      const currentInventory = await this.findById(id);
      updateInventoryDto.availableStock = updateInventoryDto.currentStock - (currentInventory.reservedStock || 0);
    }

    const inventory = await this.inventoryModel.findByIdAndUpdate(id, updateInventoryDto, { new: true });
    if (!inventory) {
      throw new Error('Inventory not found');
    }
    return inventory;
  }

  private async recordMovement(movementData: any): Promise<void> {
    const movement = new this.movementModel(movementData);
    await movement.save();
  }
}
