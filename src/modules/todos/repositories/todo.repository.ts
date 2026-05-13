import { Logger } from 'pino';
import { getRootLogger } from '@/infrastructure/logger/logger';
import { getPrismaClient } from '@/infrastructure/database/prisma';
import { TodoEntity, TodoStatus } from '../domain';
import { CreateTodoDto, UpdateTodoDto } from '../dto';
import { ITodoRepository } from './todo.repository.interface';

/**
 * Todo Repository Implementation
 * Handles all database operations for todos using Prisma
 */
export class TodoRepository implements ITodoRepository {
  private readonly prisma = getPrismaClient();
  private readonly logger: Logger;

  constructor() {
    this.logger = getRootLogger();
  }

  /**
   * Find all todos
   */
  async findAll(): Promise<TodoEntity[]> {
    try {
      const todos = await this.prisma.todo.findMany();
      return todos.map(this.mapToEntity);
    } catch (error) {
      this.logger.error({ error }, 'Error finding all todos');
      throw error;
    }
  }

  /**
   * Find todo by ID
   */
  async findById(id: string): Promise<TodoEntity | null> {
    try {
      const todo = await this.prisma.todo.findUnique({
        where: { id },
      });
      return todo ? this.mapToEntity(todo) : null;
    } catch (error) {
      this.logger.error({ error, id }, 'Error finding todo by ID');
      throw error;
    }
  }

  /**
   * Find many todos with filters and pagination
   */
  async findMany(
    filters?: Record<string, unknown>,
    pagination?: { page: number; limit: number }
  ): Promise<{ data: TodoEntity[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    try {
      const skip = pagination ? (pagination.page - 1) * pagination.limit : undefined;
      const take = pagination?.limit;

      const where: any = {};
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.userId) {
        where.userId = filters.userId;
      }

      const findManyArgs: any = {
        where,
        orderBy: { createdAt: 'desc' },
      };
      if (skip !== undefined) findManyArgs.skip = skip;
      if (take !== undefined) findManyArgs.take = take;

      const [todos, total] = await Promise.all([
        this.prisma.todo.findMany(findManyArgs),
        this.prisma.todo.count({ where }),
      ]);

      const limit = pagination?.limit || 10;
      const page = pagination?.page || 1;

      return {
        data: todos.map(this.mapToEntity),
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error({ error, filters, pagination }, 'Error finding many todos');
      throw error;
    }
  }

  /**
   * Create a new todo
   */
  async create(dto: CreateTodoDto): Promise<TodoEntity> {
    try {
      const now = Math.floor(Date.now() / 1000);

      const createData: any = {
        title: dto.title,
        description: dto.description,
        userId: dto.userId,
        status: TodoStatus.PENDING,
        createdAt: now,
        updatedAt: now,
      };

      if (dto.dueAt !== undefined) {
        createData.dueAt = dto.dueAt;
      }

      const todo = await this.prisma.todo.create({
        data: createData,
      });

      this.logger.info({ id: todo.id, userId: dto.userId }, 'Todo created');
      return this.mapToEntity(todo);
    } catch (error) {
      this.logger.error({ error, dto }, 'Error creating todo');
      throw error;
    }
  }

  /**
   * Update a todo by ID
   */
  async update(id: string, dto: UpdateTodoDto): Promise<TodoEntity | null> {
    try {
      const now = Math.floor(Date.now() / 1000);

      // Check if todo exists
      const existingTodo = await this.prisma.todo.findUnique({
        where: { id },
      });

      if (!existingTodo) {
        return null;
      }

      const updateData: any = {
        updatedAt: now,
      };

      if (dto.title !== undefined) {
        updateData.title = dto.title;
      }
      if (dto.description !== undefined) {
        updateData.description = dto.description;
      }
      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }
      if (dto.dueAt !== undefined) {
        updateData.dueAt = dto.dueAt;
      }

      const todo = await this.prisma.todo.update({
        where: { id },
        data: updateData,
      });

      this.logger.info({ id, changes: Object.keys(dto) }, 'Todo updated');
      return this.mapToEntity(todo);
    } catch (error) {
      this.logger.error({ error, id, dto }, 'Error updating todo');
      throw error;
    }
  }

  /**
   * Delete a todo by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.prisma.todo.delete({
        where: { id },
      });

      this.logger.info({ id }, 'Todo deleted');
      return !!result;
    } catch (error: any) {
      if (error.code === 'P2025') {
        // Record not found
        return false;
      }
      this.logger.error({ error, id }, 'Error deleting todo');
      throw error;
    }
  }

  /**
   * Check if todo exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const todo = await this.prisma.todo.findUnique({
        where: { id },
        select: { id: true },
      });
      return !!todo;
    } catch (error) {
      this.logger.error({ error, id }, 'Error checking todo existence');
      throw error;
    }
  }

  /**
   * Count todos with optional filters
   */
  async count(filters?: Record<string, unknown>): Promise<number> {
    try {
      const where: any = {};
      if (filters?.status) {
        where.status = filters.status;
      }
      if (filters?.userId) {
        where.userId = filters.userId;
      }

      return await this.prisma.todo.count({ where });
    } catch (error) {
      this.logger.error({ error, filters }, 'Error counting todos');
      throw error;
    }
  }

  /**
   * Find todos by userId
   */
  async findByUserId(userId: string): Promise<TodoEntity[]> {
    try {
      const todos = await this.prisma.todo.findMany({
        where: { userId },
      });
      return todos.map(this.mapToEntity);
    } catch (error) {
      this.logger.error({ error, userId }, 'Error finding todos by userId');
      throw error;
    }
  }

  /**
   * Find todos by userId with pagination
   */
  async findByUserIdPaginated(
    userId: string,
    pagination?: { page: number; limit: number }
  ): Promise<{ data: TodoEntity[]; total: number }> {
    try {
      const skip = pagination ? (pagination.page - 1) * pagination.limit : undefined;
      const take = pagination?.limit;

      const findManyArgs: any = {
        where: { userId },
        orderBy: { createdAt: 'desc' },
      };
      if (skip !== undefined) findManyArgs.skip = skip;
      if (take !== undefined) findManyArgs.take = take;

      const [todos, total] = await Promise.all([
        this.prisma.todo.findMany(findManyArgs),
        this.prisma.todo.count({ where: { userId } }),
      ]);

      return {
        data: todos.map(this.mapToEntity),
        total,
      };
    } catch (error) {
      this.logger.error({ error, userId, pagination }, 'Error finding todos by userId with pagination');
      throw error;
    }
  }

  /**
   * Find todos by status
   */
  async findByStatus(status: string): Promise<TodoEntity[]> {
    try {
      const todos = await this.prisma.todo.findMany({
        where: { status: status as any },
      });
      return todos.map(this.mapToEntity);
    } catch (error) {
      this.logger.error({ error, status }, 'Error finding todos by status');
      throw error;
    }
  }

  /**
   * Delete todos by userId
   */
  async deleteByUserId(userId: string): Promise<number> {
    try {
      const result = await this.prisma.todo.deleteMany({
        where: { userId },
      });

      this.logger.info({ userId, count: result.count }, 'Todos deleted by userId');
      return result.count;
    } catch (error) {
      this.logger.error({ error, userId }, 'Error deleting todos by userId');
      throw error;
    }
  }

  /**
   * Map Prisma Todo to TodoEntity
   */
  private mapToEntity(todo: any): TodoEntity {
    return {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      status: todo.status,
      userId: todo.userId,
      dueAt: todo.dueAt,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    };
  }
}
