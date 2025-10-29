import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Fit {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class FitService {
  constructor(
    @InjectModel('Fit') private readonly fitModel: Model<Fit>,
  ) {}

  async findAll(): Promise<Fit[]> {
    return this.fitModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async create(createFitDto: Partial<Fit>): Promise<Fit> {
    const created = new this.fitModel({
      ...createFitDto,
      slug: this.generateSlug(createFitDto.name),
      isActive: createFitDto.isActive !== false,
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
