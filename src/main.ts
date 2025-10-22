import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { join, dirname } from 'path';
import * as express from 'express';

let app: any;
const allowedOrigins = [
  'https://clothing-dashboard-seven.vercel.app',
  'http://localhost:3000',
];

function setCorsHeaders(res: any, origin?: string) {
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Content-Range, X-Total-Count');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Range, X-Total-Count');
  res.setHeader('Access-Control-Max-Age', '600');
}

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

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

    // CORS
    app.enableCors({
      origin: (origin, callback) => {
        // Allow server-to-server or tools without an Origin
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Content-Range',
        'X-Total-Count',
      ],
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 600,
    });

    // Single CORS middleware for all environments (handles preflight and ensures headers)
    app.use((req: any, res: any, next: any) => {
      const origin: string | undefined = req.headers?.origin;
      setCorsHeaders(res, origin);
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }
      next();
    });

    // Swagger documentation (toggleable)
    const swaggerConfig = configService.get('swagger');
    if (swaggerConfig.enabled) {
      // Serve swagger-ui-dist assets under a separate prefix to avoid shadowing /api/docs
      const swaggerUiAssetsDir = dirname(require.resolve('swagger-ui-dist/swagger-ui.css'));
      app.use('/api/docs-assets', express.static(swaggerUiAssetsDir));

      const config = new DocumentBuilder()
        .setTitle(swaggerConfig.title)
        .setDescription(swaggerConfig.description)
        .setVersion(swaggerConfig.version)
        .addBearerAuth()
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        jsonDocumentUrl: 'api/docs-json',
        // Point to local copies under /api/docs-assets
        customCssUrl: '/api/docs-assets/swagger-ui.css',
        customJs: [
          '/api/docs-assets/swagger-ui-bundle.js',
          '/api/docs-assets/swagger-ui-standalone-preset.js',
        ],
        swaggerOptions: {
          persistAuthorization: true,
          displayRequestDuration: true,
        },
      });

      // Ensure trailing slash so relative assets (e.g., ./swagger-ui.css) resolve correctly
      const httpAdapter = app.getHttpAdapter().getInstance();
      httpAdapter.get('/api/docs', (_req: any, res: any) => res.redirect('/api/docs/'));
    }

    await app.init();
  }
  return app;
}

// For Vercel deployment (uses same unified CORS handling)
export default async (req: any, res: any) => {
  const nestApp = await bootstrap();
  return nestApp.getHttpAdapter().getInstance()(req, res);
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(async (app) => {
    const configService = app.get(ConfigService);
    const port = configService.get('app.port');
    await app.listen(port);
    console.log(`🚀 Application is running on: http://localhost:${port}`);
    console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
  });
} 