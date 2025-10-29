import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Color {
  _id?: string;
  name: string;
  slug?: string;
  hexCode?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class ColorService {
  constructor(
    @InjectModel('Color') private readonly colorModel: Model<Color>,
  ) {}

  async findAll(): Promise<Color[]> {
    return this.colorModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Color | null> {
    return this.colorModel.findById(id).exec();
  }

  async create(createColorDto: Partial<Color>): Promise<Color> {
    const created = new this.colorModel({
      ...createColorDto,
      slug: this.generateSlug(createColorDto.name),
      isActive: createColorDto.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async update(id: string, updateColorDto: Partial<Color>): Promise<Color | null> {
    return this.colorModel.findByIdAndUpdate(
      id,
      { ...updateColorDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<Color | null> {
    return this.colorModel.findByIdAndDelete(id).exec();
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }
}
