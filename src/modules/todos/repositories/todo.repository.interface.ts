import { IRepository } from '../../../shared/repositories';
import { TodoEntity } from '../domain';
import { CreateTodoDto, UpdateTodoDto } from '../dto';

/**
 * Todo Repository Interface
 * Extends base repository with todo-specific operations
 */
export interface ITodoRepository extends IRepository<TodoEntity, CreateTodoDto, UpdateTodoDto> {
  /**
   * Find todos by userId
   */
  findByUserId(userId: string): Promise<TodoEntity[]>;

  /**
   * Find todos by userId with pagination
   */
  findByUserIdPaginated(
    userId: string,
    pagination?: { page: number; limit: number }
  ): Promise<{ data: TodoEntity[]; total: number }>;

  /**
   * Find todos by status
   */
  findByStatus(status: string): Promise<TodoEntity[]>;

  /**
   * Delete todos by userId
   */
  deleteByUserId(userId: string): Promise<number>;
}
