import { Request, Response, NextFunction } from 'express';
import { BaseError } from '../errors/base.error';
import { InternalError } from '../errors/app.error';
import { getRootLogger } from '../logger/logger';

/**
 * Error Response Format
 */
interface ErrorResponsePayload {
  success: false;
  statusCode: number;
  code: string;
  message: string;
  fields?: Record<string, string[]>;
  correlationId: string;
  timestamp: string;
}

/**
 * Global Error Handler Middleware
 *
 * Responsibilities:
 * - Catch all thrown errors
 * - Log appropriately based on error type
 * - Return standardized error response
 * - Ensure app doesn't crash on unhandled errors
 */
export function errorHandlerMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const correlationId = req.reqId || 'unknown';
  const rootLogger = getRootLogger();
  const log = req.log || rootLogger;
  const timestamp = new Date().toISOString();

  // ── Handle Operational Errors (AppError, ValidationError, etc.) ──
  if (err instanceof BaseError) {
    const payload: ErrorResponsePayload = {
      success: false,
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      correlationId,
      timestamp,
    };

    // Add validation fields if present
    if ('fields' in err && err.fields) {
      payload.fields = (err as any).fields as Record<string, string[]>;
    }

    // Log based on severity
    if (err.statusCode >= 500) {
      log.error(
        {
          err: err.toJSON(),
          method: req.method,
          url: req.originalUrl,
        },
        'Server error',
      );
    } else {
      log.warn(
        {
          code: err.code,
          message: err.message,
          method: req.method,
          url: req.originalUrl,
        },
        'Client error',
      );
    }

    res.status(err.statusCode).json(payload);
    return;
  }

  // ── Handle Unknown Errors ──
  const unknownErr = err instanceof Error ? err : new Error(String(err));
  const internalError = new InternalError('An unexpected error occurred', {
    originalError: unknownErr.message,
  });

  const payload: ErrorResponsePayload = {
    success: false,
    statusCode: internalError.statusCode,
    code: internalError.code,
    message: internalError.message,
    correlationId,
    timestamp,
  };

  // Log the original error
  log.error(
    {
      err: {
        name: unknownErr.name,
        message: unknownErr.message,
        stack: unknownErr.stack,
      },
      method: req.method,
      url: req.originalUrl,
    },
    'Unexpected error',
  );

  res.status(500).json(payload);
}
