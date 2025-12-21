import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { CategoryService } from '../services/category.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Category } from '../schemas/category.schema';
import { PaginatedResult } from '../../../common/interfaces/base.interface';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - category with same slug already exists',
  })
  @ApiBody({ type: CreateCategoryDto })
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return await this.categoryService.createCategory(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
    type: [Category],
  })
  @ApiQuery({ type: PaginationDto })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<Category>> {
    return await this.categoryService.findAll(paginationDto);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get category tree structure' })
  @ApiResponse({
    status: 200,
    description: 'Category tree retrieved successfully',
    type: [Category],
  })
  async findCategoryTree(): Promise<Category[]> {
    return await this.categoryService.findCategoryTree();
  }

  @Get('root')
  @ApiOperation({ summary: 'Get root categories (no parent)' })
  @ApiResponse({
    status: 200,
    description: 'Root categories retrieved successfully',
    type: [Category],
  })
  async findRootCategories(): Promise<Category[]> {
    return await this.categoryService.findRootCategories();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search categories by query' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [Category],
  })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  async search(
    @Query('q') query: string,
  ): Promise<Category[]> {
    return await this.categoryService.searchCategories(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get category statistics' })
  @ApiResponse({
    status: 200,
    description: 'Category statistics retrieved successfully',
  })
  async getStats() {
    return await this.categoryService.getCategoryStats();
  }

  @Get('with-product-counts')
  @ApiOperation({ summary: 'Get all categories with product counts, sorted by product count' })
  @ApiResponse({
    status: 200,
    description: 'Categories with product counts retrieved successfully',
    type: [Category],
  })
  async findAllWithProductCounts() {
    return await this.categoryService.findAllWithProductCounts();
  }

  @Post('migrate-defaults')
  @ApiOperation({ summary: 'Migrate existing categories to set default values for isActive and sortOrder' })
  @ApiQuery({ name: 'activateAll', required: false, type: Boolean, description: 'If true, also activate categories that are explicitly set to false' })
  @ApiResponse({
    status: 200,
    description: 'Migration completed successfully',
  })
  async migrateDefaults(@Query('activateAll') activateAll?: string) {
    const shouldActivateAll = activateAll === 'true' || activateAll === '1';
    return await this.categoryService.migrateDefaultValues(shouldActivateAll);
  }

  @Post('activate-all')
  @ApiOperation({ summary: 'Activate all categories' })
  @ApiResponse({
    status: 200,
    description: 'All categories activated successfully',
  })
  async activateAll() {
    return await this.categoryService.activateAllCategories();
  }

  @Get('parent/:parentId')
  @ApiOperation({ summary: 'Get subcategories by parent ID' })
  @ApiResponse({
    status: 200,
    description: 'Subcategories retrieved successfully',
    type: [Category],
  })
  @ApiParam({ name: 'parentId', description: 'Parent category ID' })
  async findSubCategories(@Param('parentId') parentId: string): Promise<Category[]> {
    return await this.categoryService.findSubCategories(parentId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  async findBySlug(@Param('slug') slug: string): Promise<Category> {
    return await this.categoryService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Category retrieved successfully',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async findOne(@Param('id') id: string): Promise<Category> {
    return await this.categoryService.findById(id);
  }

  @Patch(':id')
  @Put(':id')
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({
    status: 200,
    description: 'Category updated successfully',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - category with same slug already exists',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return await this.categoryService.updateCategory(id, updateCategoryDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle category active status' })
  @ApiResponse({
    status: 200,
    description: 'Category status toggled successfully',
    type: Category,
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async toggleStatus(@Param('id') id: string): Promise<Category> {
    return await this.categoryService.toggleCategoryStatus(id);
  }

  @Patch(':id/sort-order')
  @ApiOperation({ summary: 'Update category sort order' })
  @ApiResponse({
    status: 200,
    description: 'Category sort order updated successfully',
    type: Category,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid sort order',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sortOrder: {
          type: 'number',
          description: 'New sort order',
          minimum: 0,
        },
      },
      required: ['sortOrder'],
    },
  })
  async updateSortOrder(
    @Param('id') id: string,
    @Body('sortOrder') sortOrder: number,
  ): Promise<Category> {
    return await this.categoryService.updateSortOrder(id, sortOrder);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({
    status: 204,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - category has subcategories or products',
  })
  @ApiParam({ name: 'id', description: 'Category ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.categoryService.deleteCategory(id);
  }
}
