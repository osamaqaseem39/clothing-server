import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsDateString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ description: 'Customer first name', example: 'John' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ description: 'Customer last name', example: 'Doe' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ description: 'Customer email', example: 'customer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Customer password', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'Customer phone number', example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Customer date of birth', example: '1990-01-01', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;
}
