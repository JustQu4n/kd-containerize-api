/**
 * Base Error Class
 * All application errors should extend this class
 * Supports error tracking, logging, and serialization
 */
export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;
  public readonly context: Record<string, unknown> | undefined;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    isOperational = true,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.timestamp = new Date();
    this.context = context;

    // Maintains proper stack trace (V8 engines)
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for logging/response
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }
}
