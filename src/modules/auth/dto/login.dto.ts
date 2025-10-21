import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Customer email', example: 'customer@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Customer password', example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}
