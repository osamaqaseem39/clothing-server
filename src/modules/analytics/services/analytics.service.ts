import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../../order/schemas/order.schema';
import { Product } from '../../product/schemas/product.schema';
import { Customer } from '../../customer/schemas/customer.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      ordersLast7Days,
      revenueLast7Days,
      ordersLast30Days,
      revenueLast30Days,
    ] = await Promise.all([
      this.orderModel.countDocuments(),
      this.orderModel.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.productModel.countDocuments(),
      this.customerModel.countDocuments(),
      this.orderModel.countDocuments({ createdAt: { $gte: last7Days } }),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: last7Days }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      this.orderModel.countDocuments({ createdAt: { $gte: last30Days } }),
      this.orderModel.aggregate([
        { $match: { createdAt: { $gte: last30Days }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    return {
      totalOrders,
      totalRevenue: revenueLast7Days[0]?.total || 0,
      totalProducts,
      totalCustomers,
      ordersLast7Days,
      revenueLast7Days: revenueLast7Days[0]?.total || 0,
      ordersLast30Days,
      revenueLast30Days: revenueLast30Days[0]?.total || 0,
    };
  }

  async getRevenueChart(period: string) {
    const days = this.getDaysFromPeriod(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const revenueData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: { $ne: 'cancelled' },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    return {
      period,
      data: revenueData.map(item => ({
        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
        revenue: item.revenue,
        orders: item.orders,
      })),
    };
  }

  async getOrdersChart(period: string) {
    const days = this.getDaysFromPeriod(period);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const ordersData = await this.orderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    return {
      period,
      data: ordersData.map(item => ({
        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
        orders: item.orders,
        revenue: item.revenue,
      })),
    };
  }

  async getTopProducts(limit: number) {
    const topProducts = await this.orderModel.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productId: '$_id',
          productName: '$product.name',
          productImage: '$product.images',
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]);

    return {
      limit,
      products: topProducts,
    };
  }

  private getDaysFromPeriod(period: string): number {
    switch (period) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '90d':
        return 90;
      default:
        return 7;
    }
  }
}
