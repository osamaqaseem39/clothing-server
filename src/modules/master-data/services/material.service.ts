import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Material {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class MaterialService {
  constructor(
    @InjectModel('Material') private readonly materialModel: Model<Material>,
  ) {}

  async findAll(): Promise<Material[]> {
    return this.materialModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Material | null> {
    return this.materialModel.findById(id).exec();
  }

  async create(createMaterialDto: Partial<Material>): Promise<Material> {
    const created = new this.materialModel({
      ...createMaterialDto,
      slug: this.generateSlug(createMaterialDto.name),
      isActive: createMaterialDto.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async update(id: string, updateMaterialDto: Partial<Material>): Promise<Material | null> {
    return this.materialModel.findByIdAndUpdate(
      id,
      { ...updateMaterialDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<Material | null> {
    return this.materialModel.findByIdAndDelete(id).exec();
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
