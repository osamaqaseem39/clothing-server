import { Injectable } from '@nestjs/common';
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

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
    @InjectModel(InventoryMovement.name) private movementModel: Model<InventoryMovementDocument>,
  ) {}

  async createInventory(createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    const inventory = new this.inventoryModel(createInventoryDto);
    return await inventory.save();
  }

  async findAll(paginationDto: PaginationDto): Promise<PaginatedResult<Inventory>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.inventoryModel.find().skip(skip).limit(limit).exec(),
      this.inventoryModel.countDocuments()
    ]);
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findLowStock(): Promise<Inventory[]> {
    return await this.inventoryModel.find({
      $expr: { $lte: ['$currentStock', '$lowStockThreshold'] }
    }).exec();
  }

  async findOutOfStock(): Promise<Inventory[]> {
    return await this.inventoryModel.find({ currentStock: 0 }).exec();
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

  async findByProduct(productId: string): Promise<Inventory[]> {
    return await this.inventoryModel.find({ productId }).exec();
  }

  async updateInventory(id: string, updateInventoryDto: UpdateInventoryDto): Promise<Inventory> {
    return await this.update(id, updateInventoryDto);
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
    await this.inventoryModel.findByIdAndUpdate(id, { currentStock: newStock });

    // Record movement
    await this.recordMovement({
      inventoryId: id,
      type: adjustStockDto.type,
      quantity: adjustStockDto.quantity,
      referenceId: adjustStockDto.referenceId,
      referenceType: adjustStockDto.referenceType,
      notes: adjustStockDto.notes
    });

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

    await this.inventoryModel.findByIdAndUpdate(id, { currentStock: newFromStock });
    await this.inventoryModel.findByIdAndUpdate(toInventory._id, { currentStock: newToStock });

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
