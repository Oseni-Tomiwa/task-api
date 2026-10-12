import bcrypt from 'bcrypt';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { app } from '../../app.js';
import { errorHandler } from '../../middleware/error.middleware.js';
import { User } from '../../models/user.model.js';
import { authenticate } from './auth.middleware.js';

const credentials = {
  email: 'person@example.com',
  password: 'secure-password',
};

let mongoServer: MongoMemoryServer | undefined;

beforeAll(
  async () => {
    process.env.JWT_SECRET = 'test-jwt-secret-with-at-least-32-characters';
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  },
  120_000,
);

afterEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe('authentication', () => {
  it('registers a user and stores a bcrypt password hash', async () => {
    const response = await request(app).post('/api/auth/register').send(credentials);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      token: expect.any(String),
      user: { email: credentials.email, id: expect.any(String) },
    });

    const user = await User.findOne({ email: credentials.email }).select('+passwordHash');
    expect(user?.passwordHash).not.toBe(credentials.password);
    expect(await bcrypt.compare(credentials.password, user?.passwordHash ?? '')).toBe(true);
  });

  it('rejects invalid registration input', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'short' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: { message: 'Invalid request data' } });
    expect(await User.countDocuments()).toBe(0);
  });

  it('rejects a duplicate email', async () => {
    await request(app).post('/api/auth/register').send(credentials);

    const response = await request(app).post('/api/auth/register').send(credentials);

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: { message: 'Email is already registered' } });
  });

  it('logs in with valid credentials', async () => {
    await request(app).post('/api/auth/register').send(credentials);

    const response = await request(app).post('/api/auth/login').send(credentials);

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      token: expect.any(String),
      user: { email: credentials.email, id: expect.any(String) },
    });
  });

  it('rejects invalid credentials without revealing which value was wrong', async () => {
    await request(app).post('/api/auth/register').send(credentials);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ ...credentials, password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: { message: 'Invalid email or password' } });
  });
});

describe('authenticate middleware', () => {
  const protectedApp = express();
  protectedApp.get('/protected', authenticate, (request, response) => {
    response.status(200).json({ userId: request.user?.id });
  });
  protectedApp.use(errorHandler);

  it('allows a valid bearer token', async () => {
    const registration = await request(app).post('/api/auth/register').send(credentials);

    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', `Bearer ${registration.body.token as string}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ userId: registration.body.user.id });
  });

  it('rejects an invalid bearer token', async () => {
    const response = await request(protectedApp)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: { message: 'Invalid or expired token' } });
  });
});
