import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, Min } from 'class-validator';

export class TransferStockDto {
  @ApiProperty({ description: 'Quantity to transfer', example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Destination warehouse', example: 'warehouse-2' })
  @IsString()
  toWarehouse: string;

  @ApiProperty({ description: 'Transfer notes', required: false })
  @IsString()
  notes?: string;
}
