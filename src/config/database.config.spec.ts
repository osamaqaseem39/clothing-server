import { ConfigService } from '@nestjs/config';
import { getDatabaseConfig } from './database.config';

describe('Database Configuration', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = {
      get: jest.fn((key: string) => {
        const config = {
          'database.uri': 'mongodb://localhost:27017/test',
          'database.maxPoolSize': 10,
          'database.minPoolSize': 1,
          'database.serverSelectionTimeout': 5000,
          'database.socketTimeout': 45000,
          'database.bufferCommands': true,
          'app.nodeEnv': 'development',
        };
        return config[key];
      }),
    } as any;
  });

  it('should return valid Mongoose configuration', () => {
    const config = getDatabaseConfig(configService);
    
    expect(config).toBeDefined();
    expect(config.uri).toBe('mongodb://localhost:27017/test');
    expect(config.maxPoolSize).toBe(10);
    expect(config.minPoolSize).toBe(1);
    expect(config.serverSelectionTimeoutMS).toBe(5000);
    expect(config.socketTimeoutMS).toBe(45000);
    expect(config.bufferCommands).toBe(true);
    expect(config.connectionFactory).toBeDefined();
  });

  it('should handle production environment', () => {
    (configService.get as jest.Mock).mockImplementation((key: string) => {
      const config = {
        'database.uri': 'mongodb://localhost:27017/prod',
        'database.maxPoolSize': 20,
        'database.minPoolSize': 5,
        'database.serverSelectionTimeout': 10000,
        'database.socketTimeout': 60000,
        'database.bufferCommands': false,
        'app.nodeEnv': 'production',
      };
      return config[key];
    });

    const config = getDatabaseConfig(configService);
    
    expect(config.maxPoolSize).toBe(20);
    expect(config.minPoolSize).toBe(5);
    expect(config.serverSelectionTimeoutMS).toBe(10000);
    expect(config.socketTimeoutMS).toBe(60000);
    expect(config.bufferCommands).toBe(false);
  });
}); 