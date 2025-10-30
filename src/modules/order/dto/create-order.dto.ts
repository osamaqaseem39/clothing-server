import { IsString, IsNumber, IsArray, IsEnum, IsOptional, ValidateNested, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus } from '../schemas/order.schema';

class OrderItemDto {
  @ApiProperty({ description: 'Product ID' })
  @IsMongoId()
  productId: string;

  @ApiPropertyOptional({ description: 'Product variation ID' })
  @IsOptional()
  @IsMongoId()
  variationId?: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Product SKU' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ description: 'Quantity ordered' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'Price per unit' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Subtotal before tax/discount' })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiProperty({ description: 'Total after tax/discount' })
  @IsNumber()
  @Min(0)
  total: number;
}

class AddressDto {
  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ description: 'Address line 1' })
  @IsString()
  addressLine1: string;

  @ApiPropertyOptional({ description: 'Address line 2' })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ description: 'State/Province' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  @IsOptional()
  @IsString()
  email?: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Customer ID' })
  @IsMongoId()
  customerId: string;

  @ApiPropertyOptional({ enum: OrderStatus, description: 'Order status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ description: 'Payment method' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ enum: PaymentStatus, description: 'Payment status' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ description: 'Order total' })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({ description: 'Subtotal' })
  @IsNumber()
  @Min(0)
  subtotal: number;

  @ApiPropertyOptional({ description: 'Discount total', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountTotal?: number;

  @ApiPropertyOptional({ description: 'Shipping total', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingTotal?: number;

  @ApiPropertyOptional({ description: 'Tax total', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  taxTotal?: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'PKR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Billing address' })
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @ApiProperty({ description: 'Shipping address' })
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ApiProperty({ description: 'Order items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
} 