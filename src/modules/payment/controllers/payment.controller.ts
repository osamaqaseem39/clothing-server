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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { Payment, PaymentDocument, PaymentStatus } from '../schemas/payment.schema';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/interfaces/base.interface';

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
    type: [Payment],
  })
  @ApiQuery({ type: PaginationDto })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<PaymentDocument>> {
    return await this.paymentService.findAll(paginationDto);
  }

  @Get('order/:orderId')
  @ApiOperation({ 
    summary: 'Get payment by order ID',
    description: 'Retrieve payment information for a specific order'
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
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  async findByOrderId(@Param('orderId') orderId: string): Promise<PaymentDocument> {
    return await this.paymentService.findByOrderId(orderId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ 
    summary: 'Get payments by customer ID',
    description: 'Retrieve all payments for a specific customer'
  })
  @ApiResponse({
    status: 200,
    description: 'Customer payments retrieved successfully',
    type: [Payment],
  })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiQuery({ type: PaginationDto })
  async findByCustomerId(
    @Param('customerId') customerId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<PaymentDocument>> {
    return await this.paymentService.findByCustomerId(customerId, paginationDto);
  }

  @Get('status/:status')
  @ApiOperation({ 
    summary: 'Get payments by status',
    description: 'Retrieve payments filtered by payment status'
  })
  @ApiResponse({
    status: 200,
    description: 'Payments by status retrieved successfully',
    type: [Payment],
  })
  @ApiParam({ 
    name: 'status', 
    enum: PaymentStatus, 
    description: 'Payment status to filter by' 
  })
  @ApiQuery({ type: PaginationDto })
  async findByStatus(
    @Param('status') status: PaymentStatus,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<PaymentDocument>> {
    return await this.paymentService.findByStatus(status, paginationDto);
  }

  @Get('method/:method')
  @ApiOperation({ 
    summary: 'Get payments by payment method',
    description: 'Retrieve payments filtered by payment method'
  })
  @ApiResponse({
    status: 200,
    description: 'Payments by method retrieved successfully',
    type: [Payment],
  })
  @ApiParam({ 
    name: 'method', 
    description: 'Payment method to filter by (e.g., credit_card, paypal, bank_transfer)' 
  })
  @ApiQuery({ type: PaginationDto })
  async findByMethod(
    @Param('method') method: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginatedResult<PaymentDocument>> {
    return await this.paymentService.findByMethod(method, paginationDto);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get payment statistics',
    description: 'Retrieve payment statistics and analytics'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalPayments: { type: 'number', description: 'Total number of payments' },
        totalAmount: { type: 'number', description: 'Total amount processed' },
        successfulPayments: { type: 'number', description: 'Number of successful payments' },
        failedPayments: { type: 'number', description: 'Number of failed payments' },
        pendingPayments: { type: 'number', description: 'Number of pending payments' },
        averageAmount: { type: 'number', description: 'Average payment amount' },
        methodBreakdown: {
          type: 'object',
          description: 'Breakdown by payment method'
        },
        statusBreakdown: {
          type: 'object',
          description: 'Breakdown by payment status'
        },
      },
    },
  })
  async getPaymentStats() {
    return await this.paymentService.getPaymentStats();
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
    return await this.paymentService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ 
    summary: 'Update payment',
    description: 'Update payment information (limited fields)'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment updated successfully',
    type: Payment,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
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
    return await this.paymentService.updatePayment(id, updatePaymentDto);
  }

  @Patch(':id/refund')
  @ApiOperation({ 
    summary: 'Process payment refund',
    description: 'Process a refund for a payment'
  })
  @ApiResponse({
    status: 200,
    description: 'Refund processed successfully',
    type: Payment,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - refund amount exceeds payment amount',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Payment cannot be refunded',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        amount: {
          type: 'number',
          description: 'Refund amount (optional, defaults to full payment amount)',
        },
        reason: {
          type: 'string',
          description: 'Reason for refund',
        },
      },
    },
  })
  async processRefund(
    @Param('id') id: string,
    @Body('amount') amount?: number,
    @Body('reason') reason?: string,
  ): Promise<PaymentDocument> {
    return await this.paymentService.processRefund(id, amount, reason);
  }

  @Patch(':id/capture')
  @ApiOperation({ 
    summary: 'Capture payment',
    description: 'Capture a pending payment (for pre-authorized payments)'
  })
  @ApiResponse({
    status: 200,
    description: 'Payment captured successfully',
    type: Payment,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - payment cannot be captured',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async capturePayment(@Param('id') id: string): Promise<PaymentDocument> {
    return await this.paymentService.capturePayment(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete payment',
    description: 'Delete a payment (only for failed or cancelled payments)'
  })
  @ApiResponse({
    status: 204,
    description: 'Payment deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - payment cannot be deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Payment not found',
  })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.paymentService.delete(id);
  }
} 