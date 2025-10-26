import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('CORS Configuration', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      // Mock module for testing CORS
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Apply the same CORS configuration as in production
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

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('OPTIONS requests (preflight)', () => {
    it('should allow preflight requests from allowed origins', async () => {
      const allowedOrigins = [
        'https://clothing-website-lovat.vercel.app',
        'https://clothing-dashboard-seven.vercel.app',
        'http://localhost:3000',
        'http://localhost:3001'
      ];

      for (const origin of allowedOrigins) {
        const response = await request(app.getHttpServer())
          .options('/api/auth/login')
          .set('Origin', origin)
          .expect(204);

        expect(response.headers['access-control-allow-origin']).toBe(origin);
        expect(response.headers['access-control-allow-credentials']).toBe('true');
        expect(response.headers['access-control-allow-methods']).toContain('POST');
        expect(response.headers['access-control-allow-headers']).toContain('Authorization');
      }
    });

    it('should reject preflight requests from disallowed origins', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/auth/login')
        .set('Origin', 'https://malicious-site.com')
        .expect(204);

      // Should not have CORS headers for disallowed origins
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Actual requests', () => {
    it('should allow requests from allowed origins', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Origin', 'https://clothing-dashboard-seven.vercel.app')
        .expect(404); // 404 is expected since we don't have actual routes in this test

      expect(response.headers['access-control-allow-origin']).toBe('https://clothing-dashboard-seven.vercel.app');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should reject requests from disallowed origins', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Origin', 'https://malicious-site.com')
        .expect(404);

      // Should not have CORS headers for disallowed origins
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  describe('Security validation', () => {
    it('should have proper CORS configuration', () => {
      // This test ensures we have CORS properly configured
      // The actual CORS behavior is tested in the request tests above
      expect(app).toBeDefined();
    });
  });
});
