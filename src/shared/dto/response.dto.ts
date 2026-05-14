/**
 * Standard API Response Wrapper DTOs
 */

/**
 * Success Response DTO
 */
export class SuccessResponseDto<T> {
  success: true = true;
  statusCode: number;
  data: T;
  correlationId: string;
  timestamp: string;

  constructor(
    data: T,
    statusCode: number = 200,
    correlationId: string = '',
    timestamp: string = new Date().toISOString(),
  ) {
    this.statusCode = statusCode;
    this.data = data;
    this.correlationId = correlationId;
    this.timestamp = timestamp;
  }
}

/**
 * Error Response DTO
 */
export class ErrorResponseDto {
  success: false = false;
  statusCode: number;
  code: string;
  message: string;
  correlationId: string;
  timestamp: string;
  fields: Record<string, string[]> | undefined;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    correlationId: string = '',
    timestamp: string = new Date().toISOString(),
    fields: Record<string, string[]> | undefined,
  ) {
    this.statusCode = statusCode;
    this.code = code;
    this.message = message;
    this.correlationId = correlationId;
    this.timestamp = timestamp;
    this.fields = fields;
  }
}
