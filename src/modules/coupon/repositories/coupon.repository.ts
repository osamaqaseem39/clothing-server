import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@/common/repositories/base.repository';
import { Coupon, CouponDocument } from '../schemas/coupon.schema';

@Injectable()
export class CouponRepository extends BaseRepository<CouponDocument> {
  constructor(
    @InjectModel(Coupon.name) private readonly couponModel: Model<CouponDocument>,
  ) {
    super(couponModel);
  }

  async findByCode(code: string): Promise<CouponDocument | null> {
    return await this.couponModel.findOne({ code: code.toUpperCase() }).exec();
  }

  async findValidCoupons(): Promise<CouponDocument[]> {
    const now = new Date();
    return await this.couponModel.find({
      $and: [
        {
          $or: [
            { expiryDate: { $exists: false } },
            { expiryDate: { $gt: now } },
          ],
        },
        {
          $or: [
            { usageLimit: { $exists: false } },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
          ],
        },
      ],
    }).exec();
  }

  async incrementUsageCount(code: string): Promise<CouponDocument | null> {
    return await this.couponModel.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usageCount: 1 } },
      { new: true }
    ).exec();
  }

  async findCouponsByProduct(productId: string): Promise<CouponDocument[]> {
    return await this.couponModel.find({
      $or: [
        { productIds: { $exists: false } },
        { productIds: productId },
      ],
      $and: [
        { excludedProductIds: { $ne: productId } },
      ],
    }).exec();
  }
} 