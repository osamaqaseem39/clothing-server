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
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { PaginationOptions } from '../../common/dto/pagination.dto';

@ApiTags('Payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new payment',
    description: 'Process a new payment for an order'
  })
  @ApiResponse({
    status: 201,
    description: 'Payment created and processed successfully',
    type: Payment,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error or insufficient funds',
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Payment already exists for this order',
  })
  @ApiBody({ type: CreatePaymentDto })
  async create(@Body() createPaymentDto: CreatePaymentDto): Promise<PaymentDocument> {
    return await this.paymentService.createPayment(createPaymentDto);
  }

  @Get()
  @ApiOperation({ 
    summary: 'Get all payments with pagination',
    description: 'Retrieve a paginated list of all payments'
  })
  @ApiResponse({
    status: 200,
    description: 'Payments retrieved successfully',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'sort', required: false, type: String, description: 'Sort field' })
  @ApiQuery({ name: 'order', required: false, enum: ['asc', 'desc'], description: 'Sort order' })
  async findAll(@Query() options: PaginationOptions) {
    return await this.paymentService.findAll(options);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get payment statistics',
    description: 'Get payment statistics including totals and counts'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved successfully',
  })
  async getStats() {
    return await this.paymentService.getPaymentStats();
  }

  @Get('cod/pending')
  @ApiOperation({ 
    summary: 'Get pending COD payments',
    description: 'Get all pending Cash on Delivery payments'
  })
  @ApiResponse({
    status: 200,
    description: 'Pending COD payments retrieved successfully',
  })
  async getPendingCODPayments() {
    return await this.paymentService.getCODPendingPayments();
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get payment by ID',
    description: 'Retrieve a specific payment by its ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    type: Payment,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async findOne(@Param('id') id: string): Promise<PaymentDocument> {
    return await this.paymentService.findOne(id);
  }

  @Get('order/:orderId')
  @ApiOperation({ 
    summary: 'Get payment by order ID',
    description: 'Retrieve payment for a specific order'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment retrieved successfully',
    type: Payment,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found for this order',
  })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  async findByOrderId(@Param('orderId') orderId: string): Promise<PaymentDocument> {
    return await this.paymentService.findByOrderId(orderId);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update payment',
    description: 'Update payment information'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    type: Payment,
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({ type: UpdatePaymentDto })
  async update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentDocument> {
    return await this.paymentService.update(id, updatePaymentDto);
  }

  @Post('cod/:orderId/receive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Mark COD payment as received',
    description: 'Mark a Cash on Delivery payment as received upon delivery'
  })
  @ApiResponse({
    status: 200,
    description: 'COD payment marked as received successfully',
    type: Payment,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - not a COD payment or already completed',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found for this order',
  })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'Amount received' },
        notes: { type: 'string', description: 'Optional notes about the payment' },
      },
      required: ['amount'],
    },
  })
  async markCODPaymentReceived(
    @Param('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('notes') notes?: string,
  ): Promise<PaymentDocument> {
    return await this.paymentService.markCODPaymentReceived(orderId, amount, notes);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete payment',
    description: 'Delete a payment record'
  })
  @ApiResponse({
    status: 204,
    description: 'Payment deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async remove(@Param('id') id: string): Promise<void> {
    return await this.paymentService.remove(id);
  }
}