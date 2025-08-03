import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface PaginationMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Handle pagination data
        let responseData = data;
        let meta: PaginationMeta | undefined = undefined;

        // Check if data contains pagination info
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          responseData = data.data;
          meta = data.meta;
        }

        // Handle array responses for pagination
        if (Array.isArray(data) && request.query.page) {
          const page = parseInt(request.query.page as string) || 1;
          const limit = parseInt(request.query.limit as string) || 10;
          
          meta = {
            page,
            limit,
            total: data.length,
            totalPages: Math.ceil(data.length / limit),
          };
        }

        const baseResponse: ApiResponse<T> = {
          success: true,
          statusCode: response.statusCode,
          timestamp: new Date().toISOString(),
          path: request.url,
          method: request.method,
          data: responseData,
        };

        // Add meta only if it exists
        if (meta) {
          baseResponse.meta = meta;
        }

        return baseResponse;
      }),
    );
  }
}