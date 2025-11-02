import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
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
import { ProductService } from '../services/product.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Product } from '../schemas/product.schema';
import { PaginatedResult } from '../../../common/interfaces/base.interface';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - product with same slug or SKU already exists',
  })
  @ApiBody({ type: CreateProductDto })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return await this.productService.createProduct(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products retrieved successfully',
    type: [Product],
  })
  @ApiQuery({ type: PaginationDto })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<Product>> {
    return await this.productService.findAll(paginationDto);
  }

  @Get('published')
  @ApiOperation({ summary: 'Get all published products with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Published products retrieved successfully',
    type: [Product],
  })
  @ApiQuery({ type: PaginationDto })
  async findPublishedProducts(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<Product>> {
    return await this.productService.findPublishedProducts(paginationDto);
  }

  @Get('filter-options')
  @ApiOperation({ summary: 'Get filter options from published products' })
  @ApiResponse({
    status: 200,
    description: 'Filter options retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
            },
          },
        },
        brands: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string' },
              name: { type: 'string' },
              slug: { type: 'string' },
            },
          },
        },
        sizes: { type: 'array', items: { type: 'string' } },
        colors: { type: 'array', items: { type: 'string' } },
        priceRange: {
          type: 'object',
          properties: {
            min: { type: 'number' },
            max: { type: 'number' },
          },
        },
      },
    },
  })
  async getFilterOptions(): Promise<{
    categories: Array<{ _id: string; name: string; slug: string }>;
    brands: Array<{ _id: string; name: string; slug: string }>;
    sizes: string[];
    colors: string[];
    priceRange: { min: number; max: number };
  }> {
    try {
      return await this.productService.getFilterOptions();
    } catch (error) {
      console.error('Error in getFilterOptions controller:', error);
      // Return empty defaults instead of throwing to prevent 500 errors
      return {
        categories: [],
        brands: [],
        sizes: [],
        colors: [],
        priceRange: { min: 0, max: 10000 },
      };
    }
  }

  @Get('search')
  @ApiOperation({ summary: 'Search products by query' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [Product],
  })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiQuery({ type: PaginationDto })
  async search(
    @Query('q') query: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Product>> {
    return await this.productService.searchProducts(query, paginationDto);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category' })
  @ApiResponse({
    status: 200,
    description: 'Products by category retrieved successfully',
    type: [Product],
  })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  @ApiQuery({ type: PaginationDto })
  async findByCategory(
    @Param('categoryId') categoryId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Product>> {
    return await this.productService.findByCategory(categoryId, paginationDto);
  }

  @Get('brand/:brandId')
  @ApiOperation({ summary: 'Get products by brand' })
  @ApiResponse({
    status: 200,
    description: 'Products by brand retrieved successfully',
    type: [Product],
  })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  @ApiQuery({ type: PaginationDto })
  async findByBrand(
    @Param('brandId') brandId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Product>> {
    return await this.productService.findByBrand(brandId, paginationDto);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  async findBySlug(@Param('slug') slug: string): Promise<Product> {
    return await this.productService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product retrieved successfully',
    type: Product,
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async findOne(@Param('id') id: string): Promise<Product> {
    return await this.productService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update product (PUT)' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - product with same slug or SKU already exists',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  async updatePut(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productService.updateProduct(id, updateProductDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update product (PATCH)' })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - product with same slug or SKU already exists',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productService.updateProduct(id, updateProductDto);
  }

  @Patch(':id/stock')
  @ApiOperation({ summary: 'Update product stock' })
  @ApiResponse({
    status: 200,
    description: 'Stock updated successfully',
    type: Product,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - stock management not enabled',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          description: 'Stock quantity change (positive for increase, negative for decrease)',
        },
      },
      required: ['quantity'],
    },
  })
  async updateStock(
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ): Promise<Product> {
    return await this.productService.updateStock(id, quantity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete product' })
  @ApiResponse({
    status: 204,
    description: 'Product deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Product not found',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.productService.delete(id);
  }
} 