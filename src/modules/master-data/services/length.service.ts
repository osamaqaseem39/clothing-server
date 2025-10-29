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

  async findById(id: string): Promise<Length | null> {
    return this.lengthModel.findById(id).exec();
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

  async update(id: string, updateLengthDto: Partial<Length>): Promise<Length | null> {
    return this.lengthModel.findByIdAndUpdate(
      id,
      { ...updateLengthDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<Length | null> {
    return this.lengthModel.findByIdAndDelete(id).exec();
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
