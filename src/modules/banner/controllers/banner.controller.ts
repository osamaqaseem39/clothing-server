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
import { BannerService } from '../services/banner.service';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Banner } from '../schemas/banner.schema';
import { PaginatedResult } from '../../../common/interfaces/base.interface';

@ApiTags('Banners')
@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new banner' })
  @ApiResponse({
    status: 201,
    description: 'Banner created successfully',
    type: Banner,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiBody({ type: CreateBannerDto })
  async create(@Body() createBannerDto: CreateBannerDto): Promise<Banner> {
    return await this.bannerService.createBanner(createBannerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all banners with pagination' })
  @ApiResponse({
    status: 200,
    description: 'List of banners',
    type: [Banner],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'position', required: false, enum: ['hero', 'collection', 'promotional', 'sidebar'] })
  @ApiQuery({ name: 'enabled', required: false, type: Boolean })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<Banner>> {
    const { page = 1, limit = 10, ...filters } = paginationDto;
    const options = {
      page: Number(page),
      limit: Number(limit),
      filters,
    };
    return await this.bannerService.findAll(options);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get all active banners' })
  @ApiResponse({
    status: 200,
    description: 'List of active banners',
    type: [Banner],
  })
  async findAllActive(): Promise<Banner[]> {
    return await this.bannerService.findAllActive();
  }

  @Get('position/:position')
  @ApiOperation({ summary: 'Get active banners by position' })
  @ApiParam({ name: 'position', enum: ['hero', 'collection', 'promotional', 'sidebar'] })
  @ApiResponse({
    status: 200,
    description: 'List of active banners for the specified position',
    type: [Banner],
  })
  async findByPosition(@Param('position') position: string): Promise<Banner[]> {
    return await this.bannerService.findActiveByPosition(position);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a banner by ID' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: 200,
    description: 'Banner details',
    type: Banner,
  })
  @ApiResponse({
    status: 404,
    description: 'Banner not found',
  })
  async findOne(@Param('id') id: string): Promise<Banner> {
    return await this.bannerService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a banner' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: 200,
    description: 'Banner updated successfully',
    type: Banner,
  })
  @ApiResponse({
    status: 404,
    description: 'Banner not found',
  })
  @ApiBody({ type: UpdateBannerDto })
  async update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
  ): Promise<Banner> {
    return await this.bannerService.updateBanner(id, updateBannerDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle banner enabled status' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: 200,
    description: 'Banner status updated successfully',
    type: Banner,
  })
  @ApiResponse({
    status: 404,
    description: 'Banner not found',
  })
  @ApiBody({ schema: { type: 'object', properties: { enabled: { type: 'boolean' } } } })
  async toggleStatus(
    @Param('id') id: string,
    @Body() body: { enabled: boolean },
  ): Promise<Banner> {
    return await this.bannerService.toggleStatus(id, body.enabled);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a banner' })
  @ApiParam({ name: 'id', description: 'Banner ID' })
  @ApiResponse({
    status: 204,
    description: 'Banner deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Banner not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.bannerService.delete(id);
  }
}

