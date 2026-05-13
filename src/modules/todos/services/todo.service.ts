import { Logger } from 'pino';
import { BaseService } from '@/shared/services';
import { TodoEntity } from '../domain';
import { CreateTodoDto, UpdateTodoDto, TodoResponseDto } from '../dto';
import { ITodoRepository } from '../repositories';
import { NotFoundError } from '@/infrastructure/errors';

/**
 * Todo Service
 * Business logic for todo operations
 * Extends BaseService for dependency injection and logging
 */
export class TodoService extends BaseService<TodoEntity, CreateTodoDto, UpdateTodoDto> {
  constructor(private readonly todoRepository: ITodoRepository) {
    super(todoRepository);
  }

  /**
   * List all todos
   * Can filter by userId if provided
   */
  async listTodos(userId?: string, _logger?: Logger): Promise<TodoResponseDto[]> {
    try {
      let todos: TodoEntity[];

      if (userId) {
        todos = await this.todoRepository.findByUserId(userId);
        this.logInfo(`Listed ${todos.length} todos for user ${userId}`, { userId });
      } else {
        todos = await this.todoRepository.findAll();
        this.logInfo(`Listed all ${todos.length} todos`);
      }

      return todos.map((todo) => new TodoResponseDto(todo));
    } catch (error) {
      this.logError(`Error listing todos`, { userId, error });
      throw error;
    }
  }

  /**
   * Get todo by ID
   */
  async getTodoById(id: string, _logger?: Logger): Promise<TodoResponseDto> {
    try {
      const todo = await this.todoRepository.findById(id);

      if (!todo) {
        throw new NotFoundError('Todo', id);
      }

      this.logInfo(`Retrieved todo ${id}`);
      return new TodoResponseDto(todo);
    } catch (error) {
      this.logError(`Error getting todo ${id}`, { id, error });
      throw error;
    }
  }

  /**
   * Create a new todo
   */
  async createTodo(dto: CreateTodoDto, _logger?: Logger): Promise<TodoResponseDto> {
    try {
      this.logDebug(`Creating todo for user ${dto.userId}`, { dto });

      const todo = await this.todoRepository.create(dto);

      this.logInfo(`Todo created successfully`, { id: todo.id, userId: dto.userId });
      return new TodoResponseDto(todo);
    } catch (error) {
      this.logError(`Error creating todo`, { dto, error });
      throw error;
    }
  }

  /**
   * Update a todo
   */
  async updateTodo(id: string, dto: UpdateTodoDto, _logger?: Logger): Promise<TodoResponseDto> {
    try {
      // Check if todo exists
      const existingTodo = await this.todoRepository.findById(id);
      if (!existingTodo) {
        throw new NotFoundError('Todo', id);
      }

      this.logDebug(`Updating todo ${id}`, { dto });

      const updatedTodo = await this.todoRepository.update(id, dto);

      if (!updatedTodo) {
        throw new NotFoundError('Todo', id);
      }

      this.logInfo(`Todo updated successfully`, { id, changes: Object.keys(dto) });
      return new TodoResponseDto(updatedTodo);
    } catch (error) {
      this.logError(`Error updating todo ${id}`, { id, dto, error });
      throw error;
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(id: string, _logger?: Logger): Promise<void> {
    try {
      // Check if todo exists
      const existingTodo = await this.todoRepository.findById(id);
      if (!existingTodo) {
        throw new NotFoundError('Todo', id);
      }

      this.logDebug(`Deleting todo ${id}`);

      const deleted = await this.todoRepository.delete(id);

      if (!deleted) {
        throw new NotFoundError('Todo', id);
      }

      this.logInfo(`Todo deleted successfully`, { id });
    } catch (error) {
      this.logError(`Error deleting todo ${id}`, { id, error });
      throw error;
    }
  }

  /**
   * Get todos by user with pagination
   */
  async getTodosByUser(
    userId: string,
    pagination?: { page: number; limit: number },
    _logger?: Logger
  ): Promise<{ todos: TodoResponseDto[]; total: number }> {
    try {
      const result = await this.todoRepository.findByUserIdPaginated(userId, pagination);

      this.logInfo(`Retrieved ${result.data.length} todos for user ${userId}`, {
        userId,
        total: result.total,
      });

      return {
        todos: result.data.map((todo) => new TodoResponseDto(todo)),
        total: result.total,
      };
    } catch (error) {
      this.logError(`Error getting todos by user`, { userId, error });
      throw error;
    }
  }

  /**
   * Get todos by status
   */
  async getTodosByStatus(status: string, _logger?: Logger): Promise<TodoResponseDto[]> {
    try {
      const todos = await this.todoRepository.findByStatus(status);

      this.logInfo(`Retrieved ${todos.length} todos with status ${status}`, { status });
      return todos.map((todo) => new TodoResponseDto(todo));
    } catch (error) {
      this.logError(`Error getting todos by status`, { status, error });
      throw error;
    }
  }

  /**
   * Count todos
   */
  async countTodos(filters?: Record<string, unknown>, _logger?: Logger): Promise<number> {
    try {
      const count = await this.todoRepository.count(filters);
      this.logDebug(`Counted ${count} todos`);
      return count;
    } catch (error) {
      this.logError(`Error counting todos`, { filters, error });
      throw error;
    }
  }
}
