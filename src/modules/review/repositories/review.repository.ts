import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async create(data: Partial<Review>): Promise<Review> {
    const review = new this.reviewModel(data);
    return await review.save();
  }

  async findById(id: string): Promise<Review | null> {
    return await this.reviewModel.findById(id);
  }

  async findAll(): Promise<Review[]> {
    return await this.reviewModel.find();
  }

  async update(id: string, data: Partial<Review>): Promise<Review | null> {
    return await this.reviewModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.reviewModel.findByIdAndDelete(id);
    return !!result;
  }
}
