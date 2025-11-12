const request = require('supertest');

// Minimal smoke tests: these mock nothing but check basic responses and app wiring.
const app = require('../src/app');

describe('Auth endpoints (basic wiring)', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('POST /auth/signup without body returns 400', async () => {
    const res = await request(app).post('/auth/signup').send({});
    expect(res.statusCode).toBe(400);
  });

  test('GET /users/me without token returns 401', async () => {
    const res = await request(app).get('/users/me');
    expect(res.statusCode).toBe(401);
  });
});
