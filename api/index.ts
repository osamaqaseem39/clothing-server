import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import * as express from 'express';

let app: any;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    // Get config service
    const configService = app.get(ConfigService);

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    // Static assets from /public
    app.useStaticAssets(join(__dirname, '..', 'public'));

    // CORS configuration for production
    app.enableCors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          'https://clothing-website-lovat.vercel.app',
          'https://clothing-dashboard-seven.vercel.app',
          'http://localhost:3000',
          'http://localhost:3001'
        ];
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 600,
    });

    // Set global prefix for all environments
    app.setGlobalPrefix('api');

    // Swagger documentation
    const swaggerConfig = configService.get('swagger');
    if (swaggerConfig?.enabled !== false && process.env.NODE_ENV === 'production') {
      const config = new DocumentBuilder()
        .setTitle(swaggerConfig?.title || 'API')
        .setDescription(swaggerConfig?.description || 'API Documentation')
        .setVersion(swaggerConfig?.version || '1.0')
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document);
    }

    await app.init();
  }
  return app;
}

// Initialize app
const initPromise = bootstrap();

// Export Vercel serverless function
export default async (req: any, res: any) => {
  try {
    // Ensure app is initialized
    const appInstance = await initPromise;
    
    // Get the underlying Express instance
    const expressApp = appInstance.getHttpAdapter().getInstance();
    
    // Handle the request
    expressApp(req, res, (err: any) => {
      if (err) {
        console.error('Request handling error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
      }
    });
  } catch (error) {
    console.error('Error in Vercel handler:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};