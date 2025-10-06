import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from '../schemas/payment.schema';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaginationOptions, PaginatedResult } from '@/common/interfaces/base.interface';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
  ) {}

  async createPayment(createPaymentDto: CreatePaymentDto): Promise<PaymentDocument> {
    // Check if payment already exists for this order
    const existingPayment = await this.paymentModel.findOne({ 
      orderId: createPaymentDto.orderId 
    });
    
    if (existingPayment) {
      throw new ConflictException(`Payment already exists for order ${createPaymentDto.orderId}`);
    }

    // Validate payment amount
    if (createPaymentDto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    const payment = new this.paymentModel(createPaymentDto);
    return await payment.save();
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResult<PaymentDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.paymentModel.find().sort(sortOption).skip(skip).limit(limit).exec(),
      this.paymentModel.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByOrderId(orderId: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findOne({ orderId }).exec();
    if (!payment) {
      throw new NotFoundException(`Payment for order ${orderId} not found`);
    }
    return payment;
  }

  async findByCustomerId(customerId: string, options?: PaginationOptions): Promise<PaginatedResult<PaymentDocument>> {
    // This would require joining with orders to get customer payments
    // For now, return empty result
    return {
      data: [],
      total: 0,
      page: options?.page || 1,
      limit: options?.limit || 10,
      totalPages: 0,
    };
  }

  async findByStatus(status: PaymentStatus, options?: PaginationOptions): Promise<PaginatedResult<PaymentDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.paymentModel.find({ status }).sort(sortOption).skip(skip).limit(limit).exec(),
      this.paymentModel.countDocuments({ status }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByMethod(method: string, options?: PaginationOptions): Promise<PaginatedResult<PaymentDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    
    const skip = (page - 1) * limit;
    const sortOption = sort ? { [sort]: order === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.paymentModel.find({ method }).sort(sortOption).skip(skip).limit(limit).exec(),
      this.paymentModel.countDocuments({ method }).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updatePayment(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentDocument> {
    // Check if payment exists
    await this.findById(id);

    // Validate amount if updating
    if (updatePaymentDto.amount !== undefined && updatePaymentDto.amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    const updatedPayment = await this.paymentModel.findByIdAndUpdate(
      id,
      updatePaymentDto,
      { new: true }
    ).exec();

    if (!updatedPayment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return updatedPayment;
  }

  async processRefund(id: string, amount?: number, reason?: string): Promise<PaymentDocument> {
    const payment = await this.findById(id);

    // Check if payment can be refunded
    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    // Validate refund amount
    const refundAmount = amount || payment.amount;
    if (refundAmount > payment.amount) {
      throw new BadRequestException('Refund amount cannot exceed payment amount');
    }

    // Update payment status and add refund metadata
    payment.status = PaymentStatus.REFUNDED;
    payment.metadata = {
      ...payment.metadata,
      refund: {
        amount: refundAmount,
        reason: reason || 'Customer request',
        date: new Date(),
      },
    };

    return await payment.save();
  }

  async capturePayment(id: string): Promise<PaymentDocument> {
    const payment = await this.findById(id);

    // Check if payment can be captured
    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be captured');
    }

    // Update payment status
    payment.status = PaymentStatus.COMPLETED;
    payment.metadata = {
      ...payment.metadata,
      captured: {
        date: new Date(),
      },
    };

    return await payment.save();
  }

  async delete(id: string): Promise<void> {
    const payment = await this.findById(id);

    // Check if payment can be deleted
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Completed payments cannot be deleted');
    }

    await this.paymentModel.findByIdAndDelete(id).exec();
  }

  async getPaymentStats(): Promise<any> {
    const [
      totalPayments,
      totalAmount,
      successfulPayments,
      failedPayments,
      pendingPayments,
    ] = await Promise.all([
      this.paymentModel.countDocuments().exec(),
      this.paymentModel.aggregate([
        { $match: { status: PaymentStatus.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).exec(),
      this.paymentModel.countDocuments({ status: PaymentStatus.COMPLETED }).exec(),
      this.paymentModel.countDocuments({ status: PaymentStatus.FAILED }).exec(),
      this.paymentModel.countDocuments({ status: PaymentStatus.PENDING }).exec(),
    ]);

    const totalAmountValue = totalAmount.length > 0 ? totalAmount[0].total : 0;
    const averageAmount = successfulPayments > 0 ? totalAmountValue / successfulPayments : 0;

    // Get method breakdown
    const methodBreakdown = await this.paymentModel.aggregate([
      { $group: { _id: '$method', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).exec();

    // Get status breakdown
    const statusBreakdown = await this.paymentModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).exec();

    return {
      totalPayments,
      totalAmount: totalAmountValue,
      successfulPayments,
      failedPayments,
      pendingPayments,
      averageAmount,
      methodBreakdown,
      statusBreakdown,
    };
  }
} 