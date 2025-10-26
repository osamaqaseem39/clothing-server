import { IsString, IsOptional, IsEnum, IsArray, IsBoolean, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SizeType } from '../schemas/size-chart.schema';

export class CreateSizeChartDto {
  @ApiProperty({ description: 'Size chart name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Size chart description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: SizeType, description: 'Size type' })
  @IsEnum(SizeType)
  sizeType: SizeType;

  @ApiPropertyOptional({ description: 'Size measurements' })
  @IsOptional()
  @IsArray()
  sizes?: Array<{
    size: string;
    measurements: {
      bust?: string;
      waist?: string;
      hips?: string;
      shoulder?: string;
      sleeveLength?: string;
      length?: string;
      custom?: Record<string, string>;
    };
  }>;

  @ApiPropertyOptional({ description: 'Size chart image URL' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Size chart image alt text' })
  @IsOptional()
  @IsString()
  imageAltText?: string;

  @ApiPropertyOptional({ description: 'Is this size chart active', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
