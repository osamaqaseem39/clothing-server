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
import { ShippingService } from '../services/shipping.service';
import { CreateShippingMethodDto } from '../dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from '../dto/update-shipping-method.dto';
import { ShippingMethod, ShippingMethodDocument } from '../schemas/shipping-method.schema';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { PaginatedResult } from '@/common/interfaces/base.interface';

@ApiTags('Shipping')
@ApiBearerAuth()
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('methods')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new shipping method',
    description: 'Add a new shipping method to the system'
  })
  @ApiResponse({
    status: 201,
    description: 'Shipping method created successfully',
    type: ShippingMethod,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - shipping method with same name already exists',
  })
  @ApiBody({ type: CreateShippingMethodDto })
  async create(@Body() createShippingMethodDto: CreateShippingMethodDto): Promise<ShippingMethodDocument> {
    return await this.shippingService.createShippingMethod(createShippingMethodDto);
  }

  @Get('methods')
  @ApiOperation({ 
    summary: 'Get all shipping methods',
    description: 'Retrieve all available shipping methods'
  })
  @ApiResponse({
    status: 200,
    description: 'Shipping methods retrieved successfully',
    type: [ShippingMethod],
  })
  async findAll(): Promise<ShippingMethodDocument[]> {
    return await this.shippingService.findAll();
  }

  @Get('methods/active')
  @ApiOperation({ 
    summary: 'Get active shipping methods',
    description: 'Retrieve only active/enabled shipping methods'
  })
  @ApiResponse({
    status: 200,
    description: 'Active shipping methods retrieved successfully',
    type: [ShippingMethod],
  })
  async findActive(): Promise<ShippingMethodDocument[]> {
    return await this.shippingService.findActive();
  }

  @Get('methods/:id')
  @ApiOperation({ 
    summary: 'Get shipping method by ID',
    description: 'Retrieve a specific shipping method by its ID'
  })
  @ApiResponse({
    status: 200,
    description: 'Shipping method retrieved successfully',
    type: ShippingMethod,
  })
  @ApiResponse({
    status: 404,
    description: 'Shipping method not found',
  })
  @ApiParam({ name: 'id', description: 'Shipping method ID' })
  async findOne(@Param('id') id: string): Promise<ShippingMethodDocument> {
    return await this.shippingService.findById(id);
  }

  @Patch('methods/:id')
  @ApiOperation({ 
    summary: 'Update shipping method',
    description: 'Update an existing shipping method'
  })
  @ApiResponse({
    status: 200,
    description: 'Shipping method updated successfully',
    type: ShippingMethod,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiResponse({
    status: 404,
    description: 'Shipping method not found',
  })
  @ApiParam({ name: 'id', description: 'Shipping method ID' })
  @ApiBody({ type: UpdateShippingMethodDto })
  async update(
    @Param('id') id: string,
    @Body() updateShippingMethodDto: UpdateShippingMethodDto,
  ): Promise<ShippingMethodDocument> {
    return await this.shippingService.updateShippingMethod(id, updateShippingMethodDto);
  }

  @Patch('methods/:id/status')
  @ApiOperation({ 
    summary: 'Toggle shipping method status',
    description: 'Enable or disable a shipping method'
  })
  @ApiResponse({
    status: 200,
    description: 'Shipping method status updated successfully',
    type: ShippingMethod,
  })
  @ApiResponse({
    status: 404,
    description: 'Shipping method not found',
  })
  @ApiParam({ name: 'id', description: 'Shipping method ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        enabled: {
          type: 'boolean',
          description: 'Whether the shipping method should be enabled',
        },
      },
      required: ['enabled'],
    },
  })
  async toggleStatus(
    @Param('id') id: string,
    @Body('enabled') enabled: boolean,
  ): Promise<ShippingMethodDocument> {
    return await this.shippingService.toggleStatus(id, enabled);
  }

  @Delete('methods/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete shipping method',
    description: 'Delete a shipping method (only if not in use)'
  })
  @ApiResponse({
    status: 204,
    description: 'Shipping method deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - shipping method cannot be deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Shipping method not found',
  })
  @ApiParam({ name: 'id', description: 'Shipping method ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.shippingService.delete(id);
  }

  @Post('calculate')
  @ApiOperation({ 
    summary: 'Calculate shipping cost',
    description: 'Calculate shipping cost for a given order and destination'
  })
  @ApiResponse({
    status: 200,
    description: 'Shipping cost calculated successfully',
    schema: {
      type: 'object',
      properties: {
        availableMethods: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              methodId: { type: 'string', description: 'Shipping method ID' },
              name: { type: 'string', description: 'Shipping method name' },
              cost: { type: 'number', description: 'Shipping cost' },
              estimatedDays: { type: 'number', description: 'Estimated delivery days' },
              description: { type: 'string', description: 'Shipping method description' },
            },
          },
          description: 'Available shipping methods with costs',
        },
        totalCost: { type: 'number', description: 'Total shipping cost' },
        currency: { type: 'string', description: 'Currency code' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid shipping address or order details',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: {
          type: 'string',
          description: 'Order ID for shipping calculation',
        },
        shippingAddress: {
          type: 'object',
          properties: {
            country: { type: 'string', description: 'Country code' },
            state: { type: 'string', description: 'State/province' },
            city: { type: 'string', description: 'City' },
            postalCode: { type: 'string', description: 'Postal code' },
          },
          required: ['country', 'city'],
        },
        packageDetails: {
          type: 'object',
          properties: {
            weight: { type: 'number', description: 'Package weight in kg' },
            dimensions: {
              type: 'object',
              properties: {
                length: { type: 'number', description: 'Length in cm' },
                width: { type: 'number', description: 'Width in cm' },
                height: { type: 'number', description: 'Height in cm' },
              },
            },
          },
        },
      },
      required: ['shippingAddress'],
    },
  })
  async calculateShipping(@Body() calculateShippingDto: any) {
    return await this.shippingService.calculateShipping(calculateShippingDto);
  }

  @Get('zones')
  @ApiOperation({ 
    summary: 'Get shipping zones',
    description: 'Retrieve available shipping zones and their configurations'
  })
  @ApiResponse({
    status: 200,
    description: 'Shipping zones retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Zone ID' },
          name: { type: 'string', description: 'Zone name' },
          countries: { type: 'array', items: { type: 'string' }, description: 'Countries in this zone' },
          regions: { type: 'array', items: { type: 'string' }, description: 'Regions in this zone' },
          baseCost: { type: 'number', description: 'Base shipping cost for this zone' },
          additionalCost: { type: 'number', description: 'Additional cost per kg' },
        },
      },
    },
  })
  async getShippingZones() {
    return await this.shippingService.getShippingZones();
  }

  @Get('tracking/:trackingNumber')
  @ApiOperation({ 
    summary: 'Track shipment',
    description: 'Get tracking information for a shipment'
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        trackingNumber: { type: 'string', description: 'Tracking number' },
        status: { type: 'string', description: 'Current shipment status' },
        estimatedDelivery: { type: 'string', description: 'Estimated delivery date' },
        currentLocation: { type: 'string', description: 'Current shipment location' },
        history: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              timestamp: { type: 'string', description: 'Event timestamp' },
              location: { type: 'string', description: 'Event location' },
              status: { type: 'string', description: 'Event status' },
              description: { type: 'string', description: 'Event description' },
            },
          },
          description: 'Shipment tracking history',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Tracking number not found',
  })
  @ApiParam({ name: 'trackingNumber', description: 'Shipment tracking number' })
  async trackShipment(@Param('trackingNumber') trackingNumber: string) {
    return await this.shippingService.trackShipment(trackingNumber);
  }
} 