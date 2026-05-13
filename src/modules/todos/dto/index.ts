import { TodoStatus } from '../domain';

/**
 * Create Todo DTO
 * Request body for creating a new todo
 */
export class CreateTodoDto {
  title!: string;
  description?: string | undefined;
  dueAt?: number | undefined;
  userId!: string;
}

/**
 * Update Todo DTO
 * Request body for updating a todo
 */
export class UpdateTodoDto {
  title?: string | undefined;
  description?: string | null | undefined;
  status?: TodoStatus | undefined;
  dueAt?: number | null | undefined;
}

/**
 * Todo Response DTO
 * Standard response format for todo
 */
export class TodoResponseDto {
  id!: string;
  title!: string;
  description?: string;
  status!: TodoStatus;
  userId!: string;
  dueAt?: number;
  createdAt!: number;
  updatedAt!: number;

  constructor(data: any) {
    Object.assign(this, data);
  }
}

/**
 * Create Todo List Query DTO
 */
export class ListTodosQueryDto {
  page: number = 1;
  limit: number = 10;
  status?: TodoStatus;
  userId?: string;

  constructor(partial?: Partial<ListTodosQueryDto>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
