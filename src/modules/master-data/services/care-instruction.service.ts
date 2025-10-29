import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface CareInstruction {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class CareInstructionService {
  constructor(
    @InjectModel('CareInstruction') private readonly careInstructionModel: Model<CareInstruction>,
  ) {}

  async findAll(): Promise<CareInstruction[]> {
    return this.careInstructionModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async create(createCareInstructionDto: Partial<CareInstruction>): Promise<CareInstruction> {
    const created = new this.careInstructionModel({
      ...createCareInstructionDto,
      slug: this.generateSlug(createCareInstructionDto.name),
      isActive: createCareInstructionDto.isActive !== false,
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
