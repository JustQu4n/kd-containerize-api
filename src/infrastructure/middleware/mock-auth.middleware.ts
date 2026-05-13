import { Request, Response, NextFunction } from 'express';

/**
 * Mock Authentication Middleware
 * Injects a mock user for development/testing
 * In production, replace with real JWT verification
 */
export function mockAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // In development, inject a mock user (match AuthUser shape)
  req.user = {
    userId: (req.headers['x-user-id'] as string) || 'mock-user-id',
    name: (req.headers['x-user-name'] as string) || 'Mock User',
  };

  next();
}
