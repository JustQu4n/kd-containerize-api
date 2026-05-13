import { Request, Response, NextFunction } from 'express';
import { Logger } from 'pino';
import { TodoStatus } from './enums';
export { TodoStatus, VALID_STATUSES } from './enums';

// ─── Todo Types ───────────────────────────────────────────────

export interface Todo {
  id: string;
  title: string;
  description?: string | undefined;
  status: TodoStatus;
  userId: string;
  createdAt: number; // unix timestamp
  updatedAt: number;
  dueAt?: number;
}

export interface CreateTodoDto {
  title: string;
  description?: string | undefined;
  userId: string;
  dueAt?: number;
}

export interface UpdateTodoDto {
  title?: string | undefined;
  description?: string | undefined;
  status?: TodoStatus | undefined;
  dueAt?: number | null | undefined;
}

// ─── Audit Log Types ──────────────────────────────────────────
export type AuditAction =
  | 'todo.create'
  | 'todo.update'
  | 'todo.delete'
  | 'todo.read'
  | 'todo.list';

export interface AuditLogEntry {
  reqId: string;
  time: number;
  userId: string;
  action: AuditAction;
  resource?: {
    id?: string;
    title?: string;
    [key: string]: unknown;
  };
  ip?: string;
}

// ─── API Response Types ───────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  data?: T;
  reqId: string;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  code: string;
  message: string;
  reqId: string;
}

// ─── Extended Express Types ───────────────────────────────────
export interface AuthUser {
  userId: string;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      reqId: string;
      log: Logger;
      user?: AuthUser;
      startTime?: number;
    }
    interface Response {
      locals: {
        resource?: Record<string, unknown>;
        [key: string]: unknown;
      };
    }
  }
}

export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;
