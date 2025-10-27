import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AnalyticsService } from '../services/analytics.service';

@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
  })
  async getDashboardStats() {
    return await this.analyticsService.getDashboardStats();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue analytics' })
  @ApiResponse({
    status: 200,
    description: 'Revenue analytics retrieved successfully',
  })
  @ApiQuery({ name: 'period', description: 'Time period (7d, 30d, 90d)', required: false })
  async getRevenueChart(@Query('period') period: string = '7d') {
    return await this.analyticsService.getRevenueChart(period);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get orders analytics' })
  @ApiResponse({
    status: 200,
    description: 'Orders analytics retrieved successfully',
  })
  @ApiQuery({ name: 'period', description: 'Time period (7d, 30d, 90d)', required: false })
  async getOrdersChart(@Query('period') period: string = '7d') {
    return await this.analyticsService.getOrdersChart(period);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top products analytics' })
  @ApiResponse({
    status: 200,
    description: 'Top products analytics retrieved successfully',
  })
  @ApiQuery({ name: 'limit', description: 'Number of products to return', required: false })
  async getTopProducts(@Query('limit') limit: string = '5') {
    return await this.analyticsService.getTopProducts(parseInt(limit));
  }
}
