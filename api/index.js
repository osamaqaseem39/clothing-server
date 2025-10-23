// Vercel serverless function entry point
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { ValidationPipe } = require('@nestjs/common');
const { join } = require('path');

let app;

async function bootstrap() {
  if (!app) {
    app = await NestFactory.create(AppModule);

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

    // Ensure all routes are served under /api (matches client baseURL and Vercel path)
    app.setGlobalPrefix('api');

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    });

    await app.init();
  }
  return app;
}

module.exports = async (req, res) => {
  const nestApp = await bootstrap();
  return nestApp.getHttpAdapter().getInstance()(req, res);
};
