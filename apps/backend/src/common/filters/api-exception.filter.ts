import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown;
  statusCode: number;
  timestamp: string;
  path: string;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorBody: ApiErrorBody = {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      errorBody = {
        code: this.mapStatusToCode(statusCode),
        message: exception.message,
        statusCode,
        timestamp: new Date().toISOString(),
        path: request.url,
      };

      if (typeof exceptionResponse === 'string') {
        errorBody.message = exceptionResponse;
      } else if (
        exceptionResponse &&
        typeof exceptionResponse === 'object'
      ) {
        const payload = exceptionResponse as {
          code?: string;
          message?: string | string[];
          error?: string;
          details?: unknown;
        };

        if (typeof payload.code === 'string') {
          errorBody.code = payload.code;
        }

        if (typeof payload.message === 'string') {
          errorBody.message = payload.message;
        }

        if (Array.isArray(payload.message)) {
          errorBody.message = 'Validation failed';
          errorBody.details = payload.message;
        }

        if (!errorBody.message && typeof payload.error === 'string') {
          errorBody.message = payload.error;
        }

        if (payload.details !== undefined) {
          errorBody.details = payload.details;
        }
      }
    } else if (exception instanceof Error) {
      errorBody.message = exception.message;
    }

    response.status(statusCode).json({
      success: false,
      error: errorBody,
    });
  }

  private mapStatusToCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }
}
