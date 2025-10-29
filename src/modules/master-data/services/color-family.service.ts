import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface ColorFamily {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class ColorFamilyService {
  constructor(
    @InjectModel('ColorFamily') private readonly colorFamilyModel: Model<ColorFamily>,
  ) {}

  async findAll(): Promise<ColorFamily[]> {
    return this.colorFamilyModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<ColorFamily | null> {
    return this.colorFamilyModel.findById(id).exec();
  }

  async create(createColorFamilyDto: Partial<ColorFamily>): Promise<ColorFamily> {
    const created = new this.colorFamilyModel({
      ...createColorFamilyDto,
      slug: this.generateSlug(createColorFamilyDto.name),
      isActive: createColorFamilyDto.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async update(id: string, updateColorFamilyDto: Partial<ColorFamily>): Promise<ColorFamily | null> {
    return this.colorFamilyModel.findByIdAndUpdate(
      id,
      { ...updateColorFamilyDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<ColorFamily | null> {
    return this.colorFamilyModel.findByIdAndDelete(id).exec();
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

