import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '@/common/repositories/base.repository';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../schemas/order.schema';
import { PaginationOptions, PaginatedResult } from '@/common/interfaces/base.interface';

@Injectable()
export class OrderRepository extends BaseRepository<OrderDocument> {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {
    super(orderModel);
  }

  async findByCustomerId(customerId: string, options?: PaginationOptions): Promise<PaginatedResult<OrderDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.orderModel
        .find({ customerId })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'firstName lastName email')
        .populate('items.productId', 'name sku images')
        .populate('items.variationId', 'sku price')
        .exec(),
      this.orderModel.countDocuments({ customerId }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByStatus(status: OrderStatus, options?: PaginationOptions): Promise<PaginatedResult<OrderDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.orderModel
        .find({ status })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'firstName lastName email')
        .populate('items.productId', 'name sku images')
        .populate('items.variationId', 'sku price')
        .exec(),
      this.orderModel.countDocuments({ status }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByPaymentStatus(paymentStatus: PaymentStatus, options?: PaginationOptions): Promise<PaginatedResult<OrderDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.orderModel
        .find({ paymentStatus })
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'firstName lastName email')
        .populate('items.productId', 'name sku images')
        .populate('items.variationId', 'sku price')
        .exec(),
      this.orderModel.countDocuments({ paymentStatus }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderDocument | null> {
    return await this.orderModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<OrderDocument | null> {
    return await this.orderModel.findByIdAndUpdate(
      id,
      { paymentStatus, updatedAt: new Date() },
      { new: true }
    ).exec();
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    const [totalOrders, totalRevenue, pendingOrders, completedOrders] = await Promise.all([
      this.orderModel.countDocuments().exec(),
      this.orderModel.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]).exec(),
      this.orderModel.countDocuments({ status: 'pending' }).exec(),
      this.orderModel.countDocuments({ status: 'completed' }).exec(),
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingOrders,
      completedOrders,
    };
  }
} 