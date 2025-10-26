// Simple test script to verify the API is working
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');

async function testAPI() {
  try {
    console.log('🚀 Starting NestJS app...');
    const app = await NestFactory.create(AppModule);
    
    console.log('✅ NestJS app created successfully');
    
    // Test health endpoint
    const healthController = app.get('HealthController');
    const health = healthController.getHealth();
    console.log('✅ Health check:', health);
    
    await app.close();
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Error testing API:', error);
    process.exit(1);
  }
}

testAPI();
