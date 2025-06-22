import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/auth/register (POST) - Successful registration', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
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
    const uniqueEmail = `test${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Test', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(201);
    return request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Test2', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(400); // Espera 400 para duplicidade de email, ajuste conforme a lógica do AuthService
  });

  it('/auth/login (POST) - Successful login', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Test', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'password123' })
      .expect(200);
    expect(response.body).toHaveProperty('access_token');
  });

  it('/auth/login (POST) - Invalid password', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Test', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(201);

    return request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'wrongpassword' })
      .expect(401);
  });

  it('/users (GET) - List users as admin', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Admin', email: uniqueEmail, password: 'password123', role: 'admin' })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'password123' })
      .expect(200);
    const token = loginResponse.body.access_token;

    return request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('/users/inactive (GET) - List inactive users as admin', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'Admin', email: uniqueEmail, password: 'password123', role: 'admin' })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'password123' })
      .expect(200);
    const token = loginResponse.body.access_token;

    return request(app.getHttpServer())
      .get('/api/users/inactive')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('/users (GET) - Forbidden for non-admin', async () => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ name: 'User', email: uniqueEmail, password: 'password123', role: 'user' })
      .expect(201);

    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: uniqueEmail, password: 'password123' })
      .expect(200);
    const token = loginResponse.body.access_token;

    return request(app.getHttpServer())
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});