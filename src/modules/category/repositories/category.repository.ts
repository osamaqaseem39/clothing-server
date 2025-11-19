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

  async findBySlug(slug: string): Promise<CategoryDocument | null> {
    return this.categoryModel.findOne({ slug, isActive: true }).exec();
  }

  async findActiveCategories(): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findRootCategories(): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ 
        $or: [
          { parentId: null },
          { parentId: { $exists: false } }
        ],
        isActive: true 
      })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findSubCategories(parentId: string): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ parentId, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findCategoryTree(): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({ isActive: true })
      .populate('parentId', 'name slug')
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async searchCategories(query: string): Promise<CategoryDocument[]> {
    return this.categoryModel
      .find({
        $and: [
          { isActive: true },
          {
            $or: [
              { name: { $regex: query, $options: 'i' } },
              { description: { $regex: query, $options: 'i' } },
              { slug: { $regex: query, $options: 'i' } },
            ],
          },
        ],
      })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
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
    const category = await this.categoryModel.findById(categoryId).exec();
    if (!category) return null;

    return this.categoryModel
      .findByIdAndUpdate(categoryId, { isActive: !category.isActive }, { new: true })
      .exec();
  }
}
