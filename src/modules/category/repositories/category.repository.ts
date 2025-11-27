import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class CategoryRepository extends BaseRepository<CategoryDocument> {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {
    super(categoryModel);
  }

  // Helper method to ensure default values are set
  private ensureDefaults(category: CategoryDocument | null): CategoryDocument | null {
    if (!category) return null;
    if (category.isActive === undefined || category.isActive === null) {
      category.isActive = true;
    }
    if (category.sortOrder === undefined || category.sortOrder === null) {
      category.sortOrder = 0;
    }
    return category;
  }

  private ensureDefaultsArray(categories: CategoryDocument[]): CategoryDocument[] {
    return categories.map(cat => this.ensureDefaults(cat)!).filter(Boolean);
  }

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    const category = await this.categoryModel.findOne({ slug }).exec();
    return this.ensureDefaults(category);
  }

  async findById(id: string): Promise<CategoryDocument | null> {
    const category = await this.categoryModel.findById(id).exec();
    return this.ensureDefaults(category);
  }

  async findAll(options?: any): Promise<any> {
    const { page = 1, limit = 10, sort, sortBy, order = 'desc', sortOrder } = options || {};
    
    const sortField = sortBy || sort;
    const orderBy = sortOrder || order;
    const skip = (page - 1) * limit;
    const sortOption = sortField ? { [sortField]: orderBy === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.categoryModel.find().sort(sortOption).skip(skip).limit(limit).exec(),
      this.categoryModel.countDocuments().exec(),
    ]);

    return {
      data: this.ensureDefaultsArray(data),
      total,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil(total / (limit || 10)),
    };
  }

  async findRootCategories(): Promise<CategoryDocument[]> {
    const categories = await this.categoryModel
      .find({ 
        $and: [
          {
            $or: [
              { parentId: null },
              { parentId: { $exists: false } }
            ]
          }
        ]
      })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
    return this.ensureDefaultsArray(categories);
  }

  async findSubCategories(parentId: string): Promise<CategoryDocument[]> {
    const categories = await this.categoryModel
      .find({ parentId })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
    return this.ensureDefaultsArray(categories);
  }

  async findCategoryTree(): Promise<CategoryDocument[]> {
    const categories = await this.categoryModel
      .find({})
      .populate('parentId', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
      .exec();
    return this.ensureDefaultsArray(categories);
  }

  async searchCategories(query: string): Promise<CategoryDocument[]> {
    const categories = await this.categoryModel
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { slug: { $regex: query, $options: 'i' } },
        ],
      })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
    return this.ensureDefaultsArray(categories);
  }

  async getCategoryStats() {
    const totalCategories = await this.categoryModel.countDocuments();
    const activeCategories = await this.categoryModel.countDocuments({ isActive: true });
    const rootCategories = await this.categoryModel.countDocuments({ parentId: null });
    const subCategories = await this.categoryModel.countDocuments({ parentId: { $ne: null } });

    return {
      total: totalCategories,
      active: activeCategories,
      root: rootCategories,
      subCategories,
    };
  }

  async updateSortOrder(categoryId: string, sortOrder: number): Promise<CategoryDocument | null> {
    return this.categoryModel
      .findByIdAndUpdate(categoryId, { sortOrder }, { new: true })
      .exec();
  }

  async toggleStatus(categoryId: string): Promise<CategoryDocument | null> {
    const category = await this.findById(categoryId);
    if (!category) return null;

    const updated = await this.categoryModel
      .findByIdAndUpdate(categoryId, { isActive: !category.isActive }, { new: true })
      .exec();
    return this.ensureDefaults(updated);
  }

  async update(id: string, data: Partial<CategoryDocument>): Promise<CategoryDocument | null> {
    const updated = await this.categoryModel.findByIdAndUpdate(id, data, { new: true }).exec();
    return this.ensureDefaults(updated);
  }

  async create(data: Partial<CategoryDocument>): Promise<CategoryDocument> {
    // Ensure defaults are set before creating
    const categoryData = {
      ...data,
      isActive: data.isActive !== undefined ? data.isActive : true,
      sortOrder: data.sortOrder !== undefined ? data.sortOrder : 0,
    };
    const entity = new this.categoryModel(categoryData);
    return await entity.save();
  }

  // Migration method to set default values for existing categories
  async migrateDefaultValues(): Promise<{ updated: number }> {
    const result = await this.categoryModel.updateMany(
      {
        $or: [
          { isActive: { $exists: false } },
          { isActive: null },
          { sortOrder: { $exists: false } },
          { sortOrder: null }
        ]
      },
      {
        $set: {
          isActive: true,
          sortOrder: 0
        }
      }
    ).exec();
    
    return { updated: result.modifiedCount };
  }
}
