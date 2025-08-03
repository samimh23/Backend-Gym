import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    
    const { method, url, ip, headers } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();

    // Log incoming request
    const requestLog = {
      method,
      url,
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        headers: this.sanitizeHeaders(headers),
        body: this.sanitizeBody(request.body),
      }),
    };

    this.logger.log(`📥 Incoming Request: ${method} ${url}`, requestLog);

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          const { statusCode } = response;

          const responseLog = {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            ...(process.env.NODE_ENV === 'development' && {
              responseSize: JSON.stringify(data).length,
            }),
          };

          // Use different log levels based on status code
          if (statusCode >= 400) {
            this.logger.warn(`📤 Response: ${method} ${url} - ${statusCode} (${duration}ms)`, responseLog);
          } else {
            this.logger.log(`📤 Response: ${method} ${url} - ${statusCode} (${duration}ms)`, responseLog);
          }
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || 500;

          const errorLog = {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            error: error.message,
            timestamp: new Date().toISOString(),
          };

          this.logger.error(`📤 Error Response: ${method} ${url} - ${statusCode} (${duration}ms)`, errorLog);
        },
      }),
    );
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    
    // Remove sensitive headers
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    sensitiveHeaders.forEach(header => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sanitized = { ...body };
    
    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}