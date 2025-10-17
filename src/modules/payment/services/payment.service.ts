import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument, PaymentStatus } from '../schemas/payment.schema';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaginationOptions } from '../../common/dto/pagination.dto';
import { PaginatedResult } from '../../common/interfaces/base.interface';

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

    // For COD orders, set status to PENDING by default
    if (createPaymentDto.method.toLowerCase() === 'cash_on_delivery' || 
        createPaymentDto.method.toLowerCase() === 'cod') {
      createPaymentDto.status = PaymentStatus.PENDING;
    }

    const payment = new this.paymentModel(createPaymentDto);
    return await payment.save();
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResult<PaymentDocument>> {
    const { page = 1, limit = 10, sort, order = 'desc' } = options || {};
    const skip = (page - 1) * limit;
    
    const query = this.paymentModel.find();
    
    if (sort) {
      query.sort({ [sort]: order === 'desc' ? -1 : 1 });
    } else {
      query.sort({ createdAt: -1 });
    }
    
    const [data, total] = await Promise.all([
      query.skip(skip).limit(limit).exec(),
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

  async findOne(id: string): Promise<PaymentDocument> {
    const payment = await this.paymentModel.findById(id).exec();
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async findByOrderId(orderId: string): Promise<PaymentDocument | null> {
    return await this.paymentModel.findOne({ orderId }).exec();
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<PaymentDocument> {
    const payment = await this.findOne(id);
    
    Object.assign(payment, updatePaymentDto);
    return await payment.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.paymentModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
  }

  // COD-specific methods
  async markCODPaymentReceived(orderId: string, amount: number, notes?: string): Promise<PaymentDocument> {
    const payment = await this.findByOrderId(orderId);
    
    if (!payment) {
      throw new NotFoundException(`Payment not found for order ${orderId}`);
    }

    if (payment.method.toLowerCase() !== 'cash_on_delivery' && 
        payment.method.toLowerCase() !== 'cod') {
      throw new BadRequestException('This payment is not a COD payment');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment has already been marked as received');
    }

    // Update payment status to completed
    payment.status = PaymentStatus.COMPLETED;
    payment.paymentDate = new Date();
    if (notes) {
      payment.notes = notes;
    }

    return await payment.save();
  }

  async getCODPendingPayments(): Promise<PaymentDocument[]> {
    return await this.paymentModel.find({
      method: { $in: ['cash_on_delivery', 'cod'] },
      status: PaymentStatus.PENDING
    }).populate('orderId').exec();
  }

  async getPaymentStats(): Promise<{
    totalPayments: number;
    totalAmount: number;
    pendingPayments: number;
    completedPayments: number;
    codPayments: number;
  }> {
    const [
      totalPayments,
      totalAmount,
      pendingPayments,
      completedPayments,
      codPayments
    ] = await Promise.all([
      this.paymentModel.countDocuments(),
      this.paymentModel.aggregate([
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0),
      this.paymentModel.countDocuments({ status: PaymentStatus.PENDING }),
      this.paymentModel.countDocuments({ status: PaymentStatus.COMPLETED }),
      this.paymentModel.countDocuments({ 
        method: { $in: ['cash_on_delivery', 'cod'] } 
      })
    ]);

    return {
      totalPayments,
      totalAmount,
      pendingPayments,
      completedPayments,
      codPayments
    };
  }
}