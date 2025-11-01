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

  // Override to populate relations commonly needed by the dashboard
  async findById(id: string): Promise<ProductDocument | null> {
    return await this.productModel
      .findById(id)
      .populate('brand', 'name slug logo')
      .populate('categories', 'name slug')
      .populate('images')
      .populate('variations')
      .exec();
  }

  // Override to populate images for list views
  async findAll(options?: PaginationOptions): Promise<PaginatedResult<ProductDocument>> {
    const { page = 1, limit = 10, sort, sortBy, order = 'desc', sortOrder } = options || {} as any;

    const sortField: any = (sortBy as any) || (sort as any);
    const orderBy: any = (sortOrder as any) || (order as any);

    const skip = (page - 1) * limit;
    const sortOption: any = sortField ? { [sortField]: orderBy === 'desc' ? -1 : 1 } : { createdAt: -1 };

    const [data, total] = await Promise.all([
      this.productModel
        .find()
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('brand', 'name slug logo')
        .populate('images')
        .exec(),
      this.productModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil(total / (limit || 10)),
    };
  }

  async findBySlug(slug: string): Promise<ProductDocument | null> {
    return await this.productModel
      .findOne({ slug })
      .populate('brand', 'name slug logo')
      .populate('categories', 'name slug')
      .populate('images')
      .populate('variations')
      .exec();
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
        .populate('brand', 'name slug logo')
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
        .populate('brand', 'name slug logo')
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
        .populate('brand', 'name slug logo')
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