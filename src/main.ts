import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

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
    const frontendUrl = configService.get('FRONTEND_URL');
    app.enableCors({
      origin: process.env.NODE_ENV === 'production' 
        ? (frontendUrl ? [frontendUrl] : false)  // ✅ Better null handling
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
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        errorHttpStatusCode: 422,
        disableErrorMessages: process.env.NODE_ENV === 'production', // ✅ Hide detailed errors in production
      }),
    );

    // Global exception filter
    app.useGlobalFilters(new AllExceptionsFilter());

    // Global interceptors
    app.useGlobalInterceptors(
      new LoggingInterceptor(),
      new ResponseInterceptor(),
    );

    // ✅ Graceful shutdown
    const port = configService.get('PORT', 3000);
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'; // ✅ Security improvement

    await app.listen(port, host);
    
    logger.log(`🚀 Application is running on: http://localhost:${port}/${apiPrefix}`);
    logger.log(`📊 Database: Connected to PostgreSQL`);
    logger.log(`🔒 Security: Helmet enabled`);
    logger.log(`🌐 CORS: Enabled for ${process.env.NODE_ENV === 'production' ? 'production' : 'development'}`);
    logger.log(`📝 API Documentation: http://localhost:${port}/${apiPrefix}/docs (when Swagger is added)`);
    
    if (process.env.NODE_ENV === 'development') {
      logger.log(`🎨 Prisma Studio: Run 'npm run db:studio' to open database browser`);
      logger.log(`🔍 pgAdmin: http://localhost:8080 (admin@fitness.com / admin123)`);
      logger.log(`👤 Current User: samimh23`); // ✅ Added user context
    }

    // ✅ Graceful shutdown handlers
    process.on('SIGINT', async () => {
      logger.log('🛑 Received SIGINT, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.log('🛑 Received SIGTERM, shutting down gracefully...');
      await app.close();
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

bootstrap();