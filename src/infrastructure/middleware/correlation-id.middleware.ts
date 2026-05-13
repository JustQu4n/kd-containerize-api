import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createRequestLogger } from '../logger/logger';

/**
 * Correlation ID Middleware
 * 
 * Responsibilities:
 * - Generate or extract correlation ID from headers
 * - Attach to request for reference
 * - Create request-scoped logger
 * - Echo back in response headers
 */
export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate or extract correlation ID
  const correlationId =
    (req.headers['x-correlation-id'] as string) ||
    (req.headers['x-request-id'] as string) ||
    uuidv4();

  // Attach to request
  req.reqId = correlationId;
  req.startTime = Date.now();

  // Create request-scoped logger
  req.log = createRequestLogger(correlationId);

  // Echo in response header
  res.setHeader('X-Correlation-Id', correlationId);

  next();
}
