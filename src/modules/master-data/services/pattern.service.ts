import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Pattern {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class PatternService {
  constructor(
    @InjectModel('Pattern') private readonly patternModel: Model<Pattern>,
  ) {}

  async findAll(): Promise<Pattern[]> {
    return this.patternModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Pattern | null> {
    return this.patternModel.findById(id).exec();
  }

  async create(createPatternDto: Partial<Pattern>): Promise<Pattern> {
    const created = new this.patternModel({
      ...createPatternDto,
      slug: this.generateSlug(createPatternDto.name),
      isActive: createPatternDto.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return created.save();
  }

  async update(id: string, updatePatternDto: Partial<Pattern>): Promise<Pattern | null> {
    return this.patternModel.findByIdAndUpdate(
      id,
      { ...updatePatternDto, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<Pattern | null> {
    return this.patternModel.findByIdAndDelete(id).exec();
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
