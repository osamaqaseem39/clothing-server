import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export interface Attribute {
  _id?: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class AttributeService {
  constructor(
    @InjectModel('Attribute') private readonly attributeModel: Model<Attribute>,
  ) {}

  async findAll(): Promise<Attribute[]> {
    return this.attributeModel.find({ isActive: { $ne: false } }).sort({ name: 1 }).exec();
  }

  async create(createAttributeDto: Partial<Attribute>): Promise<Attribute> {
    const created = new this.attributeModel({
      ...createAttributeDto,
      slug: this.generateSlug(createAttributeDto.name),
      isActive: createAttributeDto.isActive !== false,
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
