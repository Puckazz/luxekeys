import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaginationMeta } from '../interfaces';

type MaybeStandardResponse<T = unknown> = {
  data?: T;
  pagination?: PaginationMeta;
};

@Injectable()
export class TransformResponseInterceptor<T> implements NestInterceptor<
  T,
  unknown
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<{ method?: string }>();
    const response = http.getResponse<{ statusCode?: number }>();
    const method = request.method ?? 'GET';
    const statusCode = response.statusCode ?? HttpStatus.OK;

    return next
      .handle()
      .pipe(map((body) => this.transformResponse(body, statusCode, method)));
  }

  private transformResponse(
    response: T,
    statusCode: number,
    method: string,
  ): unknown {
    if (!this.isObject(response)) {
      return this.buildSuccessResponse({
        statusCode,
        message: this.getDefaultMessage(method),
        data: response,
      });
    }

    const normalizedResponse = response as MaybeStandardResponse;

    if ('data' in normalizedResponse) {
      return this.buildSuccessResponse({
        statusCode,
        message: this.getDefaultMessage(method),
        data: normalizedResponse.data,
        meta: normalizedResponse.pagination,
      });
    }

    return this.buildSuccessResponse({
      statusCode,
      message: this.getDefaultMessage(method),
      data: response,
    });
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private buildSuccessResponse({
    statusCode,
    message,
    data,
    meta,
  }: {
    statusCode: number;
    message: string;
    data: unknown;
    meta?: PaginationMeta;
  }) {
    return {
      success: true,
      statusCode,
      message,
      data,
      ...(meta && { meta }),
    };
  }

  private getDefaultMessage(method: string): string {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'Resource created successfully';
      case 'PUT':
      case 'PATCH':
        return 'Resource updated successfully';
      case 'DELETE':
        return 'Resource deleted successfully';
      case 'GET':
      default:
        return 'Resource fetched successfully';
    }
  }
}
