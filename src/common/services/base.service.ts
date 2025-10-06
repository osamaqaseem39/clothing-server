import { NotFoundException } from '@nestjs/common';
import { IBaseService } from '../interfaces/repository.interface';
import { IBaseRepository } from '../interfaces/repository.interface';
import { PaginationOptions, PaginatedResult } from '../interfaces/base.interface';

export abstract class BaseService<T> implements IBaseService<T> {
  constructor(protected readonly repository: IBaseRepository<T>) {}

  async create(data: Partial<T>): Promise<T> {
    return await this.repository.create(data);
  }

  async findById(id: string): Promise<T> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async findAll(options?: PaginationOptions): Promise<PaginatedResult<T>> {
    return await this.repository.findAll(options);
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    const entity = await this.repository.update(id, data);
    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
    return entity;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }
  }
} 