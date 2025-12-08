import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { Banner, BannerDocument } from '../schemas/banner.schema';

@Injectable()
export class BannerRepository extends BaseRepository<BannerDocument> {
  constructor(
    @InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>,
  ) {
    super(bannerModel);
  }

  async findActiveByPosition(position: string): Promise<BannerDocument[]> {
    const now = new Date();
    return await this.bannerModel
      .find({
        enabled: true,
        position,
        $or: [
          { startDate: { $exists: false }, endDate: { $exists: false } },
          { startDate: { $lte: now }, endDate: { $gte: now } },
          { startDate: { $lte: now }, endDate: { $exists: false } },
          { startDate: { $exists: false }, endDate: { $gte: now } },
        ],
      })
      .sort({ displayOrder: 1, createdAt: -1 })
      .exec();
  }

  async findAllActive(): Promise<BannerDocument[]> {
    const now = new Date();
    return await this.bannerModel
      .find({
        enabled: true,
        $or: [
          { startDate: { $exists: false }, endDate: { $exists: false } },
          { startDate: { $lte: now }, endDate: { $gte: now } },
          { startDate: { $lte: now }, endDate: { $exists: false } },
          { startDate: { $exists: false }, endDate: { $gte: now } },
        ],
      })
      .sort({ displayOrder: 1, createdAt: -1 })
      .exec();
  }

  async count(): Promise<number> {
    return await this.bannerModel.countDocuments().exec();
  }
}

