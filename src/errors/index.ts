import { ErrorCode } from '../types/enums';
// ─── Base App Error ───────────────────────────────────────────
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintains proper stack trace (V8 engines)
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 400 Validation Error ─────────────────────────────────────
export class ValidationError extends AppError {
  public readonly fields?: Record<string, string[]> | undefined;

  constructor(message: string, fields?: Record<string, string[]>) {
    super(message, 400, ErrorCode.VALIDATION_ERROR);
    this.fields = fields;
  }
}

// ─── 404 Not Found Error ──────────────────────────────────────
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 404, ErrorCode.NOT_FOUND);
  }
}

// ─── 401 Unauthorized Error ───────────────────────────────────
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, ErrorCode.UNAUTHORIZED);
  }
}

// ─── 403 Forbidden Error ──────────────────────────────────────
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, ErrorCode.FORBIDDEN);
  }
}

// ─── 409 Conflict Error ───────────────────────────────────────
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, ErrorCode.CONFLICT);
  }
}

// ─── 500 Internal Error ───────────────────────────────────────
export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super(message, 500, ErrorCode.INTERNAL_ERROR, false);
  }
}
