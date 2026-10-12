import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { app } from '../../app.js';
import { User } from '../../models/user.model.js';
import { createToken } from '../auth/token.js';
import { Task } from './task.model.js';

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
  await Promise.all([Task.deleteMany({}), User.deleteMany({})]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

const createUser = async (email: string) => {
  const user = await User.create({ email, passwordHash: 'unused-in-task-tests' });
  return { id: String(user._id), token: createToken(String(user._id)) };
};

const authorization = (token: string) => ({ Authorization: `Bearer ${token}` });

describe('/api/tasks', () => {
  it('requires authentication', async () => {
    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: { message: 'Authentication required' } });
  });

  it('creates a task for the authenticated user', async () => {
    const user = await createUser('owner@example.com');

    const response = await request(app)
      .post('/api/tasks')
      .set(authorization(user.token))
      .send({ title: 'Write the internship report' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      title: 'Write the internship report',
      status: 'pending',
      createdAt: expect.any(String),
    });
    expect(response.body).not.toHaveProperty('owner');
    expect(response.body).not.toHaveProperty('description');

    const task = await Task.findById(response.body.id);
    expect(String(task?.owner)).toBe(user.id);
  });

  it('lists only the authenticated user tasks', async () => {
    const owner = await createUser('owner@example.com');
    const otherUser = await createUser('other@example.com');

    await request(app)
      .post('/api/tasks')
      .set(authorization(owner.token))
      .send({ title: 'First task' });
    await request(app)
      .post('/api/tasks')
      .set(authorization(owner.token))
      .send({ title: 'Second task', status: 'in-progress' });
    await request(app)
      .post('/api/tasks')
      .set(authorization(otherUser.token))
      .send({ title: 'Someone else task' });

    const response = await request(app).get('/api/tasks').set(authorization(owner.token));

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body.map((task: { title: string }) => task.title)).toEqual(
      expect.arrayContaining(['First task', 'Second task']),
    );
  });

  it('retrieves one owned task', async () => {
    const user = await createUser('owner@example.com');
    const creation = await request(app)
      .post('/api/tasks')
      .set(authorization(user.token))
      .send({ title: 'Read one task', description: 'Task details' });

    const response = await request(app)
      .get(`/api/tasks/${creation.body.id as string}`)
      .set(authorization(user.token));

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: creation.body.id,
      title: 'Read one task',
      description: 'Task details',
      status: 'pending',
    });
  });

  it('updates an owned task', async () => {
    const user = await createUser('owner@example.com');
    const creation = await request(app)
      .post('/api/tasks')
      .set(authorization(user.token))
      .send({ title: 'Initial title' });

    const response = await request(app)
      .patch(`/api/tasks/${creation.body.id as string}`)
      .set(authorization(user.token))
      .send({ title: 'Updated title', description: 'Finished work', status: 'completed' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: creation.body.id,
      title: 'Updated title',
      description: 'Finished work',
      status: 'completed',
    });
  });

  it('deletes an owned task', async () => {
    const user = await createUser('owner@example.com');
    const creation = await request(app)
      .post('/api/tasks')
      .set(authorization(user.token))
      .send({ title: 'Delete this task' });

    const response = await request(app)
      .delete(`/api/tasks/${creation.body.id as string}`)
      .set(authorization(user.token));

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(await Task.findById(creation.body.id)).toBeNull();
  });

  it('rejects invalid request bodies and task IDs', async () => {
    const user = await createUser('owner@example.com');

    const invalidBody = await request(app)
      .post('/api/tasks')
      .set(authorization(user.token))
      .send({ title: '', status: 'blocked' });
    const invalidId = await request(app)
      .get('/api/tasks/not-a-mongodb-id')
      .set(authorization(user.token));

    expect(invalidBody.status).toBe(400);
    expect(invalidBody.body).toEqual({ error: { message: 'Invalid request data' } });
    expect(invalidId.status).toBe(400);
    expect(invalidId.body).toEqual({ error: { message: 'Invalid request data' } });
  });

  it('hides owned tasks from other users for every ID-based operation', async () => {
    const owner = await createUser('owner@example.com');
    const otherUser = await createUser('other@example.com');
    const creation = await request(app)
      .post('/api/tasks')
      .set(authorization(owner.token))
      .send({ title: 'Private task' });
    const taskPath = `/api/tasks/${creation.body.id as string}`;

    const read = await request(app).get(taskPath).set(authorization(otherUser.token));
    const update = await request(app)
      .patch(taskPath)
      .set(authorization(otherUser.token))
      .send({ status: 'completed' });
    const removal = await request(app).delete(taskPath).set(authorization(otherUser.token));

    expect(read.status).toBe(404);
    expect(update.status).toBe(404);
    expect(removal.status).toBe(404);
    expect(await Task.exists({ _id: creation.body.id, owner: owner.id })).not.toBeNull();
  });
});
