import app from './app';
import { getEnv } from './config/env';
import { getRootLogger } from './infrastructure/logger/logger';
import { disconnectPrisma } from './infrastructure/database/prisma';

// Get logger and environment
const logger = getRootLogger();
const env = getEnv();

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  logger.info(
    {
      port: PORT,
      env: env.NODE_ENV,
      logLevel: env.LOG_LEVEL,
    },
    'Server started successfully'
  );
});

server.on('error', (err) => {
  logger.error({ err }, 'Server error');
  process.exit(1);
});

// ── Graceful Shutdown ────────────────────────────────────────
function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down gracefully...');
  server.close(() => {
    logger.info('HTTP server closed');
    // Disconnect database client then exit
    disconnectPrisma()
      .then(() => {
        logger.info('Prisma disconnected');
        process.exit(0);
      })
      .catch(() => process.exit(0));
  });

  // Force kill after 10s
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Unhandled Promise Rejections ──────────────────────────────
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled promise rejection — shutting down');
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — shutting down');
  process.exit(1);
});

export default server;
