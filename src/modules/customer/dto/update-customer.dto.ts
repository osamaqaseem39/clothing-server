import { PartialType, OmitType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDate, IsString, IsBoolean } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(
  OmitType(CreateCustomerDto, ['password'] as const),
) {
  @ApiProperty({ description: 'Last login timestamp', required: false })
  @IsOptional()
  @IsDate()
  lastLoginAt?: Date;

  @ApiProperty({ description: 'Password reset token', required: false })
  @IsOptional()
  @IsString()
  resetPasswordToken?: string;

  @ApiProperty({ description: 'Password reset token expiry', required: false })
  @IsOptional()
  @IsDate()
  resetPasswordExpires?: Date;

  @ApiProperty({ description: 'Email verification status', required: false })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiProperty({ description: 'Account active status', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ description: 'Customer password', required: false })
  @IsOptional()
  @IsString()
  password?: string;
} 