import { z } from 'zod';

/**
 * Pagination Query DTO
 * Used for list endpoints
 */
export class PaginationQueryDto {
  page: number = 1;
  limit: number = 10;

  constructor(page?: number | string, limit?: number | string) {
    if (page !== undefined) {
      const parsed = typeof page === 'string' ? parseInt(page, 10) : page;
      this.page = Math.max(1, parsed) || 1;
    }

    if (limit !== undefined) {
      const parsed = typeof limit === 'string' ? parseInt(limit, 10) : limit;
      this.limit = Math.max(1, Math.min(100, parsed)) || 10; // Max 100 items per page
    }
  }

  /**
   * Get offset for database query
   */
  getOffset(): number {
    return (this.page - 1) * this.limit;
  }
}

/**
 * Pagination Query Validator
 */
export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

/**
 * List Response DTO wrapper
 */
export interface ListResponseDto<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
