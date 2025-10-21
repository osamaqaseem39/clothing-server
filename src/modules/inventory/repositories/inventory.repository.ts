import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inventory, InventoryDocument } from '../schemas/inventory.schema';

@Injectable()
export class InventoryRepository {
  constructor(
    @InjectModel(Inventory.name) private inventoryModel: Model<InventoryDocument>,
  ) {}

  async create(data: Partial<Inventory>): Promise<Inventory> {
    const inventory = new this.inventoryModel(data);
    return await inventory.save();
  }

  async findById(id: string): Promise<Inventory | null> {
    return await this.inventoryModel.findById(id);
  }

  async findAll(): Promise<Inventory[]> {
    return await this.inventoryModel.find();
  }

  async update(id: string, data: Partial<Inventory>): Promise<Inventory | null> {
    return await this.inventoryModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.inventoryModel.findByIdAndDelete(id);
    return !!result;
  }
}
