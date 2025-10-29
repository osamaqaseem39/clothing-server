import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface SleeveLength {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class SleeveLengthService {
  constructor(
    @InjectModel('SleeveLength') private readonly sleeveLengthModel: Model<SleeveLength>,
  ) {}

  async findAll(): Promise<SleeveLength[]> {
    return this.sleeveLengthModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async create(createSleeveLengthDto: Partial<SleeveLength>): Promise<SleeveLength> {
    const created = new this.sleeveLengthModel({
      ...createSleeveLengthDto,
      slug: this.generateSlug(createSleeveLengthDto.name),
      isActive: createSleeveLengthDto.isActive !== false,
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
      .trim('-');
  }
}
