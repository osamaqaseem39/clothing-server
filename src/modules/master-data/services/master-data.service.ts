import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface MasterDataItem {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class MasterDataService<T extends MasterDataItem> {
  constructor(
    @InjectModel('MasterData') private readonly model: Model<T>,
  ) {}

  async findAll(): Promise<T[]> {
    return this.model.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async create(createDto: Partial<T>): Promise<T> {
    const created = new this.model({
      ...createDto,
      slug: this.generateSlug(createDto.name),
      isActive: createDto.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async update(id: string, updateDto: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(
      id,
      { ...updateDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async softDelete(id: string): Promise<T | null> {
    return this.model.findByIdAndUpdate(
      id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
