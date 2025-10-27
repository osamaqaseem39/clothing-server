import { Model, Document } from 'mongoose';
import { IBaseRepository } from '../interfaces/repository.interface';
import { PaginationOptions, PaginatedResult } from '../interfaces/base.interface';

export abstract class BaseRepository<T extends Document> implements IBaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async create(data: Partial<T>): Promise<T> {
    const entity = new this.model(data);
    return await entity.save();
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id).exec();
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10, sort, sortBy, order = 'desc', sortOrder } = options || {};
    
    // Use sortBy if provided, otherwise use sort
    const sortField = sortBy || sort;
    // Use sortOrder if provided, otherwise use order
    const orderBy = sortOrder || order;
    
    const skip = (page - 1) * limit;
    const sortOption = sortField ? { [sortField]: orderBy === 'desc' ? -1 : 1 } : { createdAt: -1 } as any;
    
    const [data, total] = await Promise.all([
      this.model.find().sort(sortOption).skip(skip).limit(limit).exec(),
      this.model.countDocuments().exec(),
    ]);

    return {
      data,
      total,
      page: page || 1,
      limit: limit || 10,
      totalPages: Math.ceil(total / (limit || 10)),
    };
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.countDocuments({ _id: id }).exec();
    return count > 0;
  }
} 