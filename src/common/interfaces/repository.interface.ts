import { PaginationOptions, PaginatedResult } from './base.interface';

export interface IBaseRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
}

export interface IBaseService<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T>;
  findAll(options?: PaginationOptions): Promise<PaginatedResult<T>>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
} 