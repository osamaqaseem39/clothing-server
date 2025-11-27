import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { CategoryRepository } from '../repositories/category.repository';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { Category, CategoryDocument } from '../schemas/category.schema';
import { PaginationOptions } from '../../../common/interfaces/base.interface';
import { PaginatedResult } from '../../../common/interfaces/base.interface';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<CategoryDocument> {
    // Check if slug already exists
    const existingCategory = await this.categoryRepository.findBySlug(createCategoryDto.slug);
    if (existingCategory) {
      throw new ConflictException('Category with this slug already exists');
    }

    // If parentId is provided, verify parent exists
    if (createCategoryDto.parentId) {
      const parentCategory = await this.categoryRepository.findById(createCategoryDto.parentId);
      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.categoryRepository.create(createCategoryDto);
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<CategoryDocument>> {
    return this.categoryRepository.findAll(options);
  }

  async findRootCategories(): Promise<CategoryDocument[]> {
    return this.categoryRepository.findRootCategories();
  }

  async findSubCategories(parentId: string): Promise<CategoryDocument[]> {
    return this.categoryRepository.findSubCategories(parentId);
  }

  async findCategoryTree(): Promise<CategoryDocument[]> {
    return this.categoryRepository.findCategoryTree();
  }

  async findById(id: string): Promise<CategoryDocument> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string): Promise<CategoryDocument> {
    const category = await this.categoryRepository.findBySlug(slug);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async searchCategories(query: string): Promise<CategoryDocument[]> {
    return this.categoryRepository.searchCategories(query);
  }

  async updateCategory(id: string, updateCategoryDto: UpdateCategoryDto): Promise<CategoryDocument> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    // Check if slug is being changed and if it conflicts
    if (updateCategoryDto.slug && updateCategoryDto.slug !== existingCategory.slug) {
      const slugExists = await this.categoryRepository.findBySlug(updateCategoryDto.slug);
      if (slugExists) {
        throw new ConflictException('Category with this slug already exists');
      }
    }

    // If parentId is being changed, verify parent exists and prevent circular reference
    if (updateCategoryDto.parentId) {
      if (updateCategoryDto.parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }
      
      const parentCategory = await this.categoryRepository.findById(updateCategoryDto.parentId);
      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
      }

      // Check for circular reference
      const isCircular = await this.checkCircularReference(id, updateCategoryDto.parentId);
      if (isCircular) {
        throw new BadRequestException('Cannot set parent: would create circular reference');
      }
    }

    return this.categoryRepository.update(id, updateCategoryDto);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    // Check if category has subcategories
    const subCategories = await this.categoryRepository.findSubCategories(id);
    if (subCategories.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    // TODO: Check if category has products
    // const productsWithCategory = await this.productService.findByCategory(id);
    // if (productsWithCategory.length > 0) {
    //   throw new BadRequestException('Cannot delete category with products');
    // }

    await this.categoryRepository.delete(id);
  }

  async toggleCategoryStatus(id: string): Promise<CategoryDocument> {
    const category = await this.categoryRepository.toggleStatus(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async updateSortOrder(id: string, sortOrder: number): Promise<CategoryDocument> {
    const category = await this.categoryRepository.updateSortOrder(id, sortOrder);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async getCategoryStats() {
    return this.categoryRepository.getCategoryStats();
  }

  // Migration method to fix existing categories missing default values
  async migrateDefaultValues(): Promise<{ updated: number }> {
    return this.categoryRepository.migrateDefaultValues();
  }

  private async checkCircularReference(categoryId: string, parentId: string): Promise<boolean> {
    let currentParentId = parentId;
    
    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }
      
      const parent = await this.categoryRepository.findById(currentParentId);
      if (!parent || !parent.parentId) {
        break;
      }
      
      currentParentId = parent.parentId.toString();
    }
    
    return false;
  }
}
