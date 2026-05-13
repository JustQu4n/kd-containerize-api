import { Request, Response, NextFunction } from 'express';

/**
 * Request/Response Logging Middleware
 * 
 * Logs all HTTP requests and their responses
 * Records: method, URL, status code, duration, response size
 */
export function requestLoggerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();
  const log = req.log;

  // Log incoming request
  log.debug(
    {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      userId: req.user?.userId,
    },
    'Incoming request'
  );

  // Intercept response to log it
  const originalJson = res.json;
  const originalSend = res.send;

  let responseSize = 0;

  const logResponse = () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    log[statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'](
      {
        method: req.method,
        url: req.originalUrl,
        statusCode,
        duration: `${duration}ms`,
        responseSize: `${responseSize}B`,
        userId: req.user?.userId,
      },
      `${req.method} ${req.originalUrl} ${statusCode}`
    );
  };

  // Override json method
  res.json = function (data: any) {
    responseSize = JSON.stringify(data).length;
    logResponse();
    return originalJson.call(this, data);
  };

  // Override send method
  res.send = function (data: any) {
    if (data) {
      responseSize = typeof data === 'string' ? data.length : JSON.stringify(data).length;
    }
    logResponse();
    return originalSend.call(this, data);
  };

  next();
}
