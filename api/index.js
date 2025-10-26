// Vercel serverless function entry point
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/app.module');
const { ValidationPipe } = require('@nestjs/common');

let app;

async function bootstrap() {
  if (!app) {
    try {
      app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn'],
      });

      // Global validation pipe
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }));

      // CORS configuration for Vercel - Specific origins for security
      app.enableCors({
        origin: [
          'https://clothing-website-lovat.vercel.app',
          'https://clothing-dashboard-seven.vercel.app',
          'http://localhost:3000',
          'http://localhost:3001'
        ],
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
        exposedHeaders: ['Content-Range', 'X-Total-Count'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
      });

      // Set global prefix to empty since Vercel handles the /api prefix
      app.setGlobalPrefix('');

      await app.init();
      console.log('✅ NestJS app initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing NestJS app:', error);
      throw error;
    }
  }
  return app;
}

module.exports = async (req, res) => {
  // Handle CORS preflight requests immediately
  if (req.method === 'OPTIONS') {
    console.log(`🔄 Handling CORS preflight for ${req.url}`);
    
    const allowedOrigins = [
      'https://clothing-website-lovat.vercel.app',
      'https://clothing-dashboard-seven.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      // Don't set CORS header for disallowed origins
      console.warn(`CORS: Disallowed origin: ${origin}`);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '600');
    
    return res.status(204).end();
  }

  try {
    console.log(`📡 Handling ${req.method} ${req.url}`);
    
    const nestApp = await bootstrap();
    const expressApp = nestApp.getHttpAdapter().getInstance();
    
    // Add CORS headers to the response before processing
    const allowedOrigins = [
      'https://clothing-website-lovat.vercel.app',
      'https://clothing-dashboard-seven.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      // Don't set CORS header for disallowed origins
      console.warn(`CORS: Disallowed origin: ${origin}`);
    }
    
    return expressApp(req, res);
  } catch (error) {
    console.error('❌ Error in Vercel function:', error);
    
    // Set CORS headers even for errors
    const allowedOrigins = [
      'https://clothing-website-lovat.vercel.app',
      'https://clothing-dashboard-seven.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else {
      // Don't set CORS header for disallowed origins
      console.warn(`CORS: Disallowed origin: ${origin}`);
    }
    
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
