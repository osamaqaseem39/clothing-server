import { MongooseModuleOptions } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): MongooseModuleOptions => {
  const dbConfig = configService.get('database');
  
  return {
    uri: dbConfig.uri,
    // Connection pool options
    maxPoolSize: dbConfig.maxPoolSize,
    minPoolSize: dbConfig.minPoolSize,
    
    // Timeout options
    serverSelectionTimeoutMS: dbConfig.serverSelectionTimeout,
    socketTimeoutMS: dbConfig.socketTimeout,
    
    // Buffer options
    bufferCommands: dbConfig.bufferCommands,
    
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