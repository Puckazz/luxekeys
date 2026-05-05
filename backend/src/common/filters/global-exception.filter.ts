import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message =
          (responseObj.message as string | string[]) || exception.message;
        error = (responseObj.error as string) || String(HttpStatus[statusCode]);
      } else {
        message = exception.message;
        error = String(HttpStatus[statusCode]);
      }
    } else if (
      exception &&
      typeof exception === 'object' &&
      'code' in exception &&
      'clientVersion' in exception
    ) {
      // Handle Prisma errors via duck typing to avoid coupling
      statusCode = HttpStatus.BAD_REQUEST;
      const prismaError = exception as Record<string, unknown>;
      const code = String(prismaError.code);
      error = `Prisma Error ${code}`;

      const meta = prismaError.meta as Record<string, unknown> | undefined;
      message = (meta?.cause as string) || 'Database error occurred';

      if (code === 'P2002') {
        statusCode = HttpStatus.CONFLICT;
        error = 'Conflict';
        message = 'Unique constraint violation';
      } else if (code === 'P2025') {
        statusCode = HttpStatus.NOT_FOUND;
        error = 'Not Found';
        message = 'Record not found';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log the error with stack trace if available
    this.logger.error(
      `${request.method} ${request.url} - ${statusCode} - ${error}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // Send consistent error response
    response.status(statusCode).json({
      statusCode,
      message,
      error,
    });
  }
}
