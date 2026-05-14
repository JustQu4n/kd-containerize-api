import { PaginationQuery } from '../types';

/**
 * Generic Repository Interface
 * Defines standard CRUD operations
 * All repositories should implement this or extend it
 */
export interface IRepository<T, CreateDTO, UpdateDTO> {
  /**
   * Find all entities
   */
  findAll(): Promise<T[]>;

  /**
   * Find entity by ID
   */
  findById(id: string): Promise<T | null>;

  /**
   * Find entities with filters and pagination
   */
  findMany(
    filters?: Record<string, unknown>,
    pagination?: { page: number; limit: number },
  ): Promise<{ data: T[]; meta: PaginationQuery }>;

  /**
   * Create new entity
   */
  create(dto: CreateDTO): Promise<T>;

  /**
   * Update entity by ID
   */
  update(id: string, dto: UpdateDTO): Promise<T | null>;

  /**
   * Delete entity by ID
   */
  delete(id: string): Promise<boolean>;

  /**
   * Check if entity exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Count entities with optional filters
   */
  count(filters?: Record<string, unknown>): Promise<number>;
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationQuery {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}
