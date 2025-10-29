import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Occasion {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class OccasionService {
  constructor(
    @InjectModel('Occasion') private readonly occasionModel: Model<Occasion>,
  ) {}

  async findAll(): Promise<Occasion[]> {
    return this.occasionModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Occasion | null> {
    return this.occasionModel.findById(id).exec();
  }

  async create(createOccasionDto: Partial<Occasion>): Promise<Occasion> {
    const created = new this.occasionModel({
      ...createOccasionDto,
      slug: this.generateSlug(createOccasionDto.name),
      isActive: createOccasionDto.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async update(id: string, updateOccasionDto: Partial<Occasion>): Promise<Occasion | null> {
    return this.occasionModel.findByIdAndUpdate(
      id,
      { ...updateOccasionDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<Occasion | null> {
    return this.occasionModel.findByIdAndDelete(id).exec();
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
