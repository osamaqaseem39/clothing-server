# Environment Configuration

This project uses environment variables for configuration, with a structured approach using NestJS ConfigModule.

## Environment Variables

### Application
- `NODE_ENV`: Environment (development, production, test)
- `PORT`: Application port (default: 3000)

### MongoDB Configuration
- `MONGODB_URI`: MongoDB connection string (default: mongodb://localhost:27017/ecommerce)
- `MONGODB_MAX_POOL_SIZE`: Maximum connection pool size (default: 10)
- `MONGODB_MIN_POOL_SIZE`: Minimum connection pool size (default: 1)
- `MONGODB_SERVER_SELECTION_TIMEOUT`: Server selection timeout in ms (default: 5000)
- `MONGODB_SOCKET_TIMEOUT`: Socket timeout in ms (default: 45000)
- `MONGODB_BUFFER_COMMANDS`: Enable/disable command buffering (default: true)

### JWT Configuration
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: JWT expiration time (default: 7d)

### Swagger Configuration
- `SWAGGER_TITLE`: API title (default: E-commerce API)
- `SWAGGER_DESCRIPTION`: API description
- `SWAGGER_VERSION`: API version (default: 1.0)

### SMTP Email Configuration
- `SMTP_HOST`: SMTP server hostname (default: mail.spacemail.com)
- `SMTP_PORT`: SMTP server port (default: 465)
- `SMTP_USER`: SMTP username/email (default: orders@shestrends.com)
- `SMTP_PASS`: SMTP password (required)
- `SMTP_FROM`: Email address to send from (default: same as SMTP_USER)
- `SMTP_SECURE`: Use SSL/TLS encryption (default: true)

## Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` file according to your environment

3. For production, ensure all required environment variables are set

## Configuration Structure

The configuration is organized into logical groups:

- **Database**: MongoDB connection settings
- **App**: Application-level settings
- **Swagger**: API documentation settings
- **JWT**: Authentication settings
- **SMTP**: Email service configuration

## Usage in Code

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SomeService {
  constructor(private configService: ConfigService) {}
  
  someMethod() {
    const dbUri = this.configService.get('database.uri');
    const port = this.configService.get('app.port');
  }
}
```

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection errors:

1. **Check MongoDB Service**: Ensure MongoDB is running on your system
2. **Verify Connection String**: Check `MONGODB_URI` in your `.env` file
3. **Network Access**: Ensure MongoDB is accessible from your application
4. **Authentication**: Verify username/password if using authentication
5. **Port Configuration**: Default MongoDB port is 27017

### Common Error: "option loggerlevel is not supported"

This error occurs when using unsupported MongoDB driver options. The current configuration only uses supported options:
- `maxPoolSize`
- `minPoolSize` 
- `serverSelectionTimeoutMS`
- `socketTimeoutMS`
- `bufferCommands`

## MongoDB Connection Features

- **Connection Pooling**: Configurable min/max pool sizes
- **Timeout Handling**: Configurable server selection and socket timeouts
- **Connection Events**: Automatic logging of connection status
- **Buffer Management**: Configurable command buffering
- **Environment-specific Configuration**: Different settings for development/production 