const { NestFactory } = require('@nestjs/core');
const { ValidationPipe } = require('@nestjs/common');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('../dist/src/app.module');
const { ConfigService } = require('@nestjs/config');
const { NestExpressApplication } = require('@nestjs/platform-express');
const { join } = require('path');

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

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

    // CORS configuration
    app.enableCors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          'https://clothing-website-lovat.vercel.app',
          'https://clothing-dashboard-seven.vercel.app',
          'http://localhost:3000',
          'http://localhost:3001',
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
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
      ],
      exposedHeaders: ['Content-Range', 'X-Total-Count'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
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
  }
  return app;
}

// Export Vercel serverless function
module.exports = async (req, res) => {
  try {
    // Ensure app is initialized
    const appInstance = await bootstrap();
    
    // Get the underlying Express instance
    const expressApp = appInstance.getHttpAdapter().getInstance();
    
    // Handle the request
    expressApp(req, res, (err) => {
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
