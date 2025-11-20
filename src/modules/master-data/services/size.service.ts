import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Size {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  sizeType?: 'numeric' | 'alphabetic' | 'custom';
  unit?: 'cm' | 'inch' | 'US' | 'UK' | 'EU' | 'none';
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class SizeService {
  constructor(
    @InjectModel('Size') private readonly sizeModel: Model<Size>,
  ) {}

  async findAll(): Promise<Size[]> {
    return this.sizeModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Size | null> {
    return this.sizeModel.findById(id).exec();
  }

  async create(createSizeDto: Partial<Size>): Promise<Size> {
    const created = new this.sizeModel({
      ...createSizeDto,
      slug: this.generateSlug(createSizeDto.name),
      isActive: createSizeDto.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async update(id: string, updateSizeDto: Partial<Size>): Promise<Size | null> {
    return this.sizeModel.findByIdAndUpdate(
      id,
      { ...updateSizeDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<Size | null> {
    return this.sizeModel.findByIdAndDelete(id).exec();
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
