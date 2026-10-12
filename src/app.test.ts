import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { app } from './app.js';

describe('GET /api/health', () => {
  it('returns an OK health response', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/docs', () => {
  it('serves the Swagger UI', async () => {
    const response = await request(app).get('/api/docs').redirects(1);

    expect(response.status).toBe(200);
    expect(response.text).toContain('id="swagger-ui"');
  });
});
