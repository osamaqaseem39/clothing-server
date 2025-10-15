import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): MongooseModuleOptions => {
  const dbConfig: any = configService.get('database') || {};

  const getDbValue = <T>(key: string, envKey: string, defaultValue: T): T => {
    const fromConfigKey = configService.get(`database.${key}`);
    const fromGroup = dbConfig[key];
    const fromEnv = process.env[envKey as any];
    if (fromConfigKey !== undefined) return fromConfigKey as T;
    if (fromGroup !== undefined) return fromGroup as T;
    if (fromEnv !== undefined) return (typeof defaultValue === 'number' ? Number(fromEnv) : (fromEnv as any)) as T;
    return defaultValue;
  };

  const uri = getDbValue<string>('uri', 'MONGODB_URI', 'mongodb://localhost:27017/ecommerce');
  const maxPoolSize = getDbValue<number>('maxPoolSize', 'MONGODB_MAX_POOL_SIZE', 10);
  const minPoolSize = getDbValue<number>('minPoolSize', 'MONGODB_MIN_POOL_SIZE', 1);
  const serverSelectionTimeout = getDbValue<number>('serverSelectionTimeout', 'MONGODB_SERVER_SELECTION_TIMEOUT', 5000);
  const socketTimeout = getDbValue<number>('socketTimeout', 'MONGODB_SOCKET_TIMEOUT', 45000);
  const bufferCommands = (() => {
    const fromConfigKey = configService.get('database.bufferCommands');
    if (fromConfigKey !== undefined) return fromConfigKey as boolean;
    if (dbConfig.bufferCommands !== undefined) return dbConfig.bufferCommands as boolean;
    if (process.env.MONGODB_BUFFER_COMMANDS !== undefined) return process.env.MONGODB_BUFFER_COMMANDS !== 'false';
    return true;
  })();

  return {
    uri,
    // Connection pool options
    maxPoolSize,
    minPoolSize,

    // Timeout options
    serverSelectionTimeoutMS: serverSelectionTimeout,
    socketTimeoutMS: socketTimeout,

    // Buffer options
    bufferCommands,

    // Connection event handlers
    connectionFactory: (connection) => {
      connection.on('connected', () => {
        console.log('✅ MongoDB connected successfully');
      });

      connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      connection.on('disconnected', () => {
        console.log('⚠️ MongoDB disconnected');
      });

      return connection;
    },
  };
};