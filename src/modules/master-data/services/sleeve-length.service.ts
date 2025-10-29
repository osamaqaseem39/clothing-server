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

  async findById(id: string): Promise<SleeveLength | null> {
    return this.sleeveLengthModel.findById(id).exec();
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

  async update(id: string, updateSleeveLengthDto: Partial<SleeveLength>): Promise<SleeveLength | null> {
    return this.sleeveLengthModel.findByIdAndUpdate(
      id,
      { ...updateSleeveLengthDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<SleeveLength | null> {
    return this.sleeveLengthModel.findByIdAndDelete(id).exec();
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
