import type { ErrorHandler } from 'elysia';
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
    super(401, message);
    this.name = 'UnauthorizedError';
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(400, message);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not Found') {
    super(404, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, message);
    this.name = 'ConflictError';
  }
}

export class BadGatewayError extends AppError {
  constructor(message = 'Bad Gateway') {
    super(502, message);
    this.name = 'BadGatewayError';
  }
}

type ErrorHandlerOptions = Parameters<ErrorHandler>[0];
type ErrorHandlerResult = ReturnType<ErrorHandler>;

export function elysiaErrorHandler({ error, code, set }: ErrorHandlerOptions): ErrorHandlerResult {
  if (error instanceof AppError) {
    set.status = error.statusCode;
    return { error: error.message };
  }
  if (code === 'VALIDATION') {
    set.status = 400;
    return { error: 'Validation error', details: error.message };
  }
  logger.error(error);
  set.status = 500;
  return { error: 'Internal server error' };
}
