import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { BaseService } from '@/common/services/base.service';
import { OrderRepository } from '../repositories/order.repository';
import { OrderDocument, OrderStatus, PaymentStatus } from '../schemas/order.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { PaginationOptions, PaginatedResult } from '@/common/interfaces/base.interface';

@Injectable()
export class OrderService extends BaseService<OrderDocument> {
  constructor(private readonly orderRepository: OrderRepository) {
    super(orderRepository);
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    // Validate order totals
    const calculatedSubtotal = createOrderDto.items.reduce((sum, item) => sum + item.subtotal, 0);
    const calculatedTotal = createOrderDto.items.reduce((sum, item) => sum + item.total, 0);
    
    if (Math.abs(calculatedSubtotal - createOrderDto.subtotal) > 0.01) {
      throw new BadRequestException('Subtotal does not match item subtotals');
    }
    
    if (Math.abs(calculatedTotal - createOrderDto.total) > 0.01) {
      throw new BadRequestException('Total does not match item totals');
    }

    // Validate that total includes all components
    const expectedTotal = createOrderDto.subtotal + 
                         (createOrderDto.shippingTotal || 0) + 
                         (createOrderDto.taxTotal || 0) - 
                         (createOrderDto.discountTotal || 0);
    
    if (Math.abs(expectedTotal - createOrderDto.total) > 0.01) {
      throw new BadRequestException('Total does not match subtotal + shipping + tax - discount');
    }

    return await this.orderRepository.create(createOrderDto);
  }

  async updateOrder(id: string, updateOrderDto: UpdateOrderDto): Promise<OrderDocument> {
    // Check if order exists
    await this.findById(id);

    // If updating items, recalculate totals
    if (updateOrderDto.items) {
      const calculatedSubtotal = updateOrderDto.items.reduce((sum, item) => sum + item.subtotal, 0);
      const calculatedTotal = updateOrderDto.items.reduce((sum, item) => sum + item.total, 0);
      
      updateOrderDto.subtotal = calculatedSubtotal;
      updateOrderDto.total = calculatedTotal + 
                            (updateOrderDto.shippingTotal || 0) + 
                            (updateOrderDto.taxTotal || 0) - 
                            (updateOrderDto.discountTotal || 0);
    }

    return await this.orderRepository.update(id, updateOrderDto);
  }

  async findByCustomerId(customerId: string, options?: PaginationOptions): Promise<PaginatedResult<OrderDocument>> {
    return await this.orderRepository.findByCustomerId(customerId, options);
  }

  async findByStatus(status: OrderStatus, options?: PaginationOptions): Promise<PaginatedResult<OrderDocument>> {
    return await this.orderRepository.findByStatus(status, options);
  }

  async findByPaymentStatus(paymentStatus: PaymentStatus, options?: PaginationOptions): Promise<PaginatedResult<OrderDocument>> {
    return await this.orderRepository.findByPaymentStatus(paymentStatus, options);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderDocument> {
    // Check if order exists
    await this.findById(id);

    // Validate status transition
    const order = await this.findById(id);
    if (!this.isValidStatusTransition(order.status, status)) {
      throw new BadRequestException(`Invalid status transition from ${order.status} to ${status}`);
    }

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

  private isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED, OrderStatus.FAILED],
      [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.FAILED],
      [OrderStatus.COMPLETED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.FAILED]: [OrderStatus.PENDING],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
} 