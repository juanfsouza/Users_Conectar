import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST)', () => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Test', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(201);
  });

  it('/auth/login (POST)', async () => {
    const uniqueEmail = `test-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Test', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: uniqueEmail, password: 'password123' });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('accessToken');
  });
});