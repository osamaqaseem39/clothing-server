import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';

let app: any;

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

    // CORS
    app.enableCors({
      origin: [
        'https://clothing-dashboard-seven.vercel.app',
        'http://localhost:3000',
      ],
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: '*',
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
      maxAge: 600,
    });

    // Swagger documentation
    const swaggerConfig = configService.get('swagger');
    const config = new DocumentBuilder()
      .setTitle(swaggerConfig.title)
      .setDescription(swaggerConfig.description)
      .setVersion(swaggerConfig.version)
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
  }
  return app;
}

// For Vercel deployment
export default async (req: any, res: any) => {
  // Handle CORS preflight explicitly for Vercel functions
  if (req.method === 'OPTIONS') {
    const origin = req.headers?.origin as string | undefined;
    const allowedOrigins = [
      'https://clothing-dashboard-seven.vercel.app',
      'http://localhost:3000',
    ];

    const requestHeaders = (req.headers['access-control-request-headers'] as string) || '*';
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', requestHeaders);
      res.setHeader('Access-Control-Max-Age', '600');
    }
    res.status(204).end();
    return;
  }
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