import {
  Controller,
  Get,
  Post,
  Body,
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
import { BrandService } from '../services/brand.service';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Brand } from '../schemas/brand.schema';
import { PaginatedResult } from '../../../common/interfaces/base.interface';

@ApiTags('Brands')
@Controller('brands')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({
    status: 201,
    description: 'Brand created successfully',
    type: Brand,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - brand with same slug already exists',
  })
  @ApiBody({ type: CreateBrandDto })
  async create(@Body() createBrandDto: CreateBrandDto): Promise<Brand> {
    return await this.brandService.createBrand(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Brands retrieved successfully',
    type: [Brand],
  })
  @ApiQuery({ type: PaginationDto })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<Brand>> {
    return await this.brandService.findAll(paginationDto);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active brands with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Active brands retrieved successfully',
    type: [Brand],
  })
  @ApiQuery({ type: PaginationDto })
  async findActiveBrands(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<Brand>> {
    return await this.brandService.findActiveBrands(paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get brand statistics' })
  @ApiResponse({
    status: 200,
    description: 'Brand statistics retrieved successfully',
  })
  async getStats() {
    return await this.brandService.getBrandStats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search brands by query' })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
    type: [Brand],
  })
  @ApiQuery({ name: 'q', description: 'Search query', required: true })
  @ApiQuery({ type: PaginationDto })
  async search(
    @Query('q') query: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Brand>> {
    return await this.brandService.searchBrands(query, paginationDto);
  }

  @Get('country/:country')
  @ApiOperation({ summary: 'Get brands by country' })
  @ApiResponse({
    status: 200,
    description: 'Brands by country retrieved successfully',
    type: [Brand],
  })
  @ApiParam({ name: 'country', description: 'Country name' })
  @ApiQuery({ type: PaginationDto })
  async findByCountry(
    @Param('country') country: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<Brand>> {
    return await this.brandService.findByCountry(country, paginationDto);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get brand by slug' })
  @ApiResponse({
    status: 200,
    description: 'Brand retrieved successfully',
    type: Brand,
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @ApiParam({ name: 'slug', description: 'Brand slug' })
  async findBySlug(@Param('slug') slug: string): Promise<Brand> {
    return await this.brandService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brand retrieved successfully',
    type: Brand,
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  async findOne(@Param('id') id: string): Promise<Brand> {
    return await this.brandService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update brand' })
  @ApiResponse({
    status: 200,
    description: 'Brand updated successfully',
    type: Brand,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - brand with same slug already exists',
  })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  @ApiBody({ type: UpdateBrandDto })
  async update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
  ): Promise<Brand> {
    return await this.brandService.updateBrand(id, updateBrandDto);
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle brand active status' })
  @ApiResponse({
    status: 200,
    description: 'Brand status toggled successfully',
    type: Brand,
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  async toggleStatus(@Param('id') id: string): Promise<Brand> {
    return await this.brandService.toggleBrandStatus(id);
  }

  @Patch(':id/order')
  @ApiOperation({ summary: 'Update brand sort order' })
  @ApiResponse({
    status: 200,
    description: 'Brand order updated successfully',
    type: Brand,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid sort order',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @ApiParam({ name: 'id', description: 'Brand ID' })
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
  async updateOrder(
    @Param('id') id: string,
    @Body('sortOrder') sortOrder: number,
  ): Promise<Brand> {
    return await this.brandService.updateBrandOrder(id, sortOrder);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete brand' })
  @ApiResponse({
    status: 204,
    description: 'Brand deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Brand not found',
  })
  @ApiParam({ name: 'id', description: 'Brand ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.brandService.delete(id);
  }
} 