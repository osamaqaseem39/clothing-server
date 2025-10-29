import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface AgeGroup {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class AgeGroupService {
  constructor(
    @InjectModel('AgeGroup') private readonly ageGroupModel: Model<AgeGroup>,
  ) {}

  async findAll(): Promise<AgeGroup[]> {
    return this.ageGroupModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async create(createAgeGroupDto: Partial<AgeGroup>): Promise<AgeGroup> {
    const created = new this.ageGroupModel({
      ...createAgeGroupDto,
      slug: this.generateSlug(createAgeGroupDto.name),
      isActive: createAgeGroupDto.isActive !== false,
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
