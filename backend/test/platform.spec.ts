import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from '../src/users/users.module.js';
import { AuthModule } from '../src/auth/auth.module.js';
import { StoresModule } from '../src/stores/stores.module.js';
import { RatingsModule } from '../src/ratings/ratings.module.js';
import { SeedModule } from '../src/seed/seed.module.js';

describe('Store Rating Platform API Tests', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let ownerToken: string;
  let userToken: string;
  let testStoreId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              MONGODB_URI: uri,
              JWT_SECRET: 'test-secret-key-1234567890',
              JWT_EXPIRES_IN: '1d',
            }),
          ],
        }),
        MongooseModule.forRoot(uri),
        UsersModule,
        AuthModule,
        StoresModule,
        RatingsModule,
        SeedModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  }, 60000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  describe('1. Authentication & Validation', () => {
    it('should register a valid new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Charlie Test Consumer User', // 27 chars (between 20 and 60)
          email: 'charlie@example.com',
          address: '303 Pine St, Suite 5, Seattle, WA',
          password: 'Password@123',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('charlie@example.com');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should reject duplicate email with 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Charlie Duplicate Account',
          email: 'charlie@example.com',
          address: '303 Pine St, Suite 5, Seattle, WA',
          password: 'Password@123',
        });

      expect(res.status).toBe(409);
    });

    it('should reject name shorter than 20 characters', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Short Name', // 10 chars
          email: 'short@example.com',
          address: '123 Test St',
          password: 'Password@123',
        });

      expect(res.status).toBe(400);
    });

    it('should reject name longer than 60 characters', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'This Name Is Purposely Exceedingly Long And Beyond The Sixty Character Upper Limit Specified',
          email: 'toolong@example.com',
          address: '123 Test St',
          password: 'Password@123',
        });

      expect(res.status).toBe(400);
    });

    it('should reject address longer than 400 characters', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Valid Length User Name Here',
          email: 'longaddr@example.com',
          address: 'A'.repeat(405),
          password: 'Password@123',
        });

      expect(res.status).toBe(400);
    });

    it('should reject invalid email format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Valid Length User Name Here',
          email: 'invalid-email-format',
          address: '123 Test St',
          password: 'Password@123',
        });

      expect(res.status).toBe(400);
    });

    it('should reject password shorter than 8 characters', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Valid Length User Name Here',
          email: 'shortpass@example.com',
          address: '123 Test St',
          password: 'Pass@1',
        });

      expect(res.status).toBe(400);
    });

    it('should reject password without uppercase letter', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Valid Length User Name Here',
          email: 'nouppercase@example.com',
          address: '123 Test St',
          password: 'password@123',
        });

      expect(res.status).toBe(400);
    });

    it('should reject password without special character', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          name: 'Valid Length User Name Here',
          email: 'nospecial@example.com',
          address: '123 Test St',
          password: 'Password1234',
        });

      expect(res.status).toBe(400);
    });

    it('should login seeded user with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.role).toBe('USER');
      userToken = res.body.access_token;
    });

    it('should login seeded owner with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'owner@example.com',
          password: 'Password@123',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body.user.role).toBe('OWNER');
      ownerToken = res.body.access_token;
    });

    it('should reject invalid login credentials with 401 Unauthorized', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'alice@example.com',
          password: 'WrongPassword@999',
        });

      expect(res.status).toBe(401);
    });

    it('should fetch safe profile via GET /auth/me with valid token', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('alice@example.com');
      expect(res.body).not.toHaveProperty('passwordHash');
    });
  });

  describe('2. Stores & Search', () => {
    it('should return list of stores with average ratings', async () => {
      const res = await request(app.getHttpServer()).get('/stores');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);

      const store1 = res.body.find((s: any) => s.name === 'Green Valley Organic Market');
      expect(store1).toBeDefined();
      expect(store1.averageRating).toBeDefined();
      expect(typeof store1.averageRating).toBe('number');
      testStoreId = store1.id;
    });

    it('should search stores case-insensitively by name', async () => {
      const res = await request(app.getHttpServer()).get('/stores?search=organic');

      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].name).toContain('Organic');
    });

    it('should include user rating if authenticated', async () => {
      const res = await request(app.getHttpServer())
        .get('/stores')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      const store1 = res.body.find((s: any) => s.name === 'Green Valley Organic Market');
      expect(store1.userRating).toBe(5); // Alice rated store 1 with 5 in seed
    });
  });

  describe('3. Ratings APIs', () => {
    it('should reject duplicate rating with 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post(`/stores/${testStoreId}/ratings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 5 });

      expect(res.status).toBe(409);
    });

    it('should allow user to update their rating via PATCH', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/stores/${testStoreId}/ratings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 4 });

      expect(res.status).toBe(200);
      expect(res.body.rating).toBe(4);
    });

    it('should get current user rating for store via GET /stores/:storeId/ratings/me', async () => {
      const res = await request(app.getHttpServer())
        .get(`/stores/${testStoreId}/ratings/me`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.rating).toBe(4);
    });

    it('should reject rating below 1', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/stores/${testStoreId}/ratings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 0 });

      expect(res.status).toBe(400);
    });

    it('should reject rating above 5', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/stores/${testStoreId}/ratings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 6 });

      expect(res.status).toBe(400);
    });

    it('should reject decimal rating', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/stores/${testStoreId}/ratings`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 4.5 });

      expect(res.status).toBe(400);
    });
  });

  describe('4. Owner Dashboard & Role-based Authorization', () => {
    it('should block normal user from accessing GET /owner/dashboard with 403 Forbidden', async () => {
      const res = await request(app.getHttpServer())
        .get('/owner/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow OWNER to access GET /owner/dashboard', async () => {
      const res = await request(app.getHttpServer())
        .get('/owner/dashboard')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('stores');
      expect(Array.isArray(res.body.stores)).toBe(true);
      expect(res.body.stores.length).toBeGreaterThanOrEqual(1);

      const store = res.body.stores[0];
      expect(store).toHaveProperty('name');
      expect(store).toHaveProperty('averageRating');
      expect(store).toHaveProperty('totalRatings');
      expect(store).toHaveProperty('ratings');
      expect(Array.isArray(store.ratings)).toBe(true);

      if (store.ratings.length > 0) {
        const ratingEntry = store.ratings[0];
        expect(ratingEntry).toHaveProperty('rating');
        expect(ratingEntry).toHaveProperty('user');
        expect(ratingEntry.user).toHaveProperty('name');
        expect(ratingEntry.user).toHaveProperty('email');
        expect(ratingEntry.user).not.toHaveProperty('passwordHash');
      }
    });
  });
});
