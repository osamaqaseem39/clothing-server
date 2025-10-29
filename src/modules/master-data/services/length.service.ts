import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Length {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class LengthService {
  constructor(
    @InjectModel('Length') private readonly lengthModel: Model<Length>,
  ) {}

  async findAll(): Promise<Length[]> {
    return this.lengthModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async create(createLengthDto: Partial<Length>): Promise<Length> {
    const created = new this.lengthModel({
      ...createLengthDto,
      slug: this.generateSlug(createLengthDto.name),
      isActive: createLengthDto.isActive !== false,
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
