import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

let cachedApp: NestExpressApplication;

async function createApp(): Promise<NestExpressApplication> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Get config service
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Static assets from /public
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // CORS configuration tailored for Next.js (supports exact origins and suffix-based matches like .vercel.app)
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);

  const allowedOriginSuffixes = (process.env.ALLOWED_ORIGIN_SUFFIXES || '.vercel.app')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const wildcardAllowed = allowedOrigins.includes('*');
      const exactAllowed = allowedOrigins.includes(origin);
      const suffixAllowed = allowedOriginSuffixes.some(suffix => origin.endsWith(suffix));

      if (wildcardAllowed || exactAllowed || suffixAllowed) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 600,
  });

  // Set global prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const swaggerConfig = configService.get('swagger');
  if (swaggerConfig?.enabled) {
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.init();
  cachedApp = app;
  return app;
}

// Export the createApp function for Vercel
export { createApp };

// For Vercel serverless
export default async function handler(req: any, res: any) {
  const app = await createApp();
  const server = app.getHttpAdapter().getInstance();
  server(req, res);
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  async function bootstrap() {
    const app = await createApp();
    const configService = app.get(ConfigService);
    const port = configService.get('app.port') || 3001;
    
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  }
  
  bootstrap();
} 