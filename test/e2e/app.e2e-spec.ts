import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppTestingModule } from '../../src/app.testing.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppTestingModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 10000);

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/auth/register (POST) - Successful registration', () => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Test User', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(uniqueEmail);
      });
  });

  it('/auth/register (POST) - Email already exists', async () => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Test', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Test2', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(400);
  });

  it('/auth/login (POST) - Successful login', async () => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Test', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'password123' })
      .expect(200);
    expect(response.body).toHaveProperty('accessToken');
  });

  it('/auth/login (POST) - Invalid password', async () => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Test', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'wrongpassword' })
      .expect(401);
  });
});