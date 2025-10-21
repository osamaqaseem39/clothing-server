import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { OrderDocument, OrderStatus, PaymentStatus } from '../schemas/order.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { BaseService } from '../../../common/services/base.service';

@Injectable()
export class OrderService extends BaseService<OrderDocument> {
  constructor(private readonly orderRepository: OrderRepository) {
    super(orderRepository);
  }

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    // For COD orders, set payment status to UNPAID initially
    if (createOrderDto.paymentMethod.toLowerCase() === 'cash_on_delivery' || 
        createOrderDto.paymentMethod.toLowerCase() === 'cod') {
      createOrderDto.paymentStatus = PaymentStatus.UNPAID;
    }

    return await this.orderRepository.create(createOrderDto);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderDocument> {
    // Check if order exists
    await this.findById(id);

    const updatedOrder = await this.orderRepository.updateStatus(id, status);
    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return updatedOrder;
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<OrderDocument> {
    // Check if order exists
    await this.findById(id);

    const updatedOrder = await this.orderRepository.updatePaymentStatus(id, paymentStatus);
    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return updatedOrder;
  }

  async getOrderStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }> {
    return await this.orderRepository.getOrderStats();
  }

  async getCODPendingOrders(): Promise<OrderDocument[]> {
    return await (this as any).orderRepository.model.find({
      paymentMethod: { $in: ['cash_on_delivery', 'cod'] },
      paymentStatus: PaymentStatus.UNPAID
    }).exec();
  }

  async markCODPaymentReceived(orderId: string): Promise<OrderDocument> {
    const order = await this.findById(orderId);
    
    if (order.paymentMethod.toLowerCase() !== 'cash_on_delivery' && 
        order.paymentMethod.toLowerCase() !== 'cod') {
      throw new BadRequestException('This order is not a COD order');
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new BadRequestException('Payment has already been marked as received');
    }

    return await this.updatePaymentStatus(orderId, PaymentStatus.PAID);
  }
}