import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    const configService = app.get(ConfigService);

    // Security middleware
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [`'self'`, 'data:', 'apollo-server-landing-page.cdn.apollographql.com'],
        },
      },
    }));

    // CORS configuration
    app.enableCors({
      origin: process.env.NODE_ENV === 'production' 
        ? [configService.get('FRONTEND_URL')] 
        : true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Global prefix for all routes
    const apiPrefix = configService.get('API_PREFIX', 'api/v1');
    app.setGlobalPrefix(apiPrefix);

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Remove properties that don't have decorators
        forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
        transform: true, // Automatically transform payloads to DTO instances
        transformOptions: {
          enableImplicitConversion: true, // Allow implicit type conversion
        },
        errorHttpStatusCode: 422, // Use 422 for validation errors
      }),
    );

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global interceptors
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new ResponseInterceptor(),
    );

    const port = configService.get('PORT', 3000);
    const host = '0.0.0.0'; // Allow external connections

    await app.listen(port, host);
    
    logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
    logger.log(`📊 Database: Connected to PostgreSQL`);
    logger.log(`🔒 Security: Helmet enabled`);
    logger.log(`🌐 CORS: Enabled for ${process.env.NODE_ENV === 'production' ? 'production' : 'development'}`);
    logger.log(`📝 API Documentation: http://localhost:${port}/${apiPrefix}/docs (when Swagger is added)`);
    
    if (process.env.NODE_ENV === 'development') {
      logger.log(`🎨 Prisma Studio: Run 'npm run db:studio' to open database browser`);
      logger.log(`🔍 pgAdmin: http://localhost:8080 (admin@fitness.com / admin123)`);
    }

  } catch (error) {
    logger.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

bootstrap(); 