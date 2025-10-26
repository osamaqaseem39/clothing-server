import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SizeChart, SizeChartDocument } from '../schemas/size-chart.schema';
import { CreateSizeChartDto } from '../dto/create-size-chart.dto';
import { UpdateSizeChartDto } from '../dto/update-size-chart.dto';

@Injectable()
export class SizeChartService {
  constructor(
    @InjectModel(SizeChart.name) private sizeChartModel: Model<SizeChartDocument>,
  ) {}

  async create(createSizeChartDto: CreateSizeChartDto): Promise<SizeChart> {
    const createdSizeChart = new this.sizeChartModel(createSizeChartDto);
    return createdSizeChart.save();
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<{ data: SizeChart[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, isActive } = options;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      this.sizeChartModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.sizeChartModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<SizeChart> {
    const sizeChart = await this.sizeChartModel.findById(id).exec();
    if (!sizeChart) {
      throw new NotFoundException('Size chart not found');
    }
    return sizeChart;
  }

  async update(id: string, updateSizeChartDto: UpdateSizeChartDto): Promise<SizeChart> {
    const updatedSizeChart = await this.sizeChartModel
      .findByIdAndUpdate(id, updateSizeChartDto, { new: true })
      .exec();
    
    if (!updatedSizeChart) {
      throw new NotFoundException('Size chart not found');
    }
    
    return updatedSizeChart;
  }

  async remove(id: string): Promise<void> {
    const result = await this.sizeChartModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Size chart not found');
    }
  }

  async findActive(): Promise<SizeChart[]> {
    return this.sizeChartModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }
}
