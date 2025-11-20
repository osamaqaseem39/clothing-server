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

  async getFilterOptions(): Promise<{
    categories: Array<{ _id: string; name: string; slug: string }>;
    brands: Array<{ _id: string; name: string; slug: string }>;
    sizes: string[];
    colors: string[];
    priceRange: { min: number; max: number };
  }> {
    try {
      const publishedProducts = await this.productModel
        .find({ status: 'published' })
        .populate('brand', 'name slug _id')
        .populate('categories', 'name slug _id')
        .lean()
        .exec();

      // Get unique categories
      const categoryMap = new Map<string, { _id: string; name: string; slug: string }>();
      if (Array.isArray(publishedProducts)) {
        publishedProducts.forEach((product: any) => {
          if (product.categories && Array.isArray(product.categories)) {
            product.categories.forEach((cat: any) => {
              if (cat && typeof cat === 'object' && cat._id && cat.name) {
                categoryMap.set(cat._id.toString(), {
                  _id: cat._id.toString(),
                  name: cat.name,
                  slug: cat.slug || '',
                });
              }
            });
          }
        });
      }

      // Get unique brands
      const brandMap = new Map<string, { _id: string; name: string; slug: string }>();
      if (Array.isArray(publishedProducts)) {
        publishedProducts.forEach((product: any) => {
          const brand: any = product.brand;
          if (brand && typeof brand === 'object' && brand._id && brand.name && !Array.isArray(brand)) {
            const brandId = brand._id.toString();
            const brandName = brand.name;
            const brandSlug = brand.slug || '';
            brandMap.set(brandId, {
              _id: brandId,
              name: brandName,
              slug: brandSlug,
            });
          }
        });
      }

      // Get unique sizes
      const sizeSet = new Set<string>();
      if (Array.isArray(publishedProducts)) {
        publishedProducts.forEach((product: any) => {
          if (product.availableSizes && Array.isArray(product.availableSizes) && product.availableSizes.length > 0) {
            product.availableSizes.forEach((size: string) => {
              if (size && typeof size === 'string') sizeSet.add(size);
            });
          }
        });
      }

      // Get unique colors - handle both string arrays and object arrays
      const colorSet = new Set<string>();
      if (Array.isArray(publishedProducts)) {
        publishedProducts.forEach((product: any) => {
          if (product.colors && Array.isArray(product.colors)) {
            product.colors.forEach((colorItem: any) => {
              if (typeof colorItem === 'string') {
                colorSet.add(colorItem);
              } else if (colorItem && typeof colorItem === 'object') {
                // Handle colorId reference or colorName
                if (colorItem.colorName) {
                  colorSet.add(colorItem.colorName);
                } else if (colorItem.name) {
                  colorSet.add(colorItem.name);
                } else if (colorItem.color) {
                  colorSet.add(colorItem.color);
                }
              }
            });
          }
        });
      }

      // Get price range - include sale prices
      const prices: number[] = [];
      if (Array.isArray(publishedProducts)) {
        publishedProducts.forEach((product: any) => {
          // Use salePrice if available and valid, otherwise use regular price
          let productPrice: number | null = null;
          
          if (product.salePrice && typeof product.salePrice === 'number' && product.salePrice > 0) {
            productPrice = product.salePrice;
          } else if (product.price && typeof product.price === 'number' && product.price > 0) {
            productPrice = product.price;
          }
          
          if (productPrice !== null) {
            prices.push(productPrice);
          }
        });
      }
      
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

      return {
        categories: Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
        brands: Array.from(brandMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
        sizes: Array.from(sizeSet).sort(),
        colors: Array.from(colorSet).sort(),
        priceRange: { min: minPrice, max: maxPrice },
      };
    } catch (error) {
      console.error('Error in getFilterOptions:', error);
      // Return empty defaults on error
      return {
        categories: [],
        brands: [],
        sizes: [],
        colors: [],
        priceRange: { min: 0, max: 10000 },
      };
    }
  }
} 