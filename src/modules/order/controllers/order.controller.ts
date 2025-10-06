import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { Order, OrderDocument, OrderStatus, PaymentStatus } from '../schemas/order.schema';
import { PaginatedResult } from '@/common/interfaces/base.interface';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new order' })
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
    return await this.orderService.createOrder(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: [Order],
  })
  @ApiQuery({ type: PaginationDto })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<OrderDocument>> {
    return await this.orderService.findAll(paginationDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get order statistics' })
  @ApiResponse({
    status: 200,
    description: 'Order statistics retrieved successfully',
  })
  async getStats() {
    return await this.orderService.getOrderStats();
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get orders by customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Customer orders retrieved successfully',
    type: [Order],
  })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiQuery({ type: PaginationDto })
  async findByCustomer(
    @Param('customerId') customerId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<OrderDocument>> {
    return await this.orderService.findByCustomerId(customerId, paginationDto);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get orders by status' })
  @ApiResponse({
    status: 200,
    description: 'Orders by status retrieved successfully',
    type: [Order],
  })
  @ApiParam({ name: 'status', enum: OrderStatus, description: 'Order status' })
  @ApiQuery({ type: PaginationDto })
  async findByStatus(
    @Param('status') status: OrderStatus,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<OrderDocument>> {
    return await this.orderService.findByStatus(status, paginationDto);
  }

  @Get('payment/:paymentStatus')
  @ApiOperation({ summary: 'Get orders by payment status' })
  @ApiResponse({
    status: 200,
    description: 'Orders by payment status retrieved successfully',
    type: [Order],
  })
  @ApiParam({ name: 'paymentStatus', enum: PaymentStatus, description: 'Payment status' })
  @ApiQuery({ type: PaginationDto })
  async findByPaymentStatus(
    @Param('paymentStatus') paymentStatus: PaymentStatus,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<OrderDocument>> {
    return await this.orderService.findByPaymentStatus(paymentStatus, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
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
  @ApiOperation({ summary: 'Update order' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
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
    return await this.orderService.updateOrder(id, updateOrderDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: Order,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid status transition',
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
  @ApiOperation({ summary: 'Update order payment status' })
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

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete order' })
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
    await this.orderService.delete(id);
  }
} 