import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../schemas/order.schema';
import { PaginationOptions } from '../../common/dto/pagination.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new order',
    description: 'Create a new order with items and customer information'
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiBody({ type: CreateOrderDto })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderDocument> {
    return await this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all orders with pagination',
    description: 'Retrieve a paginated list of all orders'
  })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  async findAll(@Query() options: PaginationOptions) {
    return await this.orderService.findAll(options);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get order statistics',
    description: 'Get order statistics including totals and counts'
  })
  @ApiResponse({
    status: 200,
    description: 'Order statistics retrieved successfully',
  })
  async getStats() {
    return await this.orderService.getOrderStats();
  }

  @Get('cod/pending')
  @ApiOperation({ 
    summary: 'Get pending COD orders',
    description: 'Get all pending Cash on Delivery orders'
  })
  @ApiResponse({
    status: 200,
    description: 'Pending COD orders retrieved successfully',
  })
  async getPendingCODOrders() {
    return await this.orderService.getCODPendingOrders();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get order by ID',
    description: 'Retrieve a specific order by its ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async findOne(@Param('id') id: string): Promise<OrderDocument> {
    return await this.orderService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update order',
    description: 'Update order information'
  })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({ type: UpdateOrderDto })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<OrderDocument> {
    return await this.orderService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ 
    summary: 'Update order status',
    description: 'Update the status of an order'
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(OrderStatus),
          description: 'New order status',
        },
      },
      required: ['status'],
    },
  })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ): Promise<OrderDocument> {
    return await this.orderService.updateOrderStatus(id, status);
  }

  @Patch(':id/payment-status')
  @ApiOperation({ 
    summary: 'Update order payment status',
    description: 'Update the payment status of an order'
  })
  @ApiResponse({
    status: 200,
    description: 'Order payment status updated successfully',
    type: Order,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        paymentStatus: {
          type: 'string',
          enum: Object.values(PaymentStatus),
          description: 'New payment status',
        },
      },
      required: ['paymentStatus'],
    },
  })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
  ): Promise<OrderDocument> {
    return await this.orderService.updatePaymentStatus(id, paymentStatus);
  }

  @Post(':id/cod/receive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Mark COD payment as received',
    description: 'Mark a Cash on Delivery payment as received upon delivery'
  })
  @ApiResponse({
    status: 200,
    description: 'COD payment marked as received successfully',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - not a COD order or already paid',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async markCODPaymentReceived(@Param('id') id: string): Promise<OrderDocument> {
    return await this.orderService.markCODPaymentReceived(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete order',
    description: 'Delete an order record'
  })
  @ApiResponse({
    status: 204,
    description: 'Order deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiParam({ name: 'id', description: 'Order ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.orderService.remove(id);
  }
}