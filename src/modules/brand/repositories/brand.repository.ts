import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@/common/repositories/base.repository';
import { Brand, BrandDocument } from '../schemas/brand.schema';
import { PaginationOptions, PaginatedResult } from '@/common/interfaces/base.interface';

@Injectable()
export class BrandRepository extends BaseRepository<BrandDocument> {
  constructor(
    @InjectModel(Brand.name) private readonly brandModel: Model<BrandDocument>,
  ) {
    super(brandModel);
  }

  async findBySlug(slug: string): Promise<BrandDocument | null> {
    return await this.brandModel.findOne({ slug }).exec();
  }

  async findActiveBrands(options?: PaginationOptions): Promise<PaginatedResult<BrandDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { sortOrder: 1, name: 1 } as any;
    
    const [data, total] = await Promise.all([
      this.brandModel
        .find({ isActive: true })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.brandModel.countDocuments({ isActive: true }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByCountry(country: string, options?: PaginationOptions): Promise<PaginatedResult<BrandDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { name: 1 } as any;
    
    const [data, total] = await Promise.all([
      this.brandModel
        .find({ country, isActive: true })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.brandModel.countDocuments({ country, isActive: true }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchBrands(query: string, options?: PaginationOptions): Promise<PaginatedResult<BrandDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { name: 1 } as any;
    
    const searchRegex = new RegExp(query, 'i');
    
    const [data, total] = await Promise.all([
      this.brandModel
        .find({
          $and: [
            { isActive: true },
            {
              $or: [
                { name: searchRegex },
                { description: searchRegex },
                { country: searchRegex },
              ],
            },
          ],
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.brandModel.countDocuments({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: searchRegex },
              { description: searchRegex },
              { country: searchRegex },
            ],
          },
        ],
      }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBrandStats(): Promise<{
    totalBrands: number;
    activeBrands: number;
    countries: string[];
  }> {
    const [totalBrands, activeBrands, countries] = await Promise.all([
      this.brandModel.countDocuments().exec(),
      this.brandModel.countDocuments({ isActive: true }).exec(),
      this.brandModel.distinct('country').exec(),
    ]);

    return {
      totalBrands,
      activeBrands,
      countries: countries.filter(Boolean),
    };
  }
} 