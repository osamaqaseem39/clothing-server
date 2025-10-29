import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Neckline {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class NecklineService {
  constructor(
    @InjectModel('Neckline') private readonly necklineModel: Model<Neckline>,
  ) {}

  async findAll(): Promise<Neckline[]> {
    return this.necklineModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async create(createNecklineDto: Partial<Neckline>): Promise<Neckline> {
    const created = new this.necklineModel({
      ...createNecklineDto,
      slug: this.generateSlug(createNecklineDto.name),
      isActive: createNecklineDto.isActive !== false,
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
