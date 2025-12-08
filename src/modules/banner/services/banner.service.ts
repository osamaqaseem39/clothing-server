import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../../common/services/base.service';
import { BannerRepository } from '../repositories/banner.repository';
import { BannerDocument } from '../schemas/banner.schema';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';

@Injectable()
export class BannerService extends BaseService<BannerDocument> {
  constructor(private readonly bannerRepository: BannerRepository) {
    super(bannerRepository);
  }

  async createBanner(createBannerDto: CreateBannerDto): Promise<BannerDocument> {
    // Validate date range if both dates are provided
    if (createBannerDto.startDate && createBannerDto.endDate) {
      const startDate = new Date(createBannerDto.startDate);
      const endDate = new Date(createBannerDto.endDate);
      
      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Set default displayOrder if not provided
    if (createBannerDto.displayOrder === undefined) {
      const count = await this.bannerRepository.count();
      createBannerDto.displayOrder = count;
    }

    // Convert date strings to Date objects
    const bannerData: any = {
      ...createBannerDto,
      startDate: createBannerDto.startDate ? new Date(createBannerDto.startDate) : undefined,
      endDate: createBannerDto.endDate ? new Date(createBannerDto.endDate) : undefined,
    };

    return await this.bannerRepository.create(bannerData);
  }

  async updateBanner(id: string, updateBannerDto: UpdateBannerDto): Promise<BannerDocument> {
    // Check if banner exists
    await this.findById(id);

    // Validate date range if both dates are provided
    if (updateBannerDto.startDate && updateBannerDto.endDate) {
      const startDate = new Date(updateBannerDto.startDate);
      const endDate = new Date(updateBannerDto.endDate);
      
      if (endDate < startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Convert date strings to Date objects
    const updateData: any = { ...updateBannerDto };
    if (updateBannerDto.startDate) {
      updateData.startDate = new Date(updateBannerDto.startDate);
    }
    if (updateBannerDto.endDate) {
      updateData.endDate = new Date(updateBannerDto.endDate);
    }

    return await this.bannerRepository.update(id, updateData);
  }

  async findActiveByPosition(position: string): Promise<BannerDocument[]> {
    return await this.bannerRepository.findActiveByPosition(position);
  }

  async findAllActive(): Promise<BannerDocument[]> {
    return await this.bannerRepository.findAllActive();
  }

  async toggleStatus(id: string, enabled: boolean): Promise<BannerDocument> {
    const banner = await this.findById(id);
    return await this.bannerRepository.update(id, { enabled });
  }
}

