import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce',
  maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
  minPoolSize: parseInt(process.env.MONGODB_MIN_POOL_SIZE || '1'),
  serverSelectionTimeout: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT || '5000'),
  socketTimeout: parseInt(process.env.MONGODB_SOCKET_TIMEOUT || '45000'),
  bufferCommands: process.env.MONGODB_BUFFER_COMMANDS !== 'false',
}));

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000'),
}));

export const swaggerConfig = registerAs('swagger', () => ({
  title: process.env.SWAGGER_TITLE || 'E-commerce API',
  description: process.env.SWAGGER_DESCRIPTION || 'Clean e-commerce API built with NestJS and MongoDB',
  version: process.env.SWAGGER_VERSION || '1.0',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
})); 