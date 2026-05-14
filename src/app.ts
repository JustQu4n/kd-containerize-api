import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import {
  correlationIdMiddleware,
  requestLoggerMiddleware,
  errorHandlerMiddleware,
  mockAuthMiddleware,
} from './infrastructure/middleware';
import { NotFoundError } from './infrastructure/errors';
import { getEnv } from './config/env';
import { createTodoRoutes } from './modules/todos';

const app = express();

// ── Security & Rate Limiting ──────────────────────────────────
app.use(helmet());

const env = getEnv();
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// ── Global Middleware (order matters!) ────────────────────────

// 1. Correlation ID — MUST be first: attaches reqId + child logger
app.use(correlationIdMiddleware);

// 2. Request logger — logs incoming requests and responses
app.use(requestLoggerMiddleware);

// 3. Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Mock Authentication (for development/testing)
if (env.NODE_ENV !== 'production') {
  app.use(mockAuthMiddleware);
}

// ── Health Check ──────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Routes ────────────────────────────────────────────────
app.use('/api/todos', createTodoRoutes());

// ── 404 Handler — catches undefined routes ────────────────────
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(
    new NotFoundError('Route', `${req.method} ${req.originalUrl}`, {
      method: req.method,
      path: req.originalUrl,
    }),
  );
});

// ── Global Error Handler — MUST be last ────────────────────────
app.use(errorHandlerMiddleware);

export default app;
