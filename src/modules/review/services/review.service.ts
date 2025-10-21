import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from '../schemas/review.schema';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async createReview(reviewData: any): Promise<Review> {
    const review = new this.reviewModel(reviewData);
    return await review.save();
  }

  async findByProduct(productId: string): Promise<Review[]> {
    return await this.reviewModel.find({ productId }).sort({ createdAt: -1 }).exec();
  }

  async findByCustomer(customerId: string): Promise<Review[]> {
    return await this.reviewModel.find({ customerId }).sort({ createdAt: -1 }).exec();
  }

  async getProductRating(productId: string): Promise<{ average: number; count: number }> {
    const reviews = await this.reviewModel.find({ productId });
    if (reviews.length === 0) {
      return { average: 0, count: 0 };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;

    return { average: Math.round(average * 10) / 10, count: reviews.length };
  }

  async getRatingDistribution(productId: string): Promise<{ [key: number]: number }> {
    const reviews = await this.reviewModel.find({ productId });
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach(review => {
      distribution[review.rating]++;
    });

    return distribution;
  }

  async updateReview(id: string, updateData: any): Promise<Review> {
    return await this.update(id, updateData);
  }

  async deleteReview(id: string): Promise<void> {
    const result = await this.reviewModel.findByIdAndDelete(id);
    if (!result) {
      throw new Error('Review not found');
    }
  }

  async findById(id: string): Promise<Review> {
    const review = await this.reviewModel.findById(id);
    if (!review) {
      throw new Error('Review not found');
    }
    return review;
  }

  async update(id: string, data: any): Promise<Review> {
    const review = await this.reviewModel.findByIdAndUpdate(id, data, { new: true });
    if (!review) {
      throw new Error('Review not found');
    }
    return review;
  }
}
