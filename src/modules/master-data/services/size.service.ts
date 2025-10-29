import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Size {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  sizeType?: 'numeric' | 'alphabetic' | 'custom';
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

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
