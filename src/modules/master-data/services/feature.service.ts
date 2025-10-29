import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Feature {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class FeatureService {
  constructor(
    @InjectModel('Feature') private readonly featureModel: Model<Feature>,
  ) {}

  async findAll(): Promise<Feature[]> {
    return this.featureModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Feature | null> {
    return this.featureModel.findById(id).exec();
  }

  async create(createFeatureDto: Partial<Feature>): Promise<Feature> {
    const created = new this.featureModel({
      ...createFeatureDto,
      slug: this.generateSlug(createFeatureDto.name),
      isActive: createFeatureDto.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async update(id: string, updateFeatureDto: Partial<Feature>): Promise<Feature | null> {
    return this.featureModel.findByIdAndUpdate(
      id,
      { ...updateFeatureDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<Feature | null> {
    return this.featureModel.findByIdAndDelete(id).exec();
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
