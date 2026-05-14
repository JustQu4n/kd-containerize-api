import { Logger } from 'pino';
import { getRootLogger } from '../../infrastructure/logger/logger';
import { IRepository } from '../repositories';

/**
 * Base Service Class
 *
 * Provides:
 * - Dependency injection for repository
 * - Logger support
 * - Standard service lifecycle methods
 *
 * All services should extend this
 */
export abstract class BaseService<Entity, CreateDTO, UpdateDTO> {
  protected logger: Logger;

  constructor(protected readonly repository: IRepository<Entity, CreateDTO, UpdateDTO>) {
    this.logger = getRootLogger();
  }

  /**
   * Get repository (can be overridden for special cases)
   */
  protected getRepository(): IRepository<Entity, CreateDTO, UpdateDTO> {
    return this.repository;
  }

  /**
   * Log debug information
   */
  protected logDebug(message: string, data?: Record<string, unknown>) {
    this.logger.debug(data || {}, message);
  }

  /**
   * Log info
   */
  protected logInfo(message: string, data?: Record<string, unknown>) {
    this.logger.info(data || {}, message);
  }

  /**
   * Log warning
   */
  protected logWarn(message: string, data?: Record<string, unknown>) {
    this.logger.warn(data || {}, message);
  }

  /**
   * Log error
   */
  protected logError(message: string, error?: Error | Record<string, unknown>) {
    if (error instanceof Error) {
      this.logger.error({ err: error }, message);
    } else {
      this.logger.error(error || {}, message);
    }
  }
}
