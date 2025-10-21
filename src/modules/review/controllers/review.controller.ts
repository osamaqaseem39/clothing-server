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
import { ReviewService } from '../services/review.service';
import { Review } from '../schemas/review.schema';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new review' })
  @ApiResponse({
    status: 201,
    description: 'Review created successfully',
    type: Review,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'Product ID' },
        customerId: { type: 'string', description: 'Customer ID' },
        rating: { type: 'number', minimum: 1, maximum: 5, description: 'Rating (1-5)' },
        title: { type: 'string', description: 'Review title' },
        comment: { type: 'string', description: 'Review comment' },
        isVerified: { type: 'boolean', description: 'Whether the purchase is verified' },
      },
      required: ['productId', 'customerId', 'rating'],
    },
  })
  async create(@Body() reviewData: any): Promise<Review> {
    return await this.reviewService.createReview(reviewData);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get reviews by product ID' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: [Review],
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async findByProduct(@Param('productId') productId: string): Promise<Review[]> {
    return await this.reviewService.findByProduct(productId);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get reviews by customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    type: [Review],
  })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  async findByCustomer(@Param('customerId') customerId: string): Promise<Review[]> {
    return await this.reviewService.findByCustomer(customerId);
  }

  @Get('product/:productId/rating')
  @ApiOperation({ summary: 'Get product rating statistics' })
  @ApiResponse({
    status: 200,
    description: 'Product rating retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        average: { type: 'number', description: 'Average rating' },
        count: { type: 'number', description: 'Total number of reviews' },
      },
    },
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async getProductRating(@Param('productId') productId: string) {
    return await this.reviewService.getProductRating(productId);
  }

  @Get('product/:productId/distribution')
  @ApiOperation({ summary: 'Get product rating distribution' })
  @ApiResponse({
    status: 200,
    description: 'Rating distribution retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        1: { type: 'number', description: 'Number of 1-star reviews' },
        2: { type: 'number', description: 'Number of 2-star reviews' },
        3: { type: 'number', description: 'Number of 3-star reviews' },
        4: { type: 'number', description: 'Number of 4-star reviews' },
        5: { type: 'number', description: 'Number of 5-star reviews' },
      },
    },
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async getRatingDistribution(@Param('productId') productId: string) {
    return await this.reviewService.getRatingDistribution(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({
    status: 200,
    description: 'Review retrieved successfully',
    type: Review,
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiParam({ name: 'id', description: 'Review ID' })
  async findOne(@Param('id') id: string): Promise<Review> {
    return await this.reviewService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update review' })
  @ApiResponse({
    status: 200,
    description: 'Review updated successfully',
    type: Review,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        rating: { type: 'number', minimum: 1, maximum: 5, description: 'Rating (1-5)' },
        title: { type: 'string', description: 'Review title' },
        comment: { type: 'string', description: 'Review comment' },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateData: any,
  ): Promise<Review> {
    return await this.reviewService.updateReview(id, updateData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({
    status: 204,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Review not found',
  })
  @ApiParam({ name: 'id', description: 'Review ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.reviewService.deleteReview(id);
  }
}
