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
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryDto } from '../dto/create-inventory.dto';
import { UpdateInventoryDto } from '../dto/update-inventory.dto';
import { AdjustStockDto } from '../dto/adjust-stock.dto';
import { TransferStockDto } from '../dto/transfer-stock.dto';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Inventory } from '../schemas/inventory.schema';
import { PaginatedResult } from '../../../common/interfaces/base.interface';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create inventory record' })
  @ApiResponse({
    status: 201,
    description: 'Inventory record created successfully',
    type: Inventory,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
  })
  @ApiBody({ type: CreateInventoryDto })
  async create(@Body() createInventoryDto: CreateInventoryDto): Promise<Inventory> {
    return await this.inventoryService.createInventory(createInventoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all inventory records with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Inventory records retrieved successfully',
    type: [Inventory],
  })
  @ApiQuery({ type: PaginationDto })
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<Inventory>> {
    return await this.inventoryService.findAll(paginationDto);
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiResponse({
    status: 200,
    description: 'Low stock items retrieved successfully',
    type: [Inventory],
  })
  async findLowStock(): Promise<Inventory[]> {
    return await this.inventoryService.findLowStock();
  }

  @Get('out-of-stock')
  @ApiOperation({ summary: 'Get out of stock items' })
  @ApiResponse({
    status: 200,
    description: 'Out of stock items retrieved successfully',
    type: [Inventory],
  })
  async findOutOfStock(): Promise<Inventory[]> {
    return await this.inventoryService.findOutOfStock();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get inventory statistics' })
  @ApiResponse({
    status: 200,
    description: 'Inventory statistics retrieved successfully',
  })
  async getStats() {
    return await this.inventoryService.getInventoryStats();
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get inventory by product ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory retrieved successfully',
    type: [Inventory],
  })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async findByProduct(@Param('productId') productId: string): Promise<Inventory[]> {
    return await this.inventoryService.findByProduct(productId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory by ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory retrieved successfully',
    type: Inventory,
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory not found',
  })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  async findOne(@Param('id') id: string): Promise<Inventory> {
    return await this.inventoryService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory' })
  @ApiResponse({
    status: 200,
    description: 'Inventory updated successfully',
    type: Inventory,
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory not found',
  })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  @ApiBody({ type: UpdateInventoryDto })
  async update(
    @Param('id') id: string,
    @Body() updateInventoryDto: UpdateInventoryDto,
  ): Promise<Inventory> {
    return await this.inventoryService.updateInventory(id, updateInventoryDto);
  }

  @Post(':id/adjust')
  @ApiOperation({ summary: 'Adjust stock quantity' })
  @ApiResponse({
    status: 200,
    description: 'Stock adjusted successfully',
    type: Inventory,
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory not found',
  })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  @ApiBody({ type: AdjustStockDto })
  async adjustStock(
    @Param('id') id: string,
    @Body() adjustStockDto: AdjustStockDto,
  ): Promise<Inventory> {
    return await this.inventoryService.adjustStock(id, adjustStockDto);
  }

  @Post(':id/transfer')
  @ApiOperation({ summary: 'Transfer stock between warehouses' })
  @ApiResponse({
    status: 200,
    description: 'Stock transferred successfully',
  })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  @ApiBody({ type: TransferStockDto })
  async transferStock(
    @Param('id') id: string,
    @Body() transferStockDto: TransferStockDto,
  ): Promise<{ from: Inventory; to: Inventory }> {
    return await this.inventoryService.transferStock(id, transferStockDto);
  }

  @Get(':id/movements')
  @ApiOperation({ summary: 'Get inventory movements' })
  @ApiResponse({
    status: 200,
    description: 'Inventory movements retrieved successfully',
  })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  async getMovements(@Param('id') id: string) {
    return await this.inventoryService.getInventoryMovements(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inventory record' })
  @ApiResponse({
    status: 204,
    description: 'Inventory deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Inventory not found',
  })
  @ApiParam({ name: 'id', description: 'Inventory ID' })
  async remove(@Param('id') id: string): Promise<void> {
    await this.inventoryService.deleteInventory(id);
  }
}
