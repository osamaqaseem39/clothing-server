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
import { CouponService } from '../services/coupon.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { Coupon, CouponDocument } from '../schemas/coupon.schema';
import { PaginatedResult } from '@/common/interfaces/base.interface';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new coupon' })
  @ApiResponse({
    status: 201,
    description: 'Coupon created successfully',
    type: Coupon,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - coupon with same code already exists',
  })
  @ApiBody({ type: CreateCouponDto })
  async create(@Body() createCouponDto: CreateCouponDto): Promise<CouponDocument> {
    return await this.couponService.createCoupon(createCouponDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all coupons' })
  @ApiResponse({
    status: 200,
    description: 'Coupons retrieved successfully',
    type: [Coupon],
  })
  async findAll(): Promise<PaginatedResult<CouponDocument>> {
    return await this.couponService.findAll();
  }

  @Get('valid')
  @ApiOperation({ summary: 'Get all valid coupons' })
  @ApiResponse({
    status: 200,
    description: 'Valid coupons retrieved successfully',
    type: [Coupon],
  })
  async findValidCoupons(): Promise<CouponDocument[]> {
    return await this.couponService.findValidCoupons();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get coupons applicable to a product' })
  @ApiResponse({
    status: 200,
    description: 'Product coupons retrieved successfully',
    type: [Coupon],
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async findCouponsByProduct(@Param('productId') productId: string): Promise<CouponDocument[]> {
    return await this.couponService.findCouponsByProduct(productId);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get coupon by code' })
  @ApiResponse({
    status: 200,
    description: 'Coupon retrieved successfully',
    type: Coupon,
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  @ApiParam({ name: 'code', description: 'Coupon code' })
  async findByCode(@Param('code') code: string): Promise<CouponDocument> {
    return await this.couponService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID' })
  @ApiResponse({
    status: 200,
    description: 'Coupon retrieved successfully',
    type: Coupon,
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  async findOne(@Param('id') id: string): Promise<CouponDocument> {
    return await this.couponService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update coupon' })
  @ApiResponse({
    status: 200,
    description: 'Coupon updated successfully',
    type: Coupon,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - coupon with same code already exists',
  })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  @ApiBody({ type: UpdateCouponDto })
  async update(
    @Param('id') id: string,
    @Body() updateCouponDto: UpdateCouponDto,
  ): Promise<CouponDocument> {
    return await this.couponService.updateCoupon(id, updateCouponDto);
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon' })
  @ApiResponse({
    status: 200,
    description: 'Coupon validation result',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Coupon code to validate',
        },
        cartTotal: {
          type: 'number',
          description: 'Cart total amount',
        },
        productIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Product IDs in cart',
        },
      },
      required: ['code', 'cartTotal'],
    },
  })
  async validateCoupon(
    @Body('code') code: string,
    @Body('cartTotal') cartTotal: number,
    @Body('productIds') productIds?: string[],
  ) {
    return await this.couponService.validateCoupon(code, cartTotal, productIds);
  }

  @Post('apply/:code')
  @ApiOperation({ summary: 'Apply a coupon (increment usage count)' })
  @ApiResponse({
    status: 200,
    description: 'Coupon applied successfully',
    type: Coupon,
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  @ApiParam({ name: 'code', description: 'Coupon code' })
  async applyCoupon(@Param('code') code: string): Promise<CouponDocument> {
    return await this.couponService.applyCoupon(code);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete coupon' })
  @ApiResponse({
    status: 204,
    description: 'Coupon deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Coupon not found',
  })
  @ApiParam({ name: 'id', description: 'Coupon ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.couponService.delete(id);
  }
} 