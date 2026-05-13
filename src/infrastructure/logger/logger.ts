import pino, { Logger, LoggerOptions } from 'pino';
import * as fs from 'fs';
import * as path from 'path';

const isDev = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || 'info';

/**
 * Create logs directory if it doesn't exist
 */
function ensureLogsDir(): string {
  const logsDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  return logsDir;
}

/**
 * Base logger configuration
 */
const baseOptions: LoggerOptions = {
  level: logLevel,
  base: {
    pid: process.pid,
    env: process.env.NODE_ENV || 'development',
  },
  timestamp: pino.stdTimeFunctions.epochTime,
  formatters: {
    level(label) {
      return { level: label.toUpperCase() };
    },
  },
};

/**
 * Create root logger
 */
export function createRootLogger(): Logger {
  const logsDir = ensureLogsDir();
  const logFilePath = path.join(logsDir, 'app.log');
  const fileStream = fs.createWriteStream(logFilePath, { flags: 'a' });

  const streams: Array<{ level: string; stream: any }> = [];

  // Always log to file
  streams.push({
    level: 'info',
    stream: fileStream,
  });

  // Log to console in dev mode
  if (isDev) {
    streams.push({
      level: 'info',
      stream: pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
          ignore: 'pid,hostname',
          messageFormat: '{msg}',
        },
      }),
    });
  }

  return pino(baseOptions, pino.multistream(streams));
}

/**
 * Create child logger with correlation ID
 */
export function createChildLogger(logger: Logger, bindings: Record<string, unknown>): Logger {
  return logger.child(bindings);
}

/**
 * Singleton root logger
 */
let rootLoggerInstance: Logger | null = null;

export function getRootLogger(): Logger {
  if (!rootLoggerInstance) {
    rootLoggerInstance = createRootLogger();
  }
  return rootLoggerInstance;
}

/**
 * Create request-scoped logger with correlation ID
 */
export function createRequestLogger(correlationId: string): Logger {
  const root = getRootLogger();
  return createChildLogger(root, { correlationId });
}

export default getRootLogger();
