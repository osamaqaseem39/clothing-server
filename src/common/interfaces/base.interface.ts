export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BaseDocument extends BaseEntity {
  _id: string;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 