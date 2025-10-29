import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Tag {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class TagService {
  constructor(
    @InjectModel('Tag') private readonly tagModel: Model<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async create(createTagDto: Partial<Tag>): Promise<Tag> {
    const created = new this.tagModel({
      ...createTagDto,
      slug: this.generateSlug(createTagDto.name),
      isActive: createTagDto.isActive !== false,
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
