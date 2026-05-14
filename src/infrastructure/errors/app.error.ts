import { BaseError } from './base.error';

/**
 * Application Error
 * Standard error for operational errors in the application
 */
export class AppError extends BaseError {
  constructor(
    message: string,
    statusCode: number,
    code: string,
    context?: Record<string, unknown>,
  ) {
    super(message, statusCode, code, true, context);
  }
}

/**
 * 400 - Validation Error
 * Used when request data fails validation
 */
export class ValidationError extends AppError {
  public readonly fields: Record<string, string[]> | undefined;

  constructor(
    message: string,
    fields?: Record<string, string[]>,
    context?: Record<string, unknown>,
  ) {
    super(message, 400, 'VALIDATION_ERROR', context);
    this.fields = fields;
  }

  override toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}

/**
 * 404 - Not Found Error
 * Used when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string, context?: Record<string, unknown>) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND', {
      resource,
      id,
      ...context,
    });
  }
}

/**
 * 401 - Unauthorized Error
 * Used when authentication fails
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', context?: Record<string, unknown>) {
    super(message, 401, 'UNAUTHORIZED', context);
  }
}

/**
 * 403 - Forbidden Error
 * Used when user lacks permissions
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', context?: Record<string, unknown>) {
    super(message, 403, 'FORBIDDEN', context);
  }
}

/**
 * 409 - Conflict Error
 * Used when operation conflicts with current state
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', context);
  }
}

/**
 * 500 - Internal Server Error
 * Used for unexpected errors
 */
export class InternalError extends BaseError {
  constructor(message = 'Internal server error', context?: Record<string, unknown>) {
    super(message, 500, 'INTERNAL_ERROR', false, context);
  }
}

/**
 * 422 - Unprocessable Entity Error
 * Used when logic validation fails (e.g., business rule violation)
 */
export class UnprocessableEntityError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, 422, 'UNPROCESSABLE_ENTITY', context);
  }
}

/**
 * 429 - Too Many Requests Error
 * Used when rate limit is exceeded
 */
export class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests', retryAfter?: number) {
    super(message, 429, 'TOO_MANY_REQUESTS', {
      retryAfter,
    });
  }
}
