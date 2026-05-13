import { Response } from 'express';
import { SuccessResponseDto, ErrorResponseDto } from '../dto';
import { PaginationMeta } from '../types/common.types';

/**
 * Send Success Response
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  pagination?: PaginationMeta
): void {
  const correlationId = (res.req as any).reqId || 'unknown';
  const timestamp = new Date().toISOString();

  const response: any = {
    success: true,
    statusCode,
    data,
    correlationId,
    timestamp,
  };

  if (pagination) {
    response.meta = pagination;
  }

  res.status(statusCode).json(response);
}

/**
 * Send Error Response
 */
export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  fields?: Record<string, string[]>
): void {
  const correlationId = (res.req as any).reqId || 'unknown';
  const timestamp = new Date().toISOString();

  const response: any = {
    success: false,
    statusCode,
    code,
    message,
    correlationId,
    timestamp,
  };

  if (fields) {
    response.fields = fields;
  }

  res.status(statusCode).json(response);
}

/**
 * Store resource data in response locals (for audit logging)
 */
export function setAuditResource(
  res: Response,
  resource: Record<string, unknown>
): void {
  res.locals.resource = resource;
}

/**
 * Store pagination metadata in response locals
 */
export function setPaginationMeta(
  res: Response,
  pagination: PaginationMeta
): void {
  res.locals.pagination = pagination;
}
