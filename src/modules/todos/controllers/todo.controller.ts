import { Request, Response } from 'express';
import { TodoService } from '../services/todo.service';
import { sendSuccess, setAuditResource } from '../../../shared/utils';
import { ValidationError } from '../../../errors';
import { CreateTodoDto, UpdateTodoDto } from '../dto';
import { TodoStatus, VALID_STATUSES } from '../../../types';



export class TodoController {
  constructor(private readonly service: TodoService) {}

  // GET /todos
  listTodos = async (req: Request, res: Response): Promise<void> => {
    const userId = req.query.userId as string | undefined;
    const todos = await this.service.listTodos(userId, req.log);

    setAuditResource(res, { count: todos.length, userId: userId ?? 'all' });

    sendSuccess(res, { todos, total: todos.length }, 200);
  };

  // GET /todos/:id
  getTodo = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const todo = await this.service.getTodoById(id, req.log);

    setAuditResource(res, { id: todo.id, title: todo.title });

    sendSuccess(res, { todo });
  };

  // POST /todos
  createTodo = async (req: Request, res: Response): Promise<void> => {
    const { title, description, dueAt } = req.body as {
      title?: string;
      description?: string;
      dueAt?: string;
    };

    if (!title) {
      throw new ValidationError('Request body validation failed', {
        title: ['title is required'],
      });
    }

    // dueAt validation: if provided, must be valid ISO date
    let dueAtTs: number | undefined;
    if (dueAt !== undefined) {
      const parsed = Date.parse(dueAt);
      if (isNaN(parsed)) {
        throw new ValidationError('Invalid dueAt format', {
          dueAt: ['dueAt must be a valid ISO date string'],
        });
      }
      dueAtTs = Math.floor(parsed / 1000);
    }

    const dto: CreateTodoDto = {
      title,
      description,
      userId: req.user?.userId ?? 'anonymous',
      ...(dueAtTs !== undefined && { dueAt: dueAtTs }),
    };
    const todo = await this.service.createTodo(dto, req.log);

    setAuditResource(res, { id: todo.id, title: todo.title });

    sendSuccess(res, { todo }, 201);
  };

  // PUT /todos/:id
  updateTodo = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };
    const { title, description, status, dueAt } = req.body as {
      title?: string;
      description?: string;
      status?: string;
      dueAt?: string | null;
    };

    if (status !== undefined && !VALID_STATUSES.includes(status as TodoStatus)) {
      throw new ValidationError('Invalid status value', {
        status: [`status must be one of: ${VALID_STATUSES.join(', ')}`],
      });
    }

    let dueAtTs: number | null | undefined;
    if (dueAt !== undefined) {
      if (dueAt === null) {
        dueAtTs = null;
      } else {
        const parsed = Date.parse(dueAt as string);
        if (isNaN(parsed)) {
          throw new ValidationError('Invalid dueAt format', {
            dueAt: ['dueAt must be a valid ISO date string or null'],
          });
        }
        dueAtTs = Math.floor(parsed / 1000);
      }
    }

    const dto: UpdateTodoDto = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status: status as TodoStatus }),
      ...(dueAt !== undefined && { dueAt: dueAtTs }),
    };

    const todo = await this.service.updateTodo(id, dto, req.log);

    setAuditResource(res, { id: todo.id, title: todo.title, status: todo.status });

    sendSuccess(res, { todo });
  };

  // DELETE /todos/:id
  deleteTodo = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params as { id: string };

    // Fetch before delete so we can log the resource
    const todo = await this.service.getTodoById(id, req.log);
    await this.service.deleteTodo(id, req.log);

    setAuditResource(res, { id: todo.id, title: todo.title });

    sendSuccess(res, {}, 204);
  };
}
