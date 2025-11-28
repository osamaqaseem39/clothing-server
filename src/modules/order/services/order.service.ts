import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { OrderDocument, OrderStatus, PaymentStatus } from '../schemas/order.schema';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { BaseService } from '../../../common/services/base.service';
import { PaginationOptions, PaginatedResult } from '../../../common/interfaces/base.interface';
import { ProductService } from '../../product/services/product.service';
import { EmailService } from '../../notification/services/email.service';

@Injectable()
export class OrderService extends BaseService<OrderDocument> {
  constructor(
    private readonly orderRepository: OrderRepository,
    @Inject(forwardRef(() => ProductService))
    private readonly productService: ProductService,
    private readonly emailService: EmailService,
  ) {
    super(orderRepository);
  }

  private generateTrackingId(): string {
    // Generate a unique tracking ID: TRK + timestamp + random string
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TRK${timestamp}${random}`;
  }

  async findAll(options?: PaginationOptions & { status?: OrderStatus; paymentStatus?: PaymentStatus }): Promise<PaginatedResult<OrderDocument>> {
    return await this.orderRepository.findAll(options);
  }

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    // For COD orders, set payment status to UNPAID initially
    if (createOrderDto.paymentMethod.toLowerCase() === 'cash_on_delivery' || 
        createOrderDto.paymentMethod.toLowerCase() === 'cod') {
      createOrderDto.paymentStatus = PaymentStatus.UNPAID;
    }

    // Generate tracking ID
    const trackingId = this.generateTrackingId();
    
    // Create order with tracking ID
    const order = await this.orderRepository.create({
      ...createOrderDto,
      trackingId,
    });

    // Send order confirmation email
    const customerEmail = order.shippingAddress?.email || order.billingAddress?.email;
    if (customerEmail) {
      try {
        await this.sendOrderConfirmationEmail(order, customerEmail);
      } catch (error) {
        console.error('Failed to send order confirmation email:', error);
        // Don't fail order creation if email fails
      }
    }

    return order;
  }

  private async sendOrderConfirmationEmail(order: OrderDocument, email: string): Promise<void> {
    const subject = `Order Confirmation - Order #${order._id}`;
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9fafb; padding: 20px; }
          .order-info { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .info-label { font-weight: bold; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmation</h1>
          </div>
          <div class="content">
            <p>Thank you for your order! We've received your order and will begin processing it right away.</p>
            
            <div class="order-info">
              <h2>Order Details</h2>
              <div class="info-row">
                <span class="info-label">Order ID:</span>
                <span>${order._id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tracking ID:</span>
                <span>${order.trackingId}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Total:</span>
                <span>${order.currency} ${order.total.toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Method:</span>
                <span>${order.paymentMethod}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Order Status:</span>
                <span>${order.status}</span>
              </div>
            </div>

            <div class="order-info">
              <h2>Shipping Address</h2>
              <p>
                ${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
                ${order.shippingAddress.addressLine1}<br>
                ${order.shippingAddress.addressLine2 ? order.shippingAddress.addressLine2 + '<br>' : ''}
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
                ${order.shippingAddress.country}
              </p>
            </div>

            <p>You can track your order using the Tracking ID: <strong>${order.trackingId}</strong></p>
            <p>We'll send you another email once your order ships.</p>
          </div>
          <div class="footer">
            <p>Thank you for shopping with us!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.emailService.sendEmail(email, subject, htmlContent);
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderDocument> {
    // Check if order exists
    const order = await this.findById(id);

    const updatedOrder = await this.orderRepository.updateStatus(id, status);
    if (!updatedOrder) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Manage inventory when order is approved (status changes to processing or completed)
    // Only process inventory if order was previously pending and is now being approved
    if ((status === OrderStatus.PROCESSING || status === OrderStatus.COMPLETED) && 
        order.status === OrderStatus.PENDING) {
      try {
        await this.manageInventoryForOrder(updatedOrder);
      } catch (error) {
        console.error('Failed to manage inventory for order:', error);
        // Don't fail status update if inventory management fails
      }
    }

    return updatedOrder;
  }

  private async manageInventoryForOrder(order: OrderDocument): Promise<void> {
    // Decrease stock for each item in the order
    for (const item of order.items) {
      try {
        // Decrease stock quantity (negative value decreases)
        await this.productService.updateStock(item.productId.toString(), -item.quantity);
      } catch (error) {
        console.error(`Failed to update stock for product ${item.productId}:`, error);
        // Continue with other products even if one fails
      }
    }
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