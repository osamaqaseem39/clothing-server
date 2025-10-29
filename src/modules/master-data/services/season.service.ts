import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Season {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class SeasonService {
  constructor(
    @InjectModel('Season') private readonly seasonModel: Model<Season>,
  ) {}

  async findAll(): Promise<Season[]> {
    return this.seasonModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Season | null> {
    return this.seasonModel.findById(id).exec();
  }

  async create(createSeasonDto: Partial<Season>): Promise<Season> {
    const created = new this.seasonModel({
      ...createSeasonDto,
      slug: this.generateSlug(createSeasonDto.name),
      isActive: createSeasonDto.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async update(id: string, updateSeasonDto: Partial<Season>): Promise<Season | null> {
    return this.seasonModel.findByIdAndUpdate(
      id,
      { ...updateSeasonDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<Season | null> {
    return this.seasonModel.findByIdAndDelete(id).exec();
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
