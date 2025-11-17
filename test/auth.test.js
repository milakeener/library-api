const request = require('supertest');
const app = require('../src/app');

describe('Health Check', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

describe('POST /auth/signup', () => {
  test('should return 400 when body is empty', async () => {
    const res = await request(app).post('/auth/signup').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('should return 400 when name is missing', async () => {
    const res = await request(app).post('/auth/signup').send({
      email: 'test@example.com',
      password: 'Password123!'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('name');
  });

  test('should return 400 when email is missing', async () => {
    const res = await request(app).post('/auth/signup').send({
      name: 'Test User',
      password: 'Password123!'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('email');
  });

  test('should return 400 when password is missing', async () => {
    const res = await request(app).post('/auth/signup').send({
      name: 'Test User',
      email: 'test@example.com'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('password');
  });
});

describe('POST /auth/login', () => {
  test('should return 400 when body is empty', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  test('should return 400 when email is missing', async () => {
    const res = await request(app).post('/auth/login').send({
      password: 'Password123!'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('email');
  });

  test('should return 400 when password is missing', async () => {
    const res = await request(app).post('/auth/login').send({
      email: 'test@example.com'
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('password');
  });

  // Note: Testing actual login with wrong credentials requires a real database connection
  // This test validates the input but doesn't test authentication logic
});

describe('GET /users/me - Authorization Tests', () => {
  test('should return 401 when no token is provided', async () => {
    const res = await request(app).get('/users/me');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  test('should return 401 when Authorization header is missing Bearer prefix', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', 'InvalidTokenFormat');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('Missing or invalid token');
  });

  test('should return 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer invalid.token.here');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('Invalid token');
  });

  test('should return 401 when token is malformed', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('Authorization', 'Bearer notajwttoken');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toContain('Invalid token');
  });
});
