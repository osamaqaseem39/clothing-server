import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { BaseService } from '../../../common/services/base.service';
import { CouponRepository } from '../repositories/coupon.repository';
import { CouponDocument, DiscountType } from '../schemas/coupon.schema';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { PaginatedResult } from '../../../common/interfaces/base.interface';

@Injectable()
export class CouponService extends BaseService<CouponDocument> {
  constructor(private readonly couponRepository: CouponRepository) {
    super(couponRepository);
  }

  async createCoupon(createCouponDto: CreateCouponDto): Promise<CouponDocument> {
    // Check if coupon with same code already exists
    const existingCoupon = await this.couponRepository.findByCode(createCouponDto.code);
    if (existingCoupon) {
      throw new ConflictException(`Coupon with code '${createCouponDto.code}' already exists`);
    }

    // Validate amount based on discount type
    if (createCouponDto.discountType === DiscountType.PERCENT && createCouponDto.amount > 100) {
      throw new BadRequestException('Percentage discount cannot exceed 100%');
    }

    // Validate minimum and maximum spend
    if (createCouponDto.minimumSpend && createCouponDto.maximumSpend) {
      if (createCouponDto.minimumSpend >= createCouponDto.maximumSpend) {
        throw new BadRequestException('Minimum spend must be less than maximum spend');
      }
    }

    // Convert code to uppercase and expiryDate to Date if provided
    const couponData = {
      ...createCouponDto,
      code: createCouponDto.code.toUpperCase(),
      ...(createCouponDto.expiryDate && { expiryDate: new Date(createCouponDto.expiryDate) }),
    };

    return await this.couponRepository.create(couponData);
  }

  async updateCoupon(id: string, updateCouponDto: UpdateCouponDto): Promise<CouponDocument> {
    // Check if coupon exists
    await this.findById(id);

    // If updating code, check for conflicts
    if (updateCouponDto.code) {
      const existingCoupon = await this.couponRepository.findByCode(updateCouponDto.code);
      if (existingCoupon && existingCoupon._id.toString() !== id) {
        throw new ConflictException(`Coupon with code '${updateCouponDto.code}' already exists`);
      }
      updateCouponDto.code = updateCouponDto.code.toUpperCase();
    }

    // Validate amount if updating
    if (updateCouponDto.amount !== undefined) {
      const coupon = await this.findById(id);
      const discountType = updateCouponDto.discountType || coupon.discountType;
      
      if (discountType === DiscountType.PERCENT && updateCouponDto.amount > 100) {
        throw new BadRequestException('Percentage discount cannot exceed 100%');
      }
    }

    // Validate minimum and maximum spend if updating
    if (updateCouponDto.minimumSpend !== undefined || updateCouponDto.maximumSpend !== undefined) {
      const coupon = await this.findById(id);
      const minSpend = updateCouponDto.minimumSpend ?? coupon.minimumSpend;
      const maxSpend = updateCouponDto.maximumSpend ?? coupon.maximumSpend;
      
      if (minSpend && maxSpend && minSpend >= maxSpend) {
        throw new BadRequestException('Minimum spend must be less than maximum spend');
      }
    }

    // Convert expiryDate to Date if provided
    const updateData = {
      ...updateCouponDto,
      ...(updateCouponDto.expiryDate && { expiryDate: new Date(updateCouponDto.expiryDate) }),
    };

    return await this.couponRepository.update(id, updateData);
  }

  async findByCode(code: string): Promise<CouponDocument> {
    const coupon = await this.couponRepository.findByCode(code);
    if (!coupon) {
      throw new Error(`Coupon with code '${code}' not found`);
    }
    return coupon;
  }

  async validateCoupon(code: string, cartTotal: number, productIds?: string[]): Promise<{
    isValid: boolean;
    coupon?: CouponDocument;
    discountAmount: number;
    message?: string;
  }> {
    const coupon = await this.couponRepository.findByCode(code);
    
    if (!coupon) {
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Coupon not found',
      };
    }

    // Check if coupon has expired
    if (coupon.expiryDate && coupon.expiryDate < new Date()) {
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Coupon has expired',
      };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return {
        isValid: false,
        discountAmount: 0,
        message: 'Coupon usage limit exceeded',
      };
    }

    // Check minimum spend
    if (coupon.minimumSpend && cartTotal < coupon.minimumSpend) {
      return {
        isValid: false,
        discountAmount: 0,
        message: `Minimum spend of ${coupon.minimumSpend} required`,
      };
    }

    // Check maximum spend
    if (coupon.maximumSpend && cartTotal > coupon.maximumSpend) {
      return {
        isValid: false,
        discountAmount: 0,
        message: `Maximum spend of ${coupon.maximumSpend} exceeded`,
      };
    }

    // Check product restrictions
    if (productIds && productIds.length > 0) {
      if (coupon.productIds && coupon.productIds.length > 0) {
        const hasValidProduct = productIds.some(id => coupon.productIds!.includes(id));
        if (!hasValidProduct) {
          return {
            isValid: false,
            discountAmount: 0,
            message: 'Coupon does not apply to any products in cart',
          };
        }
      }

      if (coupon.excludedProductIds && coupon.excludedProductIds.length > 0) {
        const hasExcludedProduct = productIds.some(id => coupon.excludedProductIds!.includes(id));
        if (hasExcludedProduct) {
          return {
            isValid: false,
            discountAmount: 0,
            message: 'Coupon cannot be used with excluded products',
          };
        }
      }
    }

    // Calculate discount amount
    let discountAmount = 0;
    switch (coupon.discountType) {
      case DiscountType.FIXED_CART:
        discountAmount = Math.min(coupon.amount, cartTotal);
        break;
      case DiscountType.PERCENT:
        discountAmount = (cartTotal * coupon.amount) / 100;
        break;
      case DiscountType.FIXED_PRODUCT:
        discountAmount = coupon.amount;
        break;
    }

    return {
      isValid: true,
      coupon,
      discountAmount,
    };
  }

  async applyCoupon(code: string): Promise<CouponDocument> {
    const coupon = await this.findByCode(code);
    
    // Increment usage count
    const updatedCoupon = await this.couponRepository.incrementUsageCount(code);
    if (!updatedCoupon) {
      throw new Error('Failed to update coupon usage count');
    }

    return updatedCoupon;
  }

  async findValidCoupons(): Promise<CouponDocument[]> {
    return await this.couponRepository.findValidCoupons();
  }

  async findCouponsByProduct(productId: string): Promise<CouponDocument[]> {
    return await this.couponRepository.findCouponsByProduct(productId);
  }

  async findAll(options?: any): Promise<PaginatedResult<CouponDocument>> {
    return await this.couponRepository.findAll(options);
  }
} 