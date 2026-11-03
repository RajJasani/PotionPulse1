import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Request ID middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const requestId = (req.headers['x-request-id'] as string) || uuidv4();
    (req as any).requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  });

  // Global exception filter for standardized error envelopes
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS configuration
  const configuredOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or in allowed list
      if (!origin || configuredOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in dev/staging environments
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Idempotency-Key',
      'X-Request-Id',
      'x-request-id',
      'x-tenant-id',
      'X-Tenant-Id',
    ],
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // OpenAPI Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('PotionPulse API')
    .setDescription(
      'Multi-tenant inventory intelligence platform for potion shops and small inventory businesses.',
    )
    .setVersion('1.0')
    .addTag('Health', 'System uptime and operational diagnostics')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`PotionPulse API running on port ${port} (prefix: /api/v1)`);
  logger.log(`OpenAPI docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();

