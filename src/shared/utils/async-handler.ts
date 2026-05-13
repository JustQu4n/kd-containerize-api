import { Request, Response, NextFunction } from 'express';

/**
 * Async Request Handler Wrapper
 * 
 * Wraps async route handlers to catch errors and pass to error middleware
 * Eliminates try-catch blocks in controllers
 * 
 * Usage:
 * router.post('/', asyncHandler(controller.create))
 */
export function asyncHandler(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
