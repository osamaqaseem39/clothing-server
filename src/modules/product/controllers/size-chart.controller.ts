import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SizeChartService } from '../services/size-chart.service';
import { CreateSizeChartDto } from '../dto/create-size-chart.dto';
import { UpdateSizeChartDto } from '../dto/update-size-chart.dto';
import { SizeChart } from '../schemas/size-chart.schema';

@ApiTags('Size Charts')
@Controller('size-charts')
export class SizeChartController {
  constructor(private readonly sizeChartService: SizeChartService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new size chart' })
  @ApiResponse({ status: 201, description: 'Size chart created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createSizeChartDto: CreateSizeChartDto): Promise<SizeChart> {
    return this.sizeChartService.create(createSizeChartDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all size charts' })
  @ApiResponse({ status: 200, description: 'Size charts retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('isActive') isActive?: boolean,
  ): Promise<{ data: SizeChart[]; total: number; page: number; limit: number }> {
    return this.sizeChartService.findAll({ page, limit, isActive });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a size chart by ID' })
  @ApiResponse({ status: 200, description: 'Size chart retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Size chart not found' })
  async findOne(@Param('id') id: string): Promise<SizeChart> {
    return this.sizeChartService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a size chart' })
  @ApiResponse({ status: 200, description: 'Size chart updated successfully' })
  @ApiResponse({ status: 404, description: 'Size chart not found' })
  async update(
    @Param('id') id: string,
    @Body() updateSizeChartDto: UpdateSizeChartDto,
  ): Promise<SizeChart> {
    return this.sizeChartService.update(id, updateSizeChartDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a size chart' })
  @ApiResponse({ status: 200, description: 'Size chart deleted successfully' })
  @ApiResponse({ status: 404, description: 'Size chart not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.sizeChartService.remove(id);
  }

  @Get('active/list')
  @ApiOperation({ summary: 'Get all active size charts' })
  @ApiResponse({ status: 200, description: 'Active size charts retrieved successfully' })
  async findActive(): Promise<SizeChart[]> {
    return this.sizeChartService.findActive();
  }
}
