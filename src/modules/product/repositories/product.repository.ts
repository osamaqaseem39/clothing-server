import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Product, ProductDocument } from '../schemas/product.schema';
import { PaginationOptions, PaginatedResult } from '../../../common/interfaces/base.interface';

@Injectable()
export class ProductRepository extends BaseRepository<ProductDocument> {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<ProductDocument>,
  ) {
    super(productModel);
  }

  async findBySlug(slug: string): Promise<ProductDocument | null> {
    return await this.productModel.findOne({ slug }).exec();
  }

  async findBySku(sku: string): Promise<ProductDocument | null> {
    return await this.productModel.findOne({ sku }).exec();
  }

  async findByCategory(categoryId: string, options?: PaginationOptions): Promise<PaginatedResult<ProductDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.productModel
        .find({ categories: categoryId, status: 'published' })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('categories', 'name slug')
        .populate('tags', 'name slug')
        .populate('images', 'url altText position')
        .exec(),
      this.productModel.countDocuments({ categories: categoryId, status: 'published' }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async searchProducts(query: string, options?: PaginationOptions): Promise<PaginatedResult<ProductDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const searchRegex = new RegExp(query, 'i');
    
    const [data, total] = await Promise.all([
      this.productModel
        .find({
          $and: [
            { status: 'published' },
            {
              $or: [
                { name: searchRegex },
                { description: searchRegex },
                { shortDescription: searchRegex },
                { sku: searchRegex },
              ],
            },
          ],
        })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('categories', 'name slug')
        .populate('tags', 'name slug')
        .populate('images', 'url altText position')
        .exec(),
      this.productModel.countDocuments({
        $and: [
          { status: 'published' },
          {
            $or: [
              { name: searchRegex },
              { description: searchRegex },
              { shortDescription: searchRegex },
              { sku: searchRegex },
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

  async findByBrand(brandId: string, options?: PaginationOptions): Promise<PaginatedResult<ProductDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.productModel
        .find({ brand: brandId, status: 'published' })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('brand', 'name slug logo')
        .populate('categories', 'name slug')
        .populate('tags', 'name slug')
        .populate('images', 'url altText position')
        .exec(),
      this.productModel.countDocuments({ brand: brandId, status: 'published' }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublishedProducts(options?: PaginationOptions): Promise<PaginatedResult<ProductDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.productModel
        .find({ status: 'published' })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('categories', 'name slug')
        .populate('tags', 'name slug')
        .populate('images', 'url altText position')
        .exec(),
      this.productModel.countDocuments({ status: 'published' }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
} 