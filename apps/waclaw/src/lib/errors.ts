import { type ErrorHandler, StatusMap } from 'elysia';
import { logger } from '#lib/logger.ts';

export class AppError extends Error {
  readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(StatusMap.Unauthorized, message);
    this.name = 'UnauthorizedError';
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(StatusMap['Bad Request'], message);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(StatusMap['Not Found'], message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(StatusMap.Conflict, message);
    this.name = 'ConflictError';
  }
}

export class BadGatewayError extends AppError {
  constructor(message = 'Bad Gateway') {
    super(StatusMap['Bad Gateway'], message);
    this.name = 'BadGatewayError';
  }
}

type ErrorHandlerOptions = Parameters<ErrorHandler>[0];
type ErrorHandlerResult = ReturnType<ErrorHandler>;

export function elysiaErrorHandler({
  error,
  code,
  status,
}: ErrorHandlerOptions): ErrorHandlerResult {
  logger.error(error);
  if (error instanceof AppError) {
    return status(error.statusCode, { error: error.message });
  }
  if (code === 'VALIDATION') {
    return status(StatusMap['Bad Request'], { error: 'Validation error', details: error.message });
  }
  return status(StatusMap['Internal Server Error'], { error: 'Internal server error' });
}
