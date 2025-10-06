import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { BaseService } from '@/common/services/base.service';
import { BrandRepository } from '../repositories/brand.repository';
import { BrandDocument } from '../schemas/brand.schema';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { PaginationOptions, PaginatedResult } from '@/common/interfaces/base.interface';

@Injectable()
export class BrandService extends BaseService<BrandDocument> {
  constructor(private readonly brandRepository: BrandRepository) {
    super(brandRepository);
  }

  async createBrand(createBrandDto: CreateBrandDto): Promise<BrandDocument> {
    // Check if brand with same slug already exists
    const existingBrand = await this.brandRepository.findBySlug(createBrandDto.slug);
    if (existingBrand) {
      throw new ConflictException(`Brand with slug '${createBrandDto.slug}' already exists`);
    }

    // Validate founded year if provided
    if (createBrandDto.foundedYear) {
      const currentYear = new Date().getFullYear();
      if (createBrandDto.foundedYear > currentYear) {
        throw new BadRequestException('Founded year cannot be in the future');
      }
    }

    return await this.brandRepository.create(createBrandDto);
  }

  async updateBrand(id: string, updateBrandDto: UpdateBrandDto): Promise<BrandDocument> {
    // Check if brand exists
    await this.findById(id);

    // If updating slug, check for conflicts
    if (updateBrandDto.slug) {
      const existingBrand = await this.brandRepository.findBySlug(updateBrandDto.slug);
      if (existingBrand && existingBrand._id.toString() !== id) {
        throw new ConflictException(`Brand with slug '${updateBrandDto.slug}' already exists`);
      }
    }

    // Validate founded year if updating
    if (updateBrandDto.foundedYear) {
      const currentYear = new Date().getFullYear();
      if (updateBrandDto.foundedYear > currentYear) {
        throw new BadRequestException('Founded year cannot be in the future');
      }
    }

    return await this.brandRepository.update(id, updateBrandDto);
  }

  async findBySlug(slug: string): Promise<BrandDocument> {
    const brand = await this.brandRepository.findBySlug(slug);
    if (!brand) {
      throw new Error(`Brand with slug '${slug}' not found`);
    }
    return brand;
  }

  async findActiveBrands(options?: PaginationOptions): Promise<PaginatedResult<BrandDocument>> {
    return await this.brandRepository.findActiveBrands(options);
  }

  async findByCountry(country: string, options?: PaginationOptions): Promise<PaginatedResult<BrandDocument>> {
    return await this.brandRepository.findByCountry(country, options);
  }

  async searchBrands(query: string, options?: PaginationOptions): Promise<PaginatedResult<BrandDocument>> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters long');
    }
    return await this.brandRepository.searchBrands(query, options);
  }

  async getBrandStats(): Promise<{
    totalBrands: number;
    activeBrands: number;
    countries: string[];
  }> {
    return await this.brandRepository.getBrandStats();
  }

  async toggleBrandStatus(id: string): Promise<BrandDocument> {
    const brand = await this.findById(id);
    const newStatus = !brand.isActive;
    
    return await this.brandRepository.update(id, { isActive: newStatus });
  }

  async updateBrandOrder(id: string, sortOrder: number): Promise<BrandDocument> {
    if (sortOrder < 0) {
      throw new BadRequestException('Sort order must be non-negative');
    }
    
    return await this.brandRepository.update(id, { sortOrder });
  }
} 